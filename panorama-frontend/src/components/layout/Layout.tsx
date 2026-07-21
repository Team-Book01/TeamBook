import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/**
 * 일반(사용자용) 페이지 공통 레이아웃: 상단 GNB + 콘텐츠 + 푸터.
 * 라우터에서 이 Layout 하위에 각 페이지를 <Outlet/> 으로 렌더한다.
 */
export default function Layout() {
  const { pathname } = useLocation()
  // 전체화면 지도 페이지는 푸터 숨김 (100vh 레이아웃이라 푸터가 스크롤을 유발)
  const hideFooter = pathname.startsWith('/library-map')
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
