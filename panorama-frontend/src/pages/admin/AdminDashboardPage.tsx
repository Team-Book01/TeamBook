import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  Flag,
  Inbox,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/api/client'
import { useAdminDashboard } from '@/api/admin'
import type { PostCategory, ReportReason } from '@/types/admin'

// ── enum 라벨 ────────────────────────────────────────────────────────────────
const REASON_LABEL: Record<ReportReason, string> = {
  ABUSE: '욕설·비방', SPAM: '스팸', MISINFO: '허위정보', OBSCENE: '음란성', ETC: '기타',
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

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'reports' | 'inquiries'>('reports')
  const { data, isLoading, isError, error, refetch } = useAdminDashboard()

  if (isLoading) {
    return <div className="p-7 text-center text-sm text-muted-foreground py-24">대시보드를 불러오는 중…</div>
  }
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
  const kpis = [
    { icon: Users, label: '전체 회원', value: s.totalUsers.toLocaleString(), sub: '명', trend: `+${s.newUsersThisWeek.toLocaleString()} 이번 주`, tone: 'normal' as const },
    { icon: Activity, label: '오늘 방문자', value: s.todayVisitors.toLocaleString(), sub: '명', trend: '오늘 기준', tone: 'normal' as const },
    { icon: FileText, label: '전체 게시글', value: s.totalPosts.toLocaleString(), sub: '개', trend: `+${s.newPostsToday.toLocaleString()} 오늘`, tone: 'normal' as const },
    { icon: Flag, label: '신고 대기', value: s.pendingReports.toLocaleString(), sub: '건', trend: '즉시 처리 필요', tone: 'urgent' as const },
    { icon: MessageSquare, label: '문의 대기', value: s.pendingInquiries.toLocaleString(), sub: '건', trend: '답변 대기 중', tone: 'warn' as const },
  ]

  return (
    <div className="p-7 space-y-5">
      {/* ── KPI row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map(({ icon: Icon, label, value, sub, trend, tone }) => (
          <div
            key={label}
            className={cn(
              'bg-white border rounded-xl px-4 py-4 flex items-center gap-3 shadow-sm',
              tone === 'urgent' ? 'border-red-200 ring-1 ring-red-100' : tone === 'warn' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-border',
            )}
          >
            <div className={cn('p-2.5 rounded-lg shrink-0', tone === 'urgent' ? 'bg-red-50' : tone === 'warn' ? 'bg-amber-50' : 'bg-admin-light')}>
              <Icon size={18} className={tone === 'urgent' ? 'text-red-500' : tone === 'warn' ? 'text-amber-500' : 'text-admin-point'} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium truncate">{label}</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className={cn('text-[22px] font-bold leading-tight', tone === 'urgent' ? 'text-[#d9534f]' : tone === 'warn' ? 'text-amber-600' : 'text-foreground')}>{value}</span>
                <span className="text-[11px] text-muted-foreground ml-0.5">{sub}</span>
              </div>
              <p className={cn('text-[10px] mt-0.5 font-medium flex items-center gap-0.5', tone === 'urgent' ? 'text-red-500' : tone === 'warn' ? 'text-amber-500' : 'text-admin-point')}>
                {tone === 'normal' ? <TrendingUp size={9} /> : <AlertTriangle size={9} />}
                {trend}
              </p>
            </div>
          </div>
        ))}
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
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] transition-colors">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0">{REASON_LABEL[r.reasonType]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground font-medium truncate">{r.targetSummary ?? '(원본 없음)'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">신고자: {r.reporterNickname}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(r.createdAt)}</span>
                    </button>
                  ))
                : data.pendingInquiries.map(q => (
                    <button key={q.inquiryId} onClick={() => navigate(`/admin/inquiries?open=${q.inquiryId}`)}
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] transition-colors">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 shrink-0 max-w-[96px] truncate">{q.category}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground font-medium truncate">{q.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{q.writerNickname}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(q.createdAt)}</span>
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
                  className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] transition-colors">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', POST_CATEGORY_BADGE[c.category])}>
                    {POST_CATEGORY_LABEL[c.category]}
                  </span>
                  <p className="flex-1 text-[12px] font-medium text-foreground truncate">{c.title}</p>
                  <span className="text-[11px] text-muted-foreground shrink-0">{c.authorNickname}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 w-[52px] text-right">{timeAgo(c.createdAt)}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
