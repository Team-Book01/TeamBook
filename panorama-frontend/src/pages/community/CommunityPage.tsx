import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PenLine,
  Eye,
  Heart,
  MessageCircle,
  Flame,
  BookMarked,
  ChevronDown,
  Bookmark,
  TrendingUp,
} from "lucide-react";

import type { MainTab, PeriodChip, Post } from "./data";
import {
  ALL_POSTS,
  HOT_POSTS,
  POPULAR_BOOKS,
  BADGE,
  MAIN_TABS,
  PERIOD_CHIPS,
} from "./data";

// ─── Badge ────────────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Exclude<MainTab, "전체" | "인기"> }) {
  const s = BADGE[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] font-bold leading-none"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {category}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initial, color, size = 28 }: { initial: string; color: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initial}
    </span>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <article
      onClick={onOpen}
      className="bg-white border border-[#EAEAEA] rounded-2xl p-6 hover:shadow-[0_4px_24px_rgba(30,74,56,0.09)] transition-all duration-200 cursor-pointer group"
    >

      <div className="flex gap-5">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Top: badge + book */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <CategoryBadge category={post.category} />
            <div className="flex items-center gap-1.5">
              <img
                src={post.bookCover}
                alt={post.bookTitle}
                className="w-[18px] h-[24px] object-cover rounded-[3px] bg-[#f0f0f0] flex-shrink-0"
              />
              <span className="text-xs font-semibold truncate max-w-[130px]" style={{ color: "#2E7D6B" }}>
                {post.bookTitle}
              </span>
              <span className="text-[#ddd] text-xs">·</span>
              <span className="text-xs text-[#bbb] truncate max-w-[80px]">{post.bookAuthor}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-[15px] font-bold text-[#1A1A1A] leading-snug group-hover:text-[#1E4A38] transition-colors line-clamp-2"
          >
            {post.title}
          </h3>

          {/* Preview */}
          <p className="text-sm text-[#888] line-clamp-2" style={{ lineHeight: 1.72 }}>
            {post.preview}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-2 pt-0.5">
            <Avatar initial={post.authorInitial} color={post.authorColor} size={26} />
            <span className="text-xs font-semibold text-[#555]">{post.author}</span>
            <span className="text-[#ddd] text-xs">·</span>
            <span className="text-xs text-[#bbb]">{post.timeAgo}</span>

            <div className="ml-auto flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-[#ccc]">
                <Eye size={13} strokeWidth={1.8} />
                <span>{post.views.toLocaleString()}</span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? "text-rose-500" : "text-[#bbb] hover:text-rose-400"}`}
              >
                <Heart size={13} strokeWidth={1.8} className={liked ? "fill-rose-500" : ""} />
                <span>{post.likes + (liked ? 1 : 0)}</span>
              </button>
              <span className="flex items-center gap-1 text-xs" style={{ color: "#2E7D6B" }}>
                <MessageCircle size={13} strokeWidth={1.8} />
                <span>{post.comments}</span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
                className={`transition-colors ${bookmarked ? "text-[#1E4A38]" : "text-[#ddd] hover:text-[#1E4A38]"}`}
              >
                <Bookmark size={14} strokeWidth={1.8} className={bookmarked ? "fill-[#1E4A38]" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Right thumbnail */}
        {post.image && (
          <div className="flex-shrink-0 w-[110px] h-[86px] rounded-xl overflow-hidden bg-[#f3f3f3]">
            <img src={post.image} alt="첨부 이미지" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="flex flex-col gap-5">
      {/* Profile card */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
        {/* Banner */}
        <div
          className="h-[58px] relative"
          style={{ background: "linear-gradient(135deg, #1E4A38 0%, #2E7D6B 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Avatar anchored to bottom of banner */}
          <div
            className="absolute left-5 -bottom-6 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base border-[3px] border-white shadow-md z-10"
            style={{ background: "#2E7D6B" }}
          >
            달
          </div>
        </div>

        {/* Info — pt-8 clears the avatar overhang */}
        <div className="px-5 pb-5 pt-8">
          <div className="mb-4">
            <p className="text-sm font-bold text-[#1A1A1A]">달빛독서가</p>
            <p className="text-xs text-[#bbb] mt-0.5">열정적인 독서인 · Lv.12</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F2F2F2]">
            <a href="#" className="text-center group py-1.5">
              <p className="text-[22px] font-black leading-none" style={{ color: "#1E4A38" }}>12</p>
              <p className="text-[11px] text-[#bbb] mt-1 group-hover:text-[#2E7D6B] transition-colors">내가 쓴 글</p>
            </a>
            <a href="#" className="text-center group py-1.5">
              <p className="text-[22px] font-black leading-none" style={{ color: "#1E4A38" }}>5</p>
              <p className="text-[11px] text-[#bbb] mt-1 group-hover:text-[#2E7D6B] transition-colors">스크랩한 글</p>
            </a>
          </div>
        </div>
      </div>

      {/* Hot posts */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} color="#E07B00" />
          <h3 className="text-sm font-bold text-[#1A1A1A]">이번 주 핫한 글</h3>
        </div>
        <ol className="divide-y divide-[#F5F5F5]">
          {HOT_POSTS.map((post) => (
            <li key={post.rank} className="flex items-start gap-3 py-3 group cursor-pointer first:pt-0 last:pb-0">
              <span
                className="text-sm font-black w-5 text-center flex-shrink-0 mt-0.5"
                style={{ color: post.rank <= 3 ? "#F5B301" : "#ccc" }}
              >
                {post.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs text-[#444] line-clamp-2 group-hover:text-[#2E7D6B] transition-colors"
                  style={{ lineHeight: 1.6 }}
                >
                  {post.title}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp size={10} color="#2E7D6B" />
                  <span className="text-[11px] text-[#bbb]">추천 {post.likes}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Popular books */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookMarked size={16} color="#2E7D6B" />
          <h3 className="text-sm font-bold text-[#1A1A1A]">지금 뜨는 도서</h3>
        </div>
        <div className="divide-y divide-[#F5F5F5]">
          {POPULAR_BOOKS.map((book, i) => (
            <div key={book.title} className="flex items-center gap-3 py-3 group cursor-pointer first:pt-0 last:pb-0">
              <span
                className="text-xs font-black w-4 text-center flex-shrink-0"
                style={{ color: i < 3 ? "#F5B301" : "#ccc" }}
              >
                {i + 1}
              </span>
              <div className="w-9 h-[50px] rounded-md overflow-hidden bg-[#f0f0f0] flex-shrink-0 shadow-sm">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#333] group-hover:text-[#2E7D6B] transition-colors truncate">
                  {book.title}
                </p>
                <p className="text-[11px] text-[#bbb] mt-0.5">{book.author}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#2E7D6B" }}>언급 {book.count}회</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge promo */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E4A38 0%, #2E7D6B 100%)" }}
      >
        <div className="absolute -right-5 -bottom-5 w-28 h-28 rounded-full opacity-10 bg-white" />
        <div className="absolute right-3 top-3 w-12 h-12 rounded-full opacity-10 bg-white" />
        <p className="text-[11px] font-semibold text-white/60 mb-1">오늘의 독서 도전</p>
        <p className="text-sm font-bold text-white leading-snug mb-3">
          30일 독서 챌린지에<br />참여해 보세요!
        </p>
        <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
          참여하기 →
        </button>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>("인기");
  const [period, setPeriod] = useState<PeriodChip>("주간");
  const [sort, setSort] = useState("최신순");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedSearchOpen, setFeedSearchOpen] = useState(false);

  const isPopularTab = activeTab === "인기";

  // Filter posts
  const base =
    activeTab === "전체" || activeTab === "인기"
      ? ALL_POSTS
      : ALL_POSTS.filter((p) => p.category === activeTab);

  const filtered = searchQuery
    ? base.filter(
        (p) =>
          p.title.includes(searchQuery) ||
          p.preview.includes(searchQuery) ||
          p.bookTitle.includes(searchQuery)
      )
    : base;

  const sorted =
    sort === "인기순" || activeTab === "인기"
      ? [...filtered].sort((a, b) => b.likes - a.likes)
      : filtered;

  return (
    <div className="min-h-screen" style={{ background: "#F9F9F9", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="max-w-[1440px] mx-auto px-10 py-8">
        <div className="grid gap-7" style={{ gridTemplateColumns: "1fr 308px" }}>
          {/* ── Feed ─────────────────────────────────────────────── */}
          <section className="min-w-0">

            {/* Header */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "#1A1A1A" }}>
                  커뮤니티
                </h1>
                <p className="text-sm mt-1" style={{ color: "#999", lineHeight: 1.6 }}>
                  다양한 책 이야기를 나누어 보세요
                </p>
              </div>

              <button
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
                style={{ background: "#1E4A38", color: "#fff", boxShadow: "0 2px 8px rgba(30,74,56,0.2)" }}
              >
                <PenLine size={15} strokeWidth={2.2} />
                새 글 작성
              </button>
            </div>

            {/* ── Tab bar + Search + Sort (same row) ────────────── */}
            <div className="flex items-center border-b border-[#EAEAEA]">
              {/* Tabs */}
              <div className="flex flex-1">
                {MAIN_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative px-4 py-3 text-sm font-semibold transition-colors flex-shrink-0"
                    style={{ color: activeTab === tab ? "#2E7D6B" : "#aaa" }}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: "#2E7D6B" }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Search + Sort */}
              <div className="flex items-center gap-2 pb-2">
                {/* Expandable search */}
                <div
                  className="flex items-center overflow-hidden transition-all duration-300 rounded-lg"
                  style={{ width: feedSearchOpen ? 200 : 32 }}
                >
                  {feedSearchOpen ? (
                    <div className="flex items-center gap-1.5 border border-[#2E7D6B] rounded-lg px-2.5 py-1.5 w-full bg-white">
                      <Search size={13} strokeWidth={1.8} color="#2E7D6B" className="flex-shrink-0" />
                      <input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="검색어를 입력하세요"
                        onBlur={() => { if (!searchQuery) setFeedSearchOpen(false); }}
                        className="text-xs text-[#333] outline-none bg-transparent placeholder:text-[#ccc] w-full"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setFeedSearchOpen(true)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#aaa] hover:text-[#333] hover:bg-[#F5F5F5] transition-colors"
                    >
                      <Search size={15} strokeWidth={1.8} />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none text-xs font-semibold text-[#555] bg-white border border-[#E0E0E0] rounded-lg pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none focus:border-[#2E7D6B] transition-colors"
                  >
                    <option>최신순</option>
                    <option>인기순</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ── Post count + 기간 칩 (항상 동일한 위치) ─────── */}
            <div className="flex items-center justify-between mt-4 mb-3">
              <p className="text-xs text-[#ccc]">
                총{" "}
                <span className="font-bold" style={{ color: "#2E7D6B" }}>
                  {sorted.length}
                </span>
                개의 게시글
                {isPopularTab && (
                  <span className="ml-1.5 text-[#ccc]">· {period} 기준</span>
                )}
              </p>

              {/* 인기 탭: 기간 칩 / 나머지 탭: 빈 공간 유지 */}
              <div className="flex items-center gap-1.5 h-[28px]">
                {isPopularTab && PERIOD_CHIPS.map((chip) => {
                  const active = period === chip;
                  return (
                    <button
                      key={chip}
                      onClick={() => setPeriod(chip)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={
                        active
                          ? { background: "#1E4A38", color: "#fff" }
                          : { background: "#F0F0F0", color: "#999" }
                      }
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Post list ─────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              {sorted.length === 0 ? (
                <div className="text-center py-20 text-[#ccc] text-sm">
                  검색 결과가 없습니다.
                </div>
              ) : (
                sorted.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpen={() => navigate(`/community/${post.id}`)}
                  />
                ))
              )}
            </div>

            {/* Load more */}
            <div className="mt-8 text-center">
              <button
                className="text-sm font-semibold border rounded-xl px-8 py-3 bg-white transition-all hover:shadow-sm"
                style={{ color: "#2E7D6B", borderColor: "#D5EAE4" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#EFF6F2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                게시글 더 보기
              </button>
            </div>
          </section>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
