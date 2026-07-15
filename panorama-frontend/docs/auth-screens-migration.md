# 인증 화면 이식 작업 정리 (test 초안 → panorama-frontend)

> 작성일: 2026-07-14
> 범위: 로그인 · 회원가입 · 계정설정 · 마이페이지 4개 화면 (UI 우선, 백엔드 연결 제외)

---

## 1. 배경

Lovable.dev로 생성한 프론트 초안(`panorama-frontend/test/read-happy-hub-19`)에서
일부 화면을 기존 `panorama-frontend` 로 옮겨왔다.

두 프로젝트의 스택이 근본적으로 달라 **파일 복붙이 불가**했고,
**기존 panorama-frontend 컨벤션을 기준으로 test 코드를 변환(포팅)** 하는 방식으로 진행했다.

| 항목 | panorama-frontend (기준) | test 초안 |
|---|---|---|
| 라우팅 | `react-router-dom` v7 (`pages/`) | `@tanstack/react-router` (`routes/`, 파일기반) |
| 백엔드/인증 | `axios` → 자체 Spring 백엔드 | `@supabase/supabase-js` + `@lovable.dev/cloud-auth-js` |
| UI 컴포넌트 | 자체 경량 `components/ui` (`cn` 기반) | Radix UI 전체 (shadcn) |
| 폼/검증 | (없음) | `react-hook-form` + `zod` |
| 알림 | (없음) | `sonner` (toast) |

---

## 2. 결정 사항

1. **기준 스택**: 기존 panorama-frontend (react-router-dom + 경량 ui + axios)
2. **연결 시점**: UI 먼저 이식, 백엔드 연결은 다음 단계
3. **범위**: 로그인 · 회원가입 · 계정설정 · 마이페이지 (파일명은 기존 유지)

---

## 3. 변환 원칙

- `@tanstack/react-router` → `react-router-dom`
  - `createFileRoute`/`Route` export 제거 → 일반 `default export` 컴포넌트
  - `Link`(`to`) / `useNavigate` 는 react-router-dom 것으로 교체 (`navigate('/path')`)
- **백엔드 로직 제거**: Supabase / Lovable / `useAuth` / `zod` / `sonner` 삭제
  - `zod` 스키마 → 순수 JS 검증 함수로 재구현 (UX 동일)
  - 프로필/목록 데이터 → 목(mock) 데이터
  - 각 API 지점에 `// TODO(백엔드 연동)` 주석 표시
- **컴포넌트 매핑**
  - test의 shadcn `Avatar`/`AvatarFallback` → 인라인 `div` 아바타
  - test의 `Badge variant="secondary"` → 기존 `Badge variant="brand"` 재사용
  - `Button`/`Input`/`Label`/`Checkbox`/`Switch`/`Separator` → 경량 프리미티브 신규 작성
- **toast**: 기존 프로젝트에 toast 시스템이 없어 `window.alert` 임시 스텁으로 대체

---

## 4. 변경/생성 파일

### 신규 UI 프리미티브 (`src/components/ui/`)
radix 의존 없이 기존 `cn` + Tailwind 토큰으로 경량 작성.

- `Button.tsx` — variant(default/outline/ghost/destructive) · size(default/sm/lg)
- `Input.tsx`
- `Label.tsx`
- `Checkbox.tsx` — 네이티브 checkbox + `accent-primary`
- `Switch.tsx` — 네이티브 checkbox 를 트랙+썸 토글로 스타일
- `Separator.tsx`

### 신규 auth 컴포넌트 (`src/components/auth/`)
- `AuthLayout.tsx` — 로그인/회원가입 2단 레이아웃 (좌 비주얼 / 우 폼)
- `SocialButtons.tsx` — 구글/카카오/네이버 버튼 (현재는 "준비 중" 안내만)

### 이식한 화면 (기존 파일명 유지)
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/SignupPage.tsx`
- `src/pages/auth/SettingsPage.tsx`
- `src/pages/mypage/MyPage.tsx`

### 기타
- `src/lib/toast.ts` — 임시 toast 스텁 (`success`/`error`/`info` → `alert`)
- `src/assets/auth-books.jpg` — test 에서 복사 (AuthLayout 배경)
- `src/index.css` — 디자인 토큰 추가: `--font-display`, `--shadow-card`
- `src/App.tsx` — 라우팅 조정 (아래 참고)

### 라우팅 변경 (`src/App.tsx`)
4개 화면은 **자체 헤더/전체화면 디자인**이라, 공통 `Layout`(GNB + 푸터) **바깥**으로 이동.
(그대로 두면 헤더가 이중으로 렌더되는 문제)

```
// 이전: /login, /signup, /settings, /mypage 가 <Layout> 하위
// 이후: 공통 Layout 밖의 독립 라우트로 분리
<Route element={<Layout />}>
  { / , /books, /community, /library-map ... }
</Route>
<Route path="/login"    element={<LoginPage />} />
<Route path="/signup"   element={<SignupPage />} />
<Route path="/settings" element={<SettingsPage />} />
<Route path="/mypage"   element={<MyPage />} />
```

---

## 5. 검증

- `npx tsc --noEmit -p tsconfig.app.json` → **통과 (exit 0)**
- `npx vite build` → **성공** (2,335 modules, `auth-books.jpg` 정상 번들)
  - 청크 크기 경고는 기존부터 있던 것으로 이번 작업과 무관

---

## 6. 다음 단계 (미완료 · 후속 요청 예정)

1. **백엔드 연결** — `// TODO(백엔드 연동)` 지점을 실제 API 로 교체
   - ✅ 소셜 로그인(구글/네이버) 연결 완료 — [social-login-integration.md](./social-login-integration.md) 참고
     (카카오는 백엔드 미등록으로 "준비 중" 유지)
   - ✅ 아이디/비밀번호 로그인 + 로그아웃 + 로그인 유지(refresh 쿠키 reissue) 완료
     — [login-and-session.md](./login-and-session.md) 참고
   - ✅ 회원가입(POST /users) + 아이디/닉네임 중복 확인(/users/exists) 연결 완료
   - 프로필·비밀번호 저장, 닉네임 중복 확인(설정 화면)
   - 마이페이지 활동 데이터(리뷰·독후감·북마크·인증) — **백엔드 미구현이라 mock 유지**.
     프로필 닉네임/아바타만 로그인 사용자(authStore.user)로 표시. 엔드포인트 생기면 교체.
2. **toast 교체** — `lib/toast.ts` 임시 스텁 → 실제 toast 라이브러리(예: sonner)
3. **`/forgot-password` 화면** — 이번 범위 제외. 로그인 화면의 "비밀번호 찾기" 링크는
   현재 해당 라우트가 없어 `*` 폴백으로 홈(`/`)으로 이동함. 화면 추가 시 연결 필요.
   (test 초안에는 `forgot-password`, `reset-password` 화면이 존재 — 추후 이식 가능)

---

## 7. 참고: test 초안 vs 이식 결과 매핑

| test/read-happy-hub-19 | 이식 결과 (panorama-frontend) |
|---|---|
| `routes/login.tsx` | `pages/auth/LoginPage.tsx` |
| `routes/signup.tsx` | `pages/auth/SignupPage.tsx` |
| `routes/_authenticated/settings.tsx` | `pages/auth/SettingsPage.tsx` |
| `routes/_authenticated/mypage.tsx` | `pages/mypage/MyPage.tsx` |
| `components/auth/AuthLayout.tsx` | `components/auth/AuthLayout.tsx` |
| `components/auth/SocialButtons.tsx` | `components/auth/SocialButtons.tsx` |
| `components/ui/{button,input,label,checkbox,switch,separator}` | `components/ui/*` (경량 재작성) |
| `integrations/supabase`, `hooks/use-auth`, `sonner` | 제거 (목데이터 + `lib/toast` 스텁) |
