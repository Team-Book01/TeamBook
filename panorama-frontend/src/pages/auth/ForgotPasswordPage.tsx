import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { toast } from '@/lib/toast'
import { isValidLoginId, isValidPassword, PASSWORD_MESSAGE } from '@/lib/validation'

/**
 * 비밀번호 찾기(초기화) 화면 — 페이지 흐름만 설계.
 *
 * 전제: 이메일은 가입 시 받지 않고, 설정(SettingsPage)에서 등록·인증한다.
 *       인증된 이메일이 있는 계정만 이 흐름으로 비밀번호를 재설정할 수 있다.
 *
 * 2단계:
 *   1) 아이디 입력 → 등록된 이메일로 6자리 인증코드 전송
 *   2) 인증코드 + 새 비밀번호 입력 → 재설정
 *
 * ⚠️ 백엔드 이메일 발송·비밀번호 초기화(PasswordService/EmailVerificationService)는
 *    현재 스텁이라, 실제 전송·재설정은 '준비 중' 안내로 대체한다(화면 흐름만 동작).
 */
type Step = 'request' | 'reset'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')

  // 1단계
  const [loginId, setLoginId] = useState('')

  // 2단계
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const loginIdValid = isValidLoginId(loginId.trim())
  const codeValid = /^\d{6}$/.test(code)
  const passwordValid = isValidPassword(newPassword)
  const confirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  const canReset = codeValid && passwordValid && confirmMatch

  // 1단계: 아이디 입력 → 등록 이메일로 인증코드 전송(준비 중)
  function handleSendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!loginIdValid) return
    setStep('reset')
    toast.info('등록된 이메일로 인증코드를 전송했어요. (메일 발송은 준비 중이에요)')
  }

  // 2단계: 인증코드 + 새 비밀번호 → 재설정(준비 중)
  function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canReset) return
    toast.info('비밀번호 초기화는 준비 중이에요. (백엔드 연동 예정)')
    navigate('/login', { replace: true })
  }

  return (
    <AuthLayout
      eyebrow="비밀번호를 잊으셨나요?"
      title="비밀번호 찾기"
      subtitle={
        step === 'request'
          ? '가입한 아이디를 입력하면 등록·인증된 이메일로 인증코드를 보내드려요.'
          : '이메일로 받은 인증코드와 새 비밀번호를 입력해 주세요.'
      }
    >
      {step === 'request' ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="loginId">아이디</Label>
            <Input
              id="loginId"
              name="loginId"
              placeholder="가입한 아이디"
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="mt-2 h-11" disabled={!loginIdValid}>
            인증코드 전송
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            이메일을 아직 등록하지 않았다면, 로그인 후 설정에서 등록·인증할 수 있어요.
          </p>
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">인증코드</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="메일로 받은 6자리 숫자"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
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
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
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

          <Button type="submit" size="lg" className="mt-2 h-11" disabled={!canReset}>
            비밀번호 재설정
          </Button>

          <button
            type="button"
            className="text-center text-xs text-muted-foreground hover:underline"
            onClick={() => setStep('request')}
          >
            아이디를 다시 입력할게요
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        비밀번호가 기억나셨나요?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          로그인
        </Link>
      </p>
    </AuthLayout>
  )
}
