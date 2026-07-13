import { useState } from "react";
import {
  Search, Filter, Lock, CheckCircle, AlertCircle,
  AlertTriangle, ChevronDown, ChevronUp, Users,
  RotateCcw, XCircle, MoreHorizontal,
} from "lucide-react";
import { USERS, SAMPLE_POSTS, TABS } from "./usersData";
import type { User, Status, Role, JoinType } from "./usersData";

// ─── Badge Components ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const cfg = {
    ACTIVE: "bg-green-50 text-green-700 ring-green-200",
    SUSPENDED: "bg-red-50 text-red-600 ring-red-200",
    DELETED: "bg-gray-100 text-gray-500 ring-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ring-1 ${cfg[status]}`}>
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return role === "ADMIN" ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-700 text-white tracking-wide">
      ADMIN
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500 ring-1 ring-gray-200">
      USER
    </span>
  );
}

function JoinTypeBadge({ type }: { type: JoinType }) {
  const cfg: Record<JoinType, string> = {
    LOCAL: "bg-gray-100 text-gray-600",
    GOOGLE: "bg-blue-50 text-blue-700",
    KAKAO: "bg-yellow-50 text-yellow-700",
    NAVER: "bg-green-50 text-green-700",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-px rounded text-[10px] font-semibold ${cfg[type]}`}>
      {type}
    </span>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { label: "전체 회원", val: "12,480", sub: "+128 이번 주", subCls: "text-green-600", bgCls: "bg-blue-50", iconCls: "text-blue-500", Icon: Users },
    { label: "정상 (ACTIVE)", val: "12,051", sub: "96.6%", subCls: "text-green-600", bgCls: "bg-green-50", iconCls: "text-green-500", Icon: CheckCircle },
    { label: "이용제한 (SUSPENDED)", val: "37", sub: "0.3%", subCls: "text-amber-600", bgCls: "bg-amber-50", iconCls: "text-amber-500", Icon: AlertCircle },
    { label: "탈퇴 (DELETED)", val: "392", sub: "3.1%", subCls: "text-gray-400", bgCls: "bg-gray-50", iconCls: "text-gray-400", Icon: XCircle },
  ];
  return (
    <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
      {stats.map(({ label, val, sub, subCls, bgCls, iconCls, Icon }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-center gap-3 shadow-sm">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgCls}`}>
            <Icon size={18} className={iconCls} />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 leading-tight mb-0.5">{label}</p>
            <p className="text-[20px] font-bold text-gray-900 leading-tight">
              {val}<span className="text-[11px] font-normal text-gray-400 ml-0.5">명</span>
            </p>
            <p className={`text-[11px] font-medium ${subCls}`}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── User List Panel ──────────────────────────────────────────────────────────
function UserListPanel({
  users, selectedId, onSelect,
}: { users: User[]; selectedId: string; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u =>
    u.name.includes(search) || u.id.includes(search) || u.uid.includes(search)
  );

  return (
    <div className="w-[400px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-3 pb-2.5 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름 / 아이디로 검색"
            className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
          />
        </div>
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="text-[11px] text-gray-400">전체 {filtered.length}명</span>
          <div className="flex items-center gap-2">
            {(["ACTIVE", "SUSPENDED", "DELETED"] as Status[]).map(s => {
              const count = users.filter(u => u.status === s).length;
              const cls = s === "ACTIVE" ? "text-green-600" : s === "SUSPENDED" ? "text-red-500" : "text-gray-400";
              return (
                <span key={s} className={`text-[10px] font-semibold ${cls}`}>
                  {s} {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[1fr_60px_80px] gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <span className="text-[11px] font-semibold text-gray-400">회원</span>
        <span className="text-[11px] font-semibold text-gray-400 text-center">권한</span>
        <span className="text-[11px] font-semibold text-gray-400 text-right">상태</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(u => {
          const isSelected = u.id === selectedId;
          return (
            <button
              key={u.id}
              onClick={() => onSelect(u.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-50 transition-all duration-100 ${
                isSelected
                  ? "bg-emerald-50/70"
                  : "hover:bg-gray-50"
              }`}
              style={isSelected ? { borderLeft: "3px solid #2D9B56" } : { borderLeft: "3px solid transparent" }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ background: u.status === "DELETED" ? "#9CA3AF" : u.color }}
              >
                {u.initial}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-semibold leading-tight truncate ${
                  u.status === "DELETED" ? "text-gray-400 line-through decoration-gray-300" : "text-gray-800"
                }`}>
                  {u.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-400">{u.id}</span>
                  <span className="text-gray-300 text-[10px]">·</span>
                  <JoinTypeBadge type={u.joinType} />
                </div>
              </div>
              {/* Role */}
              <div className="w-[60px] flex justify-center">
                <RoleBadge role={u.role} />
              </div>
              {/* Status */}
              <div className="w-[80px] flex justify-end">
                <StatusBadge status={u.status} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Active Level ─────────────────────────────────────────────────────────────
function activeLevel(u: User): "clean" | "caution" | "warning" {
  if (u.warnings >= 3) return "warning";
  if (u.warnings >= 1 || u.reports >= 1) return "caution";
  return "clean";
}

// ─── Status Summary Blocks ────────────────────────────────────────────────────
function ActiveSummaryBlock({ user }: { user: User }) {
  const level = activeLevel(user);

  if (level === "clean") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4" style={{ borderLeft: "4px solid #16A34A" }}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={15} className="text-green-600" />
          <span className="text-[13px] font-bold text-green-800">이상 없음</span>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
          {[
            { label: "받은 신고", value: `${user.reports}건` },
            { label: "누적 경고", value: `${user.warnings}회` },
            { label: "상태 변경 이력", value: "없음" },
            { label: "최근 로그인", value: user.lastLogin },
          ].map(item => (
            <div key={item.label} className="bg-white/75 rounded-lg px-3 py-2">
              <p className="text-[10px] text-green-700/70 mb-0.5">{item.label}</p>
              <p className="text-[13px] font-bold text-green-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (level === "caution") {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" style={{ borderLeft: "4px solid #9CA3AF" }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={15} className="text-gray-500" />
          <span className="text-[13px] font-bold text-gray-700">주의 이력 있음</span>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
          {[
            { label: "받은 신고", value: `${user.reports}건` },
            { label: "누적 경고", value: `${user.warnings}회` },
            { label: "최근 로그인", value: user.lastLogin },
          ].map(item => (
            <div key={item.label} className="bg-white/80 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
              <p className="text-[13px] font-bold text-gray-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // warning ≥ 3
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4" style={{ borderLeft: "4px solid #D97706" }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={15} className="text-amber-600" />
        <span className="text-[13px] font-bold text-amber-800">경고 임계 근접</span>
        <span className="ml-auto text-[11px] text-amber-600 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
          경고 {user.warnings}회 / 임계 3회
        </span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        {[
          { label: "받은 신고", value: `${user.reports}건` },
          { label: "PENDING 신고", value: `${user.reportsPending}건` },
          { label: "누적 경고", value: `${user.warnings}회` },
          { label: "최근 로그인", value: user.lastLogin },
        ].map(item => (
          <div key={item.label} className="bg-white/80 rounded-lg px-3 py-2">
            <p className="text-[10px] text-amber-600/80 mb-0.5">{item.label}</p>
            <p className="text-[13px] font-bold text-amber-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuspendedSummaryBlock({ user }: { user: User }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4" style={{ borderLeft: "4px solid #DC2626" }}>
      <div className="flex items-center gap-2 mb-3">
        <XCircle size={15} className="text-red-600" />
        <span className="text-[13px] font-bold text-red-800">즉시 검토 필요</span>
        <span className="ml-auto text-[11px] text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">SUSPENDED</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        {/* Hero metric: reports */}
        <div className="bg-white/80 rounded-lg px-3 py-2 col-span-1">
          <p className="text-[10px] text-red-500 mb-0.5">받은 신고 / PENDING</p>
          <p className="text-[22px] font-extrabold text-red-700 leading-tight">{user.reports}건</p>
          <p className="text-[11px] text-red-400 font-medium">PENDING {user.reportsPending}건</p>
        </div>
        <div className="bg-white/80 rounded-lg px-3 py-2">
          <p className="text-[10px] text-red-500 mb-0.5">누적 경고</p>
          <p className="text-[22px] font-extrabold text-red-700 leading-tight">{user.warnings}회</p>
        </div>
        <div className="bg-white/80 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400 mb-0.5">현재 상태</p>
          <p className="text-[13px] font-bold text-red-700">SUSPENDED</p>
          <p className="text-[11px] text-gray-400">{user.suspendedDate} 제한</p>
        </div>
        <div className="bg-white/80 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400 mb-0.5">마지막 로그인</p>
          <p className="text-[13px] font-bold text-gray-600">{user.lastLogin}</p>
        </div>
      </div>
    </div>
  );
}

function calcRetentionDate(deletedDate: string): string {
  const [y, m, d] = deletedDate.split(".").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 90);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

function DeletedSummaryBlock({ user }: { user: User }) {
  const retentionDate = user.deletedDate ? calcRetentionDate(user.deletedDate) : "—";
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" style={{ borderLeft: "4px solid #9CA3AF" }}>
      <div className="flex items-center gap-2 mb-3">
        <XCircle size={15} className="text-gray-400" />
        <span className="text-[13px] font-bold text-gray-500">탈퇴한 계정 · 조치 불가</span>
        <span className="ml-auto text-[11px] text-gray-500 font-semibold bg-gray-200 px-2 py-0.5 rounded-full">DELETED</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        {[
          { label: "탈퇴 유형", value: user.deletedBy === "admin" ? "관리자 삭제" : "본인 요청 탈퇴" },
          { label: "탈퇴일", value: user.deletedDate ?? "—" },
          { label: "데이터 보관 기한", value: `~${retentionDate}` },
          { label: "보관 상태", value: user.withinRetention ? "유예기간 내" : "유예기간 경과" },
        ].map(item => (
          <div key={item.label} className="bg-white/80 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
            <p className="text-[13px] font-semibold text-gray-500">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-2.5 pl-0.5">
        {user.withinRetention
          ? `데이터 보관 ${retentionDate}까지 · 이후 영구 삭제`
          : "영구 삭제 예정 · 열람만 가능"}
      </p>
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────
function ActionButtons({ user, onAdminModal }: { user: User; onAdminModal: () => void }) {
  if (user.status === "ACTIVE") {
    return (
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-amber-400 hover:bg-amber-500 text-white transition-colors shadow-sm">
          이용제한
        </button>
        <button
          onClick={() => user.role === "ADMIN" ? onAdminModal() : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
        >
          {user.role === "ADMIN" && <Lock size={11} strokeWidth={2.5} />}
          강제탈퇴
        </button>
      </div>
    );
  }

  if (user.status === "SUSPENDED") {
    return (
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm">
          제한해제
        </button>
        <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm">
          강제탈퇴
        </button>
      </div>
    );
  }

  // DELETED
  if (user.withinRetention) {
    return (
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">
        <RotateCcw size={12} strokeWidth={2.5} />
        계정 복구
      </button>
    );
  }

  return (
    <span className="text-[11px] text-gray-400 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
      영구 삭제 예정 · 열람만 가능
    </span>
  );
}

// ─── Activity Metrics Grid ────────────────────────────────────────────────────
function ActivityMetricsGrid({ user, muted = false }: { user: User; muted?: boolean }) {
  const metrics = [
    { label: "작성 게시글", value: user.posts },
    { label: "작성 리뷰", value: user.reviews },
    { label: "작성 댓글", value: user.comments },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map(({ label, value }) => (
        <div
          key={label}
          className={`bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm transition-opacity ${muted ? "opacity-50" : ""}`}
        >
          <p className="text-[11px] text-gray-400 mb-1">{label}</p>
          <p className={`text-[22px] font-bold leading-tight ${muted ? "text-gray-400" : "text-gray-800"}`}>
            {value}
            <span className="text-[11px] font-normal ml-0.5 text-gray-400">건</span>
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Tab Section ──────────────────────────────────────────────────────────────
function TabSection({ activeTab, setActiveTab, user }: {
  activeTab: string; setActiveTab: (t: string) => void; user: User;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap border-b-2 transition-all duration-150 ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/60"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.showCount && user.reports > 0 && (
              <span className="px-1.5 py-px bg-red-500 text-white rounded-full text-[9px] font-bold leading-none">
                {user.reports}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table header row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 bg-gray-50/50">
        <span className="text-[11px] text-gray-400">총 {user.posts}건</span>
        <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
          <Filter size={11} />
          필터
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {["카테고리", "제목", "조회", "댓글", "좋아요", "상태", "작성일"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="px-3 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {SAMPLE_POSTS.map((p, i) => (
              <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/80 transition-colors">
                <td className="px-3 py-2.5">
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">
                    {p.category}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[12px] text-gray-700 max-w-[220px] truncate">{p.title}</td>
                <td className="px-3 py-2.5 text-[12px] text-gray-500">{p.views.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-[12px] text-gray-500">{p.comments}</td>
                <td className="px-3 py-2.5 text-[12px] text-gray-500">{p.likes}</td>
                <td className="px-3 py-2.5">
                  {p.status === "HIDDEN" ? (
                    <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-semibold rounded">HIDDEN</span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded">ACTIVE</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-[11px] text-gray-400 whitespace-nowrap">{p.date}</td>
                <td className="px-3 py-2.5">
                  <button className="text-gray-300 hover:text-gray-500 transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Admin Guard Modal ────────────────────────────────────────────────────────
function AdminGuardModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">관리자 계정 강제탈퇴</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">오조작 방지를 위한 추가 확인</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-3.5 mb-4">
          <p className="text-[12px] text-red-700 leading-relaxed">
            <span className="font-bold">{user.name}</span>은(는) 관리자(ADMIN) 계정입니다.
            강제탈퇴 시 관리자 권한이 즉시 회수되며, 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button className="px-4 py-2 rounded-lg text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">
            강제탈퇴 확인
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────
function UserDetailPanel({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const isDeleted = user.status === "DELETED";
  const isSuspended = user.status === "SUSPENDED";
  const isActive = user.status === "ACTIVE";

  const activityLine = isDeleted ? (
    <p className="text-[12px] text-gray-400 px-0.5">
      마지막 활동 기록: {user.lastLogin}
    </p>
  ) : isSuspended ? (
    <p className="text-[12px] text-gray-600 px-0.5">
      최근 30일간 누적 신고{" "}
      <span className="font-bold text-red-600">{user.reports}건</span> ·
      경고{" "}
      <span className="font-bold text-red-600">{user.warnings}회</span> 누적. 현재 이용 제한 상태.
    </p>
  ) : (
    <p className="text-[12px] text-gray-500 px-0.5">
      최근 30일간 게시글{" "}
      <span className="font-semibold text-gray-700">{Math.min(user.posts, 4)}건</span> ·
      댓글{" "}
      <span className="font-semibold text-gray-700">{Math.min(user.comments, 12)}건</span>{" "}
      작성 중.
    </p>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] p-4 space-y-3 min-w-0">
      {/* ① Member Header */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-white text-[16px] font-bold flex-shrink-0 shadow-sm"
              style={{ background: isDeleted ? "#9CA3AF" : user.color }}
            >
              {user.initial}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[16px] font-bold leading-tight ${isDeleted ? "text-gray-400" : "text-gray-900"}`}>
                  {user.name}
                </span>
                <StatusBadge status={user.status} />
                <RoleBadge role={user.role} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-tight">
                #{user.uid} · {user.joinType === "LOCAL" ? "이메일" : user.joinType} 가입 · {user.joinDate} 가입
              </p>
            </div>
          </div>
          <ActionButtons user={user} onAdminModal={() => setShowAdminModal(true)} />
        </div>
      </div>

      {/* ② Status Summary Block */}
      {isActive && <ActiveSummaryBlock user={user} />}
      {isSuspended && <SuspendedSummaryBlock user={user} />}
      {isDeleted && <DeletedSummaryBlock user={user} />}

      {/* ③ Activity Summary Line */}
      {activityLine}

      {/* ④ Activity Metrics — accordion for DELETED, plain for others */}
      {isDeleted ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setAccordionOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span>보관된 활동 내역</span>
            {accordionOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </button>
          {accordionOpen && (
            <div className="px-4 pb-4 space-y-2.5">
              <ActivityMetricsGrid user={user} muted />
              <p className="text-[11px] text-gray-400 px-0.5">
                좋아요 {user.likes} · 스크랩 {user.scraps} · 평균 별점 {user.avgRating} · 북마크 {user.bookmarks}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <ActivityMetricsGrid user={user} />
          {/* ⑤ Contribution line */}
          <p className="text-[11px] text-gray-400 px-0.5">
            좋아요 {user.likes} · 스크랩 {user.scraps} · 평균 별점 {user.avgRating} · 북마크 {user.bookmarks}
          </p>
        </>
      )}

      {/* ⑥ Tabs + Table */}
      <TabSection activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      {/* Admin Guard Modal */}
      {showAdminModal && <AdminGuardModal user={user} onClose={() => setShowAdminModal(false)} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [selectedId, setSelectedId] = useState(USERS[0].id);
  const selectedUser = USERS.find(u => u.id === selectedId) ?? USERS[0];

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <div className="flex flex-col" style={{ minWidth: 1200, fontFamily: "'Noto Sans KR', sans-serif" }}>
          <StatsBar />
          <div className="flex overflow-hidden rounded-b-xl border border-t-0 border-gray-200" style={{ height: "calc(100vh - 220px)" }}>
            <UserListPanel
              users={USERS}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <UserDetailPanel user={selectedUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
