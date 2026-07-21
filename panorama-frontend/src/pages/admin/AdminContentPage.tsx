import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, EyeOff, Trash2, Eye, Flag, Clock, AlertCircle, Inbox, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'
import { useAdminContents, useAdminContent, useProcessContent, processAdminContent, adminKeys } from '@/api/admin'
import { useQueryClient } from '@tanstack/react-query'
import DetailDrawer from '@/components/admin/DetailDrawer'
import OriginLink from '@/components/admin/OriginLink'
import AdminSelect from '@/components/admin/AdminSelect'
import { sanitizePostHtml, stripHtml } from '@/pages/community/utils'
import { POST_CATEGORY_LABEL } from '@/api/community'
import type { CommunityContentSearchRequest, CommunityContentResponse, ContentType, ContentStatus, ContentAction } from '@/types/admin'
import type { PostCategory } from '@/types/community'

// 행 메뉴(상세보기/숨김/삭제 3줄)의 대략적인 높이. 위/아래 어느 쪽으로 펼칠지 판단용.
const ROW_MENU_HEIGHT = 140

/**
 * 게시글 카테고리(말머리) 한글 라벨. 커뮤니티 화면과 같은 맵을 쓴다.
 * 서버가 이 값을 string 으로 넘기므로, 모르는 값이 오면 원본을 그대로 보여준다.
 */
function catLabel(category: string): string {
  return POST_CATEGORY_LABEL[category as PostCategory] ?? category
}

/**
 * 목록 미리보기 텍스트. 게시글 본문은 에디터 HTML 이라 태그를 걷어낸다.
 * (stripHtml 은 엔티티도 풀어주므로 &nbsp; 같은 게 그대로 노출되지 않는다)
 *
 * 서버가 넘기는 건 본문 앞부분뿐이라, 걷어내고 남는 글자가 없다고 해서 글이 없는 건 아니다
 * (이미지가 여러 장이면 텍스트가 그 뒤로 밀린다). 단정하지 말고 이미지로 시작한다는 사실만 알린다.
 */
function summarize(row: CommunityContentResponse): string {
  if (row.contentType !== 'POST') return row.contentSummary ?? ''
  const text = stripHtml(row.contentSummary ?? '').slice(0, 100)
  return text || '(이미지)'
}

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
  const act = (action: ContentAction) =>
    me?.id != null && processMut.mutate({ contentType, contentId, body: { action, handlerUserId: me.id } }, { onSuccess: onClose })

  const header = data ? (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-admin-light text-admin">{TABS.find(t => t.type === data.contentType)?.label}</span>
      <StatusBadge status={data.status} />
      {data.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{catLabel(data.category)}</span>}
    </div>
  ) : (
    <span className="text-sm font-bold text-foreground">콘텐츠 상세</span>
  )

  const footer = data ? (
    <div className="p-4 space-y-2">
      {/* 숨김 상태에서는 되돌리기를, 그 외에는 조치 버튼을 보여준다. 삭제는 되돌리지 않는다
          — soft delete 라 기술적으론 가능하지만 작성자가 스스로 지운 글까지 복구하게 된다. */}
      <div className="flex gap-2">
        {data.status === 'HIDDEN' ? (
          <button onClick={() => act('ACTIVE')} disabled={processMut.isPending} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors">공개로 되돌리기</button>
        ) : (
          <button onClick={() => act('HIDDEN')} disabled={processMut.isPending || data.status === 'DELETED'} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-amber-500 text-amber-600 hover:bg-amber-50 disabled:opacity-50 transition-colors">숨김 처리</button>
        )}
        <button onClick={() => act('DELETED')} disabled={processMut.isPending || data.status === 'DELETED'} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">삭제</button>
      </div>
      {processMut.isError && <p className="text-[11px] text-red-600 text-center">{getErrorMessage(processMut.error, '처리에 실패했습니다. 다시 시도해 주세요.')}</p>}
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-admin shrink-0">{data.authorNickname[0]}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{data.authorNickname}</div>
              <div className="text-xs text-muted-foreground">{fmt(data.createdAt)}</div>
            </div>
            {/* 게시글은 자기 자신, 댓글은 부모 글로 이동. 리뷰는 링크하지 않는다(OriginLink 주석 참고). */}
            <div className="ml-auto">
              <OriginLink
                postId={data.contentType === 'POST' ? data.contentId : data.parentPostId}
                status={data.status}
              />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold mb-1.5 text-muted-foreground">내용</div>
            {/* 게시글 본문만 에디터가 만든 HTML 이다. 댓글·리뷰는 평문이라 그대로 둔다.
                작성자가 쓴 HTML 이므로 커뮤니티 화면과 같은 sanitize 를 거쳐야 한다 —
                관리자 세션에서 열리는 화면이라 여기서 스크립트가 돌면 피해가 더 크다. */}
            {data.contentType === 'POST' ? (
              <div
                className="text-[13px] leading-relaxed p-3 rounded-xl text-gray-700 bg-gray-50 break-words
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2
                  [&_p]:my-1 [&_a]:text-admin [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizePostHtml(data.content) }}
              />
            ) : (
              <p className="text-[13px] leading-relaxed p-3 rounded-xl text-gray-700 bg-gray-50 whitespace-pre-wrap">{data.content}</p>
            )}
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
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 행 메뉴가 스크롤 컨테이너(overflow-x-auto) 안 absolute 면, 검색 결과가 적을 때 위/아래
  // 여백이 없어 잘린다. 뷰포트 기준 fixed 로 띄워 클리핑을 피한다(버튼 좌표로 위치 계산,
  // 아래 공간이 모자라면 위로 펼침).
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    if (menuId === id) {
      setMenuId(null)
      return
    }
    const btn = e.currentTarget.getBoundingClientRect()
    const MENU_WIDTH = 144 // w-36
    const openUp = window.innerHeight - btn.bottom < ROW_MENU_HEIGHT
    setMenuPos({
      top: openUp ? btn.top - ROW_MENU_HEIGHT - 4 : btn.bottom + 4,
      left: btn.right - MENU_WIDTH,
    })
    setMenuId(id)
  }
  const [bulkPending, setBulkPending] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)

  // 대시보드 등에서 ?type=POST&open=123 으로 진입 시 해당 탭 + 상세 자동 오픈
  useEffect(() => {
    const t = searchParams.get('type')?.toUpperCase()
    const open = searchParams.get('open')
    const valid = (['POST', 'COMMENT', 'REVIEW'] as const).find(v => v === t) ?? null
    if (valid) {
      setTab(valid)
      setParams(p => ({ ...p, contentType: valid }))
    }
    const id = open ? Number(open) : NaN
    if (Number.isInteger(id) && id > 0) setSelected({ type: (valid ?? 'POST') as ContentType, id })
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

  const rowAction = (id: number, action: ContentAction) => {
    setMenuId(null)
    if (me?.id == null) return
    processMut.mutate({ contentType: tab, contentId: id, body: { action, handlerUserId: me.id } })
  }

  const bulkAction = async (action: 'HIDDEN' | 'DELETED') => {
    if (checkedRows.size === 0 || me?.id == null) return
    const adminId = me.id
    setBulkPending(true)
    setBulkError(null)
    const ids = [...checkedRows]
    const results = await Promise.allSettled(ids.map(id => processAdminContent(tab, id, { action, handlerUserId: adminId })))
    const failed = results.filter(r => r.status === 'rejected').length
    setBulkPending(false)
    qc.invalidateQueries({ queryKey: [...adminKeys.all, 'contents'] })
    if (failed > 0) {
      // 일부/전부 실패 → 선택 유지하고 실패 건수 안내
      setBulkError(`${ids.length}건 중 ${failed}건 처리에 실패했습니다.`)
    } else {
      setCheckedRows(new Set())
    }
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
          <AdminSelect value={fStatus} onChange={e => setFStatus(e.target.value as typeof fStatus)}>
            <option value="전체">상태 전체</option><option value="ACTIVE">공개</option><option value="HIDDEN">숨김</option><option value="DELETED">삭제</option>
          </AdminSelect>
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
          <div ref={scrollRef} className="overflow-x-auto">
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
                        <div className="text-sm font-medium truncate text-foreground">{row.title ?? summarize(row)}</div>
                        {row.title && <div className="text-xs text-muted-foreground truncate">{summarize(row)}</div>}
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
                          <button onClick={e => openMenu(e, row.contentId)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreHorizontal size={15} className="text-muted-foreground" />
                          </button>
                          {menuId === row.contentId && menuPos && (
                            <div className="fixed w-36 bg-white rounded-xl border border-border shadow-xl z-50 overflow-hidden" style={{ top: menuPos.top, left: menuPos.left }}>
                              <button onClick={() => { setSelected({ type: row.contentType, id: row.contentId }); setMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-50"><Eye size={13} />상세보기</button>
                              {row.status === 'HIDDEN' ? (
                                <button onClick={() => rowAction(row.contentId, 'ACTIVE')} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-green-700 hover:bg-gray-50"><Eye size={13} />공개로 되돌리기</button>
                              ) : row.status !== 'DELETED' && (
                                <button onClick={() => rowAction(row.contentId, 'HIDDEN')} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-amber-700 hover:bg-gray-50"><EyeOff size={13} />숨김 처리</button>
                              )}
                              {row.status !== 'DELETED' && (
                                <button onClick={() => rowAction(row.contentId, 'DELETED')} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-gray-50"><Trash2 size={13} />삭제</button>
                              )}
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
                {(bulkError || processMut.isError) && (
                  <span className="text-[11px] text-red-600 ml-1">{bulkError ?? getErrorMessage(processMut.error, '처리에 실패했습니다.')}</span>
                )}
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
