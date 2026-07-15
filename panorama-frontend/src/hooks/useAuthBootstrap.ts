import { useEffect, useRef } from 'react'
import { getMe, reissue } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

/**
 * 앱 시작 시 refresh 쿠키로 세션을 복원한다. (새로고침해도 로그인 유지)
 *
 * access 토큰은 메모리에만 두므로 새로고침하면 사라진다.
 * 부팅 시 reissue 로 새 access 를 받고 /me 로 사용자를 채워 로그인 상태를 복원한다.
 * refresh 쿠키가 없거나 만료됐으면 조용히 비로그인 상태로 시작한다.
 */
export function useAuthBootstrap() {
  const login = useAuthStore((s) => s.login)
  const setAuthReady = useAuthStore((s) => s.setAuthReady)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return // StrictMode 이중 실행 방지
    ran.current = true

    void (async () => {
      try {
        const token = await reissue()
        const user = await getMe(token)
        login(user, token)
      } catch {
        // refresh 쿠키 없음/만료 → 비로그인 상태로 시작
      } finally {
        setAuthReady(true)
      }
    })()
  }, [login, setAuthReady])
}
