import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/**
 * 일반(사용자용) 페이지 공통 레이아웃: 상단 GNB + 콘텐츠 + 푸터.
 * 라우터에서 이 Layout 하위에 각 페이지를 <Outlet/> 으로 렌더한다.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
