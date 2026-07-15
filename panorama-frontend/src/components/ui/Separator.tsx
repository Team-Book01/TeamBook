import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** 공통 수평 구분선. */
export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px w-full bg-border', className)} {...props} />
}
