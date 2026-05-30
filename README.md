# POPCA · 팝카

**정보만 입력하면 AI가 6가지 디지털 명함 콘셉트를 만들고, 사용자가 고른 1장을 3D 공유 카드와 갤러리로 완성하는 Next.js + Convex 웹앱입니다.**

POPCA는 크리에이터, 개발자, 1인 사업가가 별도 로그인 없이 자신의 브랜드 정보를 입력해 즉시 공유 가능한 디지털 명함을 만들 수 있도록 설계된 데모 친화형 프로덕트입니다. OpenAI Image API로 2×3 콘셉트 보드를 생성하고, 선택된 카드를 클라이언트에서 크롭한 뒤 Convex 또는 로컬 테스트 저장소에 저장합니다.

- **Repository:** <https://github.com/NewTurn2017/popca>
- **제품 톤:** 트렌디 · 캐주얼 · 개성 · 프리미엄 디지털 UI
- **핵심 문장:** 정보만 넣으면 딸깍 — 입체로 살아나는 내 명함, 짧은 링크 하나로 공유

---

## 주요 기능

### 1. AI 명함 콘셉트 생성

- `/api/generate` Route Handler에서 서버 전용 `OPENAI_API_KEY`로 OpenAI Image API를 호출합니다.
- 모델은 `gpt-image-2`를 사용하며, 로고가 없는 경우 이미지 생성, 로고가 있는 경우 이미지 편집 플로우를 사용합니다.
- 결과는 2열×3행 콘셉트 보드 1장으로 반환되고, UI에서 1~6번 카드 중 하나를 선택합니다.
- `TEST=1` 환경에서는 실제 OpenAI 호출 없이 `src/test/fixtures/concept.png` 픽스처를 반환해 비용 없는 검증이 가능합니다.

### 2. 번호 선택 기반 카드 크롭

- `ConceptBoard`가 합성 이미지를 6칸 그리드로 보여줍니다.
- 사용자가 번호를 선택하면 `src/lib/crop.ts`가 클라이언트 `<canvas>`로 해당 셀을 크롭합니다.
- 셀 번호에 따라 `Arctic Glass`, `Holographic Prism`, `Neural Tech` 등 스타일 이름과 accent 색상이 매핑됩니다.

### 3. 3D 공유 페이지

- `/c/[slug]`는 짧은 slug 기반 공개 공유 페이지입니다.
- `Card3D`는 `three.js`, `@react-three/fiber`, `@react-three/drei`로 3D 플립 명함을 렌더링합니다.
- 앞면은 선택 카드 이미지, 뒷면은 이름·직함·핸들·웹사이트 정보를 보여줍니다.
- `ShareBar`는 링크 복사, QR 코드 표시, 갤러리 이동을 제공합니다.

### 4. Wasee 기반 갤러리

- `/gallery`는 생성된 팝카를 `wasee-gallery` 기반 tessellated 보드로 보여줍니다.
- 이름, 브랜드, 핸들 검색을 지원합니다.
- 상세 모달에서 카드 정보를 확인하고 개별 공유 페이지로 이동할 수 있습니다.

### 5. Convex + 로컬 테스트 저장소 이중 경로

- 운영/연동 환경에서는 Convex DB와 `_storage`를 사용합니다.
- `NEXT_PUBLIC_POPCA_LOCAL=1` 또는 `TEST=1`에서는 `.popca-data/cards.json` 기반 로컬 저장소를 사용합니다.
- 이 구조 덕분에 외부 배포 환경 없이도 e2e 테스트와 데모 실행이 가능합니다.

---

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4, framer-motion |
| AI | OpenAI Image API `gpt-image-2` |
| Data / Storage | Convex DB, Convex `_storage`, 로컬 JSON fallback |
| 3D | three.js, `@react-three/fiber`, `@react-three/drei` |
| Gallery | `wasee-gallery` |
| Share | `qrcode`, Clipboard API |
| Test | Vitest, Testing Library, convex-test, Playwright |
| Package Manager | pnpm |

권장 런타임은 Node.js 22입니다.

---

## 프로젝트 구조

```text
popca/
├─ convex/
│  ├─ schema.ts                  # cards 테이블 및 인덱스
│  ├─ cards.ts                   # 카드 생성/조회/목록/삭제/조회수 mutation·query
│  └─ _generated/                # Convex codegen 산출물
├─ src/
│  ├─ app/
│  │  ├─ api/generate/route.ts   # OpenAI Image API 서버 호출
│  │  ├─ api/cards/              # 로컬 fallback 카드 API
│  │  ├─ create/page.tsx         # 생성 마법사
│  │  ├─ c/[slug]/page.tsx       # 3D 공유 페이지
│  │  ├─ gallery/page.tsx        # 갤러리 페이지
│  │  └─ page.tsx                # 랜딩 페이지
│  ├─ components/
│  │  ├─ CreateWizard.tsx        # 입력 → 생성 → 선택 → 저장 플로우
│  │  ├─ ConceptBoard.tsx        # 6분할 콘셉트 선택 UI
│  │  ├─ Card3D.tsx              # 3D 플립 카드
│  │  ├─ GalleryBoard.tsx        # WaseeGallery 래퍼
│  │  └─ ShareBar.tsx            # 링크 복사, QR, 삭제 액션
│  ├─ lib/
│  │  ├─ prompt.ts               # 이미지 생성 프롬프트와 입력 검증
│  │  ├─ crop.ts                 # 2×3 보드 셀 크롭
│  │  ├─ localCards.ts           # 로컬 JSON 저장소
│  │  ├─ serverCards.ts          # Convex / 로컬 저장소 라우팅
│  │  ├─ slug.ts                 # slug, editToken 생성
│  │  └─ styles.ts               # 6개 카드 스타일 메타데이터
│  └─ test/
│     ├─ fixtures/concept.png    # TEST 모드 이미지 픽스처
│     └─ setup.ts                # Vitest 테스트 셋업
├─ tests-e2e/                    # Playwright e2e 시나리오
├─ package.json
├─ playwright.config.ts
├─ vitest.config.ts
└─ README.md
```

---

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

Playwright 브라우저가 없는 새 환경이라면 Chromium을 설치합니다.

```bash
pnpm exec playwright install --with-deps chromium
```

### 2. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 구성합니다.

```bash
cp .env.local.example .env.local
```

필요한 환경 변수는 다음과 같습니다.

| 변수 | 용도 | 필수 여부 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 서버에서 OpenAI Image API 호출 | 실제 이미지 생성 시 필수 |
| `CONVEX_DEPLOYMENT` | Convex 배포 식별자 | Convex 연동 시 필수 |
| `NEXT_PUBLIC_CONVEX_URL` | 브라우저/서버에서 사용할 Convex URL | Convex 연동 시 필수 |
| `NEXT_PUBLIC_POPCA_LOCAL` | Convex 대신 로컬 JSON 저장소 사용 | 로컬 데모/테스트 시 선택 |

예시:

```bash
OPENAI_API_KEY=<your-openai-api-key>
CONVEX_DEPLOYMENT=dev:<your-convex-deployment>
NEXT_PUBLIC_CONVEX_URL=https://<your-convex-deployment>.convex.cloud
NEXT_PUBLIC_POPCA_LOCAL=1
```

> `.env.local`은 Git에 커밋하지 않습니다. 공개 저장소에는 `.env.local.example`만 포함됩니다.

### 3. Convex codegen

Convex 타입과 API 참조를 갱신합니다.

```bash
pnpm exec convex codegen
```

Convex 프로젝트를 새로 연결해야 하는 경우 Convex CLI 안내에 따라 배포를 연결한 뒤 `.env.local`에 값을 반영합니다.

### 4. 개발 서버 실행

실제 OpenAI + Convex 설정으로 실행:

```bash
pnpm dev
```

비용 없는 로컬 데모/테스트 모드로 실행:

```bash
TEST=1 NEXT_PUBLIC_POPCA_LOCAL=1 pnpm dev --port 3107
```

브라우저에서 다음 경로를 확인합니다.

- `http://localhost:3000` — 랜딩
- `http://localhost:3000/create` — 팝카 생성
- `http://localhost:3000/gallery` — 갤러리
- `http://localhost:3000/c/{slug}` — 개별 공유 페이지

---

## 사용 플로우

1. `/create`에서 브랜드명과 이름을 입력합니다.
2. 직함, 핸들, 웹사이트, 로고는 선택적으로 입력합니다.
3. `딸깍 생성`을 눌러 6개 콘셉트 보드를 생성합니다.
4. 1~6번 중 마음에 드는 카드를 선택합니다.
5. 선택 카드가 크롭되어 저장되고 `/c/{slug}` 공유 페이지로 이동합니다.
6. 공유 페이지에서 3D 플립 카드, QR, 링크 복사를 확인합니다.
7. `/gallery`에서 생성된 팝카를 검색·탐색합니다.

---

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | Next.js 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 빌드된 앱 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm typecheck` | TypeScript 타입 검사 |
| `pnpm test` | Vitest + coverage 실행 |
| `pnpm test:watch` | Vitest watch 모드 |
| `pnpm e2e` | `TEST=1`, 로컬 저장소 모드로 빌드 후 Playwright 실행 |
| `pnpm verify` | typecheck → lint → test → build → e2e 전체 검증 |

---

## 테스트 전략

POPCA는 외부 API 비용과 배포 의존성을 줄이기 위해 테스트 전용 경로를 명확히 분리합니다.

- **Unit / Library**: prompt validation, slug, crop/style 등 핵심 유틸 검증
- **Component**: 생성 UI, 갤러리 변환, 공유 컴포넌트 검증
- **Convex**: `convex-test`로 schema와 mutation/query 동작 검증
- **API Route**: `TEST=1`에서 `/api/generate`가 픽스처 기반 `b64_json`을 반환하는지 검증
- **E2E**: Playwright로 생성 → 선택 → 공유 페이지 → 갤러리 노출까지 검증

전체 검증:

```bash
pnpm verify
```

보안 감사:

```bash
pnpm audit --audit-level moderate
```

---

## 데이터 모델 요약

Convex `cards` 테이블은 다음 주요 필드를 저장합니다.

| 필드 | 설명 |
| --- | --- |
| `slug` | 공유 링크 식별자 |
| `editToken` | 로컬 소유권 확인용 토큰 |
| `brand`, `name`, `title`, `handle`, `website` | 사용자가 입력한 명함 정보 |
| `styleName`, `accent`, `cellIndex` | 선택된 카드 스타일 메타데이터 |
| `cardImageId` | Convex Storage에 저장된 선택 카드 이미지 |
| `compositeId`, `logoId` | 선택적 원본 보드/로고 이미지 |
| `views` | 공유 페이지 조회수 |
| `createdAt` | 생성 시각 |

로컬 fallback 모드에서는 동일한 공개 카드 형태를 `.popca-data/cards.json`에 저장합니다.

---

## 보안 및 운영 메모

- OpenAI API Key는 반드시 서버 환경 변수 `OPENAI_API_KEY`로만 주입합니다.
- 브라우저에 노출되는 값은 `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_POPCA_LOCAL`처럼 공개 가능한 값으로 제한합니다.
- 실제 이미지 생성은 비용이 발생할 수 있으므로 자동 테스트는 `TEST=1` 픽스처 모드를 사용합니다.
- 익명 서비스 구조상 소유권은 `localStorage`에 저장된 `editToken`으로만 판단합니다.
- 공개 저장소에는 `.env.local`, `.popca-data/`, `.omx/`, `.agents/`, `test-results/` 등 로컬 산출물이 포함되지 않습니다.

---

## 배포 가이드

### Vercel + Convex 기준

1. Convex 프로젝트를 생성하고 deployment를 연결합니다.
2. Convex codegen을 실행하고 schema/functions를 배포합니다.
3. Vercel 프로젝트에 다음 환경 변수를 설정합니다.
   - `OPENAI_API_KEY`
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`
4. Vercel 빌드 명령은 기본 Next.js 설정 또는 `pnpm build`를 사용합니다.
5. 배포 후 `/create`, `/gallery`, `/c/{slug}` 경로를 스모크 테스트합니다.

---

## 현재 상태

- PRD 기준 핵심 기능 구현 완료
- 공개 GitHub 저장소 생성 완료
- OpenAI 실제 호출 경로와 `TEST=1` 모킹 경로 모두 고려
- `pnpm verify`로 타입 검사, 린트, 단위/컴포넌트 테스트, 빌드, e2e를 한 번에 검증할 수 있도록 구성

---

## 라이선스

현재 별도 라이선스 파일은 포함되어 있지 않습니다. 공개 배포 또는 외부 기여를 받을 계획이라면 `LICENSE` 파일을 추가하는 것을 권장합니다.
