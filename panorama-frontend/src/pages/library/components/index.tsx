import {
  Search,
  MapPin,
  Target,
  Phone,
  Globe,
  X,
  Plus,
  Minus,
  Navigation,
  RotateCcw,
  ChevronRight,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import type { Library } from "../data";
import { FILTERS } from "../data";

// ─── LocationModal ────────────────────────────────────────────────────────────

export function LocationModal({ onAllow, onLater }: { onAllow: () => void; onLater: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onLater} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[420px] p-8 flex flex-col items-center gap-5">
        {/* icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EEF3F0" }}>
          <MapPin size={30} style={{ color: "#1E4A38" }} strokeWidth={1.8} />
        </div>
        <div className="text-center">
          <h2 className="text-[17px] font-bold text-[#1A1A1A] leading-snug mb-2">
            내 주변 도서관을 찾으려면<br />위치 정보가 필요해요
          </h2>
          <p className="text-sm text-[#6B7B74] leading-relaxed">
            현재 위치를 기반으로 가까운 공공도서관을<br />지도와 목록으로 한눈에 확인하세요.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 w-full mt-1">
          <button
            onClick={onAllow}
            className="w-full py-3 rounded-xl text-white font-semibold text-[15px] transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: "#1E4A38" }}
          >
            위치 허용
          </button>
          <button
            onClick={onLater}
            className="w-full py-3 rounded-xl text-[#6B7B74] font-medium text-[14px] hover:text-[#1A1A1A] transition-colors"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LibraryPin ───────────────────────────────────────────────────────────────

export function LibraryPin({ selected, hovered }: { selected: boolean; hovered: boolean }) {
  const color = selected ? "#F5B301" : hovered ? "#2E7D6B" : "#1E4A38";
  const scale = selected ? 1.35 : hovered ? 1.15 : 1;
  return (
    <svg
      viewBox="0 0 24 32"
      width={24}
      height={32}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "50% 100%",
        filter: selected
          ? "drop-shadow(0 3px 8px rgba(0,0,0,0.4))"
          : "drop-shadow(0 1px 3px rgba(0,0,0,0.25))",
        transition: "transform 0.15s ease, filter 0.15s ease",
      }}
    >
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20S24 20.5 24 12C24 5.373 18.627 0 12 0z"
        fill={color}
      />
      <circle cx="12" cy="11" r="5" fill="white" />
      {selected && <circle cx="12" cy="11" r="2.5" fill={color} />}
    </svg>
  );
}

// ─── MapBackground ────────────────────────────────────────────────────────────

export function MapBackground() {
  return (
    <svg
      viewBox="0 0 1000 700"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Base */}
      <rect width="1000" height="700" fill="#F0EBE0" />

      {/* Park / green areas */}
      <polygon points="0,0 158,0 148,188 8,208 0,172" fill="#D4EABC" />
      <polygon points="694,0 1000,0 1000,148 728,168 684,78" fill="#D4EABC" />
      <polygon points="312,554 712,544 732,700 292,700" fill="#D4EABC" />
      <polygon points="0,588 158,564 174,700 0,700" fill="#D4EABC" />
      <polygon points="858,568 1000,548 1000,700 848,700" fill="#D4EABC" />
      <ellipse cx="242" cy="432" rx="46" ry="31" fill="#D4EABC" opacity="0.55" />
      <ellipse cx="644" cy="622" rx="40" ry="26" fill="#D4EABC" opacity="0.55" />

      {/* Han River */}
      <path
        d="M -12,288 Q 152,270 352,296 Q 552,322 752,306 Q 872,298 1012,313 L1012,357 Q872,343 752,351 Q552,367 352,341 Q152,315 -12,333 Z"
        fill="#BDD8F0"
      />

      {/* Expressways flanking river */}
      <line x1="0" y1="255" x2="1000" y2="253" stroke="white" strokeWidth="8" />
      <line x1="0" y1="371" x2="1000" y2="373" stroke="white" strokeWidth="8" />

      {/* Major horizontal roads */}
      <line x1="0" y1="131" x2="1000" y2="129" stroke="white" strokeWidth="6" />
      <line x1="0" y1="469" x2="1000" y2="471" stroke="white" strokeWidth="6" />
      <line x1="0" y1="542" x2="1000" y2="545" stroke="white" strokeWidth="5" />

      {/* Major vertical roads */}
      <line x1="162" y1="0" x2="160" y2="700" stroke="white" strokeWidth="7" />
      <line x1="378" y1="0" x2="376" y2="700" stroke="white" strokeWidth="7" />
      <line x1="578" y1="0" x2="576" y2="700" stroke="white" strokeWidth="7" />
      <line x1="778" y1="0" x2="776" y2="700" stroke="white" strokeWidth="7" />

      {/* Secondary horizontal roads */}
      <line x1="0" y1="64" x2="1000" y2="62" stroke="white" strokeWidth="3.5" />
      <line x1="0" y1="197" x2="1000" y2="195" stroke="white" strokeWidth="3.5" />
      <line x1="0" y1="404" x2="1000" y2="406" stroke="white" strokeWidth="3.5" />
      <line x1="0" y1="508" x2="1000" y2="510" stroke="white" strokeWidth="3.5" />
      <line x1="0" y1="610" x2="1000" y2="613" stroke="white" strokeWidth="3.5" />
      <line x1="0" y1="657" x2="1000" y2="659" stroke="white" strokeWidth="3.5" />

      {/* Secondary vertical roads */}
      <line x1="71" y1="0" x2="69" y2="700" stroke="white" strokeWidth="3.5" />
      <line x1="270" y1="0" x2="268" y2="700" stroke="white" strokeWidth="3.5" />
      <line x1="474" y1="0" x2="472" y2="700" stroke="white" strokeWidth="3.5" />
      <line x1="674" y1="0" x2="672" y2="700" stroke="white" strokeWidth="3.5" />
      <line x1="874" y1="0" x2="872" y2="700" stroke="white" strokeWidth="3.5" />
      <line x1="944" y1="0" x2="942" y2="700" stroke="white" strokeWidth="3.5" />

      {/* Tertiary roads (horizontal) */}
      {[32, 97, 165, 233, 433, 486, 528, 580, 628, 678].map((y, i) => (
        <line key={`th-${i}`} x1="0" y1={y} x2="1000" y2={y + 1} stroke="white" strokeWidth="2" opacity="0.6" />
      ))}
      {/* Tertiary roads (vertical) */}
      {[34, 117, 218, 323, 426, 524, 624, 724, 824, 910, 968].map((x, i) => (
        <line key={`tv-${i}`} x1={x} y1="0" x2={x - 1} y2="700" stroke="white" strokeWidth="2" opacity="0.6" />
      ))}

      {/* Building blocks — upper left */}
      <rect x="12" y="12" width="54" height="43" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="80" y="15" width="76" height="40" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="12" y="70" width="44" height="63" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="62" y="70" width="95" height="63" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="10" y="140" width="147" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="10" y="206" width="97" height="48" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="112" y="206" width="45" height="48" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="10" y="382" width="147" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="10" y="466" width="72" height="30" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="88" y="466" width="70" height="30" rx="3" fill="#E5DDCE" opacity="0.82" />

      {/* Building blocks — upper middle */}
      <rect x="175" y="12" width="90" height="117" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="273" y="12" width="98" height="56" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="273" y="73" width="98" height="56" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="175" y="140" width="90" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="273" y="140" width="98" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="175" y="206" width="196" height="48" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="175" y="382" width="196" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="175" y="478" width="90" height="28" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="273" y="478" width="98" height="28" rx="3" fill="#E5DDCE" opacity="0.82" />

      {/* Building blocks — center */}
      <rect x="390" y="12" width="180" height="117" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="390" y="140" width="84" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="482" y="140" width="88" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="390" y="206" width="180" height="48" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="390" y="382" width="180" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="390" y="480" width="84" height="26" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="482" y="480" width="88" height="26" rx="3" fill="#E5DDCE" opacity="0.82" />

      {/* Building blocks — right center */}
      <rect x="590" y="12" width="79" height="57" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="680" y="12" width="90" height="117" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="590" y="73" width="79" height="56" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="590" y="140" width="79" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="680" y="140" width="90" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="590" y="206" width="180" height="48" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="590" y="382" width="79" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="680" y="382" width="90" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="590" y="480" width="79" height="26" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="680" y="480" width="90" height="26" rx="3" fill="#E5DDCE" opacity="0.82" />

      {/* Building blocks — far right */}
      <rect x="791" y="12" width="60" height="57" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="857" y="12" width="56" height="117" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="919" y="12" width="76" height="57" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="791" y="73" width="60" height="56" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="919" y="73" width="76" height="56" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="791" y="140" width="60" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="857" y="140" width="56" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="919" y="140" width="76" height="53" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="791" y="206" width="204" height="48" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="791" y="382" width="60" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="857" y="382" width="56" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="919" y="382" width="76" height="80" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="791" y="480" width="204" height="26" rx="3" fill="#E5DDCE" opacity="0.82" />

      {/* Southern blocks */}
      <rect x="10" y="555" width="147" height="140" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="175" y="555" width="90" height="66" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="273" y="555" width="98" height="66" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="791" y="555" width="60" height="66" rx="3" fill="#E5DDCE" opacity="0.82" />
      <rect x="919" y="555" width="76" height="66" rx="3" fill="#E5DDCE" opacity="0.82" />

      {/* Map labels */}
      <text x="72" y="188" textAnchor="middle" fontSize="9" fill="#7A7468" fontFamily="'Noto Sans KR', sans-serif" fontWeight="500">북한산</text>
      <text x="862" y="76" textAnchor="middle" fontSize="9" fill="#7A7468" fontFamily="'Noto Sans KR', sans-serif" fontWeight="500">남산공원</text>
      <text x="500" y="315" textAnchor="middle" fontSize="10" fill="#5A7A9E" fontFamily="'Noto Sans KR', sans-serif" fontWeight="600">한강</text>
      <text x="500" y="632" textAnchor="middle" fontSize="9" fill="#7A7468" fontFamily="'Noto Sans KR', sans-serif" fontWeight="500">관악산</text>
      <text x="72" y="654" textAnchor="middle" fontSize="9" fill="#7A7468" fontFamily="'Noto Sans KR', sans-serif" fontWeight="500">관악구</text>
      <text x="862" y="654" textAnchor="middle" fontSize="9" fill="#7A7468" fontFamily="'Noto Sans KR', sans-serif" fontWeight="500">송파구</text>
      <text x="236" y="260" textAnchor="middle" fontSize="8" fill="#8A8076" fontFamily="'Noto Sans KR', sans-serif">올림픽대로</text>
      <text x="620" y="260" textAnchor="middle" fontSize="8" fill="#8A8076" fontFamily="'Noto Sans KR', sans-serif">강변북로</text>
    </svg>
  );
}

// ─── LibraryCard ──────────────────────────────────────────────────────────────

export function LibraryCard({
  library,
  selected,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  library: Library;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
        selected
          ? "border-[#1E4A38] bg-[#F0F6F3] shadow-sm"
          : hovered
          ? "border-[#2E7D6B] bg-[#F7FAF8] shadow-sm"
          : "border-[#EAEAEA] bg-white hover:border-[#C8DDD6] hover:bg-[#F7FAF8]"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
            style={
              library.type === "국립"
                ? { backgroundColor: "#EEF3F0", color: "#1E4A38" }
                : { backgroundColor: "#EDF3F8", color: "#3A6E9C" }
            }
          >
            {library.type}
          </span>
          <h3
            className={`text-[14px] font-bold truncate ${
              selected ? "text-[#1E4A38]" : "text-[#1A1A1A]"
            }`}
          >
            {library.name}
          </h3>
        </div>
        <span
          className={`text-[11px] font-semibold flex-shrink-0 ${
            library.isOpen ? "text-[#2E7D6B]" : "text-[#9CA3AF]"
          }`}
        >
          {library.isOpen ? "영업중" : "영업종료"}
        </span>
      </div>

      {/* Address + distance */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <MapPin size={11} className="text-[#9CA3AF] flex-shrink-0" />
        <span className="text-[12px] text-[#6B7B74] truncate">{library.address}</span>
        <span className="text-[12px] text-[#9CA3AF] flex-shrink-0">· {library.distance}</span>
      </div>

      {/* Hours */}
      <div className="flex items-center gap-1.5 mb-3">
        <Clock size={11} className="text-[#9CA3AF] flex-shrink-0" />
        <span className="text-[12px] text-[#6B7B74]">{library.hours}</span>
        <span className="text-[11px] text-[#B0BAB5]">· {library.closedDay}</span>
      </div>

      {/* Bottom row — phone + website */}
      <div className="flex items-center gap-3 pt-2.5 border-t border-[#F0F0F0]">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-[12px] text-[#6B7B74] hover:text-[#1E4A38] transition-colors"
        >
          <Phone size={12} strokeWidth={1.8} />
          {library.phone}
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[12px] text-[#2E7D6B] hover:underline transition-colors ml-auto"
        >
          <Globe size={12} strokeWidth={1.8} />
          홈페이지
          <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  libraries,
  totalCount,
  selectedId,
  hoveredId,
  activeFilter,
  searchQuery,
  isOpen,
  onToggle,
  onSelectLibrary,
  onHoverLibrary,
  onFilterChange,
  onSearchChange,
}: {
  libraries: Library[];
  totalCount: number;
  selectedId: number | null;
  hoveredId: number | null;
  activeFilter: string;
  searchQuery: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectLibrary: (id: number) => void;
  onHoverLibrary: (id: number | null) => void;
  onFilterChange: (f: string) => void;
  onSearchChange: (q: string) => void;
}) {
  return (
    <aside
      className="flex-shrink-0 flex flex-col bg-white border-r border-[#EAEAEA] overflow-hidden relative"
      style={{
        width: isOpen ? 380 : 0,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Sidebar header row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-[#F0F0F0] flex-shrink-0">
        <span className="text-[13px] font-semibold text-[#1E4A38]">도서관 목록</span>
        <button
          onClick={onToggle}
          title="사이드바 접기"
          className="p-1.5 rounded-lg hover:bg-[#EEF3F0] transition-colors text-[#6B7B74] hover:text-[#1E4A38]"
        >
          <PanelLeftClose size={17} strokeWidth={1.8} />
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 pt-3 pb-3 border-b border-[#F0F0F0]">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            strokeWidth={1.8}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="도서관 이름 또는 지역 검색"
            className="w-full pl-9 pr-4 py-2.5 bg-[#F3F5F3] rounded-lg text-[13px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2E7D6B]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7B74]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-1.5">
          <MapPin size={13} style={{ color: "#2E7D6B" }} strokeWidth={2} />
          <span className="text-[12px] text-[#6B7B74]">서울시 관악구 신림동 기준</span>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-[#EEF3F0] transition-colors group">
          <Target size={15} className="text-[#9CA3AF] group-hover:text-[#1E4A38] transition-colors" strokeWidth={1.8} />
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-[#F0F0F0]">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
              activeFilter === f
                ? "text-white"
                : "bg-[#F3F5F3] text-[#6B7B74] hover:bg-[#EEF3F0] hover:text-[#1E4A38]"
            }`}
            style={activeFilter === f ? { backgroundColor: "#1E4A38" } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div className="px-4 pt-3 pb-1.5">
        <span className="text-[12px] text-[#6B7B74]">
          내 주변 도서관{" "}
          <strong className="text-[#1E4A38] font-bold">{totalCount}곳</strong>
        </span>
      </div>

      {/* Library list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5 scrollbar-hide pt-1.5">
        {libraries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-[#D1D5DB] mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-[#9CA3AF]">검색 결과가 없습니다</p>
          </div>
        ) : (
          libraries.map((lib) => (
            <LibraryCard
              key={lib.id}
              library={lib}
              selected={selectedId === lib.id}
              hovered={hoveredId === lib.id}
              onClick={() => onSelectLibrary(lib.id)}
              onMouseEnter={() => onHoverLibrary(lib.id)}
              onMouseLeave={() => onHoverLibrary(null)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

// ─── MapPanel ─────────────────────────────────────────────────────────────────

export function MapPanel({
  libraries,
  selectedId,
  hoveredId,
  sidebarOpen,
  onToggleSidebar,
  onSelectLibrary,
  onHoverLibrary,
}: {
  libraries: Library[];
  selectedId: number | null;
  hoveredId: number | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSelectLibrary: (id: number) => void;
  onHoverLibrary: (id: number | null) => void;
}) {
  return (
    <div className="flex-1 relative overflow-hidden bg-[#F0EBE0]">
      {/* Map background */}
      <div className="absolute inset-0">
        <MapBackground />
      </div>

      {/* Sidebar open button — shown when sidebar is collapsed */}
      {!sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          title="목록 펼치기"
          className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl shadow-md border border-[#EAEAEA] text-[13px] font-medium text-[#1E4A38] hover:shadow-lg hover:border-[#C8DDD6] transition-all"
        >
          <PanelLeftOpen size={16} strokeWidth={1.8} />
          목록 보기
        </button>
      )}

      {/* "Search this area" button — top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-[13px] font-medium text-[#1A1A1A] border border-[#EAEAEA] hover:shadow-lg hover:border-[#C8DDD6] transition-all"
        >
          <RotateCcw size={13} style={{ color: "#2E7D6B" }} strokeWidth={2} />
          이 지역에서 다시 검색
        </button>
      </div>

      {/* Zoom controls — top right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col bg-white rounded-xl shadow-md border border-[#EAEAEA] overflow-hidden">
        <button className="w-9 h-9 flex items-center justify-center text-[#4B5563] hover:bg-[#F7F8F6] transition-colors border-b border-[#EAEAEA]">
          <Plus size={16} strokeWidth={2} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-[#4B5563] hover:bg-[#F7F8F6] transition-colors">
          <Minus size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Library markers */}
      {libraries.map((lib) => {
        const isSelected = selectedId === lib.id;
        const isHovered = hoveredId === lib.id;
        return (
          <div
            key={lib.id}
            className="absolute z-10"
            style={{
              left: `${lib.mx}%`,
              top: `${lib.my}%`,
              transform: "translate(-50%, -100%)",
            }}
            onClick={() => onSelectLibrary(lib.id)}
            onMouseEnter={() => onHoverLibrary(lib.id)}
            onMouseLeave={() => onHoverLibrary(null)}
          >
            {/* Callout balloon for selected */}
            {isSelected && (
              <div
                className="absolute bottom-[calc(100%-2px)] left-1/2 -translate-x-1/2 mb-1 z-20"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))" }}
              >
                <div className="relative bg-[#1E4A38] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {lib.name}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid #1E4A38",
                    }}
                  />
                </div>
              </div>
            )}
            {/* Hover tooltip */}
            {isHovered && !isSelected && (
              <div
                className="absolute bottom-[calc(100%-2px)] left-1/2 -translate-x-1/2 mb-1 z-20"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
              >
                <div className="relative bg-white border border-[#EAEAEA] text-[#1A1A1A] text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                  {lib.name}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid #EAEAEA",
                    }}
                  />
                </div>
              </div>
            )}
            <div className="cursor-pointer">
              <LibraryPin selected={isSelected} hovered={isHovered} />
            </div>
          </div>
        );
      })}

      {/* My location dot */}
      <div
        className="absolute z-10"
        style={{ left: "43%", top: "78%", transform: "translate(-50%, -50%)" }}
      >
        <div className="relative w-5 h-5">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: "rgba(46,125,107,0.25)" }}
          />
          <div
            className="absolute inset-[3px] rounded-full"
            style={{ backgroundColor: "#2E7D6B", border: "2.5px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
          />
        </div>
      </div>

      {/* Current location button — bottom right */}
      <div className="absolute bottom-6 right-4 z-10">
        <button
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg border border-[#EAEAEA] bg-white hover:shadow-xl transition-all"
          title="현재 위치로 이동"
        >
          <Navigation size={18} style={{ color: "#1E4A38" }} strokeWidth={2} />
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-6 left-4 z-10 flex items-end gap-1">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-[#6B7B74] mb-0.5">500m</span>
          <div className="flex items-center">
            <div className="w-px h-2 bg-[#6B7B74]" />
            <div className="h-px w-16 bg-[#6B7B74]" />
            <div className="w-px h-2 bg-[#6B7B74]" />
          </div>
        </div>
      </div>

      {/* Kakao Map watermark */}
      <div className="absolute bottom-2 right-16 z-10">
        <span className="text-[10px] text-[#9CA3AF]">카카오맵 연동 예정</span>
      </div>
    </div>
  );
}
