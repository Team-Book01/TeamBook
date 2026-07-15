import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Flag,
  MessageSquare,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
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
 * 관리자 공통 좌측 사이드바 — 다크 셸 + 그린 액센트(Option B).
 *  - 배경은 중립 다크, 브랜드 그린은 로고/활성 상태 강조에만 사용
 *  - 메뉴를 섹션으로 그룹핑, 상단 로고 행에 접기 토글, 하단은 계정 영역
 *  - 접으면 아이콘만 남는 레일(64px) + tooltip + 배지 dot, ⌘B 로 토글
 */

const NAV_SECTIONS: { label: string; items: AdminNavItem[] }[] = [
  {
    label: '운영',
    items: [
      { label: '대시보드', to: '/admin', icon: LayoutDashboard, end: true },
      { label: '사용자 관리', to: '/admin/users', icon: Users },
    ],
  },
  {
    label: '콘텐츠',
    items: [
      { label: '콘텐츠 관리', to: '/admin/content', icon: FileText },
      { label: '신고 관리', to: '/admin/reports', icon: Flag, badge: 7, badgeColor: '#ef4444' },
      { label: '문의 관리', to: '/admin/inquiries', icon: MessageSquare, badge: 4, badgeColor: '#f59e0b' },
    ],
  },
  {
    label: '시스템',
    items: [{ label: '공지사항 관리', to: '/admin/notices', icon: Megaphone }],
  },
]

// AdminLayout 이 현재 페이지 제목을 찾을 때 쓰는 평탄화 목록
export const ADMIN_NAV: AdminNavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

const COLLAPSE_KEY = 'adminSidebarCollapsed'

export default function AdminSidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })

  // ⌘B / Ctrl+B 로 접기 토글 (입력 중이 아닐 때만)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        const el = e.target as HTMLElement
        if (/input|textarea|select/i.test(el?.tagName ?? '')) return
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  const navItem = ({ label, to, icon: Icon, end, badge, badgeColor }: AdminNavItem) => {
    const active = isActive(to, end)
    return (
      <Link
        key={to}
        to={to}
        title={collapsed ? label : undefined}
        className={cn(
          'relative flex items-center rounded-lg text-[13px] font-medium transition-colors mx-2 my-0.5',
          collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2',
          active ? 'bg-admin-point/15 text-white' : 'text-white/68 hover:bg-white/[0.06] hover:text-white',
        )}
      >
        {active && !collapsed && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-admin-nav-accent" />}
        <span className="relative shrink-0">
          <Icon size={17} className={active ? 'text-admin-nav-accent' : undefined} />
          {collapsed && badge != null && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-admin-nav" style={{ backgroundColor: badgeColor }} />
          )}
        </span>
        {!collapsed && <span className="flex-1 whitespace-nowrap">{label}</span>}
        {!collapsed && badge != null && (
          <span className="text-[11px] font-bold text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center" style={{ backgroundColor: badgeColor }}>
            {badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'flex flex-col sticky top-0 h-screen text-white bg-admin-nav transition-[width] duration-200',
        collapsed ? 'w-[64px] min-w-[64px]' : 'w-[240px] min-w-[240px]',
      )}
    >
      {/* 로고 + 접기 토글 */}
      <div className={cn('flex items-center h-[60px] border-b border-white/8 shrink-0', collapsed ? 'justify-center px-0' : 'gap-2 px-3.5')}>
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="w-6 h-6 rounded-md bg-admin flex items-center justify-center shrink-0">
              <BookOpen size={14} className="text-white" />
            </span>
            <span className="font-bold text-[14px] truncate">파노라마북스</span>
          </div>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!collapsed}
          aria-controls="admin-sidebar-nav"
          title={collapsed ? '사이드바 펼치기  (⌘B)' : '사이드바 접기  (⌘B)'}
          className="p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* 메뉴 (섹션 그룹핑) */}
      <nav id="admin-sidebar-nav" className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.label} className={cn(i > 0 && (collapsed ? 'mt-2 pt-2 border-t border-white/[0.06]' : 'mt-3'))}>
            {!collapsed && <p className="text-[10px] font-medium text-white/35 px-4 pb-1 pt-1">{section.label}</p>}
            {section.items.map(navItem)}
          </div>
        ))}
      </nav>

      {/* 계정 */}
      <div className="border-t border-white/8 p-2 shrink-0">
        <button
          type="button"
          title={collapsed ? '김관리자 · 슈퍼 어드민' : undefined}
          className={cn('w-full flex items-center rounded-lg hover:bg-white/[0.06] transition-colors', collapsed ? 'justify-center py-2' : 'gap-2.5 px-2.5 py-2')}
        >
          <span className="w-8 h-8 rounded-full bg-admin-point flex items-center justify-center text-[12px] font-bold shrink-0">관</span>
          {!collapsed && (
            <>
              <span className="flex flex-col items-start leading-tight min-w-0">
                <span className="text-[12.5px] font-semibold truncate">김관리자</span>
                <span className="text-[10.5px] text-white/45">슈퍼 어드민</span>
              </span>
              <ChevronsUpDown size={14} className="ml-auto text-white/40 shrink-0" />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
