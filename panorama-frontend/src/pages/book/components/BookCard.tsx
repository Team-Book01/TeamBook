import { useState } from "react";
import { Star, Heart, BookOpen } from "lucide-react";

import type { BookItem } from "@/types/book";

/** yyyymmdd → yyyy.mm (없으면 빈 문자열) */
function formatPubdate(pubdate: string): string {
  if (!pubdate || pubdate.length < 6) return pubdate ?? "";
  return `${pubdate.slice(0, 4)}.${pubdate.slice(4, 6)}`;
}

/** 네이버 판매가(숫자 문자열) → "12,600원" */
function formatPrice(discount?: string): string | null {
  if (!discount) return null;
  const n = Number(discount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toLocaleString()}원`;
}

export function BookCard({
  book,
  onAuthorClick,
  onToggleBookmark,
  onSelect,
}: {
  book: BookItem;
  onAuthorClick: (a: string) => void;
  onToggleBookmark: (book: BookItem) => void;
  onSelect: (isbn: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const price = formatPrice(book.discount);
  // isbn 이 없으면 상세 진입 비활성화
  const canOpen = book.isbn.length > 0;

  const open = () => canOpen && onSelect(book.isbn);

  return (
    <div className="flex gap-4 bg-white border border-[#EAEAEA] rounded-2xl p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow duration-200 items-stretch">
      <button onClick={open} disabled={!canOpen} className="flex-shrink-0">
        {book.image && !imgError ? (
          <img
            src={book.image}
            alt={book.title}
            onError={() => setImgError(true)}
            className="w-20 h-[110px] object-cover rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.22)]"
          />
        ) : (
          <div className="w-20 h-[110px] rounded-[10px] bg-[#EAEAEA] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
            <BookOpen size={26} className="text-[#bbb]" />
          </div>
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3
            className="text-base font-bold text-[#1A1A1A] leading-snug mb-1 cursor-pointer hover:text-[#2E7D6B] transition-colors"
            onClick={open}
          >
            {book.title}
          </h3>
          <p className="text-xs text-[#777] mb-2">
            <button onClick={() => onAuthorClick(book.author)} className="hover:text-[#2E7D6B] hover:underline cursor-pointer transition-colors">
              {book.author}
            </button>
            <span> · {book.publisher}{book.pubdate ? ` · ${formatPubdate(book.pubdate)}` : ""}</span>
          </p>
          <div className="flex items-center gap-1 mb-2.5">
            <Star size={12} fill="#F5B301" stroke="#F5B301" />
            <span className="text-[12px] font-semibold text-[#555]">
              {book.avgRating > 0 ? book.avgRating.toFixed(1) : "–"}
            </span>
            {book.reviewCount > 0 && <span className="text-[12px] text-[#aaa]">({book.reviewCount.toLocaleString()})</span>}
          </div>
        </div>
        {(price || book.link) && (
          <div className="flex items-center gap-2">
            <a
              href={book.link || undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all bg-[#F0FAF4] text-[#03C75A] border border-[#D0EFD8] hover:bg-[#03C75A] hover:text-white hover:shadow-sm"
            >
              <span className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-black bg-[#03C75A] text-white">N</span>
              구매
              {price && <span className="font-semibold text-[11px]">{price}</span>}
            </a>
          </div>
        )}
      </div>

      <div className="self-center flex-shrink-0 flex flex-col items-center gap-1">
        <button
          onClick={() => onToggleBookmark(book)}
          className="p-2 rounded-full hover:bg-[#FFF0F0] transition-colors"
        >
          <Heart size={20} className={`transition-colors ${book.isBookmarked ? "fill-rose-500 stroke-rose-500" : "stroke-[#ccc] fill-transparent"}`} />
        </button>
        <span className="text-[11px] text-[#aaa] leading-none tabular-nums">
          {book.bookmarkCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
