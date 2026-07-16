import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ChevronLeft, ChevronUp, BookOpen } from "lucide-react";

import { useBook, useBookmarkMutation } from "@/api/book";
import { getErrorMessage } from "@/api/client";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { LibraryFinder, ReviewSection } from "./components";

/** yyyymmdd → yyyy.mm.dd (형식이 아니면 원본 그대로) */
function formatPubdate(pubdate: string): string {
  if (!pubdate || pubdate.length < 8) return pubdate ?? "";
  return `${pubdate.slice(0, 4)}.${pubdate.slice(4, 6)}.${pubdate.slice(6, 8)}`;
}

/** 네이버 판매가(숫자 문자열) → "12,600원" (없으면 null) */
function formatPrice(discount?: string): string | null {
  if (!discount) return null;
  const n = Number(discount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toLocaleString()}원`;
}

export default function BookDetailPage() {
  const { isbn = "" } = useParams();
  const navigate = useNavigate();

  const { data: book, isLoading, isError, error, isFetching } = useBook(isbn);
  const bookmark = useBookmarkMutation();
  const { ensureLoggedIn } = useRequireLogin();

  const [showTop, setShowTop] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [prevIsbn, setPrevIsbn] = useState(isbn);
  const reviewRef = useRef<HTMLDivElement>(null);

  // URL(:isbn) 이 바뀌면 렌더 중 이미지 에러 상태를 초기화한다. (React 권장 패턴)
  if (isbn !== prevIsbn) {
    setPrevIsbn(isbn);
    setImgError(false);
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

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleToggleBookmark = () => {
    if (!book) return;
    // 프론트 토큰 검증: 없으면 로그인으로, 있으면 요청 발사 → 백엔드 토글
    if (!ensureLoggedIn()) return;
    bookmark.mutate({
      isbn: book.isbn || isbn, // 응답 isbn 이 비어도 URL 파라미터로 보정
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      pubdate: book.pubdate,
      image: book.image,
      link: book.link,
      description: book.description,
    });
  };

  // const BackButton = (
  //   <button
  //     onClick={() => navigate("/books")}
  //     className="flex items-center gap-1.5 text-[13px] text-[#777] hover:text-[#2E7D6B] transition-colors mb-6 group"
  //   >
  //     <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
  //     검색 결과로 돌아가기
  //   </button>
  // );

  // ── 로딩 (캐시 미스: 새로고침/URL 직접 접근/공유 링크) ──
  if (isLoading) {
    return (
      <main className="max-w-[1440px] mx-auto px-10 py-8">
        {/* {BackButton} */}
        <div className="flex justify-center py-40">
          <div className="w-7 h-7 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  // ── 에러 ──
  if (isError || !book) {
    return (
      <main className="max-w-[1440px] mx-auto px-10 py-8">
        {/* {BackButton} */}
        <p className="text-center text-[14px] text-rose-500 py-40">
          {getErrorMessage(error, "도서 정보를 불러오지 못했습니다.")}
        </p>
      </main>
    );
  }

  const price = formatPrice(book.discount);
  const bookmarking = bookmark.isPending;

  return (
    <main className="max-w-[1440px] mx-auto px-10 py-8">
      {/* {BackButton} */}

      {/* ── Hero ── */}
      <section className="bg-white border border-[#EAEAEA] rounded-2xl p-6 mb-4">
        <div className="flex gap-6">
          {/* Cover */}
          <div className="flex-shrink-0">
            {book.image && !imgError ? (
              <img
                src={book.image}
                alt={book.title}
                onError={() => setImgError(true)}
                className="w-[180px] h-[252px] object-cover rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.22)]"
              />
            ) : (
              <div className="w-[180px] h-[252px] rounded-[10px] bg-[#EAEAEA] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <BookOpen size={44} className="text-[#bbb]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <h1 className="text-[22px] font-black text-[#1A1A1A] leading-tight">{book.title}</h1>

            <table className="text-[13px] w-full max-w-sm">
              <tbody className="divide-y divide-[#F8F8F8]">
                {[
                  ["저자", book.author],
                  ["출판사", book.publisher],
                  ["출판일", formatPubdate(book.pubdate)],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-1.5 pr-6 text-[#aaa] font-medium w-16 flex-shrink-0">{label}</td>
                    <td className="py-1.5 text-[#1A1A1A]">{value || "–"}</td>
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
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={15}
                    fill={n <= Math.round(book.avgRating) ? "#F5B301" : "#E5E5E5"}
                    stroke={n <= Math.round(book.avgRating) ? "#F5B301" : "#E5E5E5"}
                  />
                ))}
              </div>
              <span className="text-[14px] font-bold text-[#1A1A1A]">
                {book.avgRating > 0 ? book.avgRating.toFixed(1) : "–"}
              </span>
              <span className="text-[12px] text-[#aaa]">({book.reviewCount.toLocaleString()})</span>
              <span className="text-[11px] text-[#2E7D6B] underline underline-offset-2 opacity-0 group-hover:opacity-100 transition-opacity">
                리뷰 보기
              </span>
            </button>

            {/* Book description */}
            <p className="text-[13px] text-[#555] leading-[1.85] border-t border-[#F5F5F5] pt-3 whitespace-pre-line">
              {book.description || "등록된 책 소개가 없습니다."}
            </p>

            {/* Actions row */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              {book.link && (
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all bg-[#F0FAF4] text-[#03C75A] border border-[#D0EFD8] hover:bg-[#03C75A] hover:text-white hover:shadow-sm"
                >
                  <span className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-black bg-[#03C75A] text-white">
                    N
                  </span>
                  구매
                  {price && <span className="font-semibold">{price}</span>}
                </a>
              )}

              <button
                onClick={handleToggleBookmark}
                disabled={bookmarking}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[13px] font-medium transition-all disabled:opacity-60 ${
                  book.isBookmarked
                    ? "bg-[#FFF0F2] border-rose-300 text-rose-500"
                    : "border-[#EAEAEA] text-[#555] hover:bg-[#FFF0F2] hover:border-rose-200 hover:text-rose-400"
                }`}
              >
                <Heart
                  size={15}
                  className={`transition-colors ${book.isBookmarked ? "fill-rose-500 stroke-rose-500" : "fill-transparent"}`}
                />
                {book.isBookmarked ? "저장됨" : "저장"}
                <span className="text-[12px] opacity-60">({book.bookmarkCount.toLocaleString()})</span>
              </button>

              {/* 백그라운드 갱신 표시 (initialData 재사용 후 최신화 중) */}
              {isFetching && (
                <span className="flex items-center gap-1.5 text-[12px] text-[#aaa]">
                  <span className="w-3 h-3 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
                  최신 정보 확인 중
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Library finder (준비 중 — 목업) ── */}
      <LibraryFinder />

      {/* ── Reviews (요약만 실데이터, 목록은 준비 중 — 목업) ── */}
      <div ref={reviewRef}>
        <ReviewSection isbn={isbn} avgRating={book.avgRating} reviewCount={book.reviewCount} />
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
