/**
 * 소셜 로그인(OAuth2) 시작 URL 유틸.
 *
 * 백엔드는 리다이렉트 방식으로 소셜 로그인을 처리한다:
 *   1) 브라우저를 `${OAUTH_BASE}/oauth2/authorization/{provider}` 로 이동
 *   2) 백엔드가 OAuth 처리 후 access 토큰을 붙여
 *      프론트 `/oauth/callback?token=...&provider=...` 로 리다이렉트 (refresh 는 쿠키)
 *
 * OAuth 시작은 XHR 이 아니라 전체 페이지 이동이라, vite 프록시(/api)를 타지 않는다.
 * provider 콜백(/login/oauth2/code/*)이 백엔드로 정상 복귀하도록 백엔드 절대주소로 이동한다.
 */
const OAUTH_BASE = import.meta.env.VITE_OAUTH_BASE_URL ?? 'http://localhost:8080'

/** 백엔드에 등록된 소셜 로그인 provider (google, naver, kakao). */
export type SocialProvider = 'google' | 'naver' | 'kakao'

/** 소셜 로그인 시작 URL 을 만든다. */
export function socialLoginUrl(provider: SocialProvider): string {
  return `${OAUTH_BASE}/oauth2/authorization/${provider}`
}

/** 소셜 로그인 시작: 백엔드 OAuth2 엔드포인트로 전체 페이지 이동. */
export function startSocialLogin(provider: SocialProvider): void {
  window.location.href = socialLoginUrl(provider)
}
