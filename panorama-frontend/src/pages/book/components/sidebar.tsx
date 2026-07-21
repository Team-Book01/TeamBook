import { useState } from "react";
import { Heart, TrendingUp } from "lucide-react";

import type { Book } from "../data";
import { ALL_BOOKS, MORE_BOOKS, POPULAR } from "../data";
import { MemberCard } from "@/components/common/MemberCard";

// ── ProfileCard ───────────────────────────────────────────────────────────────

export type BookProfileView = "saved" | "rated";

/**
 * 도서검색 사이드바 회원 카드.
 * 별명 + 아이디(그 아래) + [저장한 책 / 평가한 책] 카운트. 클릭하면 결과 영역이 전환된다.
 */
export function ProfileCard({
  nickname,
  handle,
  savedCount,
  ratedCount,
  activeView,
  onSelect,
}: {
  nickname: string;
  handle?: string;
  savedCount: number | null;
  ratedCount: number | null;
  activeView: BookProfileView | null;
  onSelect: (view: BookProfileView) => void;
}) {
  return (
    <MemberCard
      nickname={nickname}
      handle={handle}
      items={[
        {
          key: "saved",
          label: "저장한 책",
          count: savedCount,
          active: activeView === "saved",
          onClick: () => onSelect("saved"),
        },
        {
          key: "rated",
          label: "평가한 책",
          count: ratedCount,
          active: activeView === "rated",
          onClick: () => onSelect("rated"),
        },
      ]}
    />
  );
}

// ── PopularBooksCard ──────────────────────────────────────────────────────────

export function PopularBooksCard({ onSelect }: { onSelect: (b: Book) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#EAEAEA]">
        <TrendingUp size={16} className="text-[#2E7D6B]" />
        <span className="text-sm font-bold text-[#1A1A1A]">인기 도서</span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-1">
        {POPULAR.map((book) => {
          const isTop3 = book.rank <= 3;
          return (
            <div
              key={book.rank}
              className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-[#F9F9F9] transition-colors"
              onMouseEnter={() => setHovered(book.rank)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                const found = [...ALL_BOOKS, ...MORE_BOOKS].find(b => b.title === book.title);
                if (found) onSelect(found);
              }}
            >
              <span className="text-sm font-black w-5 text-center flex-shrink-0" style={{ color: isTop3 ? "#F5B301" : "#aaa" }}>{book.rank}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold truncate transition-colors ${hovered === book.rank ? "text-[#2E7D6B]" : "text-[#1A1A1A]"}`}>{book.title}</p>
                <p className="text-[11px] text-[#aaa]">{book.author}</p>
              </div>
              <span className="flex items-center gap-0.5 flex-shrink-0">
                <Heart size={11} className="fill-rose-500 stroke-rose-500" />
                <span className="text-[11px] text-[#aaa] tabular-nums">{book.likes.toLocaleString()}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
