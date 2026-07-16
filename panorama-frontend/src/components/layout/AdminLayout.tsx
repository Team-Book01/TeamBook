import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import AdminSidebar, { ADMIN_NAV } from './AdminSidebar'

/**
 * 관리자 공통 레이아웃: 좌측 사이드바 + 상단 페이지 헤더 + 콘텐츠 영역.
 * 모바일(lg 미만)에서는 사이드바가 햄버거로 여닫는 오버레이 드로어가 된다.
 */
export default function AdminLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // 라우트 이동 시 모바일 드로어 자동 닫힘
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const current = [...ADMIN_NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => (n.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(n.to)))
  const title = current?.label ?? '관리자'

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen flex bg-admin-bg">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* 모바일 오버레이 backdrop */}
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* 상단 페이지 헤더 */}
        <header className="flex items-center gap-3 px-4 sm:px-7 h-[60px] bg-white border-b border-border shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
            className="lg:hidden -ml-1 p-2 rounded-lg hover:bg-admin-light transition-colors"
          >
            <Menu size={20} className="text-admin" />
          </button>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-admin font-bold text-[16px] truncate">{title}</span>
            <span className="hidden sm:inline text-muted-foreground text-[12px]">· {today}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              aria-label="알림"
              className="relative p-2 rounded-lg hover:bg-admin-light transition-colors"
            >
              <Bell size={18} className="text-admin-point" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
