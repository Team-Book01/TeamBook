import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getMe } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/lib/toast'

/**
 * 소셜 로그인 콜백 처리 화면.
 *
 * 백엔드가 OAuth 성공 후 `/oauth/callback?token=...&provider=...` 로 리다이렉트한다.
 * 여기서 access 토큰으로 내 정보(/users/me)를 조회해 전역 상태(authStore)를 채우고
 * 마이페이지로 이동한다. (refresh 토큰은 백엔드가 HttpOnly 쿠키로 이미 심어둔 상태)
 */
export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const [message, setMessage] = useState('로그인 처리 중...')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return // StrictMode 이중 실행 방지
    ran.current = true

    const token = params.get('token')
    const errorParam = params.get('error')

    if (errorParam || !token) {
      const msg = '소셜 로그인에 실패했어요. 다시 시도해 주세요.'
      setMessage(msg)
      toast.error(msg)
      navigate('/login', { replace: true })
      return
    }

    getMe(token)
      .then((user) => {
        login(user, token)
        toast.success('로그인되었어요!')
        navigate('/mypage', { replace: true })
      })
      .catch((e) => {
        const msg = getErrorMessage(e, '로그인 정보를 불러오지 못했어요.')
        setMessage(msg)
        toast.error(msg)
        navigate('/login', { replace: true })
      })
  }, [params, login, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
