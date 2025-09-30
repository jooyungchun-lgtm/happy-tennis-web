# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `happy-tennis-web`
4. Google Analytics 활성화 (선택사항)
5. 프로젝트 생성 완료

## 2. 웹 앱 추가

1. 프로젝트 대시보드에서 "웹" 아이콘 클릭
2. 앱 닉네임: `happy-tennis-web`
3. "Firebase Hosting도 설정" 체크
4. 앱 등록 완료

## 3. Firebase 서비스 설정

### Authentication 설정
1. 왼쪽 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭에서 "이메일/비밀번호" 활성화
4. "저장" 클릭

### Firestore Database 설정
1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "테스트 모드에서 시작" 선택 (개발용)
4. 위치: `asia-northeast3` (서울) 선택
5. "완료" 클릭

## 4. 환경 변수 설정

프로젝트 설정에서 웹 앱의 Firebase SDK 설정을 복사하여 `.env.local` 파일에 추가:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Firestore 보안 규칙 설정

Firestore Database > 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 프로필은 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 채팅방은 인증된 사용자만 읽기 가능
    match /chatRooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      
      // 참여자는 본인이 참여한 방만 읽기/쓰기 가능
      match /participants/{participantId} {
        allow read, write: if request.auth != null && request.auth.uid == participantId;
      }
      
      // 메시지는 인증된 사용자만 읽기/쓰기 가능
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## 6. Firebase Hosting 설정 (선택사항)

1. 왼쪽 메뉴에서 "Hosting" 클릭
2. "시작하기" 클릭
3. Firebase CLI 설치 및 로그인
4. 프로젝트 초기화 및 배포
