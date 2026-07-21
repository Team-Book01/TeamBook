import { useState } from "react";
import { TrendingUp } from "lucide-react";

import { usePopularBooks } from "@/api/book";
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

export function PopularBooksCard({ onSelect }: { onSelect: (isbn: string) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { data, isLoading } = usePopularBooks();
  // 백엔드가 랭킹순으로 내려주므로 그대로 상위 10건만 노출한다.
  const books = (data ?? []).slice(0, 10);

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#EAEAEA]">
        <TrendingUp size={16} className="text-[#2E7D6B]" />
        <span className="text-sm font-bold text-[#1A1A1A]">인기 도서</span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-1">
        {isLoading ? (
          <p className="text-[12px] text-[#aaa] px-2 py-3 text-center">불러오는 중…</p>
        ) : books.length === 0 ? (
          <p className="text-[12px] text-[#aaa] px-2 py-3 text-center">인기 도서가 없습니다.</p>
        ) : (
          books.map((book, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            return (
              <div
                key={`${book.isbn}-${idx}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-[#F9F9F9] transition-colors"
                onMouseEnter={() => setHovered(rank)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => book.isbn && onSelect(book.isbn.trim())}
              >
                <span className="text-sm font-black w-5 text-center flex-shrink-0" style={{ color: isTop3 ? "#F5B301" : "#aaa" }}>{rank}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold truncate transition-colors ${hovered === rank ? "text-[#2E7D6B]" : "text-[#1A1A1A]"}`}>{book.title}</p>
                  <p className="text-[11px] text-[#aaa] truncate">{book.author}</p>
                </div>
                <span className="text-[11px] text-[#888] tabular-nums flex-shrink-0">대출 {Number(book.loanCount ?? 0).toLocaleString()}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
