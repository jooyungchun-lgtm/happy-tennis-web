# Wild Card Tennis Matching - Web Version

테니스 매칭 서비스를 위한 모바일 웹 애플리케이션입니다.

## 🚀 기능

- **사용자 인증**: Firebase Authentication을 통한 로그인/회원가입
- **프로필 관리**: NTRP, 경험, 홈코트 등 사용자 정보 관리
- **채팅방 생성**: 테니스 경기 매칭을 위한 채팅방 생성
- **실시간 채팅**: Firebase Firestore를 통한 실시간 메시징
- **참여자 관리**: 채팅방 참여/탈퇴, 인원 관리
- **모바일 최적화**: PWA 지원, 반응형 디자인

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Icons**: Heroicons
- **PWA**: Next.js PWA 지원

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Firebase 설정을 추가하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🔧 Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호)
3. Firestore Database 생성
4. 웹 앱 추가 후 설정 정보 복사

## 📱 PWA 설치

모바일 기기에서 웹사이트를 방문하면 홈 화면에 추가할 수 있습니다.

## 🏗 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── main/              # 메인 기능 컴포넌트
│   └── ui/                # 공통 UI 컴포넌트
├── contexts/              # React Context
├── lib/                   # 유틸리티 및 서비스
├── types/                 # TypeScript 타입 정의
└── styles/                # 스타일 파일
```

## 🚀 배포

### AWS Amplify (권장)

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)에서 앱 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 완료

### AWS S3 + CloudFront

```bash
# AWS CLI 설정 후
npm run deploy
```

### GitHub Actions 자동 배포

1. GitHub Secrets에 AWS 자격 증명 추가
2. 코드 푸시 시 자동 배포

### 기타 플랫폼

```bash
npm run build
npm start
```

자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참조하세요.

## 📄 라이선스

MIT License