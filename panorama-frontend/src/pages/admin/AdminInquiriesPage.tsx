import { useState } from "react";
import {
  Lock, Paperclip, MoreHorizontal,
  ChevronLeft, ChevronRight, Trash2, Edit3, Send, Save,
  MessageCircle, AlertTriangle, Search,
  Image as ImageIcon,
} from "lucide-react";
import type { Inquiry, Status } from "./inquiriesData";
import { INQUIRIES, STATS, CAT_STYLE, STAT_STYLE } from "./inquiriesData";

// ─── Colors ──────────────────────────────────────────────────────────────────

const G_DARK = "#1B3829";
const G_MED  = "#2D5E42";
const G_LBG  = "#F0FDF4";

// ─── Shared Badges ────────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: string }) {
  const s = CAT_STYLE[cat] ?? { bg: "#F8FAFC", color: "#475569" };
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {cat}
    </span>
  );
}

function StatBadge({ status }: { status: Status }) {
  const s = STAT_STYLE[status];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow() {
  return (
    <div className="grid grid-cols-4 gap-3.5 mb-4 flex-shrink-0">
      {STATS.map((s) => (
        <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-2.5">
            <p className="text-[11.5px] text-gray-500 font-medium leading-snug">{s.label}</p>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: s.iconBg }}
            >
              <s.icon className="w-[17px] h-[17px]" style={{ color: s.iconClr }} />
            </div>
          </div>
          <p className="text-[25px] font-bold leading-none mb-1.5" style={{ color: s.valClr }}>
            {s.value}
            <span className="text-[13px] font-medium ml-1 text-gray-400">{s.unit}</span>
          </p>
          <p className="text-[11px] text-gray-400">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── List Panel ───────────────────────────────────────────────────────────────

interface ListPanelProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const SEL_CLS =
  "text-[11px] border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-700 cursor-pointer";

function ListPanel({ selectedId, onSelect }: ListPanelProps) {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("전체");
  const [status,   setStatus]   = useState("전체");
  const [secret,   setSecret]   = useState("전체");
  const [sort,     setSort]     = useState("최신순");
  const [checked,  setChecked]  = useState<Set<number>>(new Set());
  const [menuId,   setMenuId]   = useState<number | null>(null);
  const [page,     setPage]     = useState(1);

  const allChk = checked.size === INQUIRIES.length;
  const toggleAll = () => setChecked(allChk ? new Set() : new Set(INQUIRIES.map(i => i.id)));
  const toggleOne = (id: number) =>
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div
      className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0"
      style={{ width: "42%" }}
    >
      {/* Filter bar */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="제목 / 내용 / 작성자 닉네임 검색"
              className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 placeholder-gray-300"
            />
          </div>
          <button
            className="px-3 py-1.5 text-[11px] text-white rounded-lg flex items-center gap-1.5 font-semibold flex-shrink-0"
            style={{ backgroundColor: G_DARK }}
          >
            <Search className="w-3 h-3" />검색
          </button>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <select value={category} onChange={e => setCategory(e.target.value)} className={SEL_CLS}>
            {["전체","계정·로그인","도서·도서관","게시판·콘텐츠","신고·제재","버그·오류","기타"].map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className={SEL_CLS}>
            <option>전체</option>
            <option value="PENDING">답변 대기</option>
            <option value="ANSWERED">답변 완료</option>
            <option value="DELETED">삭제됨</option>
          </select>
          <select value={secret} onChange={e => setSecret(e.target.value)} className={SEL_CLS}>
            <option>전체</option><option>공개</option><option>비밀글</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className={SEL_CLS}>
            <option>최신순</option><option>오래된순</option><option>대기우선</option>
          </select>
        </div>
      </div>

      {/* Table header */}
      <div className="bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center text-[10px] font-semibold text-gray-500 px-1 py-2">
          <div className="w-8 flex items-center justify-center flex-shrink-0">
            <input type="checkbox" checked={allChk} onChange={toggleAll} className="w-3.5 h-3.5 accent-green-800 rounded" />
          </div>
          <div className="w-11 flex-shrink-0 px-1">ID</div>
          <div className="w-[88px] flex-shrink-0 px-1">분류</div>
          <div className="flex-1 px-1">제목</div>
          <div className="w-[70px] flex-shrink-0 px-1">작성자</div>
          <div className="w-[66px] flex-shrink-0 px-1 text-center">상태</div>
          <div className="w-[68px] flex-shrink-0 px-1">접수일</div>
          <div className="w-8 flex-shrink-0" />
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {INQUIRIES.map(inq => {
          const isSel = selectedId === inq.id;
          const isPend = inq.status === "PENDING";
          return (
            <div
              key={inq.id}
              onClick={() => { onSelect(inq.id); setMenuId(null); }}
              className="relative flex items-center text-[11px] border-b border-gray-50 cursor-pointer transition-colors group"
              style={{ backgroundColor: isSel ? G_LBG : undefined }}
              onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F7FEF9"; }}
              onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.backgroundColor = ""; }}
            >
              {/* Left accent bar */}
              {(isPend || isSel) && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ backgroundColor: isSel ? "#22C55E" : "#F59E0B" }}
                />
              )}

              {/* Checkbox */}
              <div className="w-8 flex items-center justify-center flex-shrink-0 py-3">
                <input
                  type="checkbox"
                  checked={checked.has(inq.id)}
                  onChange={e => { e.stopPropagation(); toggleOne(inq.id); }}
                  className="w-3.5 h-3.5 accent-green-800 rounded"
                />
              </div>

              <div className="w-11 flex-shrink-0 px-1 text-gray-400 font-mono">#{inq.id}</div>

              <div className="w-[88px] flex-shrink-0 px-1">
                <CatBadge cat={inq.category} />
              </div>

              <div className="flex-1 px-1 text-gray-800 font-medium min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  {inq.secret       && <Lock      className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />}
                  {inq.hasAttachment && <Paperclip className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />}
                  <span className="truncate">{inq.title}</span>
                </div>
              </div>

              <div className="w-[70px] flex-shrink-0 px-1 text-gray-500 truncate">{inq.author}</div>

              <div className="w-[66px] flex-shrink-0 px-1 flex justify-center">
                <StatBadge status={inq.status} />
              </div>

              <div className="w-[68px] flex-shrink-0 px-1 text-gray-400 text-[10px]">
                {inq.createdAt.split(" ")[0]}
              </div>

              {/* ⋯ menu */}
              <div className="w-8 flex-shrink-0 flex items-center justify-center relative">
                <button
                  onClick={e => { e.stopPropagation(); setMenuId(menuId === inq.id ? null : inq.id); }}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                {menuId === inq.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-24">
                    <button className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50"
                      onClick={e => { e.stopPropagation(); onSelect(inq.id); setMenuId(null); }}>상세보기</button>
                    <button className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50"
                      onClick={e => { e.stopPropagation(); onSelect(inq.id); setMenuId(null); }}>답변하기</button>
                    <button className="w-full text-left px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50"
                      onClick={e => e.stopPropagation()}>삭제</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex-shrink-0 border-t border-gray-100 py-2.5 flex items-center justify-center gap-1">
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {[1,2,3].map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className="w-7 h-7 flex items-center justify-center rounded text-[11px] font-medium transition-colors"
            style={page === p ? { backgroundColor: G_DARK, color: "#fff" } : { color: "#6B7280" }}
          >
            {p}
          </button>
        ))}
        <span className="text-gray-300 text-xs px-0.5">…</span>
        <button
          onClick={() => setPage(10)}
          className="w-7 h-7 flex items-center justify-center rounded text-[11px] font-medium transition-colors"
          style={page === 10 ? { backgroundColor: G_DARK, color: "#fff" } : { color: "#6B7280" }}
        >
          10
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TLine({ label, time, dot, last }: { label: string; time: string; dot: string; last: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: dot }} />
        {!last && <div className="w-px flex-1 bg-gray-200 my-1 min-h-[14px]" />}
      </div>
      <div className={!last ? "pb-3" : ""}>
        <p className="text-[12px] font-medium text-gray-700">{label}</p>
        <p className="text-[10.5px] text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ inquiry }: { inquiry: Inquiry | null }) {
  const [answerText, setAnswerText] = useState("");
  const [editMode,   setEditMode]   = useState(false);
  const [editText,   setEditText]   = useState("");

  if (!inquiry) {
    return (
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-w-0">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <MessageCircle className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-[13px] text-gray-400 font-medium">왼쪽에서 문의를 선택하세요</p>
        <p className="text-[11px] text-gray-300 mt-1">선택된 문의의 상세 내용과 답변 화면이 표시됩니다</p>
      </div>
    );
  }

  const isPend = inquiry.status === "PENDING";
  const isAns  = inquiry.status === "ANSWERED";
  const isDel  = inquiry.status === "DELETED";

  const timeline = [
    { label: "접수", time: inquiry.createdAt, dot: "#22C55E" },
    ...(inquiry.answeredAt
      ? [{ label: `답변 등록 (${inquiry.answeredBy})`, time: inquiry.answeredAt, dot: "#3B82F6" }]
      : []),
  ];

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
      {/* Detail header */}
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CatBadge cat={inquiry.category} />
            <StatBadge status={inquiry.status} />
            {inquiry.secret && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                <Lock className="w-2.5 h-2.5" />비밀글
              </span>
            )}
          </div>
          {!isDel && (
            <button className="text-[11px] text-red-500 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0">
              <Trash2 className="w-3 h-3" />삭제
            </button>
          )}
        </div>
        <h2 className="text-[15px] font-bold text-gray-900 mb-3 leading-snug">{inquiry.title}</h2>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            style={{ backgroundColor: G_MED }}
          >
            {inquiry.author[0].toUpperCase()}
          </div>
          <span className="text-[12px] font-semibold text-gray-800">{inquiry.author}</span>
          <span className="text-[11px] text-gray-400">{inquiry.createdAt} 접수</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Deleted banner */}
        {isDel && (
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-[12px] text-gray-500">삭제된 문의 · 열람만 가능합니다.</p>
          </div>
        )}

        {/* Content */}
        <section>
          <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-2">문의 내용</p>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{inquiry.content}</p>
          </div>
        </section>

        {/* Attachments */}
        {inquiry.hasAttachment && (
          <section>
            <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-2">첨부 이미지</p>
            <div className="flex gap-2">
              {[1,2].map(i => (
                <div key={i} className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-dashed border-gray-200" />

        {/* Answer section */}
        <section>
          <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-3">답변</p>

          {/* ANSWERED: show card */}
          {isAns && inquiry.answer && !editMode && (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div
                className="px-4 py-3 flex items-center justify-between bg-white"
                style={{ borderLeft: `3px solid ${G_DARK}` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: G_MED }}
                  >
                    {inquiry.answeredBy?.[0]}
                  </div>
                  <span className="text-[12px] font-semibold text-gray-800">{inquiry.answeredBy}</span>
                  <span className="text-[11px] text-gray-400">{inquiry.answeredAt} 답변</span>
                </div>
                <button
                  onClick={() => { setEditMode(true); setEditText(inquiry.answer ?? ""); }}
                  className="text-[11px] text-gray-500 border border-gray-200 hover:bg-gray-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <Edit3 className="w-2.5 h-2.5" />답변 수정
                </button>
              </div>
              <div className="px-4 py-4 bg-gray-50/60">
                <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{inquiry.answer}</p>
              </div>
            </div>
          )}

          {/* PENDING or edit: textarea */}
          {(isPend || editMode) && !isDel && (
            <div>
              <textarea
                value={editMode ? editText : answerText}
                onChange={e => editMode ? setEditText(e.target.value) : setAnswerText(e.target.value)}
                placeholder="답변을 입력하세요"
                rows={6}
                className="w-full text-[13px] border border-gray-200 rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 resize-none placeholder-gray-300 leading-relaxed"
              />
              <div className="flex items-center justify-end gap-2 mt-2.5">
                {editMode && (
                  <button
                    onClick={() => setEditMode(false)}
                    className="text-[12px] text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                )}
                <button className="text-[12px] text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  <Save className="w-3 h-3" />임시저장
                </button>
                <button
                  className="text-[12px] text-white px-4 py-1.5 rounded-lg transition-opacity hover:opacity-90 flex items-center gap-1.5 font-semibold"
                  style={{ backgroundColor: G_DARK }}
                >
                  <Send className="w-3 h-3" />{editMode ? "답변 수정" : "답변 등록"}
                </button>
              </div>
            </div>
          )}

          {/* DELETED + has answer: read-only */}
          {isDel && inquiry.answer && (
            <div className="rounded-xl border border-gray-100 overflow-hidden opacity-60 pointer-events-none">
              <div className="px-4 py-3 flex items-center gap-2 bg-white" style={{ borderLeft: `3px solid ${G_DARK}` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: G_MED }}>
                  {inquiry.answeredBy?.[0]}
                </div>
                <span className="text-[12px] font-semibold text-gray-800">{inquiry.answeredBy}</span>
                <span className="text-[11px] text-gray-400">{inquiry.answeredAt} 답변</span>
              </div>
              <div className="px-4 py-4 bg-gray-50/60">
                <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{inquiry.answer}</p>
              </div>
            </div>
          )}
        </section>

        <div className="border-t border-dashed border-gray-200" />

        {/* Timeline */}
        <section>
          <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-3">처리 이력</p>
          <div>
            {timeline.map((ev, i) => (
              <TLine key={i} label={ev.label} time={ev.time} dot={ev.dot} last={i === timeline.length - 1} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminInquiriesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(1042);
  const inquiry = INQUIRIES.find(i => i.id === selectedId) ?? null;

  return (
    <div className="p-7">
      <StatsRow />
      <div className="flex gap-4 min-h-0" style={{ height: "calc(100vh - 220px)" }}>
        <ListPanel selectedId={selectedId} onSelect={setSelectedId} />
        <DetailPanel key={selectedId ?? "empty"} inquiry={inquiry} />
      </div>
    </div>
  );
}
