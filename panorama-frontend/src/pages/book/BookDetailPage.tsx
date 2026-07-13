import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ChevronLeft, ChevronUp, FileText } from "lucide-react";

import type { Book } from "./data";
import { ALL_BOOKS, MORE_BOOKS, BOOK_DESCRIPTIONS, DEFAULT_DESCRIPTION, BOOK_EXTRA } from "./data";
import { BookCoverLarge, PurchaseBtn, LibraryFinder, ReviewSection } from "./components";

export default function BookDetailPage() {
  const { isbn } = useParams();
  const navigate = useNavigate();

  const found = [...ALL_BOOKS, ...MORE_BOOKS].find(b => String(b.id) === isbn) ?? ALL_BOOKS[0];
  const [book, setBook] = useState<Book>(found);
  const [prevIsbn, setPrevIsbn] = useState(isbn);
  const [showTop, setShowTop] = useState(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  // URL(:isbn) 이 바뀌면 렌더 중 상태를 교체한다. (React 권장 패턴)
  if (isbn !== prevIsbn) {
    setPrevIsbn(isbn);
    setBook(found);
  }

  // URL(:isbn) 이 바뀌면 맨 위로 스크롤한다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isbn]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const extra = BOOK_EXTRA[book.id] ?? { isbn: "978-89-000-0000-0", pages: 256, category: "한국소설", postCount: 87 };
  const description = BOOK_DESCRIPTIONS[book.id] ?? DEFAULT_DESCRIPTION;

  const toggleBookmark = () => {
    setBook(prev => ({ ...prev, bookmarked: !prev.bookmarked }));
  };

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const avgRating = book.rating ?? 4.2;
  const reviewCount = book.reviewCount ?? 128;

  return (
    <main className="max-w-[1440px] mx-auto px-10 py-8">
      {/* Back */}
      <button onClick={() => navigate("/books")} className="flex items-center gap-1.5 text-[13px] text-[#777] hover:text-[#2E7D6B] transition-colors mb-6 group">
        <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        검색 결과로 돌아가기
      </button>

      {/* ── Hero ── */}
      <section className="bg-white border border-[#EAEAEA] rounded-2xl p-6 mb-4">
        <div className="flex gap-6">
          {/* Large cover */}
          <div className="flex-shrink-0">
            <BookCoverLarge color={book.coverColor} accent={book.coverAccent} title={book.title} size="lg" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <h1 className="text-[22px] font-black text-[#1A1A1A] leading-tight">{book.title}</h1>

            <table className="text-[13px] w-full max-w-sm">
              <tbody className="divide-y divide-[#F8F8F8]">
                {[
                  ["저자", book.author],
                  ["출판사", book.publisher],
                  ["출판일", book.publishDate],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-1.5 pr-6 text-[#aaa] font-medium w-16 flex-shrink-0">{label}</td>
                    <td className="py-1.5 text-[#1A1A1A]">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Rating row — clickable → scroll */}
            <button
              onClick={scrollToReview}
              className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity self-start"
            >
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={15}
                    fill={n <= Math.round(avgRating) ? "#F5B301" : "#E5E5E5"}
                    stroke={n <= Math.round(avgRating) ? "#F5B301" : "#E5E5E5"} />
                ))}
              </div>
              <span className="text-[14px] font-bold text-[#1A1A1A]">{avgRating.toFixed(1)}</span>
              <span className="text-[12px] text-[#aaa]">({reviewCount.toLocaleString()})</span>
              <span className="text-[11px] text-[#2E7D6B] underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity">리뷰 보기</span>
            </button>

            {/* Book description inside hero */}
            <p className="text-[13px] text-[#555] leading-[1.85] line-clamp-4 border-t border-[#F5F5F5] pt-3">{description}</p>

            {/* Actions row */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <PurchaseBtn price={book.price} />

              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[13px] font-medium transition-all ${
                  book.bookmarked
                    ? "bg-[#FFF0F2] border-rose-300 text-rose-500"
                    : "border-[#EAEAEA] text-[#555] hover:bg-[#FFF0F2] hover:border-rose-200 hover:text-rose-400"
                }`}
              >
                <Heart size={15} className={`transition-colors ${book.bookmarked ? "fill-rose-500 stroke-rose-500" : "fill-transparent"}`} />
                {book.bookmarked ? "저장됨" : "저장"}
                <span className="text-[12px] opacity-60">({(book.likes + (book.bookmarked ? 1 : 0)).toLocaleString()})</span>
              </button>

              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAEAEA] text-[13px] font-medium text-[#555] hover:bg-[#EFF6F2] hover:border-[#2E7D6B] hover:text-[#2E7D6B] transition-all">
                <FileText size={15} />
                게시글
                <span className="text-[12px] opacity-60">({extra.postCount.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Library finder ── */}
      <LibraryFinder />

      {/* ── Reviews ── */}
      <div ref={reviewRef}>
        <ReviewSection book={book} />
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
