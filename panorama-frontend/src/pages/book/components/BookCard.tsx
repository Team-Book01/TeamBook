import { useState } from "react";
import { Star, Heart } from "lucide-react";

import type { Book } from "../data";
import { BookCoverLarge } from "./primitives";

export function BookCard({
  book,
  onAuthorClick,
  onToggleBookmark,
  onSelect,
}: {
  book: Book;
  onAuthorClick: (a: string) => void;
  onToggleBookmark: (id: number) => void;
  onSelect: (b: Book) => void;
}) {
  const [purchaseHover, setPurchaseHover] = useState(false);
  const [purchaseClicked, setPurchaseClicked] = useState(false);

  return (
    <div className="flex gap-4 bg-white border border-[#EAEAEA] rounded-2xl p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow duration-200 items-stretch">
      <button onClick={() => onSelect(book)} className="flex-shrink-0">
        <BookCoverLarge color={book.coverColor} accent={book.coverAccent} title={book.title} size="md" />
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3
            className="text-base font-bold text-[#1A1A1A] leading-snug mb-1 cursor-pointer hover:text-[#2E7D6B] transition-colors"
            onClick={() => onSelect(book)}
          >
            {book.title}
          </h3>
          <p className="text-xs text-[#777] mb-2">
            <button onClick={() => onAuthorClick(book.author)} className="hover:text-[#2E7D6B] hover:underline cursor-pointer transition-colors">
              {book.author}
            </button>
            <span> · {book.publisher} · {book.publishDate}</span>
          </p>
          <div className="flex items-center gap-1 mb-2.5">
            <Star size={12} fill="#F5B301" stroke="#F5B301" />
            <span className="text-[12px] font-semibold text-[#555]">{book.rating ?? "–"}</span>
            {book.reviewCount && <span className="text-[12px] text-[#aaa]">({book.reviewCount.toLocaleString()})</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onMouseEnter={() => setPurchaseHover(true)}
            onMouseLeave={() => setPurchaseHover(false)}
            onClick={() => { setPurchaseClicked(true); setTimeout(() => setPurchaseClicked(false), 2000); }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              purchaseHover ? "bg-[#03C75A] text-white shadow-sm" : "bg-[#F0FAF4] text-[#03C75A] border border-[#D0EFD8]"
            }`}
          >
            <span className={`w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-black ${purchaseHover ? "bg-white text-[#03C75A]" : "bg-[#03C75A] text-white"}`}>N</span>
            구매
            <span className="font-semibold text-[11px]">{book.price}</span>
          </button>
          {purchaseClicked && <span className="text-[11px] text-[#2E7D6B] animate-pulse">구매 페이지로 이동</span>}
        </div>
      </div>

      <div className="self-center flex-shrink-0 flex flex-col items-center gap-1">
        <button
          onClick={() => onToggleBookmark(book.id)}
          className="p-2 rounded-full hover:bg-[#FFF0F0] transition-colors"
        >
          <Heart size={20} className={`transition-colors ${book.bookmarked ? "fill-rose-500 stroke-rose-500" : "stroke-[#ccc] fill-transparent"}`} />
        </button>
        <span className="text-[11px] text-[#aaa] leading-none tabular-nums">
          {(book.likes + (book.bookmarked ? 1 : 0)).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
