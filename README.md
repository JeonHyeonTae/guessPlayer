# 누크야! 프론트엔드

Vercel에 배포하는 React + Vite 정적 프론트엔드입니다. 게임 데이터와 로직은 별도 Spring 백엔드 API를 사용합니다.

## 로컬 실행

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

`.env.local`의 `VITE_API_BASE_URL`을 백엔드 주소로 변경합니다. 기본값은 `https://api.solusi.co.kr/api/v1`입니다.

## Vercel 배포

1. 이 디렉터리를 Vercel 프로젝트로 연결합니다.
2. **Environment Variables**에 `VITE_API_BASE_URL`을 `https://your-api-domain.com`처럼 설정합니다. 끝 슬래시는 제외합니다.
3. Build Command는 `npm run build`, Output Directory는 `dist`를 사용합니다.

`vercel.json`은 `/game/{id}`처럼 직접 접속한 SPA 경로도 앱으로 연결합니다.

백엔드에는 Vercel 도메인을 허용하는 CORS 설정이 필요합니다.


## X 공유 카드

공유 버튼은 `/share/20260907/{team}/` 주소를 사용합니다. 팀 코드는 `kt`, `nc`, `ssg`, `kia`, `doosan`, `lotte`, `samsung`, `lg`, `kiwoom`, `hanwha`입니다.

- `public/share/20260907/{team}/index.html`: JavaScript 실행 없이 읽을 수 있는 공유 메타태그. 사람이 열면 홈으로 이동합니다.
- `public/share-{team}-20260907.jpg`: 1200×675 JPEG, 각 350KB 미만. 기존 PNG는 원본으로 유지합니다.
- 기존 팀 주소의 메타태그도 새 JPEG를 참조합니다.

배포 후에는 기존 주소와 새 주소를 X 작성 화면에 각각 붙여 넣어 비교합니다. 먼저 삼성과 LG를 비교하고, 두산·NC·한화도 확인합니다. 작성 화면만으로 확인할 수 있으므로 게시할 필요는 없습니다. HTTP 응답 성공만으로 실제 X 카드 표시 성공을 판정하지 않습니다.

이미지가 여전히 빠지면 Vercel의 요청/방화벽 기록에서 해당 페이지 및 이미지 경로를 검색해 실제 `Twitterbot` 요청의 상태 코드와 차단 여부를 확인합니다. 정적 파일 요청은 함수 Runtime Logs에 없을 수 있으며, 과거 요청 기록은 프로젝트의 로그 제공 범위와 보존 기간에 따라 조회가 불가능할 수 있습니다.
