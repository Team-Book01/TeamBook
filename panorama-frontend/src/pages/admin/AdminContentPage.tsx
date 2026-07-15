import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, EyeOff, Trash2, Eye, Flag, Clock, AlertCircle, Inbox, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'
import { useAdminContents, useAdminContent, useProcessContent, processAdminContent, adminKeys } from '@/api/admin'
import { useQueryClient } from '@tanstack/react-query'
import DetailDrawer from '@/components/admin/DetailDrawer'
import type { CommunityContentSearchRequest, ContentType, ContentStatus } from '@/types/admin'

const TABS: { type: ContentType; label: string }[] = [
  { type: 'POST', label: '게시글' },
  { type: 'COMMENT', label: '댓글' },
  { type: 'REVIEW', label: '리뷰' },
]
const STATUS_BADGE: Record<ContentStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
  HIDDEN: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  DELETED: 'bg-red-50 text-red-700 border border-red-200',
}
const STATUS_LABEL: Record<ContentStatus, string> = { ACTIVE: '공개', HIDDEN: '숨김', DELETED: '삭제' }
const fmt = (iso?: string | null) => (iso ? iso.replace('T', ' ').slice(0, 16) : '-')

function StatusBadge({ status }: { status: ContentStatus }) {
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[status])}>{STATUS_LABEL[status]}</span>
}

// ── 상세 드로어 (공용 DetailDrawer 사용) ───────────────────────────────────────
function ContentDetailDrawer({ contentType, contentId, onClose }: { contentType: ContentType; contentId: number; onClose: () => void }) {
  const me = useAuthStore(s => s.user)
  const { data, isLoading, isError, error, refetch } = useAdminContent(contentType, contentId)
  const processMut = useProcessContent()
  const act = (action: 'HIDDEN' | 'DELETED') =>
    processMut.mutate({ contentType, contentId, body: { action, handlerUserId: me?.id ?? 0 } }, { onSuccess: onClose })

  const header = data ? (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-admin-light text-admin">{TABS.find(t => t.type === data.contentType)?.label}</span>
      <StatusBadge status={data.status} />
      {data.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{data.category}</span>}
    </div>
  ) : (
    <span className="text-sm font-bold text-foreground">콘텐츠 상세</span>
  )

  const footer = data ? (
    <div className="p-4 space-y-2">
      <div className="flex gap-2">
        <button onClick={() => act('HIDDEN')} disabled={processMut.isPending} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-amber-500 text-amber-600 hover:bg-amber-50 disabled:opacity-50 transition-colors">숨김 처리</button>
        <button onClick={() => act('DELETED')} disabled={processMut.isPending} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">삭제</button>
      </div>
      <div className="w-full py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground flex items-center justify-center gap-1.5">
        <Clock size={12} /> 신고 {data.reportCount}건 · 수정 {fmt(data.updatedAt)}
      </div>
    </div>
  ) : undefined

  return (
    <DetailDrawer onClose={onClose} header={header} footer={footer}>
      {isLoading ? (
        <div className="p-10 text-center text-sm text-muted-foreground">불러오는 중…</div>
      ) : isError || !data ? (
        <div className="p-8 text-center">
          <AlertCircle size={20} className="mx-auto mb-2 text-red-400" />
          <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '상세를 불러오지 못했습니다.')}</p>
          <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {data.title && <h3 className="text-base font-bold leading-snug text-foreground">{data.title}</h3>}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-admin">{data.authorNickname[0]}</div>
            <div>
              <div className="text-sm font-semibold text-foreground">{data.authorNickname}</div>
              <div className="text-xs text-muted-foreground">{fmt(data.createdAt)}</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold mb-1.5 text-muted-foreground">내용</div>
            <p className="text-[13px] leading-relaxed p-3 rounded-xl text-gray-700 bg-gray-50 whitespace-pre-wrap">{data.content}</p>
          </div>
          {data.reportCount > 0 && (
            <div className="p-3 rounded-xl border bg-red-50 border-red-200 flex items-center gap-2">
              <Flag size={13} className="text-red-600" />
              <span className="text-xs font-bold text-red-600">신고 {data.reportCount}건 누적</span>
            </div>
          )}
        </div>
      )}
    </DetailDrawer>
  )
}

export default function AdminContentPage() {
  const me = useAuthStore(s => s.user)
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState<ContentType>('POST')
  const [searchInput, setSearchInput] = useState('')
  const [fStatus, setFStatus] = useState<'전체' | ContentStatus>('전체')
  const [params, setParams] = useState<CommunityContentSearchRequest>({ contentType: 'POST', page: 1, size: 20 })
  const [selected, setSelected] = useState<{ type: ContentType; id: number } | null>(null)
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set())
  const [menuId, setMenuId] = useState<number | null>(null)
  const [bulkPending, setBulkPending] = useState(false)

  // 대시보드 등에서 ?type=POST&open=123 으로 진입 시 해당 탭 + 상세 자동 오픈
  useEffect(() => {
    const t = searchParams.get('type')?.toUpperCase()
    const open = searchParams.get('open')
    const valid = (['POST', 'COMMENT', 'REVIEW'] as const).find(v => v === t) ?? null
    if (valid) {
      setTab(valid)
      setParams(p => ({ ...p, contentType: valid }))
    }
    if (open) setSelected({ type: (valid ?? 'POST') as ContentType, id: Number(open) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminContents(params)
  const processMut = useProcessContent()
  const rows = data?.content ?? []
  const page = params.page ?? 1
  const totalPages = data?.totalPages ?? 1

  const switchTab = (t: ContentType) => {
    setTab(t)
    setSelected(null)
    setCheckedRows(new Set())
    setParams({ contentType: t, searchString: searchInput.trim() || undefined, status: fStatus === '전체' ? undefined : fStatus, page: 1, size: 20 })
  }
  const apply = () => {
    setCheckedRows(new Set())
    setParams({ contentType: tab, searchString: searchInput.trim() || undefined, status: fStatus === '전체' ? undefined : fStatus, page: 1, size: 20 })
  }

  const allChecked = rows.length > 0 && rows.every(r => checkedRows.has(r.contentId))
  const toggleAll = () => setCheckedRows(allChecked ? new Set() : new Set(rows.map(r => r.contentId)))
  const toggleOne = (id: number) => setCheckedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const rowAction = (id: number, action: 'HIDDEN' | 'DELETED') => {
    setMenuId(null)
    processMut.mutate({ contentType: tab, contentId: id, body: { action, handlerUserId: me?.id ?? 0 } })
  }

  const bulkAction = async (action: 'HIDDEN' | 'DELETED') => {
    if (checkedRows.size === 0) return
    setBulkPending(true)
    await Promise.allSettled([...checkedRows].map(id => processAdminContent(tab, id, { action, handlerUserId: me?.id ?? 0 })))
    setBulkPending(false)
    setCheckedRows(new Set())
    qc.invalidateQueries({ queryKey: [...adminKeys.all, 'contents'] })
  }

  return (
    <div className="p-6" onClick={() => setMenuId(null)}>
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map(t => (
            <button key={t.type} onClick={() => switchTab(t.type)}
              className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all', tab === t.type ? 'bg-admin text-white' : 'text-muted-foreground hover:bg-white/60')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-border px-5 py-4 shadow-sm flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()}
              placeholder="제목 / 내용 / 작성자 닉네임 검색"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none focus:border-admin" />
          </div>
          <select value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)}
            className="appearance-none pl-3 pr-7 py-2 text-sm rounded-xl border border-border bg-gray-50 text-foreground outline-none cursor-pointer focus:border-admin">
            <option value="전체">상태 전체</option><option value="ACTIVE">공개</option><option value="HIDDEN">숨김</option><option value="DELETED">삭제</option>
          </select>
          <button onClick={apply} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-admin hover:bg-admin-hover transition-colors">
            <Search size={13} />검색
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{TABS.find(t => t.type === tab)?.label} 목록</span>
            <span className="text-xs text-muted-foreground">총 {data?.totalElements ?? 0}건</span>
            {isFetching && <span className="text-xs text-muted-foreground">· 갱신 중…</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 w-9">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-admin rounded" onClick={e => e.stopPropagation()} />
                  </th>
                  {['ID', '상태', '제목 / 내용', '작성자', '신고', '작성일', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-xs font-semibold text-left whitespace-nowrap text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">불러오는 중…</td></tr>
                ) : isError ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '콘텐츠 목록을 불러오지 못했습니다.')}</p>
                    <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
                  </td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center"><Inbox size={22} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-muted-foreground">조건에 맞는 콘텐츠가 없습니다.</p></td></tr>
                ) : (
                  rows.map(row => (
                    <tr key={`${row.contentType}-${row.contentId}`} onClick={() => setSelected({ type: row.contentType, id: row.contentId })}
                      className={cn('border-b border-gray-100 cursor-pointer transition-colors', selected?.id === row.contentId ? 'bg-admin-light' : 'hover:bg-admin/5')}>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={checkedRows.has(row.contentId)} onChange={() => toggleOne(row.contentId)} className="accent-admin rounded" />
                      </td>
                      <td className="px-3 py-3 text-xs font-mono font-bold text-muted-foreground">#{row.contentId}</td>
                      <td className="px-3 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-3 py-3 max-w-[340px]">
                        <div className="text-sm font-medium truncate text-foreground">{row.title ?? row.contentSummary}</div>
                        {row.title && <div className="text-xs text-muted-foreground truncate">{row.contentSummary}</div>}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-gray-600 whitespace-nowrap">{row.authorNickname}</td>
                      <td className="px-3 py-3">
                        {row.reportCount > 0
                          ? <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-600"><Flag size={10} />{row.reportCount}</span>
                          : <span className="text-xs text-gray-300">-</span>}
                      </td>
                      <td className="px-3 py-3 text-xs whitespace-nowrap text-muted-foreground">{fmt(row.createdAt)}</td>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                          <button onClick={() => setMenuId(menuId === row.contentId ? null : row.contentId)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreHorizontal size={15} className="text-muted-foreground" />
                          </button>
                          {menuId === row.contentId && (
                            <div className="absolute right-0 top-8 w-36 bg-white rounded-xl border border-border shadow-xl z-20 overflow-hidden">
                              <button onClick={() => { setSelected({ type: row.contentType, id: row.contentId }); setMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-50"><Eye size={13} />상세보기</button>
                              <button onClick={() => rowAction(row.contentId, 'HIDDEN')} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-amber-700 hover:bg-gray-50"><EyeOff size={13} />숨김 처리</button>
                              <button onClick={() => rowAction(row.contentId, 'DELETED')} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-gray-50"><Trash2 size={13} />삭제</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: bulk + pagination */}
          {!isLoading && !isError && rows.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border flex-wrap">
              <div className="flex items-center gap-2">
                {checkedRows.size > 0 && <span className="text-xs font-medium text-gray-600 mr-1">{checkedRows.size}개 선택됨</span>}
                <button onClick={() => bulkAction('HIDDEN')} disabled={checkedRows.size === 0 || bulkPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500 text-amber-600 hover:bg-amber-50 disabled:opacity-40 transition-colors">숨김 처리</button>
                <button onClick={() => bulkAction('DELETED')} disabled={checkedRows.size === 0 || bulkPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors">삭제</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setParams(p => ({ ...p, page: page - 1 }))} disabled={page <= 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">이전</button>
                <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                <button onClick={() => setParams(p => ({ ...p, page: page + 1 }))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40">다음</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && <ContentDetailDrawer contentType={selected.type} contentId={selected.id} onClose={() => setSelected(null)} />}
    </div>
  )
}
