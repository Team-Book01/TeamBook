import { useState } from "react";
import {
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
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TABS, POSTS, COMMENTS, REVIEWS } from "./contentData";
import type { Post } from "./contentData";

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    추천: "bg-green-50 text-green-700 border border-green-200",
    리뷰: "bg-blue-50 text-blue-700 border border-blue-200",
    자유: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", styles[category] || styles["자유"])}>
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
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", styles[status])}>
      {status}
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
          className={s <= rating ? "fill-admin-point text-admin-point" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

// 통계 카드 정의 — 브랜드 그린은 admin 토큰, 경고/위험은 의미색
const STAT_CARDS = [
  { label: "전체 게시글", value: "14,320", unit: "건", sub: "+47 오늘", subCls: "text-admin-point", icon: null, iconBg: "bg-admin-light", iconCls: "text-admin-point", type: "posts" as const },
  { label: "공개 (ACTIVE)", value: "13,891", unit: "건", sub: "97.0%", subCls: "text-admin-point", iconBg: "bg-admin-light", iconCls: "text-admin-point", type: "active" as const },
  { label: "숨김 / 삭제", value: "429", unit: "건", sub: "3.0%", subCls: "text-amber-600", iconBg: "bg-amber-50", iconCls: "text-amber-700", type: "hidden" as const },
  { label: "신고 누적 게시글", value: "12", unit: "건", sub: "즉시 검토 필요", subCls: "text-red-600", iconBg: "bg-red-50", iconCls: "text-red-600", type: "flagged" as const },
];

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

  const statIcon = (type: string) => {
    switch (type) {
      case "active": return Eye;
      case "hidden": return EyeOff;
      case "flagged": return Flag;
      default: return BookOpen;
    }
  };

  return (
    <div className="p-6" onClick={() => setShowDropdown(null)}>
      <div className="overflow-x-auto">
        <div className="space-y-5 min-w-[900px]">
          {/* ── TABS ── */}
          <div className="flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    isActive ? "bg-admin text-white" : "text-muted-foreground hover:bg-white/60",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => {
              const Icon = statIcon(card.type);
              const alert = card.type === "flagged";
              return (
                <div
                  key={card.label}
                  className={cn(
                    "bg-white rounded-2xl p-5 border shadow-sm",
                    alert ? "border-red-200 shadow-[0_2px_12px_rgba(192,57,43,0.08)]" : "border-border",
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.iconBg)}>
                      <Icon size={16} className={card.iconCls} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-bold", alert ? "text-red-600" : "text-foreground")}>
                      {card.value}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">{card.unit}</span>
                  </div>
                  <div className={cn("text-xs mt-1 font-medium", card.subCls)}>{card.sub}</div>
                </div>
              );
            })}
          </div>

          {/* ── FILTER BAR ── */}
          <div className="bg-white rounded-2xl border border-border px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="제목 / 내용 / 작성자 닉네임 검색"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none focus:border-admin"
                />
              </div>

              {/* Dropdowns */}
              {[
                { label: "카테고리", options: ["전체", "추천 RECOMMEND", "리뷰 REVIEW", "자유 FREE"] },
                { label: "상태", options: ["전체", "ACTIVE", "HIDDEN", "DELETED"] },
                { label: "정렬", options: ["최신순", "조회수순", "신고 많은 순"] },
              ].map((sel) => (
                <div key={sel.label} className="relative">
                  <select className="appearance-none pl-3 pr-7 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none cursor-pointer focus:border-admin">
                    {sel.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              ))}

              {/* Date range */}
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  defaultValue="2026-07-01"
                  className="text-sm px-3 py-2 rounded-xl border border-border bg-gray-50 text-foreground outline-none focus:border-admin"
                />
                <span className="text-xs text-muted-foreground">~</span>
                <input
                  type="date"
                  defaultValue="2026-07-06"
                  className="text-sm px-3 py-2 rounded-xl border border-border bg-gray-50 text-foreground outline-none focus:border-admin"
                />
              </div>

              {/* Search button */}
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-admin hover:bg-admin-hover transition-colors">
                <Search size={13} />
                검색
              </button>
            </div>
          </div>

          {/* ── MAIN CONTENT (Table + Detail Panel) ── */}
          <div className="flex gap-5 items-start">
            {/* TABLE CARD */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* ─ POSTS TAB ─ */}
              {activeTab === "posts" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        <th className="px-4 py-3 w-9">
                          <input
                            type="checkbox"
                            checked={selectedRows.size === POSTS.length}
                            onChange={toggleAll}
                            className="accent-admin rounded"
                          />
                        </th>
                        {["ID", "카테고리", "제목", "작성자", "조회", "댓글", "좋아요", "상태", "작성일시", ""].map((h) => (
                          <th key={h} className="px-3 py-3 text-xs font-semibold text-left whitespace-nowrap text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {POSTS.map((post) => (
                        <tr
                          key={post.id}
                          className="cursor-pointer border-b border-gray-100 hover:bg-admin/5 transition-colors"
                          onClick={() => setSelectedPost(post)}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(post.id)}
                              onChange={() => toggleRow(post.id)}
                              className="accent-admin"
                            />
                          </td>
                          <td className="px-3 py-3 text-xs font-mono font-bold text-muted-foreground">#{post.id}</td>
                          <td className="px-3 py-3">
                            <CategoryBadge category={post.category} />
                          </td>
                          <td className="px-3 py-3 max-w-xs">
                            <div className="flex items-center gap-2">
                              {post.thumbnail && (
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-admin-light">
                                  <ImageIcon size={12} className="text-admin-point" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate max-w-[240px] text-foreground">
                                  {post.title}
                                </div>
                                {post.certified && (
                                  <span className="inline-flex items-center gap-0.5 text-xs mt-0.5 text-admin-point">
                                    <Check size={10} />
                                    도서 인증
                                  </span>
                                )}
                                {post.flagged && (
                                  <span className="inline-flex items-center gap-0.5 text-xs mt-0.5 ml-1 text-red-600">
                                    <Flag size={10} />
                                    신고
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs font-medium text-gray-600">{post.author}</td>
                          <td className="px-3 py-3 text-xs font-bold text-foreground">{post.views.toLocaleString()}</td>
                          <td className="px-3 py-3 text-xs font-bold text-foreground">{post.comments}</td>
                          <td className="px-3 py-3 text-xs font-bold text-foreground">{post.likes}</td>
                          <td className="px-3 py-3">
                            <StatusBadge status={post.status} />
                          </td>
                          <td className="px-3 py-3 text-xs whitespace-nowrap text-muted-foreground">{post.date}</td>
                          <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="relative">
                              <button
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdown(showDropdown === post.id ? null : post.id);
                                }}
                              >
                                <MoreHorizontal size={15} className="text-muted-foreground" />
                              </button>
                              {showDropdown === post.id && (
                                <div className="absolute right-0 top-8 w-40 bg-white rounded-xl border border-border shadow-xl z-20">
                                  {[
                                    { label: "상세보기", icon: Eye, cls: "text-foreground" },
                                    { label: "숨김 처리", icon: EyeOff, cls: "text-amber-700" },
                                    { label: "삭제", icon: Trash2, cls: "text-red-600" },
                                    { label: "작성자 보기", icon: User, cls: "text-foreground" },
                                  ].map(({ label, icon: Icon, cls }) => (
                                    <button
                                      key={label}
                                      className={cn("w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl", cls)}
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
              )}

              {/* ─ COMMENTS TAB ─ */}
              {activeTab === "comments" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        {["ID", "원글 제목", "댓글 내용", "대댓글", "작성자", "좋아요", "상태", "작성일시", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold text-left whitespace-nowrap text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMMENTS.map((c) => (
                        <tr key={c.id} className="border-b border-gray-100 hover:bg-admin/5 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono font-bold text-muted-foreground">#{c.id}</td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <span className="text-xs truncate block text-blue-600 underline cursor-pointer">{c.postTitle}</span>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <span className="text-sm truncate block text-foreground max-w-[280px]">{c.content}</span>
                            {c.flagged && (
                              <span className="inline-flex items-center gap-0.5 text-xs mt-0.5 text-red-600">
                                <Flag size={10} />신고
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {c.isReply && <span className="text-xs text-muted-foreground">└</span>}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-600">{c.author}</td>
                          <td className="px-4 py-3 text-xs font-bold text-foreground">{c.likes}</td>
                          <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{c.date}</td>
                          <td className="px-3 py-3">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100"><MoreHorizontal size={15} className="text-muted-foreground" /></button>
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
                      <tr className="border-b border-border bg-gray-50">
                        {["ID", "도서", "별점", "리뷰 내용", "작성자", "좋아요", "상태", "작성일시", ""].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold text-left whitespace-nowrap text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {REVIEWS.map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-admin/5 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono font-bold text-muted-foreground">#{r.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 bg-admin-light">
                                {r.cover}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-foreground">{r.book}</div>
                                <div className="text-xs text-muted-foreground">{r.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StarRating rating={r.rating} /></td>
                          <td className="px-4 py-3 max-w-xs">
                            <span className="text-sm text-gray-600">{r.content}</span>
                            {r.flagged && <span className="inline-flex items-center gap-0.5 text-xs ml-1 text-red-600"><Flag size={10} />신고</span>}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-600">{r.reviewer}</td>
                          <td className="px-4 py-3 text-xs font-bold text-foreground">{r.likes}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{r.date}</td>
                          <td className="px-3 py-3">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100"><MoreHorizontal size={15} className="text-muted-foreground" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                {/* Bulk actions */}
                <div className="flex items-center gap-2">
                  {selectedRows.size > 0 && (
                    <span className="text-xs font-medium mr-1 text-gray-600">{selectedRows.size}개 선택됨</span>
                  )}
                  <button className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors">
                    숨김 처리
                  </button>
                  <button className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500 text-red-600 hover:bg-red-50 transition-colors">
                    삭제
                  </button>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-muted-foreground">
                    <ChevronLeft size={15} />
                  </button>
                  {[1, 2, 3, "…", 10].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => typeof p === "number" && setCurrentPage(p)}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                        currentPage === p ? "bg-admin text-white" : "text-gray-600",
                        typeof p === "number" ? "cursor-pointer" : "cursor-default",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-muted-foreground">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── DETAIL PANEL ── */}
            {selectedPost && (
              <div className="w-80 shrink-0 bg-white rounded-2xl border border-border shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <span className="text-sm font-bold text-foreground">게시글 상세</span>
                  <button className="p-1 rounded-lg hover:bg-gray-100" onClick={() => setSelectedPost(null)}>
                    <X size={15} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {/* Category + Status */}
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={selectedPost.category} />
                    <StatusBadge status={selectedPost.status} />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold leading-snug text-foreground">{selectedPost.title}</h3>

                  {/* Author */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-admin">
                      {selectedPost.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{selectedPost.author}</div>
                      <div className="text-xs text-muted-foreground">{selectedPost.date}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Eye, label: "조회", value: selectedPost.views.toLocaleString() },
                      { icon: MessageCircle, label: "댓글", value: selectedPost.comments },
                      { icon: ThumbsUp, label: "좋아요", value: selectedPost.likes },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-100">
                        <Icon size={13} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{label}</span>
                        <span className="text-sm font-bold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Book certification */}
                  {selectedPost.certified && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border bg-admin-light border-admin/20">
                      <div className="w-10 h-12 rounded-lg flex items-center justify-center shrink-0 bg-white/70">
                        <BookOpen size={18} className="text-admin" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-admin">도서 인증 완료</div>
                        <div className="text-xs mt-0.5 text-admin-point">OCR 인증 · 2026.07.06</div>
                      </div>
                      <Check size={14} className="ml-auto text-admin-point" />
                    </div>
                  )}

                  {/* Content preview */}
                  <div>
                    <div className="text-xs font-semibold mb-1.5 text-muted-foreground">본문 미리보기</div>
                    <p className="text-xs leading-relaxed p-3 rounded-xl text-gray-600 bg-gray-50">
                      이 게시글은 "{selectedPost.title}" 라는 제목으로 작성되었습니다. 한국 독서 커뮤니티 파노라마북스에서 독자들과 함께 책 이야기를 나누는 공간입니다. 더 많은 내용은 상세보기를 통해 확인하실 수 있습니다...
                    </p>
                  </div>

                  {/* Image thumbnails */}
                  {selectedPost.thumbnail && (
                    <div>
                      <div className="text-xs font-semibold mb-1.5 text-muted-foreground">첨부 이미지</div>
                      <div className="flex gap-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="w-16 h-16 rounded-xl flex items-center justify-center bg-admin-light">
                            <ImageIcon size={18} className="text-admin-point/60" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Report history */}
                  {selectedPost.flagged && (
                    <div className="p-3 rounded-xl border bg-red-50 border-red-200">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Flag size={12} className="text-red-600" />
                        <span className="text-xs font-bold text-red-600">신고 이력</span>
                      </div>
                      {[
                        { type: "욕설/비방", count: 2, time: "1시간 전" },
                        { type: "허위정보", count: 1, time: "3시간 전" },
                      ].map((rep) => (
                        <div key={rep.type} className="flex items-center justify-between text-xs py-1">
                          <span className="px-2 py-0.5 rounded-full font-medium bg-red-200 text-red-600">{rep.type}</span>
                          <span className="text-gray-500">{rep.count}건 · {rep.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel actions */}
                <div className="p-4 space-y-2 border-t border-border">
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl text-sm font-semibold border border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors">
                      숨김 처리
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-sm font-semibold border border-red-500 text-red-600 hover:bg-red-50 transition-colors">
                      삭제
                    </button>
                  </div>
                  <button className="w-full py-2 rounded-xl text-sm font-medium border border-border text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
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
