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
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminDashboard } from '@/api/admin'

interface AdminNavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  badgeColor?: string
}

/**
 * 관리자 공통 좌측 사이드바 — 다크 셸 + 그린 액센트.
 *  - 데스크톱(lg+): 인-플로우, 접기 토글로 아이콘 레일(64px) 전환(⌘B)
 *  - 모바일(lg 미만): 오버레이 드로어(햄버거로 여닫음), 접기 개념 없이 항상 풀 라벨
 *  - 신고/문의 배지는 대시보드 실데이터(처리 대기 수)와 동일 소스
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
      { label: '신고 관리', to: '/admin/reports', icon: Flag, badgeColor: '#ef4444' },
      { label: '문의 관리', to: '/admin/inquiries', icon: MessageSquare, badgeColor: '#f59e0b' },
    ],
  },
  {
    label: '시스템',
    items: [{ label: '공지사항 관리', to: '/admin/notices', icon: Megaphone }],
  },
]

export const ADMIN_NAV: AdminNavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

const COLLAPSE_KEY = 'adminSidebarCollapsed'

interface Props {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function AdminSidebar({ mobileOpen, onMobileClose }: Props) {
  const location = useLocation()
  const { data } = useAdminDashboard()

  // 배지 카운트(실데이터). 없으면(로딩/에러) 배지 미표시
  const pendingByPath: Record<string, number | undefined> = {
    '/admin/reports': data?.stats.pendingReports,
    '/admin/inquiries': data?.stats.pendingInquiries,
  }

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

  // ⌘B / Ctrl+B 로 접기 토글 (데스크톱 편의)
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

  const navItem = ({ label, to, icon: Icon, end, badgeColor }: AdminNavItem) => {
    const active = isActive(to, end)
    const count = pendingByPath[to]
    const hasBadge = count != null && count > 0
    return (
      <Link
        key={to}
        to={to}
        onClick={onMobileClose}
        title={collapsed ? label : undefined}
        className={cn(
          'relative flex items-center rounded-lg text-[13px] font-medium transition-colors mx-2 my-0.5 gap-2.5 px-2.5 py-2',
          collapsed && 'lg:justify-center lg:gap-0 lg:px-0 lg:py-2.5',
          active ? 'bg-admin-point/15 text-white' : 'text-white/68 hover:bg-white/[0.06] hover:text-white',
        )}
      >
        {active && <span className={cn('absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-admin-nav-accent', collapsed && 'lg:hidden')} />}
        <span className="relative shrink-0">
          <Icon size={17} className={active ? 'text-admin-nav-accent' : undefined} />
          {hasBadge && (
            <span className={cn('hidden absolute -top-1 -right-1 w-2 h-2 rounded-full border border-admin-nav', collapsed && 'lg:block')} style={{ backgroundColor: badgeColor }} />
          )}
        </span>
        <span className={cn('flex-1 whitespace-nowrap', collapsed && 'lg:hidden')}>{label}</span>
        {hasBadge && (
          <span className={cn('text-[11px] font-bold text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center', collapsed && 'lg:hidden')} style={{ backgroundColor: badgeColor }}>
            {count}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside
      id="admin-sidebar-nav"
      className={cn(
        'fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col text-white bg-admin-nav transition-all duration-200',
        'w-[240px] min-w-[240px]',
        collapsed && 'lg:w-[64px] lg:min-w-[64px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/* 로고 + 토글 / 모바일 닫기 */}
      <div className={cn('flex items-center h-[60px] border-b border-white/8 shrink-0 gap-2 px-3.5', collapsed && 'lg:px-0 lg:justify-center')}>
        <div className={cn('flex items-center gap-2 flex-1 min-w-0', collapsed && 'lg:hidden')}>
          <span className="w-6 h-6 rounded-md bg-admin flex items-center justify-center shrink-0">
            <BookOpen size={14} className="text-white" />
          </span>
          <span className="font-bold text-[14px] truncate">파노라마북스</span>
        </div>
        {/* 데스크톱: 접기 토글 */}
        <button
          onClick={toggle}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!collapsed}
          title={collapsed ? '사이드바 펼치기  (⌘B)' : '사이드바 접기  (⌘B)'}
          className="hidden lg:flex p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {/* 모바일: 닫기 */}
        <button onClick={onMobileClose} aria-label="메뉴 닫기" className="lg:hidden ml-auto p-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition-colors shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* 메뉴 (섹션 그룹핑) */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.label} className={cn(i > 0 && 'mt-3')}>
            <p className={cn('text-[10px] font-medium text-white/35 px-4 pb-1 pt-1', collapsed && 'lg:hidden')}>{section.label}</p>
            {section.items.map(navItem)}
          </div>
        ))}
      </nav>

      {/* 계정 */}
      <div className="border-t border-white/8 p-2 shrink-0">
        <button
          type="button"
          title={collapsed ? '김관리자 · 슈퍼 어드민' : undefined}
          className={cn('w-full flex items-center rounded-lg hover:bg-white/[0.06] transition-colors gap-2.5 px-2.5 py-2', collapsed && 'lg:justify-center lg:px-0')}
        >
          <span className="w-8 h-8 rounded-full bg-admin-point flex items-center justify-center text-[12px] font-bold shrink-0">관</span>
          <span className={cn('flex flex-col items-start leading-tight min-w-0', collapsed && 'lg:hidden')}>
            <span className="text-[12.5px] font-semibold truncate">김관리자</span>
            <span className="text-[10.5px] text-white/45">슈퍼 어드민</span>
          </span>
          <ChevronsUpDown size={14} className={cn('ml-auto text-white/40 shrink-0', collapsed && 'lg:hidden')} />
        </button>
      </div>
    </aside>
  )
}
