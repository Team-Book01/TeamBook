/**
 * 로그인 후 복귀 경로(redirect) 유틸.
 *
 * - 아이디/비번 로그인: /login?redirect=... 쿼리로 전달 (LoginPage 가 처리)
 * - 소셜 로그인: 외부(구글/네이버) 왕복으로 URL 쿼리가 소실되므로,
 *   떠나기 전에 sessionStorage 에 저장해두고 콜백에서 회수한다.
 *   (sessionStorage 는 같은 탭·같은 오리진이면 왕복 후에도 유지된다)
 */

const PENDING_KEY = 'auth:redirect'

/**
 * redirect 값이 "우리 앱 내부 경로"일 때만 허용한다. (오픈 리다이렉트 방지)
 * - 반드시 '/' 로 시작하고
 * - '//' · '/\' (프로토콜-상대 경로 → 외부 사이트) 는 거부
 * - '/login' 자기 자신으로의 복귀도 거부
 * 유효하지 않으면 null 을 돌려 기본 경로로 보낸다.
 */
export function safeRedirect(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/')) return null
  if (raw.startsWith('//') || raw.startsWith('/\\')) return null
  if (raw === '/login' || raw.startsWith('/login?')) return null
  return raw
}

/** 소셜 로그인 시작 직전, 복귀 경로를 저장한다. (유효한 내부 경로일 때만) */
export function savePendingRedirect(raw: string | null): void {
  const safe = safeRedirect(raw)
  if (safe) sessionStorage.setItem(PENDING_KEY, safe)
  else sessionStorage.removeItem(PENDING_KEY)
}

/** 소셜 콜백에서 저장해둔 복귀 경로를 꺼내고(1회성) 지운다. 없거나 위험하면 null. */
export function takePendingRedirect(): string | null {
  const raw = sessionStorage.getItem(PENDING_KEY)
  sessionStorage.removeItem(PENDING_KEY)
  return safeRedirect(raw)
}
