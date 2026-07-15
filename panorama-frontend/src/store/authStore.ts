import { create } from 'zustand'
import type { User } from '@/types'

/**
 * 로그인 사용자 전역 상태 (zustand).
 *
 * access 토큰은 메모리(이 스토어)에만 둔다. (localStorage 미사용 — XSS 노출 방지)
 * 새로고침하면 토큰이 사라지므로, 앱 시작 시 refresh 쿠키로 재발급(reissue)해 세션을 복원한다.
 * → useAuthBootstrap + api/client 의 401 자동 재발급 참고.
 */
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  /**
   * 앱 시작 시 세션 복원(reissue) 시도가 끝났는지 여부.
   * 라우트 가드는 이 값이 true 가 될 때까지 판단(리다이렉트)을 미뤄야 한다.
   */
  authReady: boolean
  setUser: (user: User | null) => void
  /** 로그인 성공 시 사용자 + JWT 토큰을 함께 세팅한다. */
  login: (user: User, token: string) => void
  /** access 토큰만 교체한다. (401 자동 재발급 시 사용) */
  setToken: (token: string) => void
  logout: () => void
  setAuthReady: (ready: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  authReady: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setAuthReady: (ready) => set({ authReady: ready }),
}))

// 개발 편의: 크롬 콘솔에서 `authStore.getState()` 로 현재 상태 확인 (dev 전용, 빌드에는 미포함)
if (import.meta.env.DEV) {
  ;(window as unknown as { authStore: typeof useAuthStore }).authStore = useAuthStore
}