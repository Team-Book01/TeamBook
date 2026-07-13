import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'brand' | 'gray' | 'gold' | 'danger'

const VARIANTS: Record<Variant, string> = {
  brand: 'bg-[#EFF6F2] text-[#2E7D6B]',
  gray: 'bg-[#F2F2F2] text-[#666]',
  gold: 'bg-[#FDF6E3] text-[#B8860B]',
  danger: 'bg-[#FDECEC] text-[#E5484D]',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

/** 공통 뱃지 (카테고리/상태 표시). */
export function Badge({ variant = 'brand', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
