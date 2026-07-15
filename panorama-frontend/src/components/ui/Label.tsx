import type { LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** 공통 폼 라벨. */
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium text-foreground', className)} {...props} />
}
