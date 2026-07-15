import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** 공통 체크박스 (네이티브 input 기반, 브랜드 컬러 accent). */
export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn('size-4 shrink-0 rounded border-input accent-primary', className)}
      {...props}
    />
  )
}
