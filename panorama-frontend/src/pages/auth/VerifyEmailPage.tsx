import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { confirmEmailVerification } from '@/api/auth'
import { getErrorMessage } from '@/api/client'

/**
 * 이메일 인증 착지 페이지 (/verify-email).
 * 메일 링크의 ?token= 을 꺼내 백엔드 콜백(POST /auth/email/verify)을 호출한다.
 * 비로그인 상태로도 열릴 수 있어(메일에서 바로 클릭) 인증 불필요 라우트다.
 */
type Status = 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState('')
  // StrictMode의 이펙트 2회 실행으로 콜백이 두 번 나가는 것을 막는다(토큰은 1회용).
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (!token) {
      setStatus('error')
      setMessage('인증 토큰이 없는 링크예요.')
      return
    }
    confirmEmailVerification(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(getErrorMessage(err, '유효하지 않거나 만료된 링크예요.'))
      })
  }, [token])

  return (
    <AuthLayout eyebrow="이메일 인증" title="이메일 인증" subtitle="계정 이메일 인증을 처리하고 있어요.">
      {status === 'verifying' && (
        <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">인증을 확인하는 중이에요...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 className="size-12 text-primary" />
          <p className="text-center text-sm font-medium">이메일 인증이 완료되었어요.</p>
          <p className="text-center text-xs text-muted-foreground">
            이제 비밀번호를 잊었을 때 이 이메일로 재설정할 수 있어요.
          </p>
          <Button size="lg" className="mt-2 h-11 w-full" onClick={() => navigate('/settings')}>
            설정으로 돌아가기
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <XCircle className="size-12 text-destructive" />
          <p className="text-center text-sm font-medium">인증에 실패했어요.</p>
          <p className="text-center text-xs text-muted-foreground">{message}</p>
          <Button variant="outline" size="lg" className="mt-2 h-11 w-full" onClick={() => navigate('/settings')}>
            설정에서 다시 시도
          </Button>
        </div>
      )}
    </AuthLayout>
  )
}
