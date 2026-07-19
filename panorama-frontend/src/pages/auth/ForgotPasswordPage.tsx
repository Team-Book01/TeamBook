import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { toast } from '@/lib/toast'
import { requestPasswordReset } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { isValidEmail } from '@/lib/validation'

/**
 * 비밀번호 찾기(초기화) 요청 화면 (/forgot-password).
 *
 * 전제: 이메일은 설정(SettingsPage)에서 등록·인증한다. 인증된 이메일이 있는 계정만 재설정 가능.
 * 흐름: 이메일 입력 → POST /auth/password/reset-request → 등록된 이메일로 재설정 링크 발송.
 *       링크를 누르면 /reset-password 에서 새 비밀번호로 변경한다.
 *
 * 계정 유무를 노출하지 않기 위해 백엔드는 항상 202로 응답하므로, 화면도 항상 "보냈어요"로 안내한다.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const emailValid = isValidEmail(email.trim())

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailValid) return
    setSending(true)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      toast.error(getErrorMessage(err, '메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="비밀번호를 잊으셨나요?"
      title="비밀번호 찾기"
      subtitle="설정에서 등록·인증한 이메일로 재설정 링크를 보내드려요."
    >
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <Mail className="size-12 text-primary" />
          <p className="text-center text-sm font-medium">메일을 확인해 주세요.</p>
          <p className="text-center text-xs text-muted-foreground">
            입력하신 이메일이 등록되어 있다면 재설정 링크를 보냈어요. (15분 내 유효)
            <br />
            메일의 링크를 눌러 새 비밀번호를 설정해 주세요.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setSent(false)}
          >
            다른 이메일로 다시 보내기
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="설정에서 인증한 이메일"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="mt-2 h-11" disabled={!emailValid || sending}>
            {sending ? '보내는 중...' : '재설정 메일 보내기'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            이메일을 아직 등록하지 않았다면, 로그인 후 설정에서 등록·인증할 수 있어요.
          </p>
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
