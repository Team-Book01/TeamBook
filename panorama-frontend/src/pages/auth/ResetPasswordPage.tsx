import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Label } from '@/components/ui/Label'
import { toast } from '@/lib/toast'
import { confirmPasswordReset } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { isValidPassword, PASSWORD_MESSAGE } from '@/lib/validation'

/**
 * 비밀번호 재설정 착지 페이지 (/reset-password).
 * 메일 링크의 ?token= 을 꺼내, 새 비밀번호와 함께 POST /auth/password/reset 로 변경한다.
 * 비로그인 상태로 열리는 페이지다.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const passwordValid = isValidPassword(newPassword)
  const confirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  const canSubmit = Boolean(token) && passwordValid && confirmMatch

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit || !token) return
    setSubmitting(true)
    try {
      await confirmPasswordReset(token, newPassword)
      toast.success('비밀번호가 변경되었어요. 새 비밀번호로 로그인해 주세요.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, '유효하지 않거나 만료된 링크예요. 다시 요청해 주세요.'))
    } finally {
      setSubmitting(false)
    }
  }

  // 토큰이 없는 링크로 들어온 경우
  if (!token) {
    return (
      <AuthLayout eyebrow="비밀번호 재설정" title="비밀번호 재설정" subtitle="잘못된 접근이에요.">
        <div className="flex flex-col items-center gap-4 py-4">
          <XCircle className="size-12 text-destructive" />
          <p className="text-center text-sm font-medium">유효하지 않은 링크예요.</p>
          <p className="text-center text-xs text-muted-foreground">
            비밀번호 찾기부터 다시 진행해 주세요.
          </p>
          <Button size="lg" className="mt-2 h-11 w-full" onClick={() => navigate('/forgot-password')}>
            비밀번호 찾기로 이동
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="비밀번호 재설정"
      title="새 비밀번호 설정"
      subtitle="새로 사용할 비밀번호를 입력해 주세요."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">새 비밀번호</Label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            placeholder="8~15자, 대소문자·특수문자 포함"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="min-h-[1.25rem] text-xs">
            {newPassword.length > 0 && !passwordValid && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="size-3" />
                {PASSWORD_MESSAGE}
              </span>
            )}
            {newPassword.length > 0 && passwordValid && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="size-3" />
                사용 가능한 비밀번호입니다
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="비밀번호를 다시 입력"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="min-h-[1.25rem] text-xs">
            {confirmPassword.length > 0 && !confirmMatch && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="size-3" />
                비밀번호가 일치하지 않습니다
              </span>
            )}
            {confirmPassword.length > 0 && confirmMatch && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="size-3" />
                비밀번호가 일치합니다
              </span>
            )}
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-2 h-11" disabled={!canSubmit || submitting}>
          {submitting ? '변경 중...' : '비밀번호 변경'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </AuthLayout>
  )
}
