import { useState } from "react";
import { Star } from "lucide-react";

// ── BookCoverLarge ────────────────────────────────────────────────────────────

export function BookCoverLarge({ color, accent, title, size = "md" }: { color: string; accent: string; title: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? { w: 180, h: 252 } : size === "md" ? { w: 80, h: 110 } : { w: 56, h: 78 };
  return (
    <div
      className="relative flex-shrink-0 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.22)]"
      style={{ width: dims.w, height: dims.h, background: color, borderRadius: 10 }}
    >
      <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 60%)` }} />
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <div className="w-full h-[1px] bg-white opacity-30 mb-2" />
        <p className="text-white font-bold leading-tight opacity-90 line-clamp-3"
          style={{ fontSize: size === "lg" ? 13 : size === "md" ? 9 : 8, wordBreak: "keep-all" }}>
          {title}
        </p>
      </div>
      <div className="absolute top-0 right-0 w-6 h-full opacity-20"
        style={{ background: "linear-gradient(to left, rgba(255,255,255,0.4), transparent)" }} />
    </div>
  );
}

// ── PurchaseBtn ───────────────────────────────────────────────────────────────

export function PurchaseBtn({ price }: { price: string }) {
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => { setClicked(true); setTimeout(() => setClicked(false), 2000); }}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
          hover ? "bg-[#03C75A] text-white shadow-sm" : "bg-[#F0FAF4] text-[#03C75A] border border-[#D0EFD8]"
        }`}
      >
        <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-black ${hover ? "bg-white text-[#03C75A]" : "bg-[#03C75A] text-white"}`}>N</span>
        구매
        <span className="font-semibold">{price}</span>
      </button>
      {clicked && <span className="text-xs text-[#2E7D6B] animate-pulse">구매 페이지로 이동</span>}
    </div>
  );
}

// ── StarRating ────────────────────────────────────────────────────────────────

export function StarRating({ value, onChange, readOnly = false, size = 24 }: { value: number; onChange?: (v: number) => void; readOnly?: boolean; size?: number }) {
  const [hovered, setHovered] = useState(0);
  const display = readOnly ? value : (hovered || value);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          disabled={readOnly}
          onClick={() => onChange?.(n === value ? 0 : n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            size={size}
            className="transition-colors"
            fill={n <= display ? "#F5B301" : "#E5E5E5"}
            stroke={n <= display ? "#F5B301" : "#E5E5E5"}
          />
        </button>
      ))}
    </div>
  );
}
