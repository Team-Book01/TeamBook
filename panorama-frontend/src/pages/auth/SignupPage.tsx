import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { checkExists, signup } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { toast } from '@/lib/toast'
import {
  isValidLoginId,
  isValidNickname,
  isValidPassword,
  LOGIN_ID_MESSAGE,
  NICKNAME_MESSAGE,
  PASSWORD_MESSAGE,
} from '@/lib/validation'

/**
 * 회원가입 화면.
 * 백엔드 SignUpDto.Request 규칙에 맞춰 검증 → 아이디/닉네임 중복 확인(/users/exists)
 * → 가입(POST /users) → 성공 시 로그인 화면으로 이동.
 */
export default function SignupPage() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 백엔드 SignUpDto.Request 규칙과 일치시킨 클라이언트 검증
  function validate(v: {
    loginId: string
    nickname: string
    email: string
    password: string
    confirm: string
    agree: boolean
  }): Record<string, string> {
    const e: Record<string, string> = {}
    if (!isValidLoginId(v.loginId)) e.loginId = LOGIN_ID_MESSAGE
    if (!isValidNickname(v.nickname)) e.nickname = NICKNAME_MESSAGE
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = '올바른 이메일 주소를 입력해 주세요.'
    if (!isValidPassword(v.password)) e.password = PASSWORD_MESSAGE
    if (v.password !== v.confirm) e.confirm = '비밀번호가 일치하지 않아요.'
    if (!v.agree) e.agree = '약관에 동의해 주세요.'
    return e
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const values = {
      loginId: String(form.get('loginId') ?? '').trim(),
      nickname: String(form.get('nickname') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      password: String(form.get('password') ?? ''),
      confirm: String(form.get('confirm') ?? ''),
      agree: form.get('agree') === 'on',
    }

    const next = validate(values)
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setErrors({})
    setSubmitError(null)
    setSubmitting(true)
    try {
      // 1) 아이디·닉네임 중복 확인 (병렬)
      const [loginIdTaken, nicknameTaken] = await Promise.all([
        checkExists({ loginId: values.loginId }),
        checkExists({ nickname: values.nickname }),
      ])
      const dup: Record<string, string> = {}
      if (loginIdTaken) dup.loginId = '이미 사용 중인 아이디예요.'
      if (nicknameTaken) dup.nickname = '이미 사용 중인 닉네임이에요.'
      if (Object.keys(dup).length > 0) {
        setErrors(dup)
        return
      }

      // 2) 가입 요청
      await signup({
        loginId: values.loginId,
        password: values.password,
        nickname: values.nickname,
        email: values.email,
      })

      toast.success('가입 완료! 로그인해 주세요.')
      navigate('/login', { replace: true })
    } catch (err) {
      // 409(중복) 등 서버 에러는 백엔드 메시지를 그대로 노출
      setSubmitError(getErrorMessage(err, '회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="책방에 오신 걸 환영해요"
      title="회원가입"
      subtitle="계정을 만들고 나만의 독서 기록을 시작하세요."
    >
      <SocialButtons mode="signup" />

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">또는 아이디로 가입</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loginId">아이디</Label>
          <Input
            id="loginId"
            name="loginId"
            placeholder="영문·숫자·밑줄(_), 6~15자"
            autoComplete="username"
          />
          {errors.loginId && <p className="text-xs text-destructive">{errors.loginId}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nickname">닉네임</Label>
          <Input id="nickname" name="nickname" placeholder="한글·영문·숫자·밑줄(_), 1~10자" />
          {errors.nickname && <p className="text-xs text-destructive">{errors.nickname}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="비밀번호 찾기에 사용돼요"
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="8~15자, 대소문자·특수문자 포함"
            autoComplete="new-password"
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">비밀번호 확인</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="비밀번호를 다시 입력"
            autoComplete="new-password"
          />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox id="agree" name="agree" />
          <span>
            <span className="font-medium text-foreground">이용약관</span> 및{' '}
            <span className="font-medium text-foreground">개인정보 처리방침</span>에 동의합니다.
          </span>
        </label>
        {errors.agree && <p className="-mt-2 text-xs text-destructive">{errors.agree}</p>}

        {submitError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 h-11" disabled={submitting}>
          {submitting ? '가입 중...' : '회원가입'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          로그인
        </Link>
      </p>
    </AuthLayout>
  )
}
