import { create } from 'zustand'
import type { User } from '@/types'

/**
 * 로그인 사용자 전역 상태 (zustand).
 *
 * 지금은 기본 세팅만 잡아둔다. 실제 로그인/토큰 연동은 auth 도메인 담당자가
 * login 페이지 구현 시 setUser/login/logout 을 백엔드 API와 연결한다.
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
