import { useState } from "react";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Check,
  Star,
  Eye,
  EyeOff,
  Trash2,
  User,
  ChevronDown,
  Image as ImageIcon,
  MessageCircle,
  ThumbsUp,
  Flag,
  Clock,
} from "lucide-react";
import { TABS, POSTS, COMMENTS, REVIEWS } from "./contentData";
import type { Post } from "./contentData";

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    추천: "bg-green-50 text-green-700 border border-green-200",
    리뷰: "bg-blue-50 text-blue-700 border border-blue-200",
    자유: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[category] || styles["자유"]}`}>
      {category}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700 border border-green-200",
    HIDDEN: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    DELETED: "bg-red-50 text-red-700 border border-red-200",
  };
  const labels: Record<string, string> = { ACTIVE: "ACTIVE", HIDDEN: "HIDDEN", DELETED: "DELETED" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rating ? "fill-green-600 text-green-600" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === POSTS.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(POSTS.map((p) => p.id)));
  };

  return (
    <div
      className="p-6"
      style={{ fontFamily: "'Noto Sans KR', sans-serif", background: "#FAF8F3" }}
      onClick={() => setShowDropdown(null)}
    >
      <div className="overflow-x-auto">
        <div className="space-y-5" style={{ minWidth: 900 }}>
          {/* ── TABS ── */}
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "text-white"
                    : "hover:bg-white/60"
                }`}
                style={
                  activeTab === tab.id
                    ? { background: "#1A4535" }
                    : { color: "#777" }
                }
              >
                {tab.label}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "전체 게시글",
                value: "14,320",
                unit: "건",
                sub: "+47 오늘",
                subColor: "#6B9B7A",
                icon: FileText,
                iconBg: "#EDF7F1",
                iconColor: "#2A7A52",
              },
              {
                label: "공개 (ACTIVE)",
                value: "13,891",
                unit: "건",
                sub: "97.0%",
                subColor: "#6B9B7A",
                icon: Eye,
                iconBg: "#EDF7F1",
                iconColor: "#2A7A52",
              },
              {
                label: "숨김 / 삭제",
                value: "429",
                unit: "건",
                sub: "3.0%",
                subColor: "#B0966B",
                icon: EyeOff,
                iconBg: "#FEF9EE",
                iconColor: "#B7791F",
              },
              {
                label: "신고 누적 게시글",
                value: "12",
                unit: "건",
                sub: "즉시 검토 필요",
                subColor: "#C0392B",
                icon: Flag,
                iconBg: "#FEF0EE",
                iconColor: "#C0392B",
                alert: true,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-5 border"
                style={{
                  borderColor: card.alert ? "#F5C6C1" : "rgba(0,0,0,0.07)",
                  boxShadow: card.alert
                    ? "0 2px 12px rgba(192,57,43,0.08)"
                    : "0 2px 10px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium" style={{ color: "#9B9B9B" }}>
                    {card.label}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: card.iconBg }}
                  >
                    <card.icon size={16} style={{ color: card.iconColor }} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: card.alert ? "#C0392B" : "#1A1A1A" }}
                  >
                    {card.value}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "#9B9B9B" }}>
                    {card.unit}
                  </span>
                </div>
                <div className="text-xs mt-1 font-medium" style={{ color: card.subColor }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── FILTER BAR ── */}
          <div
            className="bg-white rounded-2xl border px-5 py-4"
            style={{ borderColor: "rgba(0,0,0,0.07)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9B9B9B" }} />
                <input
                  type="text"
                  placeholder="제목 / 내용 / 작성자 닉네임 검색"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border outline-none"
                  style={{
                    borderColor: "rgba(0,0,0,0.12)",
                    background: "#FAFAFA",
                    color: "#333",
                  }}
                />
              </div>

              {/* Dropdowns */}
              {[
                { label: "카테고리", options: ["전체", "추천 RECOMMEND", "리뷰 REVIEW", "자유 FREE"] },
                { label: "상태", options: ["전체", "ACTIVE", "HIDDEN", "DELETED"] },
                { label: "정렬", options: ["최신순", "조회수순", "신고 많은 순"] },
              ].map((sel) => (
                <div key={sel.label} className="relative">
                  <select
                    className="appearance-none pl-3 pr-7 py-2 text-sm rounded-xl border outline-none cursor-pointer"
                    style={{
                      borderColor: "rgba(0,0,0,0.12)",
                      background: "#FAFAFA",
                      color: "#333",
                    }}
                  >
                    {sel.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#9B9B9B" }}
                  />
                </div>
              ))}

              {/* Date range */}
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  defaultValue="2026-07-01"
                  className="text-sm px-3 py-2 rounded-xl border outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.12)", background: "#FAFAFA", color: "#333" }}
                />
                <span className="text-xs" style={{ color: "#9B9B9B" }}>~</span>
                <input
                  type="date"
                  defaultValue="2026-07-06"
                  className="text-sm px-3 py-2 rounded-xl border outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.12)", background: "#FAFAFA", color: "#333" }}
                />
              </div>

              {/* Search button */}
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#1A4535" }}
              >
                <Search size={13} />
                검색
              </button>
            </div>
          </div>

          {/* ── MAIN CONTENT (Table + Detail Panel) ── */}
          <div className="flex gap-5 items-start">
            {/* TABLE CARD */}
            <div
              className="flex-1 min-w-0 bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: "rgba(0,0,0,0.07)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
            >
              {/* ─ POSTS TAB ─ */}
              {activeTab === "posts" && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#FAFAF8" }}>
                          <th className="px-4 py-3 w-9">
                            <input
                              type="checkbox"
                              checked={selectedRows.size === POSTS.length}
                              onChange={toggleAll}
                              className="accent-green-700 rounded"
                            />
                          </th>
                          {["ID", "카테고리", "제목", "작성자", "조회", "댓글", "좋아요", "상태", "작성일시", ""].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-3 text-xs font-semibold text-left whitespace-nowrap"
                              style={{ color: "#9B9B9B" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {POSTS.map((post) => (
                          <tr
                            key={post.id}
                            className="cursor-pointer transition-colors"
                            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "rgba(26,69,53,0.04)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                            onClick={() => setSelectedPost(post)}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedRows.has(post.id)}
                                onChange={() => toggleRow(post.id)}
                                className="accent-green-700"
                              />
                            </td>
                            <td
                              className="px-3 py-3 text-xs font-mono font-bold"
                              style={{ color: "#9B9B9B" }}
                            >
                              #{post.id}
                            </td>
                            <td className="px-3 py-3">
                              <CategoryBadge category={post.category} />
                            </td>
                            <td className="px-3 py-3 max-w-xs">
                              <div className="flex items-center gap-2">
                                {post.thumbnail && (
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: "#EDF7F1" }}
                                  >
                                    <ImageIcon size={12} style={{ color: "#2A7A52" }} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div
                                    className="text-sm font-medium truncate max-w-[240px]"
                                    style={{ color: "#1A1A1A" }}
                                  >
                                    {post.title}
                                  </div>
                                  {post.certified && (
                                    <span className="inline-flex items-center gap-0.5 text-xs mt-0.5" style={{ color: "#2A7A52" }}>
                                      <Check size={10} />
                                      도서 인증
                                    </span>
                                  )}
                                  {post.flagged && (
                                    <span className="inline-flex items-center gap-0.5 text-xs mt-0.5 ml-1" style={{ color: "#C0392B" }}>
                                      <Flag size={10} />
                                      신고
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs font-medium" style={{ color: "#555" }}>
                              {post.author}
                            </td>
                            <td className="px-3 py-3 text-xs font-bold" style={{ color: "#333" }}>
                              {post.views.toLocaleString()}
                            </td>
                            <td className="px-3 py-3 text-xs font-bold" style={{ color: "#333" }}>
                              {post.comments}
                            </td>
                            <td className="px-3 py-3 text-xs font-bold" style={{ color: "#333" }}>
                              {post.likes}
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={post.status} />
                            </td>
                            <td
                              className="px-3 py-3 text-xs whitespace-nowrap"
                              style={{ color: "#9B9B9B" }}
                            >
                              {post.date}
                            </td>
                            <td
                              className="px-3 py-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="relative">
                                <button
                                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDropdown(showDropdown === post.id ? null : post.id);
                                  }}
                                >
                                  <MoreHorizontal size={15} style={{ color: "#9B9B9B" }} />
                                </button>
                                {showDropdown === post.id && (
                                  <div
                                    className="absolute right-0 top-8 w-40 bg-white rounded-xl border shadow-xl z-20"
                                    style={{ borderColor: "rgba(0,0,0,0.1)" }}
                                  >
                                    {[
                                      { label: "상세보기", icon: Eye, color: "#333" },
                                      { label: "숨김 처리", icon: EyeOff, color: "#B7791F" },
                                      { label: "삭제", icon: Trash2, color: "#C0392B" },
                                      { label: "작성자 보기", icon: User, color: "#333" },
                                    ].map(({ label, icon: Icon, color }) => (
                                      <button
                                        key={label}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                                        style={{ color }}
                                      >
                                        <Icon size={13} />
                                        {label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ─ COMMENTS TAB ─ */}
              {activeTab === "comments" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#FAFAF8" }}>
                        {["ID", "원글 제목", "댓글 내용", "대댓글", "작성자", "좋아요", "상태", "작성일시", ""].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-xs font-semibold text-left whitespace-nowrap"
                            style={{ color: "#9B9B9B" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMMENTS.map((c) => (
                        <tr
                          key={c.id}
                          className="transition-colors"
                          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,69,53,0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: "#9B9B9B" }}>#{c.id}</td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <span className="text-xs truncate block text-blue-600 underline cursor-pointer">{c.postTitle}</span>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <span className="text-sm truncate block" style={{ color: "#1A1A1A", maxWidth: 280 }}>
                              {c.content}
                            </span>
                            {c.flagged && (
                              <span className="inline-flex items-center gap-0.5 text-xs mt-0.5" style={{ color: "#C0392B" }}>
                                <Flag size={10} />신고
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {c.isReply && <span className="text-xs" style={{ color: "#9B9B9B" }}>└</span>}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium" style={{ color: "#555" }}>{c.author}</td>
                          <td className="px-4 py-3 text-xs font-bold" style={{ color: "#333" }}>{c.likes}</td>
                          <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9B9B9B" }}>{c.date}</td>
                          <td className="px-3 py-3">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100"><MoreHorizontal size={15} style={{ color: "#9B9B9B" }} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─ REVIEWS TAB ─ */}
              {activeTab === "reviews" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#FAFAF8" }}>
                        {["ID", "도서", "별점", "리뷰 내용", "작성자", "좋아요", "상태", "작성일시", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold text-left whitespace-nowrap" style={{ color: "#9B9B9B" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {REVIEWS.map((r) => (
                        <tr
                          key={r.id}
                          className="transition-colors"
                          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,69,53,0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: "#9B9B9B" }}>#{r.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-12 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: "#EDF7F1" }}>
                                {r.cover}
                              </div>
                              <div>
                                <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{r.book}</div>
                                <div className="text-xs" style={{ color: "#9B9B9B" }}>{r.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StarRating rating={r.rating} /></td>
                          <td className="px-4 py-3 max-w-xs">
                            <span className="text-sm" style={{ color: "#555" }}>{r.content}</span>
                            {r.flagged && <span className="inline-flex items-center gap-0.5 text-xs ml-1" style={{ color: "#C0392B" }}><Flag size={10} />신고</span>}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium" style={{ color: "#555" }}>{r.reviewer}</td>
                          <td className="px-4 py-3 text-xs font-bold" style={{ color: "#333" }}>{r.likes}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9B9B9B" }}>{r.date}</td>
                          <td className="px-3 py-3">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100"><MoreHorizontal size={15} style={{ color: "#9B9B9B" }} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
              >
                {/* Bulk actions */}
                <div className="flex items-center gap-2">
                  {selectedRows.size > 0 && (
                    <span className="text-xs font-medium mr-1" style={{ color: "#555" }}>
                      {selectedRows.size}개 선택됨
                    </span>
                  )}
                  <button
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:bg-yellow-50"
                    style={{ borderColor: "#D69E2E", color: "#D69E2E" }}
                  >
                    숨김 처리
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:bg-red-50"
                    style={{ borderColor: "#C0392B", color: "#C0392B" }}
                  >
                    삭제
                  </button>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                    style={{ color: "#9B9B9B" }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {[1, 2, 3, "…", 10].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => typeof p === "number" && setCurrentPage(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                      style={
                        currentPage === p
                          ? { background: "#1A4535", color: "#fff" }
                          : { color: "#555", cursor: typeof p === "number" ? "pointer" : "default" }
                      }
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                    style={{ color: "#9B9B9B" }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── DETAIL PANEL ── */}
            {selectedPost && (
              <div
                className="w-80 shrink-0 bg-white rounded-2xl border overflow-hidden"
                style={{
                  borderColor: "rgba(0,0,0,0.07)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                {/* Panel header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "rgba(0,0,0,0.07)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                    게시글 상세
                  </span>
                  <button
                    className="p-1 rounded-lg hover:bg-gray-100"
                    onClick={() => setSelectedPost(null)}
                  >
                    <X size={15} style={{ color: "#9B9B9B" }} />
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
                  {/* Category + Status */}
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={selectedPost.category} />
                    <StatusBadge status={selectedPost.status} />
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-bold leading-snug" style={{ color: "#1A1A1A" }}>
                      {selectedPost.title}
                    </h3>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "#FAFAF8" }}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "#1A4535" }}
                    >
                      {selectedPost.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                        {selectedPost.author}
                      </div>
                      <div className="text-xs" style={{ color: "#9B9B9B" }}>
                        {selectedPost.date}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Eye, label: "조회", value: selectedPost.views.toLocaleString() },
                      { icon: MessageCircle, label: "댓글", value: selectedPost.comments },
                      { icon: ThumbsUp, label: "좋아요", value: selectedPost.likes },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1 p-2.5 rounded-xl"
                        style={{ background: "#F5F5F0" }}
                      >
                        <Icon size={13} style={{ color: "#9B9B9B" }} />
                        <span className="text-xs font-medium" style={{ color: "#9B9B9B" }}>{label}</span>
                        <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Book certification */}
                  {selectedPost.certified && (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ background: "#EDF7F1", borderColor: "#A8D5B7" }}
                    >
                      <div
                        className="w-10 h-13 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background: "#C6E8D1" }}
                      >
                        📖
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: "#1A4535" }}>
                          도서 인증 완료
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#4A7A5A" }}>
                          OCR 인증 · 2026.07.06
                        </div>
                      </div>
                      <Check size={14} className="ml-auto" style={{ color: "#2A7A52" }} />
                    </div>
                  )}

                  {/* Content preview */}
                  <div>
                    <div className="text-xs font-semibold mb-1.5" style={{ color: "#9B9B9B" }}>본문 미리보기</div>
                    <p className="text-xs leading-relaxed p-3 rounded-xl" style={{ color: "#555", background: "#FAFAF8" }}>
                      이 게시글은 "{selectedPost.title}" 라는 제목으로 작성되었습니다. 한국 독서 커뮤니티 파노라마북스에서 독자들과 함께 책 이야기를 나누는 공간입니다. 더 많은 내용은 상세보기를 통해 확인하실 수 있습니다...
                    </p>
                  </div>

                  {/* Image thumbnails */}
                  {selectedPost.thumbnail && (
                    <div>
                      <div className="text-xs font-semibold mb-1.5" style={{ color: "#9B9B9B" }}>첨부 이미지</div>
                      <div className="flex gap-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                            style={{ background: "#EDF7F1" }}
                          >
                            <ImageIcon size={18} style={{ color: "#A8D5B7" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Report history */}
                  {selectedPost.flagged && (
                    <div
                      className="p-3 rounded-xl border"
                      style={{ background: "#FEF0EE", borderColor: "#F5C6C1" }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Flag size={12} style={{ color: "#C0392B" }} />
                        <span className="text-xs font-bold" style={{ color: "#C0392B" }}>신고 이력</span>
                      </div>
                      {[
                        { type: "욕설/비방", count: 2, time: "1시간 전" },
                        { type: "허위정보", count: 1, time: "3시간 전" },
                      ].map((rep) => (
                        <div key={rep.type} className="flex items-center justify-between text-xs py-1">
                          <span
                            className="px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "#FECACA", color: "#C0392B" }}
                          >
                            {rep.type}
                          </span>
                          <span style={{ color: "#888" }}>{rep.count}건 · {rep.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel actions */}
                <div
                  className="p-4 space-y-2 border-t"
                  style={{ borderColor: "rgba(0,0,0,0.07)" }}
                >
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-yellow-50"
                      style={{ borderColor: "#D69E2E", color: "#D69E2E" }}
                    >
                      숨김 처리
                    </button>
                    <button
                      className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-red-50"
                      style={{ borderColor: "#C0392B", color: "#C0392B" }}
                    >
                      삭제
                    </button>
                  </div>
                  <button
                    className="w-full py-2 rounded-xl text-sm font-medium border transition-all hover:bg-gray-50 flex items-center justify-center gap-1.5"
                    style={{ borderColor: "rgba(0,0,0,0.12)", color: "#555" }}
                  >
                    <Clock size={13} />
                    관리 로그 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
