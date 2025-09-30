# 🚀 배포 가이드

## 📋 사전 준비사항

### 1. Firebase 프로젝트 설정
- [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
- Authentication (이메일/비밀번호) 활성화
- Firestore Database 생성
- 웹 앱 등록 후 설정 정보 복사

### 2. AWS 계정 설정
- [AWS Console](https://console.aws.amazon.com/) 계정 생성
- IAM 사용자 생성 (프로그래밍 방식 액세스)
- 필요한 권한: S3, CloudFront, Route 53, Certificate Manager

## 🎯 배포 방법 선택

### 방법 1: AWS Amplify (권장 - 가장 간단)

#### 1단계: GitHub 저장소 생성
```bash
# Git 저장소 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub에 푸시
git remote add origin https://github.com/yourusername/happy-tennis-web.git
git push -u origin main
```

#### 2단계: AWS Amplify에서 앱 생성
1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/) 접속
2. "새 앱 호스팅" → "GitHub" 선택
3. 저장소 연결
4. 빌드 설정 자동 감지 확인
5. 환경 변수 설정:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
6. 배포 시작

### 방법 2: AWS S3 + CloudFront

#### 1단계: AWS CLI 설정
```bash
# AWS CLI 설치 (macOS)
brew install awscli

# AWS 자격 증명 설정
aws configure
```

#### 2단계: 배포 스크립트 실행
```bash
# 배포 스크립트 실행
./scripts/deploy.sh production
```

#### 3단계: 도메인 설정 (선택사항)
1. Route 53에서 도메인 등록/연결
2. Certificate Manager에서 SSL 인증서 생성
3. CloudFront에 도메인 연결

### 방법 3: GitHub Actions 자동 배포

#### 1단계: GitHub Secrets 설정
Repository Settings → Secrets and variables → Actions에서 다음 추가:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
CLOUDFRONT_DISTRIBUTION_ID
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

#### 2단계: 코드 푸시
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

## 🔧 환경 변수 설정

### 로컬 개발
`.env.local` 파일 생성:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 프로덕션 배포
- AWS Amplify: Console에서 환경 변수 설정
- AWS S3/CloudFront: GitHub Secrets 또는 AWS Systems Manager 사용

## 🌐 도메인 설정

### 1. 커스텀 도메인 연결
1. Route 53에서 도메인 등록
2. Certificate Manager에서 SSL 인증서 생성
3. CloudFront/Amplify에 도메인 연결

### 2. DNS 설정
```
Type: CNAME
Name: www
Value: your-cloudfront-domain.cloudfront.net
```

## 📊 모니터링 설정

### 1. CloudWatch 로그
- 애플리케이션 로그 수집
- 에러 모니터링
- 성능 메트릭

### 2. AWS X-Ray (선택사항)
- 분산 추적
- 성능 분석

## 💰 비용 최적화

### 1. CloudFront 캐싱
- 정적 파일: 1년 캐시
- HTML: 1시간 캐시
- 압축 활성화

### 2. S3 스토리지
- Standard-IA 사용
- 수명주기 정책 설정

### 3. Lambda@Edge (고급)
- 엣지에서 동적 콘텐츠 처리

## 🔒 보안 설정

### 1. Firestore 보안 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /chatRooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. CORS 설정
- 필요한 도메인만 허용
- 적절한 헤더 설정

## 🚨 문제 해결

### 1. 빌드 실패
- Node.js 버전 확인 (18.x 권장)
- 의존성 충돌 해결
- 환경 변수 누락 확인

### 2. 배포 실패
- AWS 자격 증명 확인
- 권한 설정 확인
- 리전 설정 확인

### 3. 도메인 연결 실패
- DNS 전파 대기 (최대 48시간)
- SSL 인증서 상태 확인
- CloudFront 배포 상태 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. [Firebase 문서](https://firebase.google.com/docs)
2. [AWS Amplify 문서](https://docs.aws.amazon.com/amplify/)
3. [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
