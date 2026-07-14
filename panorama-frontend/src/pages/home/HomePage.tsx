import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Star,
  Heart,
  Eye,
  Megaphone,
} from 'lucide-react'
import {
  POPULAR_BOOKS,
  POSTS,
  NOTICES,
  QUICK_LINKS,
  TYPE_BADGE,
} from './data'
import type { TabKey } from './data'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const navigate = useNavigate()
  const [searchMode, setSearchMode] = useState<'제목' | '저자'>('제목')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('전체')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // 검색 실행 → 검색 결과 페이지(/books?q=)로 이동
  const handleSearch = () => {
    const q = query.trim()
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : '/books')
  }

  const scroll = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({
      left: dir === 'left' ? -360 : 360,
      behavior: 'smooth',
    })
  }

  return (
    <div
      className="min-h-screen bg-[#F9F9F9]"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* ── Search + Quick links ── */}
      <section className="bg-[#F9F9F9] py-8 px-4">
        <div className="mx-auto flex w-full max-w-[35rem] flex-col items-center gap-6">
          {/* Search input */}
          <div
            className={cn(
              'w-full flex items-center rounded-full border px-4 bg-white transition-all',
              'border-[#EAEAEA]',
              'focus-within:border-[#2E7D6B]',
              'focus-within:shadow-[0_0_0_3px_rgba(46,125,107,0.1)]'
            )}
            style={{ minHeight: '3.5rem' }}
          >
            {/* Dropdown 자리 (필요하면 복구해서 사용) */}
            <div className="relative shrink-0">
              {/* 
              <button ...> {searchMode} </button>
              드롭다운 코드 복구해서 쓰면 됩니다 
              */}
            </div>

            {/* Text input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어를 입력하세요"
              className="flex-1 h-14 px-2 text-base text-foreground bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
            />

            {/* Search icon */}
            <button
              onClick={handleSearch}
              aria-label="검색"
              className="px-2 h-14 flex items-center text-primary hover:text-primary/70 transition"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* Quick links */}
          <div className="flex items-start justify-center gap-6">
            {QUICK_LINKS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center group-hover:scale-105 transition group-hover:shadow-md"
                  style={{ boxShadow: '0 1px 5px rgba(0,0,0,0.10)' }}
                >
                  <Icon size={26} className="text-primary" />
                </div>
                <span className="text-[11px] text-foreground font-medium leading-tight text-center w-14">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-border max-w-6xl mx-auto" />

      {/* ── 독자들의 PICK — full width ── */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">독자들의 PICK</h2>
          <a
            href="#"
            className="text-sm text-primary font-medium hover:underline underline-offset-4"
          >
            더보기 →
          </a>
        </div>

        <div className="relative flex items-center">
          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            className="shrink-0 z-10 w-9 h-9 rounded-full bg-card border border-border shadow hover:bg-muted transition flex items-center justify-center mr-2"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto flex-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {POPULAR_BOOKS.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                className="shrink-0 w-40 cursor-pointer group"
              >
                <div className="relative rounded-xl overflow-hidden shadow-md bg-muted mb-3">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-40 h-56 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-sm font-semibold text-foreground truncate">
                  {book.title}
                </p>
                <p className="text-xs text-muted-foreground truncate mb-1.5">
                  {book.author}
                </p>
                <div className="flex items-center gap-1.5">
                  <Star size={11} className="text-accent fill-accent" />
                  <span className="text-xs text-muted-foreground">
                    {book.rating}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {book.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            className="shrink-0 z-10 w-9 h-9 rounded-full bg-card border border-border shadow hover:bg-muted transition flex items-center justify-center ml-2"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <div className="h-px bg-border max-w-6xl mx-auto" />

      {/* ── Bottom: Posts + Sidebar ── */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">인기 글</h2>
            <a
              href="#"
              className="text-sm text-primary font-medium hover:underline underline-offset-4"
            >
              더보기 →
            </a>
          </div>

          <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1 w-fit">
            {(['전체', '책추천', '독후감', '독서인증'] as TabKey[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    activeTab === tab
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="flex flex-col gap-2">
            {POSTS[activeTab].map((post) => (
              <div
                key={post.id}
                onClick={() => navigate('/community')}
                className="flex items-center gap-3 bg-card rounded-xl px-4 py-3.5 border border-border hover:border-primary/30 hover:shadow-sm transition group cursor-pointer"
              >
                <span
                  className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[post.type]}`}
                >
                  {post.type}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition truncate">
                  {post.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground hidden sm:block">
                  {post.author}
                </span>
                <div className="shrink-0 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {post.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {post.likes}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground hidden md:block">
                  {post.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Community stats — compact 2 items */}
          <section className="bg-primary text-primary-foreground rounded-2xl p-5">
            <h3 className="font-bold mb-4 text-base">커뮤니티 현황</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '오늘 방문', value: '3,291명' },
                { label: '게시글', value: '14,320개' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white/10 rounded-xl p-4 text-center"
                >
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs opacity-70 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Notices */}
          <section className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone size={15} className="text-primary" />
                <h3 className="font-bold text-foreground text-base">
                  공지사항
                </h3>
              </div>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-primary transition"
              >
                전체보기
              </a>
            </div>
            <ul className="flex flex-col gap-3">
              {NOTICES.map((n) => (
                <li key={n.id}>
                  <a href="#" className="flex items-start gap-2 group">
                    {n.isNew && (
                      <span className="shrink-0 mt-0.5 text-[10px] font-bold text-accent bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                    <span className="flex-1 text-sm text-foreground group-hover:text-primary transition leading-snug">
                      {n.title}
                    </span>
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {n.date}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Summer challenge */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1d4e3a 0%, #0f5132 100%)',
            }}
          >
            <div className="p-5 text-white">
              <p className="text-xs font-semibold opacity-60 uppercase tracking-widest mb-1">
                이벤트
              </p>
              <p className="font-bold text-base leading-snug mb-1">
                여름 독서 챌린지
              </p>
              <p className="text-xs opacity-70 mb-3">
                7월 한 달 3권 완독 시 스타벅스 쿠폰 증정!
              </p>
              <button className="bg-accent text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition">
                지금 참여하기
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}