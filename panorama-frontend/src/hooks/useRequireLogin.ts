import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * 로그인이 필요한 동작(북마크·리뷰 작성 등) 앞단의 토큰 검증 훅.
 *
 * 반환한 `ensureLoggedIn()` 을 호출하면:
 * - 토큰이 있으면 true → 그대로 진행(요청 발사 → 백엔드 처리).
 * - 토큰이 없으면 현재 경로를 redirect 파라미터로 달아 /login 으로 보내고 false.
 *
 * 서버 401 을 기다렸다가 튕기는 대신, 프론트에서 미리 걸러 불필요한 요청/깜빡임을 막는다.
 */
export function useRequireLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore((s) => s.token)

  const ensureLoggedIn = useCallback((): boolean => {
    if (token) return true
    const redirect = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?redirect=${redirect}`)
    return false
  }, [token, navigate, location])

  return { ensureLoggedIn, isLoggedIn: !!token }
}
