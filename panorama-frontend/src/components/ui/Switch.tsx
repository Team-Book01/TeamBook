import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** 공통 토글 스위치 (네이티브 checkbox 를 트랙+썸 형태로 스타일). */
export function Switch({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center',
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="absolute inset-0 rounded-full bg-input transition-colors peer-checked:bg-primary" />
      <span className="absolute left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  )
}
