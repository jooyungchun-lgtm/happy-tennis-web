import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  collectionGroup,
  Timestamp,
  orderBy,
  // serverTimestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, Membership, ChatRoom, ChatMessage } from '@/types/models';
import { moderationService } from './moderation';

export class AuthService {
  private static instance: AuthService;
  private authStateListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    // Firebase Auth 상태 변화 리스너
    onAuthStateChanged(auth, (user) => {
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Auth 상태 변화 리스너 등록
  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // 로그인
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 회원가입
  async signUp(email: string, password: string): Promise<void> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      // 기본 프로필 저장
      const profile: UserProfile = {
        id: uid,
        name: 'Guest',
        gender: '남성',
        ageGroup: '20대',
        homeCourt: '',
        ntrp: 1.0,
        experience: 0.5,
        lastModified: new Date(),
        isComplete: false,
        canEdit: true,
        nextEditDate: new Date()
      };

      await this.saveUserProfile(profile);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // 비밀번호 재설정
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // 사용자 프로필 로드
  async loadUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return this.decodeUserProfile(data);
      }
      return null;
    } catch (error) {
      console.error('Load user profile error:', error);
      throw error;
    }
  }

  // 사용자 프로필 저장
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.id);
      await setDoc(docRef, {
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        ageGroup: profile.ageGroup,
        homeCourt: profile.homeCourt,
        ntrp: profile.ntrp,
        experience: profile.experience,
        lastModified: profile.lastModified
      });

      // 모든 채팅방의 참여자 프로필도 업데이트
      await this.updateParticipantProfilesInAllRooms(profile);
    } catch (error) {
      console.error('Save user profile error:', error);
      throw error;
    }
  }

  // 채팅방 목록 조회
  async fetchChatRooms(): Promise<ChatRoom[]> {
    try {
      const roomsRef = collection(db, 'chatRooms');
      const snapshot = await getDocs(roomsRef);
      
      const rooms: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        const room = this.decodeChatRoom(doc.id, doc.data());
        if (room) {
          rooms.push(room);
        }
      });

      rooms.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      return rooms;
    } catch (error) {
      console.error('Fetch chat rooms error:', error);
      throw error;
    }
  }

  // 채팅방 생성
  async createChatRoom(room: ChatRoom, userProfile: UserProfile): Promise<string> {
    try {
      const roomsRef = collection(db, 'chatRooms');
      const docRef = await addDoc(roomsRef, {
        courtName: room.courtName,
        courtNumber: room.courtNumber,
        date: room.date,
        startTime: room.startTime,
        endTime: room.endTime,
        gameType: room.gameType,
        ntrp: room.ntrp,
        maleCount: room.maleCount,
        femaleCount: room.femaleCount,
        hostId: userProfile.id,
        bannedUserIds: room.bannedUserIds || [],
        status: '모집중',
        isClosed: false
      });

      // 호스트 참가자 추가
      const participantRef = doc(roomsRef, docRef.id, 'participants', userProfile.id);
      await setDoc(participantRef, {
        id: userProfile.id,
        name: userProfile.name,
        gender: userProfile.gender,
        isHost: true,
        isConfirmed: true,
        ntrp: userProfile.ntrp,
        experience: userProfile.experience,
        ageGroup: userProfile.ageGroup,
        homeCourt: userProfile.homeCourt
      });

      return docRef.id;
    } catch (error) {
      console.error('Create chat room error:', error);
      throw error;
    }
  }

  // 채팅방 참여
  async joinChatRoom(roomId: string, userProfile: UserProfile): Promise<void> {
    try {
      console.log('Attempting to join chat room:', { roomId, userId: userProfile.id });
      
      // 차단된 사용자인지 확인
      if (await this.isUserBanned(roomId, userProfile.id)) {
        console.log('User is banned from room:', roomId);
        throw new Error('이 채팅방에서 영구 추방되어 입장할 수 없습니다.');
      }

      // 이미 참여 중인지 확인
      if (await this.isUserParticipating(roomId, userProfile.id)) {
        console.log('User is already participating in room:', roomId);
        throw new Error('이미 참여 중인 채팅방입니다.');
      }

      // 인원 제한 확인
      console.log('Checking room capacity...');
      const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
      if (!roomDoc.exists()) {
        console.log('Room does not exist:', roomId);
        throw new Error('채팅방 정보를 찾을 수 없습니다.');
      }

      const roomData = roomDoc.data();
      console.log('Room data:', roomData);
      
      const maxParticipants = roomData.maleCount + roomData.femaleCount;
      const currentCounts = await this.participantCounts(roomId);
      const currentTotal = currentCounts.male + currentCounts.female;

      console.log('Participant counts:', { maxParticipants, currentTotal, currentCounts });

      if (currentTotal >= maxParticipants) {
        console.log('Room is full:', { currentTotal, maxParticipants });
        throw new Error('인원이 가득찼습니다.');
      }

      // 참여자 추가
      console.log('Adding participant to room...');
      const participantRef = doc(db, 'chatRooms', roomId, 'participants', userProfile.id);
      await setDoc(participantRef, {
        id: userProfile.id,
        name: userProfile.name,
        gender: userProfile.gender,
        isHost: false,
        isConfirmed: false,
        role: 'participant',
        ntrp: userProfile.ntrp,
        experience: userProfile.experience,
        ageGroup: userProfile.ageGroup,
        homeCourt: userProfile.homeCourt
      });
      
      console.log('Successfully joined chat room:', roomId);
    } catch (error) {
      console.error('Join chat room error:', error);
      throw error;
    }
  }

  // 채팅방 나가기
  async leaveChatRoom(roomId: string, userId: string): Promise<void> {
    try {
      const participantRef = doc(db, 'chatRooms', roomId, 'participants', userId);
      await deleteDoc(participantRef);
    } catch (error) {
      console.error('Leave chat room error:', error);
      throw error;
    }
  }

  // 사용자 멤버십 조회
  async fetchUserMemberships(userId: string): Promise<Record<string, Membership>> {
    try {
      const q = query(
        collectionGroup(db, 'participants'),
        where('id', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const memberships: Record<string, Membership> = {};

      snapshot.forEach((doc) => {
        const roomRef = doc.ref.parent.parent;
        if (roomRef) {
          const roomId = roomRef.id;
          const isConfirmed = doc.data().isConfirmed || false;
          memberships[roomId] = {
            roomId,
            isConfirmed,
            isParticipating: true
          };
        }
      });

      return memberships;
    } catch (error) {
      console.error('Fetch user memberships error:', error);
      throw error;
    }
  }

  // 메시지 전송
  async sendMessage(roomId: string, senderId: string, content: string): Promise<void> {
    try {
      // 사용자 프로필에서 이름 가져오기
      const userProfile = await this.loadUserProfile(senderId);
      if (!userProfile) {
        throw new Error('사용자 프로필을 찾을 수 없습니다.');
      }

      // 메시지 필터링
      const moderationResult = moderationService.filterMessage(content);
      
      if (!moderationResult.isClean) {
        throw new Error('부적절한 내용이 포함되어 있습니다. 메시지를 수정해주세요.');
      }

      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      await addDoc(messagesRef, {
        senderId: senderId,
        senderName: userProfile.name,
        content: moderationResult.filteredContent,
        timestamp: new Date(),
        messageType: 'text'
      });
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  // 채팅방 삭제 (호스트만 가능)
  async deleteChatRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
      if (!roomDoc.exists()) {
        throw new Error('채팅방을 찾을 수 없습니다.');
      }

      const roomData = roomDoc.data();
      if (roomData.hostId !== userId) {
        throw new Error('채팅방을 삭제할 권한이 없습니다.');
      }

      // 채팅방과 관련된 모든 하위 컬렉션 삭제
      const batch = writeBatch(db);
      
      // 참여자들 삭제
      const participantsSnapshot = await getDocs(collection(db, 'chatRooms', roomId, 'participants'));
      participantsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 메시지들 삭제
      const messagesSnapshot = await getDocs(collection(db, 'chatRooms', roomId, 'messages'));
      messagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 채팅방 자체 삭제
      batch.delete(doc(db, 'chatRooms', roomId));

      await batch.commit();
    } catch (error) {
      console.error('Delete chat room error:', error);
      throw error;
    }
  }

  // 채팅방 마감 처리
  async closeChatRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
      if (!roomDoc.exists()) {
        throw new Error('채팅방을 찾을 수 없습니다.');
      }

      const roomData = roomDoc.data();
      if (roomData.hostId !== userId) {
        throw new Error('채팅방을 마감할 권한이 없습니다.');
      }

      await updateDoc(doc(db, 'chatRooms', roomId), {
        status: '마감',
        isClosed: true
      });
    } catch (error) {
      console.error('Close chat room error:', error);
      throw error;
    }
  }

  // 참여자 목록 가져오기
  async getParticipants(roomId: string): Promise<Record<string, unknown>[]> {
    try {
      const participantsSnapshot = await getDocs(collection(db, 'chatRooms', roomId, 'participants'));
      return participantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get participants error:', error);
      throw error;
    }
  }

  // 참여자 승인
  async confirmParticipant(roomId: string, participantId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'chatRooms', roomId, 'participants', participantId), {
        isConfirmed: true
      });
    } catch (error) {
      console.error('Confirm participant error:', error);
      throw error;
    }
  }

  // 참여자 거부
  async rejectParticipant(roomId: string, participantId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'chatRooms', roomId, 'participants', participantId));
    } catch (error) {
      console.error('Reject participant error:', error);
      throw error;
    }
  }

  // 참여자 추방
  async kickParticipant(roomId: string, participantId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'chatRooms', roomId, 'participants', participantId));
    } catch (error) {
      console.error('Kick participant error:', error);
      throw error;
    }
  }

  // 채팅방 정보 가져오기
  async fetchChatRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
      if (!roomDoc.exists()) {
        return null;
      }
      return this.decodeChatRoom(roomId, roomDoc.data());
    } catch (error) {
      console.error('Fetch chat room error:', error);
      throw error;
    }
  }

  // 채팅 메시지 가져오기
  async fetchChatMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const messagesSnapshot = await getDocs(
        query(messagesRef, orderBy('timestamp', 'asc'))
      );
      
      return messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          roomId: roomId,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date(),
          messageType: data.messageType || 'text'
        };
      });
    } catch (error) {
      console.error('Fetch chat messages error:', error);
      throw error;
    }
  }

  // 참여자 수 조회
  async participantCounts(roomId: string): Promise<{ male: number; female: number }> {
    try {
      const participantsRef = collection(db, 'chatRooms', roomId, 'participants');
      const snapshot = await getDocs(participantsRef);
      
      let male = 0;
      let female = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const isHost = data.isHost || false;
        if (!isHost) {
          if (data.gender === '남성') male++;
          if (data.gender === '여성') female++;
        }
      });

      return { male, female };
    } catch (error) {
      console.error('Participant counts error:', error);
      throw error;
    }
  }

  // 사용자가 차단되었는지 확인
  private async isUserBanned(roomId: string, userId: string): Promise<boolean> {
    try {
      const roomDoc = await getDoc(doc(db, 'chatRooms', roomId));
      if (!roomDoc.exists()) return false;
      
      const data = roomDoc.data();
      const bannedUserIds = data.bannedUserIds || [];
      return bannedUserIds.includes(userId);
    } catch (error) {
      console.error('Check user banned error:', error);
      return false;
    }
  }

  // 사용자가 참여 중인지 확인
  private async isUserParticipating(roomId: string, userId: string): Promise<boolean> {
    try {
      const participantDoc = await getDoc(doc(db, 'chatRooms', roomId, 'participants', userId));
      return participantDoc.exists();
    } catch (error) {
      console.error('Check user participating error:', error);
      return false;
    }
  }

  // 모든 채팅방의 참여자 프로필 업데이트
  private async updateParticipantProfilesInAllRooms(profile: UserProfile): Promise<void> {
    try {
      const rooms = await this.fetchChatRooms();
      const memberships = await this.fetchUserMemberships(profile.id);
      
      const userRooms = rooms.filter(room => 
        room.id && memberships[room.id]?.isParticipating
      );

      for (const room of userRooms) {
        if (!room.id) continue;
        
        const participantRef = doc(db, 'chatRooms', room.id, 'participants', profile.id);
        await updateDoc(participantRef, {
          name: profile.name,
          gender: profile.gender,
          ntrp: profile.ntrp,
          experience: profile.experience,
          ageGroup: profile.ageGroup,
          homeCourt: profile.homeCourt
        });
      }
    } catch (error) {
      console.error('Update participant profiles error:', error);
    }
  }

  // 데이터 디코딩 헬퍼들
  private decodeUserProfile(data: Record<string, unknown>): UserProfile {
    const lastModified = data.lastModified instanceof Timestamp 
      ? data.lastModified.toDate() 
      : new Date();
    
    return {
      id: (data.id as string) || '',
      name: (data.name as string) || '',
      gender: (data.gender as string) || '남성',
      ageGroup: (data.ageGroup as string) || '20대',
      homeCourt: (data.homeCourt as string) || '',
      ntrp: (data.ntrp as number) || 1.0,
      experience: (data.experience as number) || 0.5,
      lastModified,
      isComplete: !!((data.name as string)?.trim() && (data.homeCourt as string)?.trim()),
      canEdit: lastModified < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextEditDate: new Date(lastModified.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  private decodeChatRoom(docId: string, data: Record<string, unknown>): ChatRoom | null {
    try {
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date();
      const startTime = data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date();
      const endTime = data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date();

      return {
        id: docId,
        courtName: (data.courtName as string) || '',
        courtNumber: (data.courtNumber as string) || '',
        date,
        startTime,
        endTime,
        gameType: (data.gameType as string) || '',
        ntrp: (data.ntrp as number) || 0,
        maleCount: (data.maleCount as number) || 0,
        femaleCount: (data.femaleCount as number) || 0,
        hostId: (data.hostId as string) || '',
        bannedUserIds: (data.bannedUserIds as string[]) || [],
        status: (data.status as string) || '모집중',
        isClosed: (data.isClosed as boolean) || false,
        isFinished: endTime < new Date()
      };
    } catch (error) {
      console.error('Decode chat room error:', error);
      return null;
    }
  }
}

export const authService = AuthService.getInstance();
