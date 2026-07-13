import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

import type { Book, Review } from "../data";
import { SAMPLE_REVIEWS } from "../data";
import { StarRating } from "./primitives";

export function ReviewSection({ book }: { book: Book }) {
  const avgRating = book.rating ?? 4.2;
  const totalCount = book.reviewCount ?? 128;

  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const handleSubmit = () => {
    if (!myRating) return;
    const newReview: Review = {
      id: Date.now(),
      author: "달빛독서가",
      avatar: "달",
      rating: myRating,
      text: myReview,
      date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(".", ""),
      likes: 0,
    };
    setReviews(prev => [newReview, ...prev]);
    setSubmitted(true);
    setMyRating(0);
    setMyReview("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const paged = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const dist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: Math.round((reviews.filter(r => r.rating === s).length / reviews.length) * 100),
  }));

  return (
    <section className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#EAEAEA]">
        <Star size={16} className="text-[#F5B301]" fill="#F5B301" />
        <h2 className="text-[15px] font-bold text-[#1A1A1A]">평점 & 리뷰</h2>
      </div>
      <div className="p-6">
        {/* Summary */}
        <div className="flex gap-8 mb-8 pb-8 border-b border-[#F5F5F5]">
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
            <p className="text-5xl font-black text-[#1E4A38]">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} readOnly size={16} />
            <p className="text-[12px] text-[#aaa] mt-0.5">{totalCount.toLocaleString()}명 참여</p>
          </div>
          <div className="flex-1 flex flex-col gap-1.5 justify-center">
            {dist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] text-[#777] w-4 text-right flex-shrink-0">{star}</span>
                <Star size={10} fill="#F5B301" stroke="#F5B301" className="flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F5B301] rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-[#aaa] w-5 flex-shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write review */}
        <div className="mb-8 pb-8 border-b border-[#F5F5F5]">
          <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">내 평가</p>
          <StarRating value={myRating} onChange={setMyRating} size={32} />
          {myRating > 0 && (
            <div className="mt-4">
              <textarea
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                placeholder="이 책에 대한 리뷰를 남겨주세요…"
                rows={4}
                className="w-full border border-[#EAEAEA] rounded-xl px-4 py-3 text-[13px] text-[#1A1A1A] resize-none focus:outline-none focus:border-[#2E7D6B] focus:shadow-[0_0_0_3px_rgba(46,125,107,0.08)] transition-all placeholder:text-[#ccc]"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-[#aaa]">{myReview.length} / 500</span>
                <button
                  onClick={handleSubmit}
                  className="bg-[#1E4A38] hover:bg-[#2E7D6B] text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-colors"
                >
                  등록
                </button>
              </div>
            </div>
          )}
          {submitted && (
            <p className="mt-2 text-[12px] text-[#2E7D6B] font-medium">리뷰가 등록되었습니다!</p>
          )}
        </div>

        {/* Review list */}
        <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">
          전체 리뷰 <span className="text-[#2E7D6B]">{reviews.length}</span>
        </p>
        <div className="flex flex-col gap-5">
          {paged.map((r) => (
            <div key={r.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EFF6F2] flex items-center justify-center text-[#2E7D6B] text-xs font-bold flex-shrink-0">{r.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">{r.author}</span>
                  <StarRating value={r.rating} readOnly size={11} />
                  <span className="text-[11px] text-[#aaa]">{r.date}</span>
                </div>
                <p className="text-[13px] text-[#555] leading-relaxed">{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-5 border-t border-[#F5F5F5]">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] disabled:opacity-30 hover:bg-[#F9F9F9] transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${n === page ? "bg-[#1E4A38] text-white" : "border border-[#EAEAEA] text-[#555] hover:bg-[#F9F9F9]"}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EAEAEA] disabled:opacity-30 hover:bg-[#F9F9F9] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
