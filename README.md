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

## 한국어·영어 지원

상단 언어 버튼으로 게임 중에도 한국어·영어를 전환할 수 있습니다. 선택은 브라우저에 저장하며, `?lang=ko` 또는 `?lang=en`으로 명시할 수 있습니다. 지정한 언어가 없으면 저장된 선택, 브라우저 언어 순서로 결정합니다. `/en/`은 검색·공유 서비스도 읽을 수 있는 정적 영문 메타정보를 가진 영어 진입점입니다.

- 화면·규칙·명단·결과·오류·접근성 문구와 사이트 자체 배너는 선택 언어에 맞춰 표시합니다. 외부 광고 및 링크로 이동한 다른 사이트의 언어는 해당 서비스에서 정합니다.
- `src/i18n-core.ts`는 번역과 구단·포지션·투타 표기를, `src/i18n.tsx`는 언어 상태와 저장을 관리합니다.
- 화면과 검색·공유 메타정보는 리그 약칭이나 구단 별칭을 쓰지 않으며, 구단은 별칭을 뺀 기본 이름으로 표시합니다. API가 전체 구단명을 보내더라도 `teamName`이 표시할 이름을 정규화합니다. 퓨처스 전용 팀인 고양·상무·울산도 영어 화면에서는 Goyang·Sangmu·Ulsan으로 표시하며 API의 팀 식별값은 유지합니다.
- 선수 응답의 `name`은 한국어 원본이며 `nameEn`, `nameEnSource`가 추가됩니다. 영어 화면은 `nameEn`을 표시하며, 구버전 백엔드에 연결하면 한국어 이름으로 대체합니다.
- `nameEnSource`는 `KBO_OFFICIAL`(공식 영문 프로필), `CLUB_OFFICIAL`(선수 신원을 대조한 구단 공식 프로필), `ROMANIZED`(공식 표기가 없을 때 생성한 로마자 표기)입니다. 로마자 표기는 선수가 사용하는 공식 철자와 다를 수 있습니다. 울산 외국인 선수처럼 리그 영문 프로필의 이름이 비어 있으면 백엔드가 구단 공식 표기를 보완하며, 명단·검색·결과·공유는 같은 `nameEn`을 표시합니다.
- 구단과 포지션은 소수의 고정된 분류이므로 화면에서 번역합니다. API 요청·필터·정답 비교에는 기존 한국어 값을 그대로 사용하며, 언어 전환으로 게임 ID나 추측 기록을 바꾸지 않습니다.
- 영문 결과 공유는 `#YANGHyeonJong`처럼 공백 없는 선수 해시태그와 `/share/en/{team}/` 링크를 사용합니다. 기존 한국어 공유 카드도 명시된 언어 쿼리를 보존합니다.
- 일일 갱신 안내 시간은 접속자의 시간대와 관계없이 한국 시간 04:00–04:05입니다.

### 반영 순서

1. 상위 `InPharm_BE`의 선수 영문명 컬럼·기존 데이터 보완 마이그레이션(V37 SQL, V38 Java) 및 영문 검색·수집 코드를 먼저 빌드하고 배포합니다. 마이그레이션은 기존 한국어 이름을 보존합니다. 수집 주기·설정과 검증 내용은 백엔드의 `docs/kbo-english-names.md`에 있습니다.
2. 영문명은 초기 로마자 표기로 채운 뒤 별도 수집 작업에서 공식 KBO 표기로 보완합니다. 공식 프로필이 없는 선수·스태프는 로마자 표기를 유지합니다.
3. `npm run build` 후 프론트를 배포합니다. Vite는 기본 홈과 `en/index.html`을 함께 빌드합니다. 운영 DB 마이그레이션과 사이트 배포는 로컬 코드 수정만으로 실행되지 않습니다.
4. `/en/`에서 영어 이름 검색·명단·결과 복사를 확인하고, 게임 도중 한국어로 전환해 진행 기록과 선택 구단이 유지되는지 확인합니다.

`npm test`(Node.js 22 이상)는 언어 우선순위, 원본 데이터 보존, 해시태그, 한국 시간 갱신 경계를 검증합니다. `npm run build`로 타입 검사와 한국어·영어 진입점 빌드를 수행합니다.


## X 공유 카드

공유 버튼과 결과 복사는 선택 언어에 맞는 주소를 사용합니다. 영어는 `/share/en/{team}/`, 한국어는 `/share/20260907/{team}/`이며 한국어 LG만 `/share/20260907-v2/lg/`입니다. 팀 코드는 `kt`, `nc`, `ssg`, `kia`, `doosan`, `lotte`, `samsung`, `lg`, `kiwoom`, `hanwha`입니다. URL 및 결과 문구는 `src/share.ts`에서 관리합니다.

- `public/share/en/{team}/index.html`: 구단별 영문 제목·설명·이미지를 가진 정적 공유 페이지. 공유 서비스가 JavaScript 없이 메타태그를 읽을 수 있고, 사람이 열면 영어 홈으로 이동합니다.
- `public/share-{team}-en-20260909.jpg`: 기존 구단별 디자인의 영문판 10종, 1200×675 JPEG, 각 350KB 미만.
- `public/thumbnail-en-20260909.jpg`: 영어 홈 `/en/`의 기본 공유 이미지. 홈페이지 언어 전환 시 주소도 `/en/` 또는 `/`로 바뀌므로 주소창에서 복사한 홈 링크에도 해당 언어 카드가 표시됩니다.
- 영문 카드는 OG와 X의 `summary_large_image`를 사용하며, 한국어 원본 이미지는 유지합니다. 날짜가 포함된 새 이미지 경로로 기존 로고 이미지 캐시와 구분합니다.
- 영문 이미지는 built-in `image_gen`으로 생성했으며, 원본·출력 경로와 최종 프롬프트는 `docs/share-images-en-prompts.md`에 보관합니다.

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
