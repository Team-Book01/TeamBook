import { useState } from "react";
import {
  Search, ChevronDown, MoreHorizontal, X, ExternalLink,
  Flag, Eye, Trash2, ShieldAlert,
  Save, User, ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import type { Report, ReportStatus, TargetType, ReportReason } from "./reportsData";
import { REPORTS, statCards, STATUS_CFG, TARGET_CFG, REASON_CFG } from "./reportsData";

// ── Small badge components ─────────────────────────────────────────────────────
function StatusBadge({ s }: { s: ReportStatus }) {
  const c = STATUS_CFG[s];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

function TargetBadge({ t }: { t: TargetType }) {
  const c = TARGET_CFG[t];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function ReasonBadge({ r }: { r: ReportReason }) {
  const c = REASON_CFG[r];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      {r}
    </span>
  );
}

// ── Detail slide-over panel ────────────────────────────────────────────────────
function DetailPanel({ report, onClose }: { report: Report; onClose: () => void }) {
  const [panelStatus, setPanelStatus] = useState<ReportStatus>(report.status);
  const [note, setNote] = useState("");

  const log = [
    { time: "2026.07.03 14:22", action: "신고 접수",     actor: "시스템" },
    ...(report.status !== "PENDING"   ? [{ time: "2026.07.03 15:10", action: "검토 시작",     actor: "이운영" }] : []),
    ...(report.status === "RESOLVED"  ? [{ time: "2026.07.04 09:30", action: "콘텐츠 숨김 처리 후 완료", actor: "박지훈" }] : []),
    ...(report.status === "REJECTED"  ? [{ time: "2026.07.04 11:05", action: "증거 불충분 — 반려 처리", actor: "이운영" }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: "slideIn .22s cubic-bezier(.25,.46,.45,.94) both" }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <TargetBadge t={report.targetType} />
            <ReasonBadge r={report.reason} />
            <StatusBadge s={report.status} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* ID + title */}
          <div className="px-6 pt-5 pb-4">
            <div className="text-[10px] font-mono text-gray-400 mb-1">{report.id}</div>
            <h2 className="text-sm font-semibold text-gray-800 leading-snug">{report.targetTitle}</h2>
          </div>

          {/* Original content preview */}
          <div className="mx-6 mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">원본 콘텐츠</span>
              <button className="flex items-center gap-1 text-[11px] text-[#1E4B3C] hover:underline font-medium">
                <ExternalLink size={10} /> 원본 이동
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{report.detail}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-[10px] text-gray-400">
              <span>작성자: {report.reporter}</span>
              <span>·</span>
              <span>{report.reportedAt}</span>
            </div>
          </div>

          {/* Report detail */}
          <div className="px-6 mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">신고 상세 내용</div>
            <div className="text-xs text-gray-700 leading-relaxed bg-red-50 border border-red-100 rounded-xl p-3.5">
              {report.detail}
            </div>
          </div>

          {/* Reporter info */}
          <div className="px-6 mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">신고자 정보</div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User size={13} className="text-gray-500" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-700">{report.reporter}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{report.reportedAt} 신고 접수</div>
              </div>
            </div>
          </div>

          {/* Duplicate history */}
          {report.duplicateCount > 0 && (
            <div className="px-6 mb-5">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                동일 대상 누적 신고&nbsp;
                <span className="text-red-500 font-bold">+{report.duplicateCount}건</span>
              </div>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {Array.from({ length: Math.min(report.duplicateCount, 3) }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <span className="font-mono text-gray-400 text-[10px]">
                      RPT-{(Number(report.id.split("-")[1]) - i - 1).toString().padStart(4, "0")}
                    </span>
                    <ReasonBadge r={report.reason} />
                    <span className="text-gray-400 text-[10px]">2026.06.{28 - i}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action area */}
          <div className="px-6 mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">처리</div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-500 mb-1.5 block font-medium">상태 변경</label>
                <div className="relative">
                  <select
                    value={panelStatus}
                    onChange={(e) => setPanelStatus(e.target.value as ReportStatus)}
                    className="w-full appearance-none text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-[#1E4B3C]/20 focus:border-[#1E4B3C]"
                  >
                    <option value="PENDING">PENDING — 대기</option>
                    <option value="REVIEWING">REVIEWING — 검토중</option>
                    <option value="RESOLVED">RESOLVED — 처리 완료</option>
                    <option value="REJECTED">REJECTED — 반려</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 mb-1.5 block font-medium">처리 사유</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="처리 사유를 입력하세요..."
                  rows={3}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E4B3C]/20 focus:border-[#1E4B3C] placeholder-gray-300"
                />
              </div>
              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-700 text-[11px] font-semibold hover:bg-yellow-100 transition-colors">
                  <Eye size={12} /> 콘텐츠 숨김
                </button>
                <button className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-colors">
                  <Trash2 size={12} /> 콘텐츠 삭제
                </button>
                <button className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100 transition-colors">
                  <ShieldAlert size={12} /> 작성자 제재
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold transition-colors hover:opacity-90" style={{ background: "#1E4B3C" }}>
                <Save size={13} /> 처리 완료 저장
              </button>
            </div>
          </div>

          {/* Action log */}
          <div className="px-6 pb-8">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">관리자 조치 로그</div>
            <div className="space-y-0">
              {log.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: "#1E4B3C" }} />
                    {i < log.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="text-xs font-medium text-gray-700">{entry.action}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{entry.time} · {entry.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [selected, setSelected]     = useState<Report | null>(null);
  const [checked, setChecked]       = useState<Set<string>>(new Set());
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [fType, setFType]           = useState("전체");
  const [fReason, setFReason]       = useState("전체");
  const [fStatus, setFStatus]       = useState("전체");

  const allChecked = checked.size === REPORTS.length;
  const toggleAll  = () => setChecked(allChecked ? new Set() : new Set(REPORTS.map((r) => r.id)));
  const toggleOne  = (id: string) => {
    const n = new Set(checked);
    n.has(id) ? n.delete(id) : n.add(id);
    setChecked(n);
  };

  return (
    <div className="p-7">
      <div className="space-y-5">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 shadow-sm overflow-hidden"
              style={card.accent ? { borderLeft: "4px solid #f87171" } : {}}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] text-gray-400 font-medium">{card.label}</div>
                  <div className={`text-3xl font-bold mt-1 ${card.valC}`}>
                    {card.val}
                    <span className="text-sm font-medium text-gray-300 ml-1">건</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">{card.sub}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <card.icon size={17} className={card.iconC} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="신고 내용, 신고자 닉네임 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:border-[#1E4B3C] placeholder-gray-300 text-gray-700"
                style={{ "--tw-ring-color": "rgba(30,75,60,0.2)" } as React.CSSProperties}
              />
            </div>

            {/* Dropdowns */}
            {[
              { label: "대상 타입", val: fType,   set: setFType,   opts: ["전체", "게시글(POST)", "댓글(COMMENT)", "리뷰(REVIEW)", "유저(USER)"] },
              { label: "신고 사유", val: fReason, set: setFReason, opts: ["전체", "욕설·비방", "스팸", "허위정보", "음란성", "기타"] },
              { label: "상태",     val: fStatus, set: setFStatus, opts: ["전체", "PENDING", "REVIEWING", "RESOLVED", "REJECTED"] },
            ].map((f) => (
              <div key={f.label} className="relative">
                <select
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none cursor-pointer min-w-[110px]"
                >
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            ))}

            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <input type="date" defaultValue="2026-06-01" className="text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-600 focus:outline-none" />
              <span className="text-xs text-gray-300">~</span>
              <input type="date" defaultValue="2026-07-06" className="text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-600 focus:outline-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select className="appearance-none pl-3 pr-7 py-2 text-xs border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none cursor-pointer">
                <option>최신순</option>
                <option>오래된순 (대기 우선)</option>
                <option>동일 대상 신고 많은 순</option>
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ background: "#1E4B3C" }}
            >
              검색
            </button>
          </div>
        </div>

        {/* ── Report table ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag size={13} className="text-[#1E4B3C]" />
              <span className="text-sm font-semibold text-gray-700">신고 목록</span>
              <span className="text-[11px] text-gray-400 ml-1">총 {REPORTS.length}건</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter size={11} className="text-gray-300" />
              <span className="text-[11px] text-gray-400">전체 기간</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "#F9F9F9" }}>
                  <th className="pl-5 pr-3 py-3 text-left w-8">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded accent-[#1E4B3C] cursor-pointer" />
                  </th>
                  {["ID", "대상 타입", "신고 대상", "사유", "신고 상세", "신고자", "상태", "담당자", "신고일시", ""].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REPORTS.map((r) => {
                  const isPending = r.status === "PENDING";
                  const isSelected = selected?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="border-b border-gray-50 cursor-pointer transition-colors group"
                      style={{
                        boxShadow: isPending ? "inset 4px 0 0 #f87171" : undefined,
                        background: isSelected ? "#f0faf5" : undefined,
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f7fdf9"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = ""; }}
                    >
                      {/* Checkbox */}
                      <td className="pl-5 pr-3 py-3.5 w-8" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked.has(r.id)}
                          onChange={() => toggleOne(r.id)}
                          className="rounded accent-[#1E4B3C] cursor-pointer"
                        />
                      </td>
                      {/* ID */}
                      <td className="px-3 py-3.5">
                        <span className="text-[10px] font-mono text-gray-400">{r.id}</span>
                      </td>
                      {/* Target type */}
                      <td className="px-3 py-3.5">
                        <TargetBadge t={r.targetType} />
                      </td>
                      {/* Target summary */}
                      <td className="px-3 py-3.5" style={{ maxWidth: 200 }}>
                        <div className="flex items-start gap-1.5">
                          <span className="text-[11px] text-gray-700 leading-snug line-clamp-2 flex-1">{r.targetTitle}</span>
                          {r.duplicateCount > 0 && (
                            <span className="flex-shrink-0 text-[9px] font-bold bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-full whitespace-nowrap mt-0.5">
                              외 {r.duplicateCount}건
                            </span>
                          )}
                        </div>
                        <button
                          className="mt-1 text-[9px] text-[#1E4B3C] hover:underline flex items-center gap-0.5 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={8} /> 원본 이동
                        </button>
                      </td>
                      {/* Reason */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <ReasonBadge r={r.reason} />
                      </td>
                      {/* Detail truncated */}
                      <td className="px-3 py-3.5" style={{ maxWidth: 160 }}>
                        <span className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{r.detail}</span>
                      </td>
                      {/* Reporter */}
                      <td className="px-3 py-3.5">
                        <span className="text-[11px] text-gray-500 font-mono">{r.reporter}</span>
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3.5">
                        <StatusBadge s={r.status} />
                      </td>
                      {/* Handler */}
                      <td className="px-3 py-3.5">
                        <span className="text-[11px] text-gray-400">{r.handler}</span>
                      </td>
                      {/* Date */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="text-[10px] text-gray-400">{r.reportedAt}</span>
                      </td>
                      {/* Actions menu */}
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer — bulk actions + pagination */}
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
            {/* Bulk actions */}
            <div className="flex items-center gap-2">
              {checked.size > 0 && (
                <span className="text-[11px] text-gray-400 mr-1">{checked.size}건 선택</span>
              )}
              <button className="px-3 py-1.5 text-[11px] font-semibold border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors">
                검토 시작
              </button>
              <button className="px-3 py-1.5 text-[11px] font-semibold border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                처리 완료
              </button>
              <button className="px-3 py-1.5 text-[11px] font-semibold border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                반려
              </button>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg transition-colors"
                  style={page === p
                    ? { background: "#1E4B3C", color: "white" }
                    : { border: "1px solid #e5e7eb", color: "#6b7280" }
                  }
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(4, page + 1))}
                disabled={page === 4}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* bottom padding */}
        <div className="h-4" />
      </div>

      {/* ── Detail panel ─────────────────────────────────────────────────────── */}
      {selected && <DetailPanel report={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
