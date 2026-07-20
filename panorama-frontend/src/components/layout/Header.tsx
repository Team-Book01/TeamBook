import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { logout as logoutApi } from '@/api/auth'
import { toast } from '@/lib/toast'


/**
 * 사이트 공통 상단 GNB (통합 Header).
 *
 * 기준: 팀원 5개 GNB 변형 중 완성도가 가장 높았던 BookSearch_List 의 GNB.
 *  - 흰 배경 + 하단 보더
 *  - 로고 + 메뉴(활성 표시) + 검색창 + 우측 알림/로그인
 * 메뉴: 홈 · 도서 검색 · 커뮤니티 · 도서관 지도
 * 우측: (로그인 연동 전) 로그인 버튼 → /login
 *
 * 모든 페이지는 이 Header 를 직접 쓰지 않고 Layout 을 통해 감싸진다.
 */

const NAV_ITEMS = [
  { label: '홈', to: '/' },
  { label: '도서 검색', to: '/books' },
  { label: '커뮤니티', to: '/community' },
  { label: '도서관 지도', to: '/library-map' },
] as const

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 검색 결과 화면의 실제 검색어(URL ?q=)를 단일 기준으로 삼는다.
  const urlQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [focused, setFocused] = useState(false)

  // Header 는 Layout 아래에 한 번만 마운트돼 페이지를 옮겨도 state 가 남는다.
  // 그래서 URL 의 q 가 바뀌어도(홈에서 재검색, 저자명 클릭, 뒤로/앞으로 가기)
  // 입력창은 이전 검색어를 그대로 들고 있어 결과와 어긋났다.
  // → q 가 바뀌면 입력창을 URL 기준으로 되맞춘다.
  //   (effect 대신 렌더 중 조정 — 어긋난 값이 한 프레임 그려지지 않는다)
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)
  if (syncedQuery !== urlQuery) {
    setSyncedQuery(urlQuery)
    setQuery(urlQuery)
  }
  const isHome = location.pathname === '/'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  // 부팅 시 세션 복원(reissue)이 끝났는지. false 인 동안은 로그인/마이페이지 판단을 보류해
  // 새로고침 직후 "로그인" → "마이페이지" 로 바뀌는 깜빡임을 막는다. (RequireAuth 와 동일한 기준)
  const authReady = useAuthStore((s) => s.authReady)
  const storeLogout = useAuthStore((s) => s.logout)

  // 현재 경로 기준 활성 메뉴 판정 ('/' 는 정확히 일치, 나머지는 prefix)
  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : '/books')
  }

  const handleLogout = async () => {
    try {
      await logoutApi() // 백엔드: refresh 토큰 삭제 + 쿠키 만료
    } catch {
      // 서버 로그아웃 실패해도 로컬 상태는 정리한다
    }
    storeLogout()
    toast.success('로그아웃되었습니다.')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 h-[68px] bg-white border-b border-[#EAEAEA]">
      <div className="h-full max-w-[1440px] mx-auto px-6 md:px-10 flex items-center gap-5">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <BookOpen size={19} className="text-brand" />
          <span className="text-brand font-bold text-[17px] tracking-tight whitespace-nowrap">
            파노라마북스
          </span>
        </Link>

        {/* 메뉴 */}
        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium transition-colors whitespace-nowrap',
                isActive(item.to)
                  ? 'bg-[#EFF6F2] text-[#2E7D6B]'
                  : 'text-[#555] hover:bg-[#F5F5F5]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 검색창 */}
     {!isHome && (
  <form onSubmit={onSearch} className="flex-1 min-w-0 max-w-sm hidden sm:block">
    <div
      className={cn(
        'flex items-center gap-2 border rounded-full px-4 py-2 bg-white transition-all',
        focused
          ? 'border-[#2E7D6B] shadow-[0_0_0_3px_rgba(46,125,107,0.1)]'
          : 'border-[#EAEAEA]',
      )}
    >
      <Search size={14} className="text-[#aaa] flex-shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="책 제목, 저자, 주제…"
        className="flex-1 text-[13px] outline-none bg-transparent text-[#1A1A1A] placeholder:text-[#bbb] min-w-0"
      />
    </div>
  </form>
)}

        {/* 우측: 로그인 (로그인 연동 전 상태) */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* 세션 복원 전(!authReady)에는 렌더를 보류해 잘못된 버튼이 잠깐 보이는 깜빡임을 막는다 */}
          {authReady &&
            (isAuthenticated ? (
              <>
                <Link
                  to="/mypage"
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-brand hover:bg-brand-point rounded-full px-4 py-2 transition-colors"
                >
                  <User size={15} />
                  마이페이지
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[13px] font-semibold text-[#555] hover:bg-[#F5F5F5] rounded-full px-4 py-2 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-brand hover:bg-brand-point rounded-full px-4 py-2 transition-colors"
              >
                로그인
              </Link>
            ))}
        </div>
      </div>
    </header>
  )
}
