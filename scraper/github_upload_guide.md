# GitHub에 테니스장 데이터 업로드하기

## 방법 1: GitHub 웹사이트에서 직접 업로드

### 1단계: GitHub 저장소 접속
1. GitHub.com에 로그인
2. 테니스 프로젝트 저장소로 이동
3. `scraper` 폴더로 이동 (없으면 생성)

### 2단계: 파일 업로드
1. "Add file" → "Upload files" 클릭
2. `seoul_tennis_github_api.json` 파일을 드래그 앤 드롭
3. Commit message 입력: "Add tennis court data for API connector"
4. "Commit changes" 클릭

### 3단계: Raw URL 확인
업로드 후 파일을 클릭하면 다음과 같은 URL이 생성됩니다:
```
https://raw.githubusercontent.com/[사용자명]/[저장소명]/main/scraper/seoul_tennis_github_api.json
```

## 방법 2: Git 명령어 사용 (터미널)

```bash
# 현재 디렉토리에서 Git 저장소로 이동
cd /Users/joo/Downloads/HappyTennis_gem/happy-tennis-web

# 파일 추가
git add scraper/seoul_tennis_github_api.json

# 커밋
git commit -m "Add tennis court data for API connector"

# GitHub에 푸시
git push origin main
```

## Raw URL 형식
업로드 완료 후 다음 형식의 URL을 사용합니다:
```
https://raw.githubusercontent.com/[GitHub사용자명]/[저장소명]/main/scraper/seoul_tennis_github_api.json
```

예시:
```
https://raw.githubusercontent.com/johndoe/tennis-app/main/scraper/seoul_tennis_github_api.json
```
