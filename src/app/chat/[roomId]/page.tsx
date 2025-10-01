'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { ChatMessage, ChatRoom } from '@/types/models';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import ChatMessageComponent from '@/components/chat/ChatMessageComponent';
import ChatInput from '@/components/chat/ChatInput';
// LoadingSpinner 컴포넌트를 인라인으로 정의
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
  </div>
);
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { notificationService } from '@/lib/notifications';

const authService = AuthService.getInstance();

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const roomId = params.roomId as string;
  
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isParticipating, setIsParticipating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 실시간 채팅 훅 사용
  const { messages, loading: messagesLoading, error: messagesError } = useRealtimeChat(roomId);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 채팅방 정보 로드
  const loadChatRoom = async () => {
    try {
      setLoading(true);
      setError('');
      
      const room = await authService.fetchChatRoom(roomId);
      if (!room) {
        setError('채팅방을 찾을 수 없습니다.');
        return;
      }
      
      setChatRoom(room);
      
      // 사용자가 참여 중인지 확인
      if (userProfile) {
        const memberships = await authService.fetchUserMemberships(userProfile.id);
        setIsParticipating(memberships[roomId]?.isParticipating || false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '채팅방을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 알림 초기화
  useEffect(() => {
    notificationService.init();
    notificationService.requestPermission();
  }, []);

  // 메시지 전송
  const handleSendMessage = async (content: string) => {
    if (!userProfile || !isParticipating) return;
    
    try {
      await authService.sendMessage(roomId, userProfile.id, content);
      // 실시간 훅이 자동으로 업데이트하므로 별도 로드 불필요
    } catch (err: unknown) {
      console.error('메시지 전송 실패:', err);
    }
  };

  // 채팅방 참여
  const handleJoinRoom = async () => {
    if (!userProfile) return;
    
    try {
      await authService.joinChatRoom(roomId, userProfile);
      setIsParticipating(true);
      await loadChatRoom();
    } catch (err: unknown) {
      console.error('채팅방 참여 실패:', err);
      setError(err instanceof Error ? err.message : '채팅방 참여에 실패했습니다.');
    }
  };

  // 채팅방 나가기
  const handleLeaveRoom = async () => {
    if (!userProfile) return;
    
    try {
      await authService.leaveChatRoom(roomId, userProfile.id);
      setIsParticipating(false);
      router.push('/');
    } catch (err: unknown) {
      console.error('채팅방 나가기 실패:', err);
      setError(err instanceof Error ? err.message : '채팅방 나가기에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (roomId) {
      loadChatRoom();
    }
  }, [roomId, userProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || messagesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">오류 발생</h2>
          <p className="text-white/80 mb-6">{error || messagesError}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!chatRoom) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* 헤더 */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{chatRoom.courtName}</h1>
              <p className="text-white/80 text-sm">
                {chatRoom.date.toLocaleDateString()} {chatRoom.startTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isParticipating ? (
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                나가기
              </button>
            ) : (
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                참여하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              <p>아직 메시지가 없습니다.</p>
              <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                isOwn={message.senderId === userProfile?.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 채팅 입력 */}
        {isParticipating && (
          <ChatInput onSendMessage={handleSendMessage} />
        )}
      </div>
    </div>
  );
}
