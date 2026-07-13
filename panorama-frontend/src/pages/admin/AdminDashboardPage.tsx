import { useState } from 'react'
import {
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  KPI_CARDS,
  VISITOR_DATA,
  CONTENT_DATA,
  REPORTS,
  INQUIRIES,
  RECENT_CONTENT,
  RECENT_MEMBERS,
  AVATAR_COLORS,
} from './dashboardData'

// ── Shared card wrapper ─────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#eaeaea] rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
      <h2 className="text-[13px] font-bold text-[#1a2e25]">{title}</h2>
      {right}
    </div>
  )
}

// ── Tooltip customisation ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#eaeaea] rounded-lg shadow-md px-3 py-2 text-[11px]">
      <p className="font-bold text-[#1a2e25] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'inquiries'>('reports')
  const pendingList = activeTab === 'reports' ? REPORTS : INQUIRIES

  return (
    <div className="p-7 space-y-5" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* ── 1. KPI row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {KPI_CARDS.map(({ icon: Icon, label, value, sub, color, bg, trend, urgent, warn }) => (
          <div
            key={label}
            className={`bg-white border rounded-xl px-4 py-4 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
              urgent
                ? 'border-red-200 ring-1 ring-red-100'
                : warn
                  ? 'border-amber-200 ring-1 ring-amber-100'
                  : 'border-[#eaeaea]'
            }`}
          >
            <div className={`${bg} p-2.5 rounded-lg shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#6b7e75] font-medium truncate">{label}</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span
                  className={`text-[22px] font-bold leading-tight ${
                    urgent ? 'text-[#d9534f]' : warn ? 'text-amber-600' : 'text-[#1a2e25]'
                  }`}
                >
                  {value}
                </span>
                <span className="text-[11px] text-[#6b7e75] ml-0.5">{sub}</span>
              </div>
              <p
                className={`text-[10px] mt-0.5 font-medium flex items-center gap-0.5 ${
                  urgent ? 'text-red-500' : warn ? 'text-amber-500' : 'text-[#2e7d6b]'
                }`}
              >
                {urgent || warn ? <AlertTriangle size={9} /> : <TrendingUp size={9} />}
                {trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. Chart row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Visitor line chart */}
        <Card>
          <CardHeader
            title="최근 7일 방문자 추이"
            right={
              <span className="text-[11px] text-[#6b7e75] bg-[#f0f4f2] px-2.5 py-1 rounded-lg font-medium">
                최근 7일
              </span>
            }
          />
          <div className="px-4 pt-4 pb-3">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={VISITOR_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b7e75' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7e75' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  name="방문자"
                  stroke="#2e7d6b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2e7d6b', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#1e4a38' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Content bar chart */}
        <Card>
          <CardHeader
            title="콘텐츠 등록 추이"
            right={
              <div className="flex items-center gap-3 text-[10px] text-[#6b7e75]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm inline-block bg-[#6b9bd1]" />
                  게시글
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm inline-block bg-[#2e7d6b]" />
                  리뷰
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm inline-block bg-[#9b8bc4]" />
                  독후감
                </span>
              </div>
            }
          />
          <div className="px-4 pt-4 pb-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={CONTENT_DATA}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barSize={10}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b7e75' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6b7e75' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="게시글" fill="#6b9bd1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="리뷰" fill="#2e7d6b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="독후감" fill="#9b8bc4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 3. Pending + Sync ──────────────────────────────────────── */}
      <div className="flex gap-5 items-start">
        {/* Pending — flex-1, height fits content */}
        <Card className="flex-1 min-w-0">
          <CardHeader
            title="처리 대기"
            right={
              <div className="flex gap-1">
                {(['reports', 'inquiries'] as const).map((tab) => {
                  const isActive = activeTab === tab
                  const label = tab === 'reports' ? '신고 대기' : '문의 대기'
                  const count = tab === 'reports' ? 7 : 4
                  const badgeCls =
                    tab === 'reports'
                      ? isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-600'
                      : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-600'
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive ? 'bg-[#1e4a38] text-white' : 'text-[#6b7e75] hover:bg-[#f0f4f2]'
                      }`}
                    >
                      {label}
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${badgeCls}`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            }
          />

          {/* Column labels */}
          <div className="grid grid-cols-[88px_1fr_148px_72px] px-5 py-2 border-b border-[#fafafa]">
            {['유형', '내용 요약', '대상', '시간'].map((h) => (
              <span
                key={h}
                className="text-[10px] font-semibold text-[#6b7e75] uppercase tracking-wide"
              >
                {h}
              </span>
            ))}
          </div>

          {/* 5 rows */}
          <div className="divide-y divide-[#f5f5f5]">
            {pendingList.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[88px_1fr_148px_72px] px-5 py-3 hover:bg-[#f9faf9] cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.typeBg}`}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="text-[12px] text-[#1a2e25] font-medium truncate pr-4 flex items-center">
                  {item.content}
                </p>
                <div className="flex flex-col justify-center min-w-0 pr-2">
                  <p className="text-[11px] text-[#4a6b5d] truncate">{item.target}</p>
                  {item.reporter && (
                    <p className="text-[10px] text-[#6b7e75] truncate">신고자: {item.reporter}</p>
                  )}
                </div>
                <span className="text-[11px] text-[#6b7e75] flex items-center">{item.time}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-[#f0f0f0]">
            <button className="flex items-center gap-1 text-[12px] text-[#2e7d6b] font-semibold hover:text-[#1e4a38] transition-colors">
              전체 목록 보기
              <ChevronRight size={13} />
            </button>
          </div>
        </Card>

        {/* Sync card — fixed width, fits content */}
        <Card className="w-[280px] min-w-[280px]">
          <CardHeader
            title="도서관 데이터 동기화"
            right={<CheckCircle2 size={15} className="text-[#2e7d6b]" />}
          />
          <div className="px-5 py-4 space-y-2.5">
            {[
              ['마지막 동기화', '2026.07.03 06:30'],
              ['총 도서관 수', '1,482개'],
              ['신규 도서 (이번 주)', '+234건'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-[11px] text-[#6b7e75]">{k}</span>
                <span className="text-[11px] font-semibold text-[#1a2e25]">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#6b7e75]">동기화 상태</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2e7d6b]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d6b] inline-block" />
                정상
              </span>
            </div>
          </div>
          <div className="px-5 pb-5">
            <button className="w-full py-2.5 bg-[#1e4a38] text-white text-[12px] font-semibold rounded-lg hover:bg-[#17382b] transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={13} />
              지금 동기화
            </button>
          </div>
        </Card>
      </div>

      {/* ── 4. Bottom row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5 pb-2">
        {/* Recent content */}
        <Card>
          <CardHeader
            title="최근 콘텐츠"
            right={
              <button className="flex items-center gap-1 text-[11px] text-[#2e7d6b] font-semibold hover:text-[#1e4a38] transition-colors">
                더보기 <ChevronRight size={12} />
              </button>
            }
          />
          <div className="divide-y divide-[#f5f5f5]">
            {RECENT_CONTENT.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] cursor-pointer transition-colors"
              >
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.typeBg}`}
                >
                  {item.typeLabel}
                </span>
                <p className="flex-1 text-[12px] font-medium text-[#1a2e25] truncate">
                  {item.title}
                </p>
                <span className="text-[11px] text-[#4a6b5d] shrink-0">{item.author}</span>
                <span className="text-[10px] text-[#6b7e75] shrink-0 w-[56px] text-right">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent members */}
        <Card>
          <CardHeader
            title="최근 가입 회원"
            right={
              <button className="flex items-center gap-1 text-[11px] text-[#2e7d6b] font-semibold hover:text-[#1e4a38] transition-colors">
                더보기 <ChevronRight size={12} />
              </button>
            }
          />
          <div className="divide-y divide-[#f5f5f5]">
            {RECENT_MEMBERS.map(({ name, email, time, avatar }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#f9faf9] cursor-pointer transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1a2e25] truncate">{name}</p>
                  <p className="text-[10px] text-[#6b7e75] truncate">{email}</p>
                </div>
                <span className="text-[10px] text-[#6b7e75] shrink-0">{time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
