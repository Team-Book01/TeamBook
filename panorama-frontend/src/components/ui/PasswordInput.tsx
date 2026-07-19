import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 비밀번호 입력 + 표시/숨김 토글 버튼.
 * 눈 아이콘을 누르면 type 이 password ↔ text 로 바뀌어 입력값을 확인할 수 있다.
 * 나머지 props 는 일반 input 과 동일하게 전달한다. (type 은 내부에서 관리)
 */
export function PasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        className={cn(
          'h-11 w-full rounded-lg border border-input bg-card pl-3.5 pr-10 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
