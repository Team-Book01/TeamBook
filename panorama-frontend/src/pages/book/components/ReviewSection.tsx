import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

import { useBookReviews } from "@/api/book";
import { getErrorMessage } from "@/api/client";
import { StarRating } from "./primitives";

const PER_PAGE = 10;

/** ISO-8601(2026-07-01T12:00:00) → 2026.07.01 */
function formatDate(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10).replaceAll("-", ".");
}

/** 닉네임 첫 글자(아바타용) */
function initial(nickname: string): string {
  return nickname?.trim()?.[0] ?? "?";
}

/**
 * 평점 & 리뷰 섹션.
 * - 상단 요약(평균 별점 / 참여 수): 도서 상세에서 받은 avgRating·reviewCount 재사용(props).
 * - 별점 분포: 리뷰 API 의 ratingDistribution(0.5 단위 10버킷) → 정수 5행으로 합산.
 * - 전체 리뷰 수 / 리뷰 목록: 리뷰 API(reviewItems, total) 연동 + 페이지네이션.
 * - "내 평가"(작성): 아직 미구현 → 별점 UI 만 두고 등록은 준비 중 안내.
 */
export function ReviewSection({
  isbn,
  avgRating = 0,
  reviewCount = 0,
}: {
  isbn: string;
  avgRating?: number;
  reviewCount?: number;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useBookReviews(isbn, page, PER_PAGE);

  const reviews = data?.reviewItems ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const dist = data?.ratingDistribution ?? {};

  // 별점 분포: 0.5 단위 10버킷(0.5 ~ 5.0)을 세로 막대로. 높이는 최댓값 대비 비율(왓챠피디아 스타일).
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const rating = (i + 1) * 0.5; // 0.5, 1.0, ... 5.0
    const key = rating.toFixed(1);
    return { rating, key, count: dist[key] ?? 0 };
  });
  const maxCount = Math.max(0, ...buckets.map((b) => b.count));

  // "내 평가" — 작성 기능은 준비 중(별점만 눌러볼 수 있게 UI 유지)
  const [myRating, setMyRating] = useState(0);

  return (
    <section className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#EAEAEA]">
        <Star size={16} className="text-[#F5B301]" fill="#F5B301" />
        <h2 className="text-[15px] font-bold text-[#1A1A1A]">평점 & 리뷰</h2>
      </div>
      <div className="p-6">
        {/* Summary — 평균/참여수는 도서 상세 정보 재사용, 분포는 리뷰 API */}
        <div className="flex gap-8 mb-8 pb-8 border-b border-[#F5F5F5]">
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
            <p className="text-5xl font-black text-[#1E4A38]">
              {avgRating > 0 ? avgRating.toFixed(1) : "–"}
            </p>
            <StarRating value={Math.round(avgRating)} readOnly size={16} />
            <p className="text-[12px] text-[#aaa] mt-0.5">{reviewCount.toLocaleString()}명 참여</p>
          </div>
          {/* 세로 막대 분포: 0.5 단위 10개 막대, x축 1~5 (왓챠피디아 스타일) */}
          <div className="flex-1 flex flex-col justify-end min-w-0">
            <div className="flex items-end gap-1.5 h-24">
              {buckets.map(({ rating, key, count }) => {
                const h = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const isPeak = count > 0 && count === maxCount;
                return (
                  <div
                    key={key}
                    className="flex-1 h-full flex flex-col justify-end"
                    title={`${rating.toFixed(1)}점 · ${count.toLocaleString()}명`}
                  >
                    <div
                      className="w-full rounded-t-[3px] transition-all"
                      style={{
                        height: `${h}%`,
                        minHeight: count > 0 ? 3 : 0,
                        background: isPeak ? "#F5B301" : "#FBE4A0",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* x축 라벨: 정수 별점(1~5) 막대 아래에만 표시 */}
            <div className="flex gap-1.5 mt-1.5 pt-1.5 border-t border-[#F0F0F0]">
              {buckets.map(({ rating, key }) => (
                <span key={key} className="flex-1 text-center text-[11px] text-[#aaa]">
                  {Number.isInteger(rating) ? rating : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Write review — 준비 중 */}
        <div className="mb-8 pb-8 border-b border-[#F5F5F5]">
          <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">내 평가</p>
          <StarRating value={myRating} onChange={setMyRating} size={32} />
          {myRating > 0 && (
            <p className="mt-3 text-[12px] text-[#aaa]">리뷰 작성 기능은 준비 중입니다.</p>
          )}
        </div>

        {/* Review list */}
        <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">
          전체 리뷰 <span className="text-[#2E7D6B]">{total.toLocaleString()}</span>
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#2E7D6B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-center text-[13px] text-rose-500 py-12">
            {getErrorMessage(error, "리뷰를 불러오지 못했습니다.")}
          </p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-[13px] text-[#aaa] py-12">아직 등록된 리뷰가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {reviews.map((r) => (
              <div key={r.reviewId} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EFF6F2] flex items-center justify-center text-[#2E7D6B] text-xs font-bold flex-shrink-0">
                  {initial(r.nickname)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-[#1A1A1A]">{r.nickname}</span>
                    {r.isMine && (
                      <span className="text-[10px] text-[#2E7D6B] bg-[#EFF6F2] rounded px-1.5 py-0.5 font-medium">
                        내 리뷰
                      </span>
                    )}
                    <StarRating value={Math.round(r.rating)} readOnly size={11} />
                    <span className="text-[11px] text-[#aaa]">{formatDate(r.createdAt)}</span>
                    {/* 내 리뷰 수정/삭제 (기능은 준비 중 — 클릭 동작 없음) */}
                    {r.isMine && (
                      <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                        <button
                          type="button"
                          title="수정"
                          className="p-1 rounded-md text-[#bbb] hover:text-[#2E7D6B] hover:bg-[#F5F5F5] transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          title="삭제"
                          className="p-1 rounded-md text-[#bbb] hover:text-rose-400 hover:bg-[#FFF0F0] transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] text-[#555] leading-relaxed">{r.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-5 border-t border-[#F5F5F5]">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] disabled:opacity-30 hover:bg-[#F9F9F9] transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${n === page ? "bg-[#1E4A38] text-white" : "border border-[#EAEAEA] text-[#555] hover:bg-[#F9F9F9]"}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] disabled:opacity-30 hover:bg-[#F9F9F9] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
