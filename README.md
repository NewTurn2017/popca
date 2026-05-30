# POPCA / 팝카

정보만 넣으면 gpt-image-2가 6종 디지털 명함 콘셉트를 만들고, 번호로 하나를 골라 3D 공유 페이지와 갤러리까지 완성하는 Next.js + Convex 웹앱입니다.

## 스택

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, pnpm
- OpenAI Image API `gpt-image-2` (`/api/generate`, 서버 전용 `OPENAI_API_KEY`)
- Convex DB + `_storage` (`convex/schema.ts`, `convex/cards.ts`)
- three.js / `@react-three/fiber` / drei 3D 플립 카드
- `wasee-gallery` 기반 tessellated 갤러리
- Vitest + convex-test + Playwright

## 환경 변수

`.env.local.example`을 참고해 `.env.local`을 구성합니다.

```bash
OPENAI_API_KEY=sk-...
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

테스트/비용 없는 로컬 검증은 아래 모드를 사용합니다.

```bash
TEST=1 NEXT_PUBLIC_POPCA_LOCAL=1 pnpm dev --port 3107
```

`TEST=1`에서는 OpenAI를 호출하지 않고 `src/test/fixtures/concept.png` 픽스처를 base64로 반환합니다.

## 실행

```bash
pnpm install
pnpm exec convex codegen
pnpm dev
```

브라우저에서 `/create`로 이동해 브랜드/이름을 입력하고, 6개 콘셉트 중 번호를 선택하면 `/c/{slug}` 공유 페이지로 이동합니다. `/gallery`에서 생성된 카드 보드를 확인할 수 있습니다.

## 검증

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm e2e
pnpm verify
```

`pnpm verify`는 typecheck, lint, Vitest coverage, production build, Playwright e2e를 순서대로 실행합니다.

## 데모 스크립트

1. `/create`에서 브랜드와 이름을 입력합니다.
2. 로고는 선택하거나 건너뜁니다.
3. `딸깍 생성`을 누릅니다.
4. 1~6번 카드 중 하나를 선택합니다.
5. `/c/{slug}`에서 3D 카드 회전/플립, 링크 복사, QR을 확인합니다.
6. `/gallery`에서 방금 만든 카드가 노출되는지 확인합니다.

실제 `OPENAI_API_KEY` 수동 생성은 비용이 발생하므로 자동 테스트에서는 제외되어 있습니다. 이 작업에서는 `TEST` 없이 실제 키 경로도 1회 검증했고, `/api/generate`가 `b64_json`을 반환한 뒤 `/c/{slug}` 공유 페이지와 `/gallery` 노출까지 확인했습니다.
