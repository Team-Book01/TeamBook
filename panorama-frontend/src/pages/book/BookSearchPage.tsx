import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, BookOpen, ChevronRight } from "lucide-react";

import type { BookItem, BookSort, MyBookmarkItem, MyReviewItem } from "@/types/book";
import {
  hasIsbn,
  useBookSearch,
  useBookmarkMutation,
  useMyBookmarks,
  useMyBookmarkCount,
  useMyReviews,
  useMyReviewCount,
} from "@/api/book";
import { getErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { BookCard, ProfileCard, PopularBooksCard, StarRating } from "./components";
import type { BookProfileView } from "./components/sidebar";

// 정렬 옵션(UI) → 백엔드 sort 파라미터 + 클라이언트 정렬 기준
const SORT_OPTIONS = ["정확도순", "최신순"] as const;
type SortLabel = (typeof SORT_OPTIONS)[number];

/** UI 정렬 라벨 → 백엔드 sort (백엔드는 sim/date 만 지원) */
function toBackendSort(label: SortLabel): BookSort {
  return label === "최신순" ? "date" : "sim";
}

/** yyyymmdd → yyyy.mm.dd 표기 */
function formatDate(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10).replaceAll("-", ".");
}

/** 저장한 책(MyBookmarkItem)을 BookCard 가 쓰는 BookItem 형태로 변환 (검색 목록과 동일 형태로 렌더). */
function bookmarkToBookItem(b: MyBookmarkItem): BookItem {
  return {
    isbn: b.isbn,
    title: b.bookTitle,
    author: b.author,
    publisher: "",
    pubdate: "",
    image: b.bookImage,
    link: "",
    description: "",
    avgRating: 0,
    reviewCount: 0,
    bookmarkCount: 0,
    isBookmarked: true,
  };
}

export default function BookSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sortLabel = (searchParams.get("sort") as SortLabel) ?? "정확도순";
  const sortOpen = searchParams.get("sortOpen") === "1";

  // ?view=saved|rated 면 회원 카드가 선택한 "저장한 책 / 평가한 책" 목록을 보여준다.
  const rawView = searchParams.get("view");
  const view: BookProfileView | null = rawView === "saved" || rawView === "rated" ? rawView : null;

  const user = useAuthStore((s) => s.user);
  const { ensureLoggedIn } = useRequireLogin();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBookSearch({ keyword: q, sort: toBackendSort(sortLabel) });

  // 회원 카드 카운트/목록 (로그인 시에만 조회)
  const bookmarkCountQuery = useMyBookmarkCount({ enabled: !!user });
  const reviewCountQuery = useMyReviewCount({ enabled: !!user });
  const savedQuery = useMyBookmarks({ enabled: view === "saved" && !!user });
  const ratedQuery = useMyReviews({ enabled: view === "rated" && !!user });

  const bookmark = useBookmarkMutation();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 서버 응답(페이지들)을 한 배열로 펼침
  const books = useMemo<BookItem[]>(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;

  const savedBooks = savedQuery.data?.myBookmarkItems ?? [];
  const ratedBooks = ratedQuery.data?.reviewItems ?? [];

  // ?q= 또는 view 가 바뀌면 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [q, view]);

  // 무한 스크롤: 하단 감지 시 다음 페이지 요청 (일반 검색 화면에서만)
  useEffect(() => {
    if (view || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, view]);

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
    if (!hasIsbn(book.isbn)) return;
    if (!ensureLoggedIn()) return;
    bookmark.mutate({
      isbn: book.isbn.trim(),
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      pubdate: book.pubdate,
      image: book.image,
      link: book.link,
      description: book.description,
    });
  };

  // 회원 카드 클릭: 같은 항목 재클릭이면 검색 화면으로 복귀(토글)
  const selectView = (v: BookProfileView) => {
    if (!ensureLoggedIn()) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get("view") === v) next.delete("view");
      else next.set("view", v);
      return next;
    });
  };

  const openBook = (isbn?: string) => {
    if (hasIsbn(isbn)) navigate(`/books/${isbn!.trim()}`);
  };

  const showTop = (view ? savedBooks.length + ratedBooks.length : books.length) > 6;

  const viewTitle = view === "saved" ? "저장한 책" : view === "rated" ? "평가한 책" : null;

  return (
    <main className="max-w-[1440px] mx-auto px-10 py-8">
      <div className="flex gap-7" style={{ alignItems: "flex-start" }}>
        {/* Left */}
        <div className="flex-1 min-w-0">
          {/* 헤더: 검색 결과 or 회원 활동(저장/평가) */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-[22px] font-bold text-[#1A1A1A] leading-snug">
                {viewTitle ?? (q ? <>&ldquo;{q}&rdquo; 검색 결과</> : "도서 검색")}
              </h1>
              {!view && q && (
                <p className="mt-1 text-sm">
                  총 <span className="text-[#2E7D6B] font-bold">{total.toLocaleString()}권</span>
                </p>
              )}
            </div>
            {/* 정렬 드롭다운은 검색 화면에서만 */}
            {!view && (
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
            )}
          </div>

          {/* ── 저장한 책 ── */}
          {view === "saved" && (
            <MyListState
              query={savedQuery}
              isEmpty={savedBooks.length === 0}
              emptyText="아직 저장한 책이 없습니다."
            >
              <div className="flex flex-col gap-3">
                {savedBooks.map((b) => (
                  <BookCard
                    key={b.isbn}
                    book={bookmarkToBookItem(b)}
                    onAuthorClick={handleAuthorClick}
                    onToggleBookmark={handleToggleBookmark}
                    onSelect={(isbn) => navigate(`/books/${isbn}`)}
                  />
                ))}
              </div>
            </MyListState>
          )}

          {/* ── 평가한 책 (리뷰 목록) ── */}
          {view === "rated" && (
            <MyListState
              query={ratedQuery}
              isEmpty={ratedBooks.length === 0}
              emptyText="아직 평가한 책이 없습니다."
            >
              <div className="flex flex-col gap-3">
                {ratedBooks.map((r) => (
                  <RatedBookCard key={r.reviewId} review={r} onOpen={() => openBook(r.isbn)} />
                ))}
              </div>
            </MyListState>
          )}

          {/* ── 일반 검색 화면 ── */}
          {!view && (
            <>
              {!q && (
                <p className="text-center text-[14px] text-[#aaa] py-20">검색어를 입력해 주세요.</p>
              )}
              {q && isLoading && (
                <div className="flex justify-center py-20">
                  <div className="w-6 h-6 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {q && isError && (
                <p className="text-center text-[14px] text-rose-500 py-20">
                  {getErrorMessage(error, "검색에 실패했습니다.")}
                </p>
              )}
              {q && !isLoading && !isError && books.length === 0 && (
                <p className="text-center text-[14px] text-[#aaa] py-20">검색 결과가 없습니다.</p>
              )}
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
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-[308px] flex-shrink-0 sticky top-[84px] flex flex-col gap-5">
          <ProfileCard
            nickname={user?.nickname ?? "로그인이 필요해요"}
            handle={user ? (user.loginId ? `@${user.loginId}` : (user.provider ?? "")) : ""}
            savedCount={user ? (bookmarkCountQuery.data ?? null) : null}
            ratedCount={user ? (reviewCountQuery.data ?? null) : null}
            activeView={view}
            onSelect={selectView}
          />
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

/** 저장/평가 목록 공통 상태 래퍼 (로딩/에러/빈 값) */
function MyListState({
  query,
  isEmpty,
  emptyText,
  children,
}: {
  query: { isLoading: boolean; isError: boolean; error: unknown };
  isEmpty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  if (query.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <p className="text-center text-[14px] text-rose-500 py-20">
        {getErrorMessage(query.error, "목록을 불러오지 못했습니다.")}
      </p>
    );
  }
  if (isEmpty) {
    return <p className="text-center text-[14px] text-[#aaa] py-20">{emptyText}</p>;
  }
  return <>{children}</>;
}

/** 평가한 책 카드 (리뷰 1건). 카드 전체를 클릭하면 도서 상세로 이동. */
function RatedBookCard({ review: r, onOpen }: { review: MyReviewItem; onOpen: () => void }) {
  const canOpen = hasIsbn(r.isbn);
  return (
    <div
      onClick={canOpen ? onOpen : undefined}
      className={`flex gap-4 bg-white border border-[#EAEAEA] rounded-2xl p-4 transition-shadow duration-200 items-stretch group ${
        canOpen ? "cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]" : ""
      }`}
    >
      <div className="flex-shrink-0">
        {r.bookImage ? (
          <img src={r.bookImage} alt={r.bookTitle} className="w-20 h-[110px] object-cover rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.22)]" />
        ) : (
          <div className="w-20 h-[110px] rounded-[10px] bg-[#EAEAEA] flex items-center justify-center">
            <BookOpen size={26} className="text-[#bbb]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-base font-bold text-[#1A1A1A] leading-snug mb-1 transition-colors ${canOpen ? "group-hover:text-[#2E7D6B]" : ""}`}>
              {r.bookTitle}
            </h3>
            {canOpen && <ChevronRight size={16} className="mt-1 flex-shrink-0 text-[#ccc]" />}
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating value={r.rating} readOnly size={13} />
            <span className="text-[12px] font-semibold text-[#555]">{Number(r.rating).toFixed(1)}</span>
          </div>
          {r.content && <p className="text-[13px] text-[#555] leading-relaxed line-clamp-2">{r.content}</p>}
        </div>
        <p className="text-[11px] text-[#aaa] mt-2">{formatDate(r.createdAt)}</p>
      </div>
    </div>
  );
}
