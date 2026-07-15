import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * 관리자 전용 라우트 가드.
 *
 * - authReady 가 false 인 동안(부팅 시 세션 복원 중)은 판단을 미룬다. (RequireAuth 와 동일)
 * - 복원이 끝났는데 비로그인이면 /login 으로 (원위치 복귀용 state.from).
 * - 로그인했지만 ADMIN 이 아니면 홈(/)으로.
 *
 * 이 가드가 통과해야 admin 화면이 렌더되므로, 내부에서는 user(및 user.id, role==='ADMIN')가
 * 항상 존재함이 보장된다 → 처리 액션의 handlerUserId 를 안전하게 채울 수 있다.
 */
export default function RequireAdmin() {
  const authReady = useAuthStore((s) => s.authReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)
  const location = useLocation()

  if (!authReady) return null // 세션 복원 대기 (깜빡임/조기 리다이렉트 방지)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
