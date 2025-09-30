# AWS 배포 가이드

## 1. AWS Amplify를 사용한 배포 (권장)

### AWS 계정 설정
1. [AWS Console](https://console.aws.amazon.com/)에 로그인
2. AWS 계정이 없다면 새로 생성

### Amplify 콘솔에서 앱 생성
1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/) 접속
2. "새 앱 호스팅" 클릭
3. "GitHub" 선택 (또는 "Deploy without Git" 선택)
4. 저장소 연결 또는 코드 업로드

### 빌드 설정
Amplify에서 자동으로 감지하지만, 필요시 `amplify.yml` 파일 생성:

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

## 2. AWS S3 + CloudFront를 사용한 배포

### S3 버킷 생성
1. [S3 Console](https://console.aws.amazon.com/s3/) 접속
2. "버킷 만들기" 클릭
3. 버킷 이름: `happy-tennis-web-[고유번호]`
4. 리전: `Asia Pacific (Seoul) ap-northeast-2`
5. 퍼블릭 액세스 차단 해제
6. 버킷 정책 설정:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### CloudFront 배포 생성
1. [CloudFront Console](https://console.aws.amazon.com/cloudfront/) 접속
2. "배포 생성" 클릭
3. 원본 도메인: S3 버킷 선택
4. 뷰어 프로토콜 정책: "Redirect HTTP to HTTPS"
5. 캐시 정책: "CachingOptimized"
6. 배포 생성

## 3. GitHub Actions를 사용한 자동 배포

### GitHub 저장소 설정
1. GitHub에 코드 푸시
2. Settings > Secrets에서 AWS 자격 증명 추가

### GitHub Actions 워크플로우
`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to S3
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-northeast-2
    
    - name: Upload to S3
      run: aws s3 sync .next/static s3://${{ secrets.S3_BUCKET }}/_next/static
      run: aws s3 sync public s3://${{ secrets.S3_BUCKET }}/
      run: aws s3 cp .next/index.html s3://${{ secrets.S3_BUCKET }}/index.html
    
    - name: Invalidate CloudFront
      run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## 4. 도메인 설정

### Route 53을 사용한 도메인 연결
1. [Route 53 Console](https://console.aws.amazon.com/route53/) 접속
2. 호스팅 영역 생성
3. 도메인 등록 또는 기존 도메인 연결
4. CloudFront 배포에 CNAME 레코드 추가

### SSL 인증서 설정
1. [Certificate Manager](https://console.aws.amazon.com/acm/) 접속
2. 인증서 요청
3. 도메인 검증
4. CloudFront 배포에 인증서 연결

## 5. 환경 변수 설정

### AWS Systems Manager Parameter Store 사용
1. [Systems Manager Console](https://console.aws.amazon.com/systems-manager/) 접속
2. Parameter Store에서 Firebase 설정 저장
3. 애플리케이션에서 환경 변수 로드

### 또는 Amplify 환경 변수 설정
1. Amplify Console > 앱 설정 > 환경 변수
2. Firebase 설정 추가
3. 빌드 시 자동으로 주입

## 6. 모니터링 및 로깅

### CloudWatch 설정
1. [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/) 접속
2. 로그 그룹 생성
3. 애플리케이션 로그 수집

### AWS X-Ray (선택사항)
1. [X-Ray Console](https://console.aws.amazon.com/xray/) 접속
2. 분산 추적 설정
3. 성능 모니터링

## 7. 비용 최적화

### CloudFront 캐싱 최적화
- 적절한 TTL 설정
- 압축 활성화
- HTTP/2 지원

### S3 스토리지 클래스 최적화
- Standard-IA 사용
- 수명주기 정책 설정

### Lambda@Edge (고급)
- 엣지에서 동적 콘텐츠 처리
- 지연 시간 최소화
