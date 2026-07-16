import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  FileText,
  Flag,
  Inbox,
  MessageSquare,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { useAdminDashboard } from '@/api/admin'
import type { PostCategory, ReportReason } from '@/types/admin'

// ── enum 라벨 ────────────────────────────────────────────────────────────────
const REASON_LABEL: Record<ReportReason, string> = {
  ABUSE: '욕설·비방', SPAM: '스팸', MISINFO: '허위정보', OBSCENE: '음란성', ETC: '기타',
}
// 사유별 색 (신고 화면과 동일 — 전부 빨강이던 것을 사유별로 구분)
const REASON_BADGE: Record<ReportReason, string> = {
  ABUSE: 'bg-red-50 text-red-600', SPAM: 'bg-orange-50 text-orange-600', MISINFO: 'bg-amber-50 text-amber-700', OBSCENE: 'bg-pink-50 text-pink-600', ETC: 'bg-gray-100 text-gray-500',
}
const POST_CATEGORY_LABEL: Record<PostCategory, string> = { RECOMMEND: '추천', REVIEW: '리뷰', FREE: '자유' }
const POST_CATEGORY_BADGE: Record<PostCategory, string> = {
  RECOMMEND: 'bg-green-50 text-green-700', REVIEW: 'bg-blue-50 text-blue-700', FREE: 'bg-gray-100 text-gray-500',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

// ── Shared card wrappers ─────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('bg-white border border-border rounded-xl shadow-sm flex flex-col', className)}>{children}</div>
}

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-[#f0f0f0] shrink-0">
      <h2 className="text-[13px] font-bold text-foreground">{title}</h2>
      {right}
    </div>
  )
}

// 처리 필요 KPI — 클릭 시 해당 관리 화면으로 이동
function ActionKpi({ to, icon: Icon, label, value, unit, tone }: {
  to: string; icon: LucideIcon; label: string; value: number; unit: string; tone: 'danger' | 'warn'
}) {
  const danger = tone === 'danger'
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        danger ? 'bg-red-50 border-red-200 hover:bg-red-100/60 focus-visible:ring-red-400' : 'bg-amber-50 border-amber-200 hover:bg-amber-100/60 focus-visible:ring-amber-400',
      )}
    >
      <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
        <Icon size={18} className={danger ? 'text-red-600' : 'text-amber-600'} />
      </span>
      <div className="min-w-0">
        <p className={cn('text-[12px] font-medium', danger ? 'text-red-700' : 'text-amber-700')}>{label}</p>
        <p className="flex items-baseline gap-0.5">
          <span className={cn('text-[24px] font-bold leading-tight', danger ? 'text-red-600' : 'text-amber-600')}>{value.toLocaleString()}</span>
          <span className={cn('text-[11px]', danger ? 'text-red-500' : 'text-amber-600')}>{unit}</span>
        </p>
      </div>
      <ArrowRight size={17} className={cn('ml-auto shrink-0', danger ? 'text-red-400' : 'text-amber-400')} />
    </Link>
  )
}

// 현황 KPI — 정적 지표
function InfoKpi({ icon: Icon, label, value, unit, trend }: {
  icon: LucideIcon; label: string; value: number; unit: string; trend?: string
}) {
  return (
    <div className="bg-white border border-border rounded-xl px-4 py-3.5">
      <p className="text-[12px] text-muted-foreground font-medium flex items-center gap-1">
        <Icon size={13} className="text-admin-point" />{label}
      </p>
      <p className="flex items-baseline gap-0.5 mt-1">
        <span className="text-[22px] font-bold text-foreground leading-tight">{value.toLocaleString()}</span>
        <span className="text-[11px] text-muted-foreground ml-0.5">{unit}</span>
      </p>
      {trend && <p className="text-[11px] text-admin-point font-medium mt-0.5">{trend}</p>}
    </div>
  )
}

// 로딩 스켈레톤 — 실제 레이아웃과 동일 형태로 점프 방지
function DashboardSkeleton() {
  const block = 'animate-pulse rounded-xl bg-gray-100'
  return (
    <div className="p-6 space-y-5">
      {[2, 3].map((n, i) => (
        <div key={i}>
          <div className="h-3 w-14 bg-gray-100 rounded mb-2 animate-pulse" />
          <div className={cn('grid gap-3 grid-cols-1', n === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
            {Array.from({ length: n }).map((_, j) => <div key={j} className={cn(block, 'h-[74px]')} />)}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={cn(block, 'h-[240px]')} />
        <div className={cn(block, 'h-[240px]')} />
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'reports' | 'inquiries'>('reports')
  const { data, isLoading, isError, error, refetch } = useAdminDashboard()

  if (isLoading) return <DashboardSkeleton />
  if (isError || !data) {
    return (
      <div className="p-7 text-center py-24">
        <AlertCircle size={24} className="mx-auto mb-2 text-red-400" />
        <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '대시보드를 불러오지 못했습니다.')}</p>
        <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
      </div>
    )
  }

  const s = data.stats

  return (
    <div className="p-6 sm:p-7 space-y-5">
      {/* ── 처리 필요 (액션 · 클릭 이동) ───────────────────────────── */}
      <div>
        <p className="text-[12px] font-medium text-muted-foreground mb-2">처리 필요</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionKpi to="/admin/reports" icon={Flag} label="신고 대기" value={s.pendingReports} unit="건 · 즉시 처리" tone="danger" />
          <ActionKpi to="/admin/inquiries" icon={MessageSquare} label="문의 대기" value={s.pendingInquiries} unit="건 · 답변 대기" tone="warn" />
        </div>
      </div>

      {/* ── 현황 (정보) ──────────────────────────────────────────── */}
      <div>
        <p className="text-[12px] font-medium text-muted-foreground mb-2">현황</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoKpi icon={Users} label="전체 회원" value={s.totalUsers} unit="명" trend={`+${s.newUsersThisWeek.toLocaleString()} 이번 주`} />
          <InfoKpi icon={Activity} label="오늘 방문자" value={s.todayVisitors} unit="명" />
          <InfoKpi icon={FileText} label="전체 게시글" value={s.totalPosts} unit="개" trend={`+${s.newPostsToday.toLocaleString()} 오늘`} />
        </div>
      </div>

      {/* ── 처리 대기 + 최근 콘텐츠 (넓으면 좌우 2열, 좁으면 상하) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* 처리 대기 */}
        <Card>
          <CardHeader
            title="처리 대기"
            right={
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {(['reports', 'inquiries'] as const).map(tab => {
                    const isActive = activeTab === tab
                    const label = tab === 'reports' ? '신고' : '문의'
                    const count = tab === 'reports' ? data.pendingReports.length : data.pendingInquiries.length
                    const badgeCls = tab === 'reports'
                      ? isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                      : isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5', isActive ? 'bg-admin text-white' : 'text-muted-foreground hover:bg-admin-light')}
                      >
                        {label}
                        <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-bold', badgeCls)}>{count}</span>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => navigate(activeTab === 'reports' ? '/admin/reports' : '/admin/inquiries')}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-admin-point hover:text-admin transition-colors whitespace-nowrap"
                >
                  전체 보기 <ChevronRight size={13} />
                </button>
              </div>
            }
          />

          {(activeTab === 'reports' ? data.pendingReports : data.pendingInquiries).length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Inbox size={20} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-muted-foreground">{activeTab === 'reports' ? '대기 중인 신고가 없습니다.' : '대기 중인 문의가 없습니다.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f5f5f5]">
              {activeTab === 'reports'
                ? data.pendingReports.map(r => (
                    <button key={r.reportId} onClick={() => navigate(`/admin/reports?open=${r.reportId}`)}
                      className="group w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] focus-visible:outline-none focus-visible:bg-admin-light transition-colors">
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', REASON_BADGE[r.reasonType])}>{REASON_LABEL[r.reasonType]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground font-medium truncate">{r.targetSummary ?? '(원본 없음)'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">신고자: {r.reporterNickname}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(r.createdAt)}</span>
                      <ChevronRight size={14} className="text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))
                : data.pendingInquiries.map(q => (
                    <button key={q.inquiryId} onClick={() => navigate(`/admin/inquiries?open=${q.inquiryId}`)}
                      className="group w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] focus-visible:outline-none focus-visible:bg-admin-light transition-colors">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 shrink-0 max-w-[96px] truncate">{q.category}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground font-medium truncate">{q.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{q.writerNickname}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(q.createdAt)}</span>
                      <ChevronRight size={14} className="text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
            </div>
          )}
        </Card>

        {/* 최근 콘텐츠 */}
        <Card>
          <CardHeader
            title="최근 콘텐츠"
            right={
              <button
                onClick={() => navigate('/admin/content')}
                title="콘텐츠 관리로 이동"
                className="flex items-center gap-0.5 text-[11px] font-semibold text-admin-point hover:text-admin transition-colors"
              >
                전체 보기 <ChevronRight size={14} />
              </button>
            }
          />
          {data.recentContents.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Inbox size={20} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-muted-foreground">최근 콘텐츠가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f5f5f5]">
              {data.recentContents.map(c => (
                <button key={c.postId} onClick={() => navigate(`/admin/content?type=POST&open=${c.postId}`)}
                  className="group w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] focus-visible:outline-none focus-visible:bg-admin-light transition-colors">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', POST_CATEGORY_BADGE[c.category])}>
                    {POST_CATEGORY_LABEL[c.category]}
                  </span>
                  <p className="flex-1 text-[12px] font-medium text-foreground truncate">{c.title}</p>
                  <span className="text-[11px] text-muted-foreground shrink-0">{c.authorNickname}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0 w-[52px] text-right">{timeAgo(c.createdAt)}</span>
                  <ChevronRight size={14} className="text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
