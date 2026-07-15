# 아이디/비밀번호 로그인 + 로그인 유지(refresh 쿠키 재발급)

> 작성일: 2026-07-15
> 범위: 아이디/비밀번호 로그인 백엔드 연결 + 로그인 유지 방식 **B(refresh 쿠키 reissue)** 전체 구현
> 상태 저장소: **zustand `authStore`** (access 토큰은 메모리에만 보관)

---

## 1. 왜 B 방식인가

새로고침해도 로그인을 유지하는 방식은 두 가지가 있고, 이 프로젝트는 **B** 를 택했다.

| | A. zustand persist (localStorage) | **B. refresh 쿠키 재발급 (선택)** |
|---|---|---|
| access 토큰 위치 | localStorage | **메모리(zustand)만** |
| 새로고침 시 | localStorage 에서 복원 | 앱 시작 시 refresh 쿠키로 `/auth/reissue` |
| 보안(XSS) | ⚠️ JS 로 토큰 탈취 가능 | ✅ refresh 는 HttpOnly 라 JS 접근 불가 |
| 백엔드 준비 | 불필요 | ✅ 이미 있음(`/auth/reissue` + 쿠키) |

백엔드가 이미 refresh 쿠키 + `/auth/reissue` 로 설계돼 있고(`LoginDto.Response` 주석: *provider 만 localStorage 에, 토큰은 쿠키로*), 보안상 유리해 B 로 진행했다.

---

## 2. 전체 인증 흐름

```
[아이디/비밀번호 로그인]  POST /auth/login {loginId,password}
   → accessToken(응답) + refresh(HttpOnly 쿠키)
   → getMe(token) 로 사용자 조회 → authStore.login(user, token) → /mypage

[소셜 로그인]  구글/네이버 → 백엔드 OAuth → /oauth/callback?token=...
   → getMe(token) → authStore.login(user, token) → /mypage
   (refresh 쿠키는 백엔드가 리다이렉트 응답에서 심음)

[새로고침 / 재방문]  useAuthBootstrap (앱 시작)
   → POST /auth/reissue (refresh 쿠키) → 새 accessToken
   → getMe(token) → authStore.login  (실패하면 조용히 비로그인)

[요청 중 access 만료(401)]  client 응답 인터셉터
   → POST /auth/reissue → 새 accessToken → authStore.setToken → 원 요청 1회 재시도
   → 재발급도 실패하면 → logout + /login 리다이렉트

[로그아웃]  POST /auth/logout (refresh 삭제 + 쿠키 만료) → authStore.logout() → /login
```

access 토큰은 **메모리에만** 두고, 지속성은 **refresh 쿠키**가 담당한다.

---

## 3. 변경/생성 파일

| 파일 | 내용 |
|---|---|
| `src/api/auth.ts` | `loginWithPassword` (로그인+getMe), `reissue`, `logout` 추가 |
| `src/api/client.ts` | `withCredentials: true` + 커스텀 옵션(`skipAuthRedirect`/`_retry`) + **401 자동 재발급 후 재시도** 인터셉터 |
| `src/store/authStore.ts` | `authReady`(부팅 완료 플래그), `setToken`(토큰만 교체), `setAuthReady` 추가 |
| `src/hooks/useAuthBootstrap.ts` (신규) | 앱 시작 시 reissue 로 세션 복원 |
| `src/App.tsx` | `useAuthBootstrap()` 호출 |
| `src/pages/auth/LoginPage.tsx` | mock 제거 → 실제 로그인 + zustand 저장 + 실패 메시지 + `?redirect=` 지원 |
| `src/pages/mypage/MyPage.tsx` | 로그아웃 버튼 → `logout` API + `authStore.logout` |
| `src/pages/auth/SettingsPage.tsx` | 로그아웃 버튼 → `logout` API + `authStore.logout` |
| `.env.example` | `VITE_API_BASE_URL` 을 백엔드 직접 호출로 변경(쿠키 인증) |

---

## 4. ⚠️ 중요 설정: 왜 vite proxy 가 아니라 직접 호출인가

`.env` 의 `VITE_API_BASE_URL` 을 **`http://localhost:8080/api/v1`** (백엔드 직접 호출)로 둔다.
API 도 8080 으로 직접 호출 + `withCredentials: true` 로 refresh 쿠키를 주고받는다.

### 왜 proxy 가 아니라 직접 호출인가 — 쿠키가 어느 도메인에 심기느냐
refresh 쿠키(`CookieUtil`)는 `domain` 을 명시하지 않아 **응답을 준 호스트**에 심긴다.

- **로컬 로그인 (proxy 경유해도 됨)**: `5173/api/v1/auth/login` → vite proxy → 8080.
  브라우저는 응답을 "5173 이 준 것"으로 봐 쿠키가 **5173** 에 심긴다. reissue 도 5173 same-origin → 전송됨 → 작동 O.
- **소셜 로그인 (proxy 로는 안 됨)**: OAuth 는 전체 페이지 이동이라 `8080/oauth2/...` 로 직접 가고,
  provider 콜백(`8080/login/oauth2/code/*`)도 **백엔드로 직접** 돌아온다. 그 응답에서 쿠키가 심기므로
  소셜 refresh 쿠키는 **항상 8080** 도메인이다. reissue 를 5173(proxy)로 보내면 8080 쿠키가 안 실려 **실패**.

즉 proxy 를 쓰면 로컬은 되고 **소셜만 깨지는 반쪽짜리**가 된다. 둘 다 일관되게 하려면 API 도 8080 직접 호출이어야 한다.

### 이 백엔드는 원래 직접 호출(cross-origin + credentials)을 전제로 설계됨
- CORS 에 `allowCredentials(true)` + `allowedOrigins(localhost:5173)` — same-origin(proxy)이면 CORS 자체가 불필요.
  이 설정을 둔 것 = 다른 origin(5173)에서 쿠키 실어 호출하는 걸 전제한 것.
- 쿠키가 `SameSite=None` — `None` 은 cross-site 전송용. same-origin 만 쓸 거면 보통 `Lax`/`Strict` 를 쓴다.

> 즉 이 프로젝트의 로그인/세션은 "same-origin proxy" 가 아니라 "cross-origin + credentials" 조합이며,
> 이는 백엔드 설정과 정합하고 프로덕션(항상 크로스도메인/지정도메인)과도 유사하다.
> (vite proxy 는 인증 설계가 아니라 일반 API 의 CORS 회피 편의였을 뿐이다.)

### 401 자동 재발급의 중복/무한루프 방지
- `skipAuthRedirect`: reissue 요청 자신이 401 이어도 재발급/리다이렉트를 하지 않는다.
- `_retry`: 원 요청은 재발급 후 **딱 한 번만** 재시도한다.
- `refreshing` 단일 Promise: 동시에 여러 요청이 401 이어도 reissue 는 **한 번만** 수행한다.

---

## 5. 검증

### 프론트 정적 검증
- `npx tsc --noEmit -p tsconfig.app.json` → **통과**
- `npx vite build` → **성공**

### 런타임 검증 (백엔드 8080 실행 상태에서 curl E2E, 2026-07-15)
| 항목 | 결과 |
|---|---|
| CORS 프리플라이트(Origin 5173) | ✅ `Allow-Origin: localhost:5173` + `Allow-Credentials: true` — **직접 호출 방식 동작 확인** |
| 회원가입 `POST /users` | ✅ 201 |
| 아이디/닉네임 중복확인 `GET /users/exists` | ✅ `{exists:...}` |
| 로그인 실패 에러 형태 | ✅ `{status,code:A004,message}` — 프론트 `getErrorMessage` 와 정합 |
| 로그아웃 `POST /auth/logout` | ✅ 204 + `Set-Cookie refreshToken=; Max-Age=0`(만료) |
| **로그인 `POST /auth/login`(정상 자격증명)** | ❌ **HTTP 500 (빈 본문) — 백엔드 버그** |

- ⚠️ **로그인이 백엔드에서 500** 이 나서(인증 통과 후 토큰 발급 단계 추정), 로그인→재발급→내정보→로그아웃
  전체 E2E 는 **막혀 있음**. refresh_tokens 스키마(AUTO_INCREMENT)는 정상이라 스키마 문제는 아님.
  정확한 원인은 백엔드 콘솔의 `Unhandled exception` 스택트레이스에 있음(백엔드 담당 확인 필요).
  → **프론트 코드 문제 아님**: 프론트는 `POST /auth/login` 을 규약대로 호출한다.
- 브라우저 기반 확인(소셜 OAuth 클릭, 새로고침 세션 유지)은 별도로 `npm run dev` + 브라우저로 진행 필요.

### 개발 시 체크리스트
1. `panorama-frontend/.env`(또는 `.env.local`)에 `VITE_API_BASE_URL=http://localhost:8080/api/v1`
2. 백엔드 CORS 가 `http://localhost:5173` 허용 + `allowCredentials(true)` (확인됨)
3. 로그인 → F5 새로고침 → 로그인 유지되는지
4. 로그아웃 → F5 → 비로그인 유지되는지(쿠키 삭제 확인)

---

## 5-1. 회원가입 (로컬)

`SignupPage` → 백엔드 `SignUpDto.Request` 규칙에 맞춰 검증 → 중복 확인 → 가입.

- 흐름: 클라이언트 검증 → `checkExists`(아이디·닉네임 병렬) → `signup(POST /users)` → 로그인 화면
- 검증 규칙(백엔드와 일치): 아이디 공백없이 6~15자 · 닉네임 공백없이 1~10자 ·
  비밀번호 8~15자(대소문자+특수문자 `!@#$%^&*`) · 이메일 형식 · 비밀번호 확인 · 약관 동의
- 파일: `src/api/auth.ts`(`signup`, `checkExists`), `src/pages/auth/SignupPage.tsx`
- 구글/네이버 회원가입은 최초 로그인 시 자동 가입 → [social-login-integration.md](./social-login-integration.md) §4-1

## 6. 남은 것 / 주의

1. **🔴 백엔드 로그인 500 (최우선)** — 정상 자격증명 로그인이 500. 이게 풀려야 로그인/세션 E2E 가 동작한다.
   백엔드 콘솔 `Unhandled exception` 스택트레이스로 원인 파악 필요. (백엔드 담당 영역)
2. **화면 mock 잔여** — `MyPage` 는 프로필 닉네임/아바타를 `authStore.user` 로 연결했고 활동 데이터만 mock.
   `SettingsPage` 는 아직 `mockProfile` 사용(닉네임 변경/비번 변경 API 연결 시 교체).
3. **라우트 가드 없음** — `/mypage`, `/settings` 가 비로그인도 접근 가능.
   `authReady` 가 true 가 된 뒤 `isAuthenticated` 로 가드하는 로직 추가 가능.
4. **Secure 쿠키 / localhost** — 브라우저는 localhost 를 secure context 로 취급해 http 에서도
   Secure 쿠키가 동작한다. 프로덕션은 https 필수.
