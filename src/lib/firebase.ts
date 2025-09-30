import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  // Firebase 설정 - 실제 프로젝트 설정
  apiKey: "AIzaSyBRzmOkjqe4bAYnk17f5tsrfWovKEXWrKM",
  authDomain: "happy-tennis-61d73.firebaseapp.com",
  projectId: "happy-tennis-61d73",
  storageBucket: "happy-tennis-61d73.firebasestorage.app",
  messagingSenderId: "144589220464",
  appId: "1:144589220464:web:cf985ff307c6aaad6da2b5",
  measurementId: "G-XC8Y4ZXB0Y"
};

// Firebase 초기화 (환경변수가 없으면 더미 설정 사용)
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // 더미 앱 객체 생성
  app = {} as FirebaseApp;
}

// Firebase 서비스들
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics는 브라우저에서만 초기화
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;
