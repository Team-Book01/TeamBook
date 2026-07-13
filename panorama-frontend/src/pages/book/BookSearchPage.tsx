import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { Book } from "./data";
import { ALL_BOOKS, MORE_BOOKS } from "./data";
import { BookCard, ProfileCard, PopularBooksCard } from "./components";

export default function BookSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "한강";

  const [searchQuery, setSearchQuery] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const [books, setBooks] = useState<Book[]>(ALL_BOOKS);
  const [sortOrder, setSortOrder] = useState("정확도순");
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadLocked, setLoadLocked] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 헤더에서 넘어온 ?q= 값이 바뀌면 렌더 중 검색 결과를 다시 세팅한다. (React 권장 패턴)
  if (q !== prevQ) {
    setPrevQ(q);
    setSearchQuery(q);
    setBooks(ALL_BOOKS);
    setHasMore(true);
    setLoadLocked(false);
  }

  // ?q= 가 바뀌면 맨 위로 스크롤한다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [q]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!hasMore || loadLocked) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoadLocked(true);
        setLoading(true);
        setTimeout(() => {
          setBooks(prev => [...prev, ...MORE_BOOKS]);
          setHasMore(false);
          setLoading(false);
        }, 1300);
      }
    }, { threshold: 0.1 });
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadLocked]);

  const handleAuthorClick = (author: string) => {
    const filtered = [...ALL_BOOKS, ...MORE_BOOKS].filter(b => b.author === author);
    setBooks(filtered.length > 0 ? filtered : ALL_BOOKS);
    setHasMore(false);
    setLoadLocked(true);
    setSearchQuery(author);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleBookmark = (id: number) => {
    setBooks(books.map(b => b.id === id ? { ...b, bookmarked: !b.bookmarked } : b));
  };

  const handleSelect = (book: Book) => {
    navigate(`/books/${book.id}`);
  };

  return (
    <main className="max-w-[1440px] mx-auto px-10 py-8">
      <div className="flex gap-7" style={{ alignItems: "flex-start" }}>
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-snug">&ldquo;{searchQuery}&rdquo; 검색 결과</h1>
              <p className="mt-1 text-sm">총 <span className="text-[#2E7D6B] font-bold">{books.length}권</span></p>
            </div>
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 border border-[#EAEAEA] rounded-full px-4 py-1.5 text-[13px] text-[#555] bg-white hover:bg-[#F9F9F9] transition-colors">
                {sortOrder}
                <ChevronDown size={13} className={`text-[#aaa] transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-9 bg-white border border-[#EAEAEA] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-20 min-w-[108px]">
                  {["정확도순", "최신순", "인기순", "별점순"].map(opt => (
                    <button key={opt} onClick={() => { setSortOrder(opt); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F9F9F9] transition-colors ${sortOrder === opt ? "text-[#2E7D6B] font-bold" : "text-[#555]"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {books.map(book => (
              <BookCard key={book.id} book={book} onAuthorClick={handleAuthorClick} onToggleBookmark={toggleBookmark} onSelect={handleSelect} />
            ))}
          </div>

          {hasMore && <div ref={bottomRef} className="h-6" />}
          {loading && <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" /></div>}
          {!hasMore && !loading && <p className="text-center text-[13px] text-[#aaa] py-8">모든 검색 결과를 불러왔습니다.</p>}
        </div>

        {/* Sidebar */}
        <aside className="w-[308px] flex-shrink-0 sticky top-[84px] flex flex-col gap-5">
          <ProfileCard />
          <PopularBooksCard onSelect={handleSelect} />
        </aside>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-[#1E4A38] text-white rounded-full shadow-[0_4px_16px_rgba(30,74,56,0.35)] flex flex-col items-center justify-center gap-0.5 hover:bg-[#2E7D6B] transition-all duration-300 z-50 ${showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        aria-label="맨 위로"
      >
        <ChevronUp size={15} strokeWidth={2.5} />
        <span className="text-[9px] font-black tracking-wider leading-none">TOP</span>
      </button>
    </main>
  );
}
