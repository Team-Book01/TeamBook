import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { loginWithPassword } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

/**
 * 로그인 화면.
 * 아이디/비밀번호 → 백엔드 POST /auth/login → 내 정보 조회 → 전역 상태(zustand) 세팅.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setLogin = useAuthStore((s) => s.login)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const loginId = String(form.get('loginId') ?? '').trim()
    const password = String(form.get('password') ?? '')

    const next: Record<string, string> = {}
    if (!loginId) next.loginId = '아이디를 입력해 주세요.'
    if (!password) next.password = '비밀번호를 입력해 주세요.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setErrors({})
    setSubmitError(null)
    setSubmitting(true)
    try {
      const { user, token } = await loginWithPassword(loginId, password)
      setLogin(user, token) // zustand 전역 상태에 사용자 + access 토큰 저장
      // client 인터셉터가 401 시 남겨둔 redirect 파라미터가 있으면 그리로, 없으면 마이페이지
      const redirect = params.get('redirect')
      navigate(redirect ?? '/mypage', { replace: true })
    } catch (err) {
      setSubmitError(getErrorMessage(err, '아이디 또는 비밀번호가 올바르지 않아요.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="다시 만나서 반가워요"
      title="로그인"
      subtitle="계정으로 로그인하고 독서 기록을 이어가세요."
    >
      <SocialButtons mode="login" />

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">또는 아이디로 로그인</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loginId">아이디</Label>
          <Input id="loginId" name="loginId" placeholder="아이디를 입력하세요" autoComplete="username" />
          {errors.loginId && <p className="text-xs text-destructive">{errors.loginId}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="remember" name="remember" />
            로그인 상태 유지
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            비밀번호 찾기
          </Link>
        </div>

        {submitError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 h-11" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        아직 계정이 없으신가요?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </AuthLayout>
  )
}
