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

공유 버튼은 `/share/20260907/{team}/` 주소를 사용합니다. LG만 iOS 카드 표시 문제를 비교하기 위해 `/share/20260907-v2/lg/`를 사용하며, 일반 공유와 결과 공유에 동일하게 적용됩니다. 팀 코드는 `kt`, `nc`, `ssg`, `kia`, `doosan`, `lotte`, `samsung`, `lg`, `kiwoom`, `hanwha`입니다.

- `public/share/20260907/{team}/index.html`: JavaScript 실행 없이 읽을 수 있는 공유 메타태그. 사람이 열면 홈으로 이동합니다.
- `public/share-{team}-20260907.jpg`: 1200×675 JPEG, 각 350KB 미만. 기존 PNG는 원본으로 유지합니다.
- LG v2 이미지는 `public/share-lg-20260907-v2.jpg`이며 1000×562 JPEG로 재인코딩했습니다. 기존 LG 주소도 이 이미지를 참조합니다. iOS 표시 개선 여부는 배포 후 별도로 확인해야 합니다.
- 기존 팀 주소의 메타태그도 새 JPEG를 참조합니다.

배포 후에는 기존 주소와 새 주소를 X 작성 화면에 각각 붙여 넣어 비교합니다. 먼저 삼성과 LG를 비교하고, 두산·NC·한화도 확인합니다. 작성 화면만으로 확인할 수 있으므로 게시할 필요는 없습니다. HTTP 응답 성공만으로 실제 X 카드 표시 성공을 판정하지 않습니다.

이미지가 여전히 빠지면 Vercel의 요청/방화벽 기록에서 해당 페이지 및 이미지 경로를 검색해 실제 `Twitterbot` 요청의 상태 코드와 차단 여부를 확인합니다. 정적 파일 요청은 함수 Runtime Logs에 없을 수 있으며, 과거 요청 기록은 프로젝트의 로그 제공 범위와 보존 기간에 따라 조회가 불가능할 수 있습니다.

## 포텔리어 야구 기운 배너

선수명·선수 이미지·구단 로고 없이 KIA, 삼성, 롯데, LG, 두산, 한화, KT, NC, SSG, 키움 기업명만 쓰는 10종입니다. 현재는 쿠팡/AdSense를 임시로 끄고 포텔리어 배너를 바로 표시합니다. 시작 화면은 선택 중인 구단, 게임 화면과 PC 사이드는 현재 출제 구단에 맞춥니다. 여러 구단이면 선택 목록에서 배너가 있는 구단들을 선택 순서대로 5초마다 순환합니다. 가로 배너와 PC 사이드는 이미지·문구·링크가 함께 바뀌며, 선택 구단을 변경하면 첫 배너부터 다시 시작합니다. 한 구단만 선택하면 고정하고, 미선택이면 기업명이 없는 공통 문구를 표시합니다. `VITE_ENABLE_EXTERNAL_ADS=true`로 변경 후 다시 빌드하면 기존 쿠팡/AdSense 혼합 노출을 복원합니다.

- `src/cheonsindangCampaigns.ts`: 기업명, 문구, 이미지, 목적지 설정.
- `src/CheonsindangBanner.tsx`: 실제 배너와 개발용 10종 갤러리.
- `public/ads/cheonsindang/`: 기업별 생성 이미지.
- 로컬 개발 서버의 `/?banner-preview=1`에서 가로형·341px 모바일·180×600 사이드 배너를 비교할 수 있습니다. 프로덕션에서는 이 쿼리가 갤러리를 열지 않습니다.

각 목적지는 `.env.example`의 `VITE_CHEONSINDANG_KIA_URL` 등 10개 환경 변수로 따로 설정합니다. Vite 환경 변수이므로 변경 후 다시 빌드/배포해야 합니다. 개별 값이 없거나 올바른 HTTP(S) URL이 아니면 공통 `VITE_BASEBALL_FORTUNE_URL`(기본: `https://www.fortelior.com/ko/baseball?from=guessPlayer`)에 기업별 `utm_content`를 붙입니다. 이 기본값은 같은 오늘의 야구 페이지로 가는 구분용 링크이며, 기업별 별도 콘텐츠 페이지를 만들지는 않습니다.

이미지는 built-in `image_gen`으로 생성했으며 최종 프롬프트 10개는 `docs/cheonsindang-image-prompts.md`에 보관합니다. PNG 원본에는 글자가 없고 실제 배너에서 HTML 문구를 겹쳐 표시합니다.


## nu-kya.com 도메인 연결

대표 게임 주소는 `https://nu-kya.com/`입니다. 게임 공유 URL, 팀별 공유 페이지의 canonical/OG/Twitter 이미지 URL, sitemap과 robots도 이 도메인을 사용합니다. 기존 `/game/{id}`와 `/share/...` 경로는 같은 Vercel 프로젝트에서 그대로 동작합니다.

- 게임 API는 `VITE_API_BASE_URL=https://api.solusi.co.kr/api/v1`을 사용합니다. 프론트 도메인으로 API 주소를 바꾸지 않습니다.
- `InPharm_BE`의 KBO CORS 변경을 먼저 배포해야 새 도메인에서 게임 API를 호출할 수 있습니다. `https://nu-kya.com`과 `https://www.nu-kya.com`을 KBO API에 허용합니다. www를 실제 서비스하려면 Vercel에도 해당 도메인 등록이 필요합니다.
- 이후 guessPlayer를 배포하면 새로 복사하는 공유 링크 및 검색·공유 메타정보가 새 도메인을 사용합니다.
- 포텔리어 배너는 기존 `https://www.fortelior.com/ko/baseball?from=guessPlayer`에 팀별 `utm_content`를 붙여 연결합니다. 도메인이 달라도 이 식별자로 기존 포텔리어 유입·결제 전환 추적을 이어갑니다.
- 이번 변경에는 DB 마이그레이션이 없습니다.
