import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * 로그인이 필요한 라우트 가드.
 *
 * - authReady 가 false 인 동안(부팅 시 세션 복원 중)은 판단을 미룬다.
 *   → 새로고침 시 세션이 복원되기도 전에 /login 으로 튕기는 것을 방지.
 * - 복원이 끝났는데 비로그인이면 /login 으로 리다이렉트한다.
 *   원래 가려던 경로를 ?redirect= 쿼리로 실어, 로그인 후 되돌아올 수 있게 한다.
 *   (client 인터셉터의 401 처리와 동일한 방식 → LoginPage 가 그대로 처리)
 * - 단, 마이페이지·설정은 복귀 대상에서 제외 → 로그아웃/재로그인 시 그냥 홈(메인)으로 보낸다.
 */
// 로그인 후 원래 경로로 복귀시키지 않고 홈으로 보낼 경로들
const NO_REDIRECT_PATHS = ['/mypage', '/settings']

export default function RequireAuth() {
  const authReady = useAuthStore((s) => s.authReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!authReady) return null // 세션 복원 대기 (깜빡임/조기 리다이렉트 방지)

  if (!isAuthenticated) {
    // 마이페이지·설정은 복귀 대상에서 제외 → 로그인 후 기본 경로(홈)로 보낸다.
    if (NO_REDIRECT_PATHS.includes(location.pathname)) {
      return <Navigate to="/login" replace />
    }
    // 원래 가려던 내부 경로(path+query)를 인코딩해 전달. (검증은 LoginPage 에서 수행)
    const dest = location.pathname + location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(dest)}`} replace />
  }

  return <Outlet />
}
