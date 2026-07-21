import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

import {
  useBookReviews,
  useCreateReview,
  useDeleteReview,
  useMyReview,
  useUpdateReview,
} from "@/api/book";
import { getErrorMessage } from "@/api/client";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { StarRating } from "./primitives";

const PER_PAGE = 10;
const MAX_CONTENT = 500;

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
 * - 별점 분포: 리뷰 API 의 ratingDistribution(0.5 단위 10버킷).
 * - 목록/작성/수정/삭제 모두 백엔드 ReviewController 연동.
 *   · GET    /api/v1/reviews/{isbn}?page&size
 *   · POST   /api/v1/reviews/{isbn}
 *   · PUT    /api/v1/reviews/{reviewId}
 *   · DELETE /api/v1/reviews/{reviewId}
 * - 작성/수정/삭제는 로그인 필요 → useRequireLogin 으로 먼저 걸러낸다.
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

  // 내가 이 책에 남긴 리뷰(단건). 있으면 작성 폼 대신 "내 리뷰" 카드를 보여준다.
  const { data: myReview } = useMyReview(isbn);

  const { ensureLoggedIn } = useRequireLogin();
  const createReview = useCreateReview(isbn);
  const updateReview = useUpdateReview(isbn);
  const deleteReview = useDeleteReview(isbn);

  // 목록은 서버가 준 순서 그대로. (내 리뷰를 맨 위로 올리는 처리는 제거)
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

  // ── 작성 폼 ──
  const [myRating, setMyRating] = useState(0);
  const [myContent, setMyContent] = useState("");

  // ── 내 리뷰 카드 수정 폼 (수정/삭제는 이 카드에서만 처리) ──
  const [cardEditing, setCardEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editContent, setEditContent] = useState("");

  const pending = createReview.isPending || updateReview.isPending || deleteReview.isPending;
  const mutationError =
    createReview.error ?? updateReview.error ?? deleteReview.error ?? null;

  const handleCreate = () => {
    if (!ensureLoggedIn()) return;
    if (myRating <= 0) return;
    createReview.mutate(
      { rating: myRating, content: myContent.trim() || undefined },
      {
        onSuccess: () => {
          setMyRating(0);
          setMyContent("");
          setPage(1);
        },
      },
    );
  };

  // 내 리뷰 카드: 수정 시작 / 저장 / 삭제 (단건 조회의 reviewId 사용)
  const startCardEdit = () => {
    if (!myReview) return;
    setEditRating(Number(myReview.rating));
    setEditContent(myReview.content ?? "");
    setCardEditing(true);
  };

  const handleCardUpdate = () => {
    if (!myReview || editRating <= 0) return;
    updateReview.mutate(
      { reviewId: myReview.reviewId, body: { rating: editRating, content: editContent.trim() || undefined } },
      { onSuccess: () => setCardEditing(false) },
    );
  };

  const handleCardDelete = () => {
    if (!myReview) return;
    if (!window.confirm("이 리뷰를 삭제할까요?")) return;
    deleteReview.mutate(myReview.reviewId, { onSuccess: () => setCardEditing(false) });
  };

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
            <StarRating value={Math.round(avgRating * 2) / 2} readOnly size={16} />
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

        {/* 내 리뷰 영역: 이미 남긴 리뷰가 있으면 별점 채워진 카드(수정/삭제는 여기서만), 없으면 작성 폼. */}
        <div className="mb-8 pb-8 border-b border-[#F5F5F5]">
          {myReview && cardEditing ? (
            // ── 내 리뷰 수정 폼 ──
            <>
              <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">내 리뷰 수정</p>
              <StarRating value={editRating} onChange={setEditRating} size={32} />
              <div className="mt-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value.slice(0, MAX_CONTENT))}
                  rows={3}
                  placeholder="이 책에 대한 생각을 남겨주세요. (선택, 최대 500자)"
                  className="w-full resize-none rounded-xl border border-[#EAEAEA] px-4 py-3 text-[13px] text-[#1A1A1A] focus:border-[#2E7D6B] focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#aaa]">
                    {editContent.length} / {MAX_CONTENT}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCardEditing(false)}
                      className="rounded-lg border border-[#EAEAEA] px-3 py-1.5 text-[12px] text-[#555] hover:bg-[#F9F9F9] transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleCardUpdate}
                      disabled={pending || editRating <= 0}
                      className="rounded-lg bg-[#1E4A38] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2E7D6B] disabled:opacity-60 transition-colors"
                    >
                      {updateReview.isPending ? "저장 중…" : "저장"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : myReview ? (
            // ── 내 리뷰 카드 (별점 채워진 상태 + 수정/삭제) ──
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#1A1A1A]">내 리뷰</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={startCardEdit}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-[#777] hover:text-[#2E7D6B] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Pencil size={13} /> 수정
                  </button>
                  <button
                    type="button"
                    onClick={handleCardDelete}
                    disabled={pending}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-[#777] hover:text-rose-500 hover:bg-[#FFF0F0] disabled:opacity-40 transition-colors"
                  >
                    <Trash2 size={13} /> 삭제
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFBFB] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <StarRating value={Number(myReview.rating)} readOnly size={18} />
                  <span className="text-[13px] font-bold text-[#1E4A38]">
                    {Number(myReview.rating).toFixed(1)}
                  </span>
                  <span className="text-[11px] text-[#aaa]">{formatDate(myReview.createdAt)}</span>
                </div>
                {myReview.content ? (
                  <p className="text-[13px] text-[#555] leading-relaxed whitespace-pre-wrap">
                    {myReview.content}
                  </p>
                ) : (
                  <p className="text-[13px] text-[#bbb]">남긴 코멘트가 없습니다.</p>
                )}
              </div>
            </>
          ) : (
            // ── 작성 폼 (내 리뷰 없음) ──
            <>
              <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">내 평가</p>
              <StarRating value={myRating} onChange={setMyRating} size={32} />
              {myRating > 0 && (
                <div className="mt-4">
                  <textarea
                    value={myContent}
                    onChange={(e) => setMyContent(e.target.value.slice(0, MAX_CONTENT))}
                    rows={3}
                    placeholder="이 책에 대한 생각을 남겨주세요. (선택, 최대 500자)"
                    className="w-full resize-none rounded-xl border border-[#EAEAEA] px-4 py-3 text-[13px] text-[#1A1A1A] focus:border-[#2E7D6B] focus:outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#aaa]">
                      {myContent.length} / {MAX_CONTENT}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMyRating(0);
                          setMyContent("");
                        }}
                        className="rounded-lg border border-[#EAEAEA] px-3 py-1.5 text-[12px] text-[#555] hover:bg-[#F9F9F9] transition-colors"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={handleCreate}
                        disabled={pending}
                        className="rounded-lg bg-[#1E4A38] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2E7D6B] disabled:opacity-60 transition-colors"
                      >
                        {createReview.isPending ? "등록 중…" : "등록"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {mutationError && (
            <p className="mt-3 text-[12px] text-rose-500">
              {getErrorMessage(mutationError, "리뷰 처리 중 오류가 발생했습니다.")}
            </p>
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
                    <StarRating value={r.rating} readOnly size={11} />
                    <span className="text-[11px] text-[#aaa]">{formatDate(r.createdAt)}</span>
                  </div>

                  {/* 목록은 읽기 전용. 내 리뷰 수정/삭제는 상단 "내 리뷰" 카드에서만 처리한다. */}
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
