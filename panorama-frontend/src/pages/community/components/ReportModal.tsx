import { useState } from 'react'
import { X } from 'lucide-react'

import type { ReportReasonType } from '@/types/community'
import { REPORT_REASONS, useCreateReport } from '@/api/community'
import { getErrorMessage, getErrorStatus } from '@/api/client'

/**
 * 게시글 신고 모달. 사유(ReasonType) 선택 + 상세 내용(선택, 최대 255자) →
 * POST /reports { targetType: 'POST', targetId, reasonType, content }.
 * 409(중복 신고)면 서버 메시지("이미 신고한 대상입니다")를 그대로 표시한다.
 */
export default function ReportModal({
  targetId,
  onClose,
}: {
  targetId: number
  onClose: () => void
}) {
  const [reasonType, setReasonType] = useState<ReportReasonType | null>(null)
  const [content, setContent] = useState('')
  const createReport = useCreateReport()

  const submit = () => {
    if (!reasonType) return alert('신고 사유를 선택해주세요.')
    const detail = content.trim()
    createReport.mutate(
      {
        targetType: 'POST',
        targetId,
        reasonType,
        ...(detail ? { content: detail } : {}),
      },
      {
        onSuccess: () => {
          alert('신고가 접수되었습니다.')
          onClose()
        },
        onError: (e) => {
          // 409(중복 신고) 포함, 서버 message 를 그대로 노출
          alert(
            getErrorMessage(
              e,
              getErrorStatus(e) === 409 ? '이미 신고한 대상입니다.' : '신고 접수에 실패했어요.',
            ),
          )
        },
      },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <h2 className="text-base font-bold text-[#1A1A1A] m-0">게시글 신고</h2>
          <button onClick={onClose} className="p-1 rounded-md text-[#aaa] hover:text-[#333] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* 사유 선택 */}
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[#555] mb-2">신고 사유</legend>
            <div className="flex flex-col gap-1">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#F7FAF9] transition-colors"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reasonType === r.value}
                    onChange={() => setReasonType(r.value)}
                    className="accent-[#1E4A38]"
                  />
                  <span className="text-sm text-[#333]">{r.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 상세 내용 (선택) */}
          <div>
            <p className="text-[13px] font-semibold text-[#555] mb-2 m-0">
              상세 내용 <span className="font-normal text-[#bbb]">(선택, 최대 255자)</span>
            </p>
            <textarea
              value={content}
              maxLength={255}
              onChange={(e) => setContent(e.target.value)}
              placeholder="신고 사유를 자세히 적어주시면 처리에 도움이 됩니다."
              className="w-full rounded-[10px] text-sm text-[#1A1A1A] outline-none box-border resize-none bg-[#FAFAFA] focus:bg-white border-[1.5px] border-black/10 focus:border-[#2E7D6B] transition-colors px-3.5 py-2.5"
              style={{ minHeight: 84, lineHeight: 1.6 }}
            />
            <p className="text-right text-[11px] text-[#ccc] mt-1 m-0">{content.length}/255</p>
          </div>
        </div>

        {/* 액션 */}
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#E0E0E0] text-sm text-[#888] bg-white cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={createReport.isPending}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60"
            style={{ background: '#D4183D' }}
          >
            {createReport.isPending ? '접수 중…' : '신고하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
