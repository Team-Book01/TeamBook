import { useState } from 'react'
import { Search, Plus, Pin, AlertCircle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'
import { useAdminNotices, useAdminNotice, useCreateNotice, useUpdateNotice } from '@/api/admin'
import type { NoticeSearchRequest, NoticeCategory, NoticeStatus } from '@/types/admin'
import NoticeDrawer, { type NoticeForm } from './notices/NoticeDrawer'
import { NOTICE_CATEGORY_BADGE, NOTICE_CATEGORY_OPTIONS, NOTICE_STATUS_META, formatDate } from './notices/noticeMeta'

const selectCls =
  'px-3 py-2 rounded-lg border-[1.5px] border-border text-[13px] text-foreground bg-white outline-none cursor-pointer focus:border-admin'

type DrawerState = { noticeId: number | null; mode: 'view' | 'edit' | 'create' }

export default function AdminNoticesPage() {
  const me = useAuthStore(s => s.user)

  // 검색 입력(즉시 반영 X) → 검색 버튼/Enter 로 params 확정
  const [searchInput, setSearchInput] = useState('')
  const [filterCat, setFilterCat] = useState<'전체' | NoticeCategory>('전체')
  const [filterStatus, setFilterStatus] = useState<'전체' | 'ACTIVE' | 'DELETED'>('전체')
  const [params, setParams] = useState<NoticeSearchRequest>({ page: 1, size: 20 })

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminNotices(params)
  const notices = data?.content ?? []
  const totalPages = data?.totalPages ?? 1
  const page = params.page ?? 1

  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const detailQuery = useAdminNotice(drawer && drawer.mode !== 'create' ? drawer.noticeId : null)
  const createMut = useCreateNotice()
  const updateMut = useUpdateNotice()

  const applyFilters = () =>
    setParams({
      searchString: searchInput.trim() || undefined,
      category: filterCat === '전체' ? undefined : filterCat,
      status: filterStatus === '전체' ? undefined : filterStatus,
      page: 1,
      size: 20,
    })

  const goPage = (p: number) => setParams(prev => ({ ...prev, page: p }))

  const handleSubmit = (f: NoticeForm) => {
    if (drawer?.mode === 'create') {
      if (me?.id == null) return
      createMut.mutate(
        { userId: me.id, category: f.category, title: f.title, content: f.content, pinned: f.pinned, important: f.important, status: 'ACTIVE' as NoticeStatus },
        { onSuccess: () => setDrawer(null) },
      )
    } else if (drawer?.mode === 'edit' && drawer.noticeId != null) {
      updateMut.mutate(
        { noticeId: drawer.noticeId, body: { category: f.category, title: f.title, content: f.content, pinned: f.pinned, important: f.important } },
        { onSuccess: () => setDrawer(null) },
      )
    }
  }

  return (
    <div className="p-7">
      {/* Filter bar */}
      <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-border mb-5 flex gap-2.5 items-center flex-wrap">
        <div className="relative flex-1 basis-[200px] min-w-[180px]">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className={cn(selectCls, 'w-full pl-9')}
            placeholder="제목, 내용 검색..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
          />
        </div>
        <select className={selectCls} value={filterCat} onChange={e => setFilterCat(e.target.value as typeof filterCat)}>
          <option value="전체">전체</option>
          {NOTICE_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className={selectCls} value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}>
          <option value="전체">전체</option>
          <option value="ACTIVE">게시중</option>
          <option value="DELETED">삭제</option>
        </select>
        <button onClick={applyFilters} className="px-5 py-2 bg-admin text-white rounded-lg font-semibold text-[13px] shrink-0 hover:bg-admin-hover transition-colors">
          검색
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-border">
        {/* Header row */}
        <div className="px-5 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
          <span className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-foreground">공지 목록</span>
            <span className="text-muted-foreground text-xs">· 총 {data?.totalElements ?? 0}건</span>
            {isFetching && <span className="text-muted-foreground text-xs">· 갱신 중…</span>}
          </span>
          <button
            onClick={() => setDrawer({ noticeId: null, mode: 'create' })}
            className="flex items-center gap-1.5 px-4 py-2 bg-admin text-white rounded-lg font-semibold text-[13px] hover:bg-admin-hover transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            새 공지 작성
          </button>
        </div>

        {/* Table / states */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['제목', '분류', '상태', '게시일'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-16 text-center text-sm text-muted-foreground">불러오는 중…</td></tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <AlertCircle size={22} className="mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-red-600 mb-3">{getErrorMessage(error, '공지 목록을 불러오지 못했습니다.')}</p>
                    <button onClick={() => refetch()} className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-gray-50">다시 시도</button>
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <Inbox size={22} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-muted-foreground">조건에 맞는 공지가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                notices.map(notice => (
                  <tr
                    key={notice.noticeId}
                    className={cn(
                      'border-b border-[#f3f4f6] cursor-pointer transition-colors',
                      notice.pinned ? 'bg-amber-50 hover:bg-amber-100/60' : 'bg-white hover:bg-gray-50',
                    )}
                    onClick={() => setDrawer({ noticeId: notice.noticeId, mode: 'view' })}
                  >
                    <td className="px-4 py-3 max-w-[420px] min-w-[240px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {notice.pinned && <Pin size={13} className="text-amber-500 fill-amber-500" />}
                        {notice.important && <span className="text-[11px] font-bold text-red-600 bg-red-100 px-1.5 py-px rounded">중요</span>}
                        <span className="text-[13px] font-semibold text-foreground">{notice.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground/70 mt-[3px]">NTC-{String(notice.noticeId).padStart(4, '0')}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('text-xs font-semibold px-2.5 py-[3px] rounded-full', NOTICE_CATEGORY_BADGE[notice.category])}>
                        {NOTICE_CATEGORY_OPTIONS.find(o => o.value === notice.category)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn('w-[7px] h-[7px] rounded-full inline-block', NOTICE_STATUS_META[notice.status].dot)} />
                        <span className={cn('text-xs font-semibold', NOTICE_STATUS_META[notice.status].text)}>{NOTICE_STATUS_META[notice.status].label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">{formatDate(notice.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !isError && notices.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
            <button
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawer && (
        <NoticeDrawer
          mode={drawer.mode}
          detail={drawer.mode === 'create' ? null : detailQuery.data ?? null}
          loading={detailQuery.isLoading}
          submitting={createMut.isPending || updateMut.isPending}
          submitError={createMut.isError ? getErrorMessage(createMut.error, '저장에 실패했습니다.') : updateMut.isError ? getErrorMessage(updateMut.error, '저장에 실패했습니다.') : null}
          onClose={() => setDrawer(null)}
          onEdit={() => setDrawer(d => (d ? { ...d, mode: 'edit' } : d))}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
