import type { ReactNode } from 'react'
import { startSocialLogin } from '@/lib/oauth'
import { toast } from '@/lib/toast'

type Provider = 'google' | 'kakao' | 'naver'

const providers: {
  id: Provider
  label: string
  className: string
  icon: ReactNode
}[] = [
  {
    id: 'google',
    label: 'Google로 계속하기',
    className: 'bg-card text-foreground border border-border hover:bg-secondary',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2 3.44-4.96 3.44-8.39Z"
        />
        <path
          fill="#34A853"
          d="M12 23.5c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.9c-1.03.7-2.35 1.11-3.88 1.11-2.98 0-5.5-2.01-6.4-4.72H1.76v2.99A11.5 11.5 0 0 0 12 23.5Z"
        />
        <path
          fill="#FBBC05"
          d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.76a11.5 11.5 0 0 0 0 10.4l3.84-3Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.3 15.1.25 12 .25A11.5 11.5 0 0 0 1.76 6.4l3.84 3c.9-2.71 3.42-4.65 6.4-4.65Z"
        />
      </svg>
    ),
  },
  {
    id: 'kakao',
    label: '카카오로 계속하기',
    className: 'bg-[#FEE500] text-[#191600] hover:brightness-95 border-0',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="#191600">
        <path d="M12 3C6.98 3 3 6.2 3 10.14c0 2.5 1.66 4.7 4.17 5.98-.18.63-.66 2.3-.76 2.66-.12.45.17.44.35.32.15-.1 2.3-1.56 3.23-2.2.66.1 1.33.15 2.01.15 5.02 0 9-3.2 9-7.14S17.02 3 12 3Z" />
      </svg>
    ),
  },
  {
    id: 'naver',
    label: '네이버로 계속하기',
    className: 'bg-[#03C75A] text-white hover:brightness-95 border-0',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="white">
        <path d="M14.2 12.1 9.5 5H5v14h4.8v-7.1L14.5 19H19V5h-4.8v7.1Z" />
      </svg>
    ),
  },
]

/**
 * 소셜 로그인 버튼 묶음.
 *
 * - google / naver: 백엔드 OAuth2 엔드포인트로 이동해 실제 로그인 시작.
 *   (백엔드가 처리 후 /oauth/callback 으로 토큰을 붙여 리다이렉트 → OAuthCallbackPage)
 * - kakao: 백엔드 미지원이라 "준비 중" 안내만 띄운다.
 */
export function SocialButtons({ mode }: { mode: 'login' | 'signup' }) {
  const action = mode === 'login' ? '로그인' : '회원가입'

  function handleClick(id: Provider, label: string) {
    if (id === 'google' || id === 'naver') {
      startSocialLogin(id)
    } else {
      toast.info(`${label.replace('로 계속하기', '')} ${action}은 준비 중이에요.`)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => handleClick(p.id, p.label)}
          className={`inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg px-4 text-sm font-semibold transition-all ${p.className}`}
        >
          {p.icon}
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  )
}
