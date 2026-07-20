import { useEffect, useRef, useState } from "react";
import {
  Search,
  MapPin,
  AlertCircle,
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

import type { Library, LatLng, Bounds } from "../data";
import { SIDO_LIST } from "../data";

// ─── Highlight ────────────────────────────────────────────────────────────────
// 검색어와 일치한 부분을 강조한다. "왜 이 결과가 나왔는지"가 바로 보여야 모호함이 사라진다.
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-[#FDE68A] text-inherit rounded-[2px] px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
import { loadKakaoMap } from "../kakao";

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
  query,
  selected,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  library: Library;
  query: string; // 매칭 하이라이트용 검색어
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      data-lib-id={library.id} // Sidebar 가 선택된 카드를 찾아 상단으로 스크롤할 때 쓴다
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
            <Highlight text={library.name} q={query} />
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
        <span className="text-[12px] text-[#6B7B74] truncate">
          <Highlight text={library.address} q={query} />
        </span>
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
        <a
          href={library.phone !== "정보 없음" ? `tel:${library.phone}` : undefined}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-[12px] text-[#6B7B74] hover:text-[#1E4A38] transition-colors"
        >
          <Phone size={12} strokeWidth={1.8} />
          {library.phone}
        </a>
        {library.homepageUrl && (
          <a
            href={library.homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] text-[#2E7D6B] hover:underline transition-colors ml-auto"
          >
            <Globe size={12} strokeWidth={1.8} />
            홈페이지
            <ChevronRight size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  libraries,
  totalCount,
  countPrefix,
  countNote,
  selectedId,
  hoveredId,
  searchQuery,
  region,
  onRegionChange,
  isOpen,
  basisLabel,
  statusMessage,
  deniedHelp,
  canLocate,
  onLocate,
  onToggle,
  onSelectLibrary,
  onHoverLibrary,
  onSearchChange,
}: {
  libraries: Library[];
  totalCount: number;
  countPrefix: string; // "내 주변 도서관" | "'부산' 검색 결과"
  countNote?: string; // 상한에 걸렸을 때 잘렸음을 알리는 문구
  selectedId: number | null;
  hoveredId: number | null;
  searchQuery: string;
  region: string; // '전체' | 시/도 단축명
  onRegionChange: (r: string) => void;
  isOpen: boolean;
  basisLabel: string; // 거리 기준점 (예: "서울시청 3km 기준")
  statusMessage?: string; // 로딩·에러 시 개수 대신 표시
  deniedHelp: boolean; // 브라우저가 위치를 차단한 상태 → 해제 방법 안내
  canLocate: boolean; // 위치를 요청할 수 있는 상태인지(차단·미지원이면 false)
  onLocate: () => void;
  onToggle: () => void;
  onSelectLibrary: (id: number) => void;
  onHoverLibrary: (id: number | null) => void;
  onSearchChange: (q: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // 선택된 도서관 카드를 목록 맨 위로 올린다.
  // 지도에서 마커를 누르면 해당 카드가 목록 한참 아래에 있어 선택 표시가 보이지 않는다.
  // (스크롤 컨테이너만 움직이도록 직접 계산한다. scrollIntoView 는 바깥 레이아웃까지 건드릴 수 있다)
  useEffect(() => {
    const list = listRef.current;
    if (!list || selectedId == null) return;
    const card = list.querySelector<HTMLElement>(`[data-lib-id="${selectedId}"]`);
    if (!card) return; // 필터에 걸려 목록에 없는 경우
    const delta = card.getBoundingClientRect().top - list.getBoundingClientRect().top;
    list.scrollTo({ top: list.scrollTop + delta, behavior: "smooth" });
  }, [selectedId]);

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

      {/* 지역(시/도) + 이름 검색 — 역할을 분리했다.
          지역은 주소에서 파싱한 구조화 필터로 고르고(모호함 없음), 검색창은 이름 중심. */}
      <div className="px-4 py-3 border-b border-[#F0F0F0] flex items-center gap-2">
        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          aria-label="지역 선택"
          className="flex-shrink-0 w-[86px] px-2.5 py-2.5 bg-[#F3F5F3] rounded-lg text-[13px] text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#2E7D6B]/30 transition-all cursor-pointer"
        >
          <option value="전체">지역</option>
          {SIDO_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            strokeWidth={1.8}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="도서관 이름 검색"
            className="w-full pl-9 pr-8 py-2.5 bg-[#F3F5F3] rounded-lg text-[13px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2E7D6B]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7B74]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 결과 메타 — 개수(좌) + 거리 기준점(우) 한 행.
          "무엇을 몇 곳 보고 있는가"와 "거리는 어디 기준인가"는 같은 맥락이라 한 줄로 묶었다. */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#F0F0F0]">
        {statusMessage ? (
          <span className="text-[12px] text-[#6B7B74] truncate">{statusMessage}</span>
        ) : (
          <span className="text-[12px] text-[#6B7B74] truncate">
            {countPrefix} <strong className="text-[#1E4A38] font-bold">{totalCount.toLocaleString()}곳</strong>
          </span>
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          <MapPin size={12} style={{ color: "#2E7D6B" }} strokeWidth={2} />
          <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{basisLabel}</span>
          {/* 위치 차단 안내 — 사이트가 프롬프트를 다시 띄울 수 없으므로 해제 경로만 알려줄 수 있다.
              차단은 사용자가 브라우저 설정을 바꾸기 전까지 유지되므로 전용 행을 두면 공간을 영구히 먹는다.
              → 거리 기준점(=위치를 못 쓰고 있다는 사실 자체) 옆에 아이콘으로만 두고 누를 때만 펼친다. */}
          {deniedHelp && (
            <button
              onClick={() => setHelpOpen((o) => !o)}
              aria-expanded={helpOpen}
              title="위치가 차단됨 · 해제 방법 보기"
              className="p-1 rounded-lg hover:bg-[#FFF7ED] transition-colors"
            >
              <AlertCircle size={14} className="text-[#EA580C]" strokeWidth={2.2} />
            </button>
          )}
          <button
            onClick={onLocate}
            disabled={!canLocate}
            title={canLocate ? "현재 위치로 거리 계산" : "브라우저에서 위치가 차단되어 사용할 수 없습니다"}
            className="p-1 rounded-lg hover:bg-[#EEF3F0] transition-colors group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Target size={14} className="text-[#9CA3AF] group-hover:text-[#1E4A38] transition-colors" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* 차단 해제 방법 — 위 아이콘을 눌렀을 때만 */}
      {deniedHelp && helpOpen && (
        <p className="px-4 py-2 bg-[#FFF7ED] border-b border-[#FED7AA] text-[11px] text-[#9A3412] leading-relaxed">
          주소창의 자물쇠(또는 ⓘ) 아이콘 → <b>위치</b> → <b>허용</b> 으로 바꾸면 즉시 내 주변이 표시됩니다.
        </p>
      )}

      {/* 상한에 걸려 잘렸을 때만 (조용히 자르지 않는다) */}
      {countNote && <p className="px-4 pt-2 text-[11px] text-[#9CA3AF]">{countNote}</p>}

      {/* Library list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2.5 scrollbar-hide pt-1.5"
      >
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
              query={searchQuery.trim()}
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

// 핀 상태별 색상. LibraryPin 과 동일 모양을 data URI SVG 로 만들어 카카오 마커에 씌운다.
//
// hover 상태가 없는 이유(중요):
//   커서가 올라가 있는 마커의 이미지를 setImage 로 바꾸면 카카오가 <img> 를 교체하고,
//   그 순간 브라우저가 mouseout 을 쏜다 → hover 해제 → 이미지 복구 → mouseover → 무한 반복(핀이 튕김).
//   그래서 hover 피드백은 마커를 건드리지 않는 별도 툴팁 오버레이로만 준다.
const PIN_COLOR = { default: "#1E4A38", selected: "#F5B301" } as const;
type PinState = keyof typeof PIN_COLOR;

function createPinImage(color: string) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 32' width='24' height='32'>` +
    `<path d='M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20S24 20.5 24 12C24 5.373 18.627 0 12 0z' fill='${color}'/>` +
    `<circle cx='12' cy='11' r='5' fill='white'/></svg>`;
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const kakao = window.kakao;
  return new kakao.maps.MarkerImage(url, new kakao.maps.Size(24, 32), {
    offset: new kakao.maps.Point(12, 32),
  });
}

/**
 * MarkerImage 는 상태별로 딱 한 번만 만들어 재사용한다.
 * (hover 마다 새로 만들어 모든 마커에 다시 씌우면, 커서 아래 마커가 재생성되며
 *  mouseout→mouseover 가 반복돼 핀이 튕기듯 깜빡인다.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pinImageCache: Record<PinState, any> | null = null;
function pinImages() {
  if (!pinImageCache) {
    pinImageCache = {
      default: createPinImage(PIN_COLOR.default),
      selected: createPinImage(PIN_COLOR.selected),
    };
  }
  return pinImageCache;
}

/**
 * 카카오 CustomOverlay 는 content 를 자체 래퍼 div 로 한 겹 감싼다.
 * content 에만 pointer-events:none 을 줘도 래퍼는 이벤트를 받으므로, 래퍼가 마커를 덮는 순간
 * 마커에 mouseout 이 발생한다 → 툴팁 제거 → mouseover → 재생성 → 깜빡임 루프.
 * 그래서 래퍼(직계 부모)까지 이벤트 투명 처리한다.
 * (상위 레이어까지 올라가면 지도 조작 자체가 막히므로 직계 부모만 건드린다.)
 */
function makeOverlayNonInteractive(contentEl: HTMLElement) {
  const wrapper = contentEl.parentElement;
  if (wrapper) wrapper.style.pointerEvents = "none";
}

export function MapPanel({
  libraries,
  selectedId,
  hoveredId,
  centerPos,
  userPos,
  canLocate,
  includeCenterInBounds,
  autoFit,
  fitCount,
  sidebarOpen,
  onToggleSidebar,
  onSelectLibrary,
  onHoverLibrary,
  onLocate,
  onSearchThisArea,
}: {
  libraries: Library[];
  selectedId: number | null;
  hoveredId: number | null;
  centerPos: LatLng; // 기준점(내 위치 또는 서울시청) — 지도 중심/바운즈용
  userPos: LatLng | null; // 실제 내 위치 — 있을 때만 위치 점 표시
  canLocate: boolean; // 위치를 요청할 수 있는 상태인지(차단·미지원이면 false)
  includeCenterInBounds: boolean; // 검색 모드(false)면 결과에만 맞춘다
  autoFit: boolean; // 지역 모드(false)면 사용자가 맞춘 화면을 건드리지 않는다
  fitCount: number; // 카메라를 맞출 때 libraries 앞에서부터 쓸 개수(약한 매칭은 제외)
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSelectLibrary: (id: number) => void;
  onHoverLibrary: (id: number | null) => void;
  onLocate: () => void;
  onSearchThisArea: (b: Bounds) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // kakao 객체들은 타입 패키지가 없어 any 로 보관한다.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const overlayRef = useRef<any>(null);
  const hoverTipRef = useRef<any>(null);
  const userDotRef = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  // 마커별로 현재 적용된 핀 상태. 바뀐 마커만 setImage 해서 불필요한 재생성을 막는다.
  const pinStateRef = useRef<Map<number, PinState>>(new Map());
  // 직전 선택 id. 선택이 실제로 바뀐 경우에만 지도를 옮기기 위해 추적한다.
  const prevSelectedRef = useRef<number | null>(null);
  // 우리가 코드로 지도를 옮기는 중인지. idle 이벤트는 사용자 조작과 프로그램 이동을 구분하지 못하므로
  // 이 플래그로 "사용자가 직접 움직인 경우"에만 지역검색 버튼을 띄운다.
  const programmaticRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showAreaButton, setShowAreaButton] = useState(false);

  // 1) SDK 로드 후 지도 1회 생성
  useEffect(() => {
    let alive = true;
    loadKakaoMap()
      .then(() => {
        if (!alive || !containerRef.current || mapRef.current) return;
        const kakao = window.kakao;
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(centerPos.lat, centerPos.lng),
          level: 6,
        });
        mapRef.current = map;

        // 축소하면 마커가 수백 개가 될 수 있어 클러스터러로 뭉친다.
        // minLevel 미만(확대 상태)에서는 개별 마커가 그대로 보인다.
        clustererRef.current = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 7,
          disableClickZoom: false,
        });

        // 사용자가 지도를 직접 움직였을 때만 "이 지도에서 검색" 버튼을 띄운다.
        kakao.maps.event.addListener(map, "idle", () => {
          if (programmaticRef.current) {
            programmaticRef.current = false; // 우리가 옮긴 것 → 버튼 띄우지 않음
            return;
          }
          setShowAreaButton(true);
        });

        setStatus("ready");
      })
      .catch((e: Error) => {
        if (!alive) return;
        setStatus("error");
        setErrorMsg(e.message);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1b) 컨테이너 크기 변화를 카카오에 알린다.
  //     사이드바 접기/펼치기·창 리사이즈로 지도 영역이 커져도 카카오는 스스로 모르기 때문에,
  //     relayout() 을 호출하지 않으면 새로 드러난 영역에 타일이 그려지지 않는다.
  //     (CSS transition 중에도 계속 발화하므로 애니메이션 내내 자연스럽게 채워진다)
  useEffect(() => {
    if (status !== "ready" || !containerRef.current) return;
    const ro = new ResizeObserver(() => mapRef.current?.relayout());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [status]);

  // 2) 도서관 마커 (목록/필터 변경 시 재생성). 마커는 클러스터러가 소유한다.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !clustererRef.current) return;
    const kakao = window.kakao;
    clustererRef.current.clear();
    markersRef.current.clear();
    pinStateRef.current.clear();
    const images = pinImages();
    const bounds = new kakao.maps.LatLngBounds();
    const markers = libraries.map((lib, i) => {
      const pos = new kakao.maps.LatLng(lib.lat, lib.lng);
      const marker = new kakao.maps.Marker({ position: pos, image: images.default, title: lib.name });
      kakao.maps.event.addListener(marker, "click", () => onSelectLibrary(lib.id));
      kakao.maps.event.addListener(marker, "mouseover", () => onHoverLibrary(lib.id));
      kakao.maps.event.addListener(marker, "mouseout", () => onHoverLibrary(null));
      markersRef.current.set(lib.id, marker);
      pinStateRef.current.set(lib.id, "default");
      // 카메라용 bounds 는 상위 fitCount 개만 반영한다(약한 매칭이 화면을 벌리지 않도록).
      if (i < fitCount) bounds.extend(pos);
      return marker;
    });
    // setMap 을 직접 하지 않는다 — 클러스터러가 표시/숨김을 관리한다.
    clustererRef.current.addMarkers(markers);

    // 지역 모드(autoFit=false)에선 사용자가 맞춰둔 화면을 절대 건드리지 않는다.
    if (!autoFit) return;
    programmaticRef.current = true; // 아래 카메라 이동은 우리가 하는 것 → 지역검색 버튼 띄우지 않음
    if (libraries.length > 0 && fitCount > 0) {
      // 내 주변 모드에선 기준점까지 포함해 "내 위치 + 주변 도서관"이 한눈에 들어오게 한다.
      // 검색 모드에선 결과에만 맞춘다(기준점을 넣으면 원거리 검색 시 전국이 보임).
      if (includeCenterInBounds) bounds.extend(new kakao.maps.LatLng(centerPos.lat, centerPos.lng));
      mapRef.current.setBounds(bounds);
    } else {
      // 결과가 없으면 기준점 중심만 잡는다.
      mapRef.current.setCenter(new kakao.maps.LatLng(centerPos.lat, centerPos.lng));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, libraries, centerPos.lat, centerPos.lng, includeCenterInBounds, autoFit, fitCount]);

  // 3) 선택 핀만 색을 바꾼다. hover 는 마커에 손대지 않는다(위 PIN_COLOR 주석의 튕김 이유).
  //    상태가 실제로 바뀐 마커만 setImage 한다.
  useEffect(() => {
    if (status !== "ready") return;
    const images = pinImages();
    markersRef.current.forEach((marker, id) => {
      const next: PinState = id === selectedId ? "selected" : "default";
      if (pinStateRef.current.get(id) === next) return;
      pinStateRef.current.set(id, next);
      marker.setImage(images[next]);
      marker.setZIndex(next === "selected" ? 10 : 1);
    });
  }, [status, selectedId, libraries]);

  // 3b) hover 이름 툴팁 — 마커가 아니라 별도 오버레이로 그린다(pointer-events:none 이라 mouseout 유발 없음).
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const kakao = window.kakao;
    if (hoverTipRef.current) {
      hoverTipRef.current.setMap(null);
      hoverTipRef.current = null;
    }
    // 선택된 마커는 이미 자체 말풍선이 있으므로 중복 표시하지 않는다.
    if (hoveredId == null || hoveredId === selectedId) return;
    const lib = libraries.find((l) => l.id === hoveredId);
    if (!lib) return;
    const el = document.createElement("div");
    el.textContent = lib.name;
    el.style.cssText =
      "transform:translateY(-38px);background:#fff;border:1px solid #EAEAEA;color:#1A1A1A;" +
      "font-size:11px;font-weight:500;padding:5px 9px;border-radius:8px;white-space:nowrap;" +
      "box-shadow:0 2px 6px rgba(0,0,0,0.15);pointer-events:none";
    hoverTipRef.current = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(lib.lat, lib.lng),
      content: el,
      yAnchor: 1,
      zIndex: 19,
      clickable: false,
    });
    hoverTipRef.current.setMap(mapRef.current);
    makeOverlayNonInteractive(el);
  }, [status, hoveredId, selectedId, libraries]);

  // 4) 선택 시 지도 이동 + 이름 말풍선
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const kakao = window.kakao;
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }
    // 선택이 "실제로 바뀐" 경우에만 지도를 옮긴다.
    // (목록이 바뀌었다는 이유로 이 효과가 다시 돌 때 지도가 선택 마커로 홱 되돌아가는 것 방지)
    const selectionChanged = prevSelectedRef.current !== selectedId;
    prevSelectedRef.current = selectedId;

    if (selectedId == null) return;
    const lib = libraries.find((l) => l.id === selectedId);
    if (!lib) return;
    const pos = new kakao.maps.LatLng(lib.lat, lib.lng);
    if (selectionChanged) {
      programmaticRef.current = true; // 우리가 옮기는 것 → 지역검색 버튼 띄우지 않음
      mapRef.current.panTo(pos);
    }
    const el = document.createElement("div");
    el.textContent = lib.name;
    el.style.cssText =
      "transform:translateY(-38px);background:#1E4A38;color:#fff;font-size:11px;font-weight:600;" +
      "padding:6px 10px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);" +
      "pointer-events:none"; // 마커의 mouseover/mouseout 을 가로채지 않도록
    overlayRef.current = new kakao.maps.CustomOverlay({
      position: pos,
      content: el,
      yAnchor: 1,
      zIndex: 20,
      clickable: false,
    });
    overlayRef.current.setMap(mapRef.current);
    makeOverlayNonInteractive(el);
  }, [status, selectedId, libraries]);

  // 5) 내 위치 점 (실제 위치 허용 시에만). 중심 이동은 마커 바운즈(효과2)가 담당.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const kakao = window.kakao;
    if (userDotRef.current) {
      userDotRef.current.setMap(null);
      userDotRef.current = null;
    }
    if (!userPos) return;
    const pos = new kakao.maps.LatLng(userPos.lat, userPos.lng);
    const el = document.createElement("div");
    el.style.cssText =
      "width:16px;height:16px;border-radius:50%;background:#2E7D6B;border:3px solid #fff;" +
      "box-shadow:0 1px 4px rgba(0,0,0,0.3);pointer-events:none";
    userDotRef.current = new kakao.maps.CustomOverlay({ position: pos, content: el, zIndex: 15, clickable: false });
    userDotRef.current.setMap(mapRef.current);
    makeOverlayNonInteractive(el);
  }, [status, userPos]);

  const zoom = (delta: number) => {
    if (mapRef.current) mapRef.current.setLevel(mapRef.current.getLevel() + delta);
  };
  // 이미 좌표가 있으면 그리로 이동은 가능하다. 좌표도 없고 요청도 막혔을 때만 할 수 있는 게 없다.
  const locateDisabled = !userPos && !canLocate;

  // 현재 위치로 이동 = "내 주변으로 돌아가기". onLocate 가 지역 모드도 해제한다.
  const recenter = () => {
    onLocate();
    if (userPos && mapRef.current) {
      programmaticRef.current = true;
      mapRef.current.panTo(new window.kakao.maps.LatLng(userPos.lat, userPos.lng));
    }
  };

  // 현재 지도 영역으로 검색. 누른 순간의 화면을 그대로 조회 범위로 넘긴다.
  const searchThisArea = () => {
    if (!mapRef.current) return;
    const b = mapRef.current.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    setShowAreaButton(false);
    onSearchThisArea({
      sw: { lat: sw.getLat(), lng: sw.getLng() },
      ne: { lat: ne.getLat(), lng: ne.getLng() },
    });
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-[#EAECEA]">
      {/* 실제 카카오 지도 컨테이너 */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* 로딩/에러 오버레이 */}
      {status === "loading" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#EAECEA]">
          <span className="text-[13px] text-[#6B7B74]">지도를 불러오는 중…</span>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#EAECEA] px-6">
          <div className="max-w-sm text-center">
            <p className="text-[13px] font-semibold text-[#B4232A] mb-1">지도를 불러오지 못했습니다</p>
            <p className="text-[12px] text-[#6B7B74] leading-relaxed">{errorMsg}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-2">
              .env 의 VITE_KAKAO_MAP_JS_KEY 와 카카오 콘솔의 JavaScript SDK 도메인(http://localhost:5173) 등록을 확인하세요.
            </p>
          </div>
        </div>
      )}

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

      {/* "이 지도에서 검색" — 사용자가 지도를 직접 움직였을 때만 노출 */}
      {status === "ready" && showAreaButton && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={searchThisArea}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-[13px] font-medium text-[#1A1A1A] border border-[#EAEAEA] hover:shadow-lg hover:border-[#C8DDD6] transition-all"
          >
            <RotateCcw size={13} style={{ color: "#2E7D6B" }} strokeWidth={2} />이 지도에서 검색
          </button>
        </div>
      )}

      {/* Zoom controls — top right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col bg-white rounded-xl shadow-md border border-[#EAEAEA] overflow-hidden">
        <button
          onClick={() => zoom(-1)}
          title="확대"
          className="w-9 h-9 flex items-center justify-center text-[#4B5563] hover:bg-[#F7F8F6] transition-colors border-b border-[#EAEAEA]"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
        <button
          onClick={() => zoom(1)}
          title="축소"
          className="w-9 h-9 flex items-center justify-center text-[#4B5563] hover:bg-[#F7F8F6] transition-colors"
        >
          <Minus size={16} strokeWidth={2} />
        </button>
      </div>

      {/* 현재 위치 버튼 — 사이드바를 접으면 🎯 가 사라지므로 이 버튼이 유일한 위치 컨트롤이 된다.
          단 위치가 차단·미지원이고 좌표도 없으면 눌러도 할 수 있는 게 없다 → 비활성화해서
          "눌리는데 아무 일도 안 일어남"을 없앤다. */}
      <div className="absolute bottom-6 right-4 z-10">
        <button
          onClick={recenter}
          disabled={locateDisabled}
          title={
            locateDisabled
              ? "브라우저에서 위치가 차단되어 사용할 수 없습니다"
              : "현재 위치로 이동"
          }
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg border border-[#EAEAEA] bg-white hover:shadow-xl transition-all disabled:opacity-45 disabled:shadow-md disabled:cursor-not-allowed disabled:hover:shadow-md"
        >
          <Navigation
            size={18}
            style={{ color: locateDisabled ? "#9CA3AF" : "#1E4A38" }}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
