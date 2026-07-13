import { cn } from '@/lib/utils'

interface AvatarProps {
  /** 이니셜 (예: '달') */
  initial: string
  color?: string
  size?: number
  className?: string
}

/** 공통 이니셜 아바타. */
export function Avatar({ initial, color = '#2E7D6B', size = 32, className }: AvatarProps) {
  return (
    <div
      className={cn('rounded-full flex items-center justify-center text-white font-bold', className)}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  )
}
