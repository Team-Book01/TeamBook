# 소셜 로그인(구글·네이버) 백엔드 연결

> 작성일: 2026-07-14
> 범위: 로그인/회원가입 화면의 **구글·네이버 버튼**을 백엔드 OAuth2 에 연결
> (카카오는 백엔드 미등록이라 "준비 중" 유지 / 아이디·비밀번호 로그인 폼은 이번 범위 아님)

---

## 1. 전체 흐름

백엔드는 **리다이렉트 방식**으로 소셜 로그인을 처리한다. 프론트는 XHR 이 아니라
브라우저 전체 페이지 이동으로 시작하고, 결과 토큰은 콜백 URL 의 쿼리로 받는다.

```
[구글/네이버 버튼 클릭]
   → window.location = http://localhost:8080/oauth2/authorization/{google|naver}
   → 백엔드가 OAuth 처리 (provider 로그인 → CustomOAuth2UserService → OAuth2SuccessHandler)
   → 백엔드가 refresh 토큰을 HttpOnly 쿠키로 심고,
     http://localhost:5173/oauth/callback?token=<access>&provider=<PROVIDER> 로 리다이렉트
   → OAuthCallbackPage: access 토큰으로 GET /users/me 조회
   → authStore.login(user, token) 으로 전역 상태 세팅
   → /mypage 로 이동
```

### 왜 절대주소로 이동하나
OAuth 시작은 브라우저 리다이렉트(전체 페이지 이동)라 vite 프록시(`/api`)를 타지 않는다.
또한 provider 콜백(`/login/oauth2/code/*`)이 백엔드로 정상 복귀해야 하므로,
버튼은 백엔드 origin(`http://localhost:8080`)의 `/oauth2/authorization/{provider}` 로 이동한다.

---

## 2. 백엔드 계약 (참고)

이미 구현돼 있는 백엔드 쪽 계약을 확인하고 맞춘 것이다.

| 항목 | 값 / 위치 |
|---|---|
| 등록 provider | `google`, `naver` (`application-local.yml` 의 `registration`) |
| OAuth 시작 | `GET /oauth2/authorization/{provider}` |
| provider 콜백 | `GET /login/oauth2/code/{provider}` |
| 프론트 콜백 주소 | `app.oauth2.redirect-uri = http://localhost:5173/oauth/callback` |
| 성공 시 전달값 | `?token=<access>&provider=<PROVIDER>` + refresh 는 Set-Cookie (`OAuth2SuccessHandler`) |
| 내 정보 조회 | `GET /api/v1/users/me` → `UserDto.Response { userId, nickname, profileImageUrl, provider, role }` |
| CORS | `http://localhost:5173` 허용 + `allowCredentials(true)` (`SecurityConfig`) |

---

## 3. 프론트 변경/생성 파일

| 파일 | 내용 |
|---|---|
| `src/lib/oauth.ts` (신규) | `startSocialLogin(provider)` — 백엔드 OAuth 시작 URL 로 전체 페이지 이동. base 는 `VITE_OAUTH_BASE_URL`(기본 `http://localhost:8080`) |
| `src/pages/auth/OAuthCallbackPage.tsx` (신규) | 콜백 처리: `token` 읽기 → `/users/me` 조회 → `authStore.login` → `/mypage`. 실패 시 `/login`. StrictMode 이중 실행 가드 포함 |
| `src/api/auth.ts` | `getMe(accessToken)` 구현 — Bearer 헤더를 명시 주입(스토어에 토큰 세팅 전이라)하고 `UserDto.Response` → 프론트 `User` 로 매핑 |
| `src/components/auth/SocialButtons.tsx` | google·naver → `startSocialLogin` 실제 연결, kakao → "준비 중" 토스트 유지 |
| `src/App.tsx` | `/oauth/callback` 라우트 추가 (전체화면 독립 라우트) |
| `.env.example` | `VITE_OAUTH_BASE_URL` 문서화 |

### 핵심 코드 조각

```ts
// src/lib/oauth.ts
const OAUTH_BASE = import.meta.env.VITE_OAUTH_BASE_URL ?? 'http://localhost:8080'
export function startSocialLogin(provider: 'google' | 'naver') {
  window.location.href = `${OAUTH_BASE}/oauth2/authorization/${provider}`
}
```

```ts
// src/api/auth.ts — 콜백 시점엔 스토어에 토큰이 없어 헤더를 직접 넘긴다
export async function getMe(accessToken: string): Promise<User> {
  const { data } = await client.get<MeResponse>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return { id: data.userId, nickname: data.nickname, email: '', role: data.role,
           avatarInitial: data.nickname.slice(0, 1) }
}
```

---

## 4. 검증

- `npx tsc --noEmit -p tsconfig.app.json` → **통과**
- `npx vite build` → **성공** (2,338 modules)
- ⚠️ 실제 구글/네이버 OAuth 왕복(브라우저 로그인 창까지)은 코드/빌드 레벨에서만 확인했고,
  런타임 E2E 는 미검증. 백엔드(`localhost:8080`) + 프론트(`npm run dev`) 띄우고
  버튼 클릭으로 확인 필요.

---

## 4-1. 소셜 회원가입 = 최초 로그인 시 자동 가입

별도의 "소셜 회원가입" 절차는 없다. 백엔드 `CustomOAuth2UserService` 가
`(provider, providerUserId)` 로 기존 계정을 찾고, **없으면 새 User 를 자동 생성**한다
(`createSocialUser` — 닉네임은 `NicknameGenerator` 로 자동 생성, loginId/비밀번호/email 은 null).

- 그래서 프론트의 소셜 버튼은 로그인/회원가입 화면에서 **동일하게 동작**한다(둘 다 OAuth 시작).
- 즉 회원가입 수단은 **로컬(가입 폼) · 구글 · 네이버** 세 가지다.
- 소셜 계정은 loginId/비밀번호가 없어 아이디·비밀번호 로그인은 불가(소셜로만 로그인).

## 5. 남은 이슈 / 주의

1. **카카오** — 백엔드 registration 에 없어서 버튼은 "준비 중" 유지.
   백엔드에 kakao 등록되면 `src/lib/oauth.ts` 의 `SocialProvider` 에 `'kakao'` 추가 +
   `SocialButtons` 의 분기만 열면 된다.
2. **refresh 쿠키 / 토큰 재발급(`/auth/reissue`)** — 이번 범위 밖.
   소셜 로그인 자체는 access 토큰이 URL 로 오므로 정상 동작하지만,
   refresh 쿠키는 백엔드 도메인(`localhost:8080`)에 심기고 프론트 API 는 vite 프록시
   (`localhost:5173`)를 타므로, 개발환경에서 자동 재발급은 쿠키 도메인 조율이 필요할 수 있다.
3. **`email` 필드** — `/users/me` 응답에 email 이 없어 프론트 `User.email` 은 `''` 로 둔다.
   백엔드 응답 확장 시 매핑에 채운다.
4. **아이디/비밀번호 로그인 폼** — 여전히 목(mock) 제출 상태. 별도 후속 작업.
