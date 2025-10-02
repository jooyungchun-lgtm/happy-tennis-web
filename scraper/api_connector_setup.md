# API Connector 설정 가이드

## 1단계: API Connector 설치

### Google Sheets에서 설치
1. 구글 시트 열기
2. **Extensions** → **Add-ons** → **Get add-ons** 클릭
3. "API Connector" 검색
4. **Mixed Analytics**에서 제공하는 **API Connector** 설치
5. 권한 허용

## 2단계: API Connector 설정

### 기본 설정
1. **Extensions** → **API Connector** → **Open** 클릭
2. **Create request** 버튼 클릭

### Request 설정
```
Application: Custom
Method: GET
Request URL: https://raw.githubusercontent.com/[사용자명]/[저장소명]/main/scraper/seoul_tennis_github_api.json
```

### Headers 설정 (선택사항)
```
Content-Type: application/json
Accept: application/json
```

## 3단계: 데이터 매핑 설정

### JSON Path 설정
1. **tennis_courts** 배열 선택
2. 다음과 같이 매핑:

| JSON Field | 구글 시트 컬럼 | 설명 |
|------------|---------------|------|
| 번호 | A | 순번 |
| 시설명 | B | 테니스장 이름 |
| 지역 | C | 구 단위 |
| 주소 | D | 상세 주소 |
| 코트번호 | E | 코트 정보 |
| 시간대 | F | 이용 시간대 |
| 이용대상 | G | 이용 제한 |
| 예약방법 | H | 예약 방식 |
| 요금정보 | I | 요금 유무 |
| 예약상태 | J | 현재 상태 |
| 설명 | K | 상세 설명 |
| 추출일시 | L | 데이터 수집 시간 |

## 4단계: Output 설정

### Destination Sheet
- **Set current**: 현재 시트의 A1 셀부터 시작
- 또는 새로운 시트 생성

### Output Options
- **Replace existing data**: 기존 데이터 덮어쓰기
- **Append to existing data**: 기존 데이터에 추가

## 5단계: 자동 새로고침 설정

### Auto-refresh 활성화
1. **Schedule automatic runs** 체크
2. **Frequency** 설정:
   - Every hour (매시간)
   - Every day (매일)
   - Every week (매주)
3. **Time** 설정 (원하는 시간대)

## 6단계: 실행 및 테스트

### 첫 실행
1. **Run** 버튼 클릭
2. 데이터가 올바르게 로드되는지 확인
3. 에러가 있으면 URL과 설정 재확인

### 성공 시 결과
- 26개 테니스장 데이터가 시트에 표시됨
- 각 컬럼에 올바른 데이터 매핑 확인
- 자동 새로고침 스케줄 활성화

## 문제 해결

### 일반적인 오류
1. **404 Error**: GitHub URL 확인
2. **JSON Parse Error**: JSON 파일 형식 확인
3. **Rate Limit**: 요청 빈도 조절

### URL 확인 방법
브라우저에서 직접 접속해서 JSON 데이터가 표시되는지 확인:
```
https://raw.githubusercontent.com/[사용자명]/[저장소명]/main/scraper/seoul_tennis_github_api.json
```
