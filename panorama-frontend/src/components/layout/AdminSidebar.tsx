import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Flag,
  MessageSquare,
  Megaphone,
  RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminNavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  badge?: number
  badgeColor?: string
}

/**
 * 관리자 공통 좌측 사이드바 (통합).
 *
 * 기준: 관리자 5개 화면이 각자 갖고 있던 좌측 사이드바를 하나로 통일.
 *  - 다크 그린(#1E4A38) 배경, 로고 "파노라마북스 / ADMIN CONSOLE"
 *  - 동일한 8개 메뉴 + 신고(7)/문의(4) 뱃지
 *  - lucide 아이콘으로 통일 (공지사항 폴더의 inline SVG, "피노라이브스" 오타 등 정리)
 */

export const ADMIN_NAV: AdminNavItem[] = [
  { label: '대시보드', to: '/admin', icon: LayoutDashboard, end: true },
  { label: '사용자 관리', to: '/admin/users', icon: Users },
  { label: '콘텐츠 관리', to: '/admin/content', icon: FileText },
  { label: '독서 모임 관리', to: '/admin/clubs', icon: BookOpen },
  { label: '신고 관리', to: '/admin/reports', icon: Flag, badge: 7, badgeColor: '#ef4444' },
  { label: '문의 관리', to: '/admin/inquiries', icon: MessageSquare, badge: 4, badgeColor: '#f59e0b' },
  { label: '공지사항 관리', to: '/admin/notices', icon: Megaphone },
  { label: '도서관 데이터 동기화', to: '/admin/sync', icon: RefreshCw },
]

export default function AdminSidebar() {
  const location = useLocation()
  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <aside
      className="w-[240px] min-w-[240px] flex flex-col sticky top-0 h-screen text-white"
      style={{ backgroundColor: '#1E4A38' }}
    >
      {/* 로고 */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-white" />
          <span className="font-bold text-[15px]">파노라마북스</span>
        </div>
        <p className="text-[11px] text-white/50 mt-1 tracking-wide">ADMIN CONSOLE</p>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {ADMIN_NAV.map(({ label, to, icon: Icon, end, badge, badgeColor }) => {
          const active = isActive(to, end)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 mx-3 my-0.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors',
                active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && (
                <span
                  className="text-[11px] font-bold text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                  style={{ backgroundColor: badgeColor }}
                >
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* 푸터 */}
      <div className="px-6 py-3 border-t border-white/10 text-[11px] text-white/45">
        v2.4.1 · 파노라마북스
      </div>
    </aside>
  )
}
