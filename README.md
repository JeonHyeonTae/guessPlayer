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
