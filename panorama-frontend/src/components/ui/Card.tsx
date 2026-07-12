import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** 공통 카드 컨테이너 (흰 배경 + 보더 + 라운드). 여러 페이지의 카드 UI 기본형. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white border border-[#EAEAEA] rounded-2xl', className)}
      {...props}
    />
  )
}
