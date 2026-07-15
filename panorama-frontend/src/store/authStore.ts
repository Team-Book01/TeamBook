import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

/**
 * 로그인 사용자 전역 상태 (zustand).
 *
 * access 토큰은 메모리(이 스토어)에만 둔다. (localStorage 미사용 — XSS 노출 방지)
 * 새로고침하면 토큰이 사라지므로, 앱 시작 시 refresh 쿠키로 재발급(reissue)해 세션을 복원한다.
 * → useAuthBootstrap + api/client 의 401 자동 재발급 참고.
 * persist 미들웨어로 localStorage('auth-storage')에 저장한다.
 * → 새로고침 / URL 직접 접근 / 링크 공유로 들어와도 토큰이 유지되어,
 *   client.ts 요청 인터셉터가 Authorization 헤더를 정상적으로 붙일 수 있다.
 *
 * 실제 로그인/토큰 발급은 auth 도메인 담당자가 login 페이지 구현 시
 * setUser/login/logout 을 백엔드 API와 연결한다.
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
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      authReady: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      setAuthReady: (ready) => set({ authReady: ready }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
        }
      },
    },
  ),
);

if (import.meta.env.DEV) {
  (window as unknown as { authStore: typeof useAuthStore }).authStore =
    useAuthStore;
}