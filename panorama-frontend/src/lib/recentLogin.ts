/**
 * "최근 로그인 수단" 저장 (localStorage).
 *
 * 로그인 응답/소셜 콜백의 provider 를 저장해, 재방문 시 로그인 화면에서
 * 마지막으로 사용한 수단(구글/네이버 등)을 강조하는 UX 에 쓴다.
 * 토큰이 아니라 단순 표시용 값이라 localStorage 에 둬도 안전하다.
 */
const KEY = 'recentLoginProvider'

export type RecentProvider = 'LOCAL' | 'GOOGLE' | 'NAVER' | 'KAKAO'

/** 최근 로그인 수단 저장. 값이 없으면 무시. */
export function setRecentProvider(provider: string | null | undefined): void {
  if (!provider) return
  try {
    localStorage.setItem(KEY, provider)
  } catch {
    // 프라이버시 모드 등 localStorage 접근 불가 시 무시
  }
}

/** 최근 로그인 수단 조회. 없으면 null. */
export function getRecentProvider(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
