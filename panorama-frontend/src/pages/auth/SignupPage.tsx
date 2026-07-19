import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SocialButtons } from '@/components/auth/SocialButtons'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
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
  NICKNAME_MAX_LENGTH,
  LOGIN_ID_MAX_LENGTH,
} from '@/lib/validation'

/**
 * 회원가입 화면.
 * - 아이디·닉네임: 입력 0.5초 후 /users/exists 로 실시간 중복 확인(사용 가능 여부 표시)
 * - 비밀번호·확인: 형식/일치 여부를 실시간 표시
 * - 모두 통과해야 가입 버튼 활성화 → POST /users → 로그인 화면으로 이동
 * 이메일은 가입 시 받지 않고, 가입 후 설정에서 등록·인증한다.
 */
type CheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

/** 아이디·닉네임 실시간 확인 결과 한 줄. */
function StatusLine({
  status,
  invalidMsg,
  takenMsg,
  availableMsg,
}: {
  status: CheckStatus
  invalidMsg: string
  takenMsg: string
  availableMsg: string
}) {
  return (
    <div className="min-h-[1.25rem] text-xs">
      {status === 'checking' && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          확인 중...
        </span>
      )}
      {status === 'available' && (
        <span className="flex items-center gap-1 text-primary">
          <CheckCircle2 className="size-3" />
          {availableMsg}
        </span>
      )}
      {status === 'taken' && (
        <span className="flex items-center gap-1 text-destructive">
          <XCircle className="size-3" />
          {takenMsg}
        </span>
      )}
      {status === 'invalid' && (
        <span className="flex items-center gap-1 text-destructive">
          <XCircle className="size-3" />
          {invalidMsg}
        </span>
      )}
    </div>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()

  const [loginId, setLoginId] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)

  const [loginIdStatus, setLoginIdStatus] = useState<CheckStatus>('idle')
  const [nickStatus, setNickStatus] = useState<CheckStatus>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const passwordValid = isValidPassword(password)
  const confirmMatch = confirm.length > 0 && password === confirm

  // 아이디: 입력 0.5초 뒤 형식 검사 → DB 중복 확인
  useEffect(() => {
    const trimmed = loginId.trim()
    if (trimmed === '') {
      setLoginIdStatus('idle')
      return
    }
    if (!isValidLoginId(trimmed)) {
      setLoginIdStatus('invalid')
      return
    }
    setLoginIdStatus('checking')
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const taken = await checkExists({ loginId: trimmed })
        if (!cancelled) setLoginIdStatus(taken ? 'taken' : 'available')
      } catch {
        if (!cancelled) setLoginIdStatus('idle')
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [loginId])

  // 닉네임: 입력 0.5초 뒤 형식 검사 → DB 중복 확인
  useEffect(() => {
    const trimmed = nickname.trim()
    if (trimmed === '') {
      setNickStatus('idle')
      return
    }
    if (!isValidNickname(trimmed)) {
      setNickStatus('invalid')
      return
    }
    setNickStatus('checking')
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const taken = await checkExists({ nickname: trimmed })
        if (!cancelled) setNickStatus(taken ? 'taken' : 'available')
      } catch {
        if (!cancelled) setNickStatus('idle')
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [nickname])

  const canSubmit =
    loginIdStatus === 'available' &&
    nickStatus === 'available' &&
    passwordValid &&
    confirmMatch &&
    agree

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      await signup({
        loginId: loginId.trim(),
        password,
        nickname: nickname.trim(),
      })
      toast.success('가입 완료! 로그인해 주세요.')
      navigate('/login', { replace: true })
    } catch (err) {
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
            maxLength={LOGIN_ID_MAX_LENGTH}
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
          <StatusLine
            status={loginIdStatus}
            invalidMsg={LOGIN_ID_MESSAGE}
            takenMsg="이미 사용 중인 아이디예요."
            availableMsg="사용 가능한 아이디예요."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            name="nickname"
            placeholder="한글·영문·숫자·밑줄(_), 1~10자"
            maxLength={NICKNAME_MAX_LENGTH}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <StatusLine
            status={nickStatus}
            invalidMsg={NICKNAME_MESSAGE}
            takenMsg="이미 사용 중인 닉네임이에요."
            availableMsg="사용 가능한 닉네임이에요."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">비밀번호</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="8~15자, 대소문자·특수문자 포함"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="min-h-[1.25rem] text-xs">
            {password.length > 0 && !passwordValid && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="size-3" />
                비밀번호는 8~15자, 대소문자·특수문자를 포함해야 해요.
              </span>
            )}
            {password.length > 0 && passwordValid && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="size-3" />
                사용 가능한 비밀번호예요.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">비밀번호 확인</Label>
          <PasswordInput
            id="confirm"
            name="confirm"
            placeholder="비밀번호를 다시 입력"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <div className="min-h-[1.25rem] text-xs">
            {confirm.length > 0 && !confirmMatch && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="size-3" />
                비밀번호가 일치하지 않아요.
              </span>
            )}
            {confirm.length > 0 && confirmMatch && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="size-3" />
                비밀번호가 일치해요.
              </span>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            id="agree"
            name="agree"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            <span className="font-medium text-foreground">이용약관</span> 및{' '}
            <span className="font-medium text-foreground">개인정보 처리방침</span>에 동의합니다.
          </span>
        </label>

        {submitError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 h-11" disabled={!canSubmit || submitting}>
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
