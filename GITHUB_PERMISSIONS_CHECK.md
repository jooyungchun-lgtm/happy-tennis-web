# 🔧 GitHub 권한 및 AWS Amplify 연결 문제 해결

## 📋 문제 진단 체크리스트

### 1. GitHub 리포지토리 가시성 확인
- [ ] 리포지토리가 **Public**으로 설정되어 있는가?
- [ ] 리포지토리 URL이 정확한가? `https://github.com/jooyungchun-lgtm/happy-tennis-web`

### 2. AWS Amplify GitHub 앱 권한 확인
1. **GitHub → Settings → Applications → Installed GitHub Apps**
2. **AWS Amplify** 앱이 설치되어 있는지 확인
3. **Configure** 클릭하여 권한 확인
4. **Repository access**에서 `jooyungchun-lgtm/happy-tennis-web` 리포지토리가 선택되어 있는지 확인

### 3. AWS Amplify Console에서 GitHub 재연결
1. **AWS Amplify Console** 접속
2. **"새 애플리케이션 추가"** 클릭
3. **"웹 앱 호스팅"** 선택
4. **"GitHub"** 선택
5. **"GitHub에 연결"** 클릭
6. GitHub 인증 재승인

## 🔄 해결 방법

### 방법 1: GitHub 앱 권한 재설정
1. GitHub → Settings → Applications → Installed GitHub Apps
2. AWS Amplify 앱 **"Uninstall"**
3. AWS Amplify Console에서 **"GitHub에 연결"** 다시 시도
4. 모든 리포지토리 권한 **"All repositories"** 선택

### 방법 2: 리포지토리 공개 설정
1. GitHub 리포지토리 → Settings → General
2. **Repository visibility** → **Public** 선택
3. **Change repository visibility** 확인

### 방법 3: 수동 리포지토리 추가
1. AWS Amplify Console에서 **"새 애플리케이션 추가"**
2. **"웹 앱 호스팅"** → **"GitHub"**
3. **"GitHub에 연결"** 후 리포지토리 목록에서 `happy-tennis-web` 찾기
4. 찾을 수 없다면 **"Refresh"** 버튼 클릭

## 🚨 일반적인 문제들

### 문제 1: 리포지토리가 비공개
- **해결**: GitHub에서 리포지토리를 Public으로 변경

### 문제 2: AWS Amplify 앱 권한 부족
- **해결**: GitHub 앱 권한을 "All repositories"로 설정

### 문제 3: 브라우저 캐시 문제
- **해결**: 브라우저 캐시 삭제 후 재시도

### 문제 4: GitHub 조직 권한
- **해결**: 조직 관리자에게 AWS Amplify 권한 요청

## 📞 추가 지원

문제가 지속되면:
1. **GitHub Support**: https://support.github.com/
2. **AWS Support**: https://aws.amazon.com/support/
3. **리포지토리 URL 재확인**: https://github.com/jooyungchun-lgtm/happy-tennis-web
