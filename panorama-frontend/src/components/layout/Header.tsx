import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Search, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  // 현재 경로 기준 활성 메뉴 판정 ('/' 는 정확히 일치, 나머지는 prefix)
  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : '/books')
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

        {/* 우측: 알림 + 로그인 (로그인 연동 전 상태) */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button
            type="button"
            aria-label="알림"
            className="relative p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
          >
            <Bell size={19} className="text-[#555]" />
            <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white" />
          </button>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-brand hover:bg-brand-point rounded-full px-4 py-2 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  )
}
