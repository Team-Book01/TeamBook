import { useState } from "react";
import { Heart, TrendingUp } from "lucide-react";

import type { Book } from "../data";
import { ALL_BOOKS, MORE_BOOKS, POPULAR } from "../data";

// ── ProfileCard ───────────────────────────────────────────────────────────────

export function ProfileCard() {
  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0" style={{ background: "#2E7D6B" }}>달</div>
          <div>
            <p className="text-sm font-bold text-[#1A1A1A] leading-none">달빛독서가</p>
            <p className="text-xs text-[#aaa] mt-1">열정적인 독서인 · Lv.12</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F0F0F0]">
          <a href="#" className="text-center group py-1">
            <p className="text-xl font-bold leading-none" style={{ color: "#1E4A38" }}>12</p>
            <p className="text-xs text-[#aaa] mt-1 group-hover:text-[#2E7D6B] transition-colors">내가 쓴 글</p>
          </a>
          <a href="#" className="text-center group py-1">
            <p className="text-xl font-bold leading-none" style={{ color: "#1E4A38" }}>5</p>
            <p className="text-xs text-[#aaa] mt-1 group-hover:text-[#2E7D6B] transition-colors">스크랩한 글</p>
          </a>
        </div>
      </div>
    </div>
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
