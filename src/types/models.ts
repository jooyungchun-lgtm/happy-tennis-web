// User Profile Model
export interface UserProfile {
  id: string;                // Firebase UID
  name: string;
  gender: string;
  ageGroup: string;
  homeCourt: string;
  ntrp: number;
  experience: number;
  lastModified: Date;        // 마지막 수정일

  // Computed properties
  isComplete: boolean;
  canEdit: boolean;
  nextEditDate: Date;
}

// Chat Room Model
export interface ChatRoom {
  id?: string;                    // Firestore documentID
  courtName: string;
  courtNumber: string;
  date: Date;                     // UI용 (저장은 Timestamp)
  startTime: Date;                // 저장 시 Timestamp
  endTime: Date;                  // 저장 시 Timestamp
  gameType: string;               // "남자 단식" 등
  ntrp: number;
  maleCount: number;
  femaleCount: number;
  hostId: string;
  bannedUserIds?: string[];       // 기본 []
  status: string;                 // "모집중", "마감"
  isClosed: boolean;              // 마감 여부

  // Computed properties
  isFinished: boolean;
}

// Chat Message Model
export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  messageType: 'text' | 'system' | 'join' | 'leave';
}

// Participant Model
export interface Participant {
  id: string;
  name: string;
  gender: string;
  isHost: boolean;
  isConfirmed: boolean;
  role: 'host' | 'participant';
  ntrp?: number;
  experience?: number;
  ageGroup?: string;
  homeCourt?: string;
}

// Personal Status for UI
export type PersonalStatus = 
  | { type: 'none' }
  | { type: 'participating'; isConfirmed: boolean }
  | { type: 'host' };

// Membership Model
export interface Membership {
  roomId: string;
  isConfirmed: boolean;
  isParticipating: boolean;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  user: unknown | null;  // Firebase User
  userProfile: UserProfile | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  keepLoggedIn: boolean;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileForm {
  name: string;
  gender: string;
  ageGroup: string;
  homeCourt: string;
  ntrp: number;
  experience: number;
}

export interface CreateRoomForm {
  courtName: string;
  courtNumber: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  gameType: string;
  ntrp: number;
  maleCount: number;
  femaleCount: number;
}
