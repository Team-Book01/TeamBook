import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * 로그인이 필요한 라우트 가드.
 *
 * - authReady 가 false 인 동안(부팅 시 세션 복원 중)은 판단을 미룬다.
 *   → 새로고침 시 세션이 복원되기도 전에 /login 으로 튕기는 것을 방지.
 * - 복원이 끝났는데 비로그인이면 /login 으로 리다이렉트한다.
 *   (원래 가려던 경로를 state.from 에 실어, 로그인 후 되돌아올 수 있게 한다.)
 */
export default function RequireAuth() {
  const authReady = useAuthStore((s) => s.authReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!authReady) return null // 세션 복원 대기 (깜빡임/조기 리다이렉트 방지)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
