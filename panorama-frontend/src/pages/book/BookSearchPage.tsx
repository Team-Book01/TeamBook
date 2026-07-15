import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { BookItem, BookSort } from "@/types/book";
import { useBookSearch, useBookmarkMutation } from "@/api/book";
import { getErrorMessage } from "@/api/client";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { BookCard, ProfileCard, PopularBooksCard } from "./components";

// 정렬 옵션(UI) → 백엔드 sort 파라미터 + 클라이언트 정렬 기준
const SORT_OPTIONS = ["정확도순", "최신순"] as const;
type SortLabel = (typeof SORT_OPTIONS)[number];

/** UI 정렬 라벨 → 백엔드 sort (백엔드는 sim/date 만 지원) */
function toBackendSort(label: SortLabel): BookSort {
  return label === "최신순" ? "date" : "sim";
}

export default function BookSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sortLabel = (searchParams.get("sort") as SortLabel) ?? "정확도순";
  const sortOpen = searchParams.get("sortOpen") === "1";

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBookSearch({ keyword: q, sort: toBackendSort(sortLabel) });

  const bookmark = useBookmarkMutation();
  const { ensureLoggedIn } = useRequireLogin();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 서버 응답(페이지들)을 한 배열로 펼치고, 인기순/별점순은 클라이언트에서 정렬
  const books = useMemo<BookItem[]>(() => {
    const items = data?.pages.flatMap((p) => p.items) ?? [];
    // if (sortLabel === "인기순") {
    //   return [...items].sort((a, b) => b.bookmarkCount - a.bookmarkCount);
    // }
    // if (sortLabel === "별점순") {
    //   return [...items].sort((a, b) => b.avgRating - a.avgRating);
    // }
    return items;
  }, [data, sortLabel]);

  const total = data?.pages[0]?.total ?? 0;

  // ?q= 가 바뀌면 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [q]);

  // 무한 스크롤: 하단 감지 시 다음 페이지 요청
  useEffect(() => {
    if (!hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const setParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null) next.delete(key);
      else next.set(key, value);
      return next;
    });
  };

  const setSortOpen = (open: boolean) => setParam("sortOpen", open ? "1" : null);

  const handleAuthorClick = (author: string) => {
    setSearchParams({ q: author, sort: sortLabel });
  };

  const handleToggleBookmark = (book: BookItem) => {
    if (!book.isbn) return;
    // 프론트 토큰 검증: 없으면 로그인으로, 있으면 요청 발사 → 백엔드 토글
    if (!ensureLoggedIn()) return;
    bookmark.mutate({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      pubdate: book.pubdate,
      image: book.image,
      link: book.link,
      description: book.description,
    });
  };

  const showTop = books.length > 6;

  return (
    <main className="max-w-[1440px] mx-auto px-10 py-8">
      <div className="flex gap-7" style={{ alignItems: "flex-start" }}>
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-snug">
                {q ? <>&ldquo;{q}&rdquo; 검색 결과</> : "도서 검색"}
              </h1>
              {q && (
                <p className="mt-1 text-sm">
                  총 <span className="text-[#2E7D6B] font-bold">{total.toLocaleString()}권</span>
                </p>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 border border-[#EAEAEA] rounded-full px-4 py-1.5 text-[13px] text-[#555] bg-white hover:bg-[#F9F9F9] transition-colors"
              >
                {sortLabel}
                <ChevronDown size={13} className={`text-[#aaa] transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-9 bg-white border border-[#EAEAEA] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-20 min-w-[108px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.set("sort", opt);
                          next.delete("sortOpen");
                          return next;
                        });
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F9F9F9] transition-colors ${sortLabel === opt ? "text-[#2E7D6B] font-bold" : "text-[#555]"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 검색어 없음 */}
          {!q && (
            <p className="text-center text-[14px] text-[#aaa] py-20">검색어를 입력해 주세요.</p>
          )}

          {/* 최초 로딩 */}
          {q && isLoading && (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 에러 */}
          {q && isError && (
            <p className="text-center text-[14px] text-rose-500 py-20">
              {getErrorMessage(error, "검색에 실패했습니다.")}
            </p>
          )}

          {/* 결과 없음 */}
          {q && !isLoading && !isError && books.length === 0 && (
            <p className="text-center text-[14px] text-[#aaa] py-20">검색 결과가 없습니다.</p>
          )}

          {/* 결과 목록 */}
          {books.length > 0 && (
            <div className="flex flex-col gap-3">
              {books.map((book, idx) => (
                <BookCard
                  key={`${book.isbn}-${idx}`}
                  book={book}
                  onAuthorClick={handleAuthorClick}
                  onToggleBookmark={handleToggleBookmark}
                  onSelect={(isbn) => navigate(`/books/${isbn}`)}
                />
              ))}
            </div>
          )}

          {hasNextPage && <div ref={bottomRef} className="h-6" />}
          {isFetchingNextPage && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {q && !isLoading && !isError && books.length > 0 && !hasNextPage && (
            <p className="text-center text-[13px] text-[#aaa] py-8">모든 검색 결과를 불러왔습니다.</p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-[308px] flex-shrink-0 sticky top-[84px] flex flex-col gap-5">
          <ProfileCard />
          <PopularBooksCard onSelect={(b) => navigate(`/books/${b.id}`)} />
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
