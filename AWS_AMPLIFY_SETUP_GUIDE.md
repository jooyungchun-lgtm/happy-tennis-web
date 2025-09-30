# 🚀 AWS Amplify 배포 설정 가이드

## 📋 사전 준비사항

### 1. AWS 계정 생성
- [AWS 계정 생성](https://aws.amazon.com/ko/amplify/getting-started/)
- 신용카드 정보 필요 (무료 플랜 사용 가능)

### 2. GitHub 리포지토리 준비
- ✅ 리포지토리: `https://github.com/jooyungchun-lgtm/happy-tennis-web`
- ✅ 브랜치: `main`, `develop`, `feature/firebase-integration`
- ✅ GitHub Actions 워크플로우 설정 완료

## 🔧 AWS Amplify 설정 단계

### 1단계: AWS Amplify Console 접속
1. [AWS Management Console](https://console.aws.amazon.com/) 로그인
2. 서비스 검색에서 "Amplify" 입력
3. **AWS Amplify** 클릭

### 2단계: 새 애플리케이션 생성
1. **"새 애플리케이션 추가"** 클릭
2. **"웹 앱 호스팅"** 선택
3. **"GitHub"** 선택 (리포지토리 공급자)

### 3단계: GitHub 리포지토리 연결
1. **"GitHub에 연결"** 클릭
2. GitHub 인증 승인
3. **리포지토리 선택**: `jooyungchun-lgtm/happy-tennis-web`
4. **브랜치 선택**: `main`
5. **"다음"** 클릭

### 4단계: 빌드 설정 구성

#### 자동 감지된 설정 확인
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

#### 환경 변수 설정
**"고급 설정"** → **"환경 변수"** 섹션에서 추가:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBRzmOkjqe4bAYnk17f5tsrfWovKEXWrKM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = happy-tennis-61d73.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = happy-tennis-61d73
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = happy-tennis-61d73.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 144589220464
NEXT_PUBLIC_FIREBASE_APP_ID = 1:144589220464:web:cf985ff307c6aaad6da2b5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-XC8Y4ZXB0Y
```

### 5단계: 배포 시작
1. **"저장 및 배포"** 클릭
2. 빌드 프로세스 시작 (약 5-10분 소요)
3. 배포 완료 후 도메인 확인

## 🌐 배포 완료 후 확인사항

### 1. 도메인 확인
- Amplify에서 제공하는 도메인 (예: `https://main.d1234567890.amplifyapp.com`)
- 애플리케이션 정상 작동 확인

### 2. 자동 배포 확인
- `main` 브랜치에 푸시 시 자동 배포
- GitHub Actions와 Amplify 연동 확인

### 3. 커스텀 도메인 설정 (선택사항)
- **"도메인 관리"** → **"도메인 추가"**
- Route 53 또는 외부 도메인 연결

## 💰 비용 정보

### 무료 플랜 (AWS Free Tier)
- **빌드 시간**: 월 1,000분 무료
- **데이터 전송**: 월 15GB 무료
- **저장소**: 월 5GB 무료

### 유료 플랜 (필요시)
- **빌드 시간**: $0.01/분
- **데이터 전송**: $0.15/GB
- **저장소**: $0.023/GB/월

## 🔧 문제 해결

### 빌드 실패 시
1. **빌드 로그** 확인
2. **환경 변수** 설정 확인
3. **Node.js 버전** 확인 (18.x 권장)

### 배포 실패 시
1. **GitHub Actions** 상태 확인
2. **리포지토리 권한** 확인
3. **브랜치 설정** 확인

## 📞 지원

- [AWS Amplify 문서](https://docs.aws.amazon.com/amplify/)
- [AWS Support](https://aws.amazon.com/support/)
- [GitHub Issues](https://github.com/jooyungchun-lgtm/happy-tennis-web/issues)

---

**🎉 설정 완료 후 웹 애플리케이션이 전 세계에서 접근 가능합니다!**
