import { Outlet, useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import AdminSidebar, { ADMIN_NAV } from './AdminSidebar'

/**
 * 관리자 공통 레이아웃: 좌측 사이드바 + 상단 페이지 헤더 + 콘텐츠 영역.
 * 각 관리자 페이지는 사이드바/상단바를 제거하고 콘텐츠만 렌더한다.
 */
export default function AdminLayout() {
  const location = useLocation()
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
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 상단 페이지 헤더 */}
        <header className="flex items-center justify-between px-7 h-[60px] bg-white border-b border-border shrink-0 sticky top-0 z-40">
          <div className="flex items-baseline gap-2">
            <span className="text-admin font-bold text-[16px]">{title}</span>
            <span className="text-muted-foreground text-[12px]">· {today}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="알림"
              className="relative p-2 rounded-lg hover:bg-admin-light transition-colors"
            >
              <Bell size={18} className="text-admin-point" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-admin flex items-center justify-center text-white text-[12px] font-bold">
                관
              </div>
              <div>
                <p className="text-[12px] font-semibold text-foreground leading-tight">김관리자</p>
                <p className="text-[10px] text-muted-foreground">슈퍼 어드민</p>
              </div>
            </div>
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
