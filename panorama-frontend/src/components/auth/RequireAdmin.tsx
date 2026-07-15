import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * 관리자(ADMIN) 전용 라우트 가드.
 *
 * - authReady 가 false 인 동안(부팅 시 세션 복원 중)은 판단을 미룬다.
 *   → 새로고침 시 복원 전에 튕기는 것을 방지 (RequireAuth 와 동일한 기준).
 * - 비로그인이면 /login 으로 리다이렉트(원래 경로를 ?redirect= 로 실어 복귀 지원).
 * - 로그인했지만 ADMIN 이 아니면 메인('/')으로 돌려보낸다.
 */
export default function RequireAdmin() {
  const authReady = useAuthStore((s) => s.authReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)
  const location = useLocation()

  if (!authReady) return null // 세션 복원 대기 (깜빡임/조기 리다이렉트 방지)

  if (!isAuthenticated) {
    const dest = location.pathname + location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(dest)}`} replace />
  }

  // 로그인은 했지만 관리자가 아니면 접근 불가 → 메인으로
  if (role !== 'ADMIN') return <Navigate to="/" replace />

  return <Outlet />
}
