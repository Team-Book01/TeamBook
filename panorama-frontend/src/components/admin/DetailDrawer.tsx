import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 관리자 화면 공용 우측 슬라이드오버 상세 드로어.
 * 목록은 풀폭을 유지하고 상세는 오버레이로 띄운다(콘텐츠·신고·문의·사용자·공지 공통 패턴).
 *
 * - header: 상단 고정 영역(배지/제목 등)
 * - children: 스크롤되는 본문
 * - footer: 하단 고정 액션 영역(선택)
 */
interface Props {
  onClose: () => void
  header?: React.ReactNode
  footer?: React.ReactNode
  width?: number
  className?: string
  children: React.ReactNode
}

export default function DetailDrawer({ onClose, header, footer, width = 480, children, className }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          'relative h-full max-w-[92vw] bg-white shadow-2xl flex flex-col overflow-hidden',
          'animate-[adminDrawerIn_.22s_cubic-bezier(.25,.46,.45,.94)_both]',
          className,
        )}
        style={{ width }}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
          <div className="min-w-0 flex-1">{header}</div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground shrink-0">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
        {footer && <div className="border-t border-border shrink-0">{footer}</div>}
      </div>
      <style>{`@keyframes adminDrawerIn { from { transform: translateX(100%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  )
}
