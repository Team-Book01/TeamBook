import { useState } from 'react'
import { X, Paperclip } from 'lucide-react'

import { INQUIRY_CATEGORIES, useSubmitInquiry } from '@/api/inquiry'
import { getErrorMessage } from '@/api/client'

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 서버(ImageStorageService) 상한과 동일. 넘는 파일은 올리자마자 걸러 왕복을 없앤다.

/**
 * 문의하기 팝업. 게시글 신고(ReportModal)와 같은 모달 패턴.
 *
 * 게시글·공지 에디터와 달리 파일을 서버에 미리 올리지 않는다 — inquiry_images.inquiry_id 가
 * NOT NULL 이라 소유자 없는 임시 업로드가 불가능해서, 본문과 파일을 제출 시 한 번에 보낸다.
 * 미리보기는 로컬 objectURL 로만 보여준다.
 */
export default function InquiryModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState(INQUIRY_CATEGORIES[0].value)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const submitInquiry = useSubmitInquiry()

  const addFiles = (picked: FileList | null) => {
    if (!picked) return
    setFileError(null)
    const next = [...files]
    for (const file of Array.from(picked)) {
      if (next.length >= MAX_FILES) {
        setFileError(`이미지는 최대 ${MAX_FILES}장까지 첨부할 수 있어요.`)
        break
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`${file.name}은(는) 5MB를 초과해 첨부할 수 없어요.`)
        continue
      }
      next.push(file)
    }
    setFiles(next)
  }
  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx))

  const submit = () => {
    const t = title.trim()
    const c = content.trim()
    if (!t) return alert('제목을 입력해주세요.')
    if (!c) return alert('내용을 입력해주세요.')

    submitInquiry.mutate(
      { request: { category, title: t, content: c }, images: files },
      {
        onSuccess: () => {
          alert('문의가 접수되었습니다.')
          onClose()
        },
        onError: e => alert(getErrorMessage(e, '문의 접수에 실패했어요.')),
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
        className="bg-white rounded-2xl w-full max-w-[480px] max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] sticky top-0 bg-white">
          <h2 className="text-base font-bold text-[#1A1A1A] m-0">문의하기</h2>
          <button onClick={onClose} className="p-1 rounded-md text-[#aaa] hover:text-[#333] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* 문의 유형 */}
          <div>
            <p className="text-[13px] font-semibold text-[#555] mb-2 m-0">문의 유형</p>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-[10px] text-sm text-[#1A1A1A] outline-none box-border bg-[#FAFAFA] focus:bg-white border-[1.5px] border-black/10 focus:border-[#2E7D6B] transition-colors px-3.5 py-2.5"
            >
              {INQUIRY_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <p className="text-[13px] font-semibold text-[#555] mb-2 m-0">제목</p>
            <input
              value={title}
              maxLength={255}
              onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              className="w-full rounded-[10px] text-sm text-[#1A1A1A] outline-none box-border bg-[#FAFAFA] focus:bg-white border-[1.5px] border-black/10 focus:border-[#2E7D6B] transition-colors px-3.5 py-2.5"
            />
          </div>

          {/* 내용 */}
          <div>
            <p className="text-[13px] font-semibold text-[#555] mb-2 m-0">내용</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="문의하실 내용을 자세히 적어주세요."
              className="w-full rounded-[10px] text-sm text-[#1A1A1A] outline-none box-border resize-none bg-[#FAFAFA] focus:bg-white border-[1.5px] border-black/10 focus:border-[#2E7D6B] transition-colors px-3.5 py-2.5"
              style={{ minHeight: 120, lineHeight: 1.6 }}
            />
          </div>

          {/* 첨부파일 */}
          <div>
            <p className="text-[13px] font-semibold text-[#555] mb-2 m-0">
              첨부 이미지 <span className="font-normal text-[#bbb]">(선택, 최대 {MAX_FILES}장)</span>
            </p>
            <label className="flex items-center gap-1.5 w-fit px-3 py-2 rounded-lg border border-dashed border-black/20 text-[13px] text-[#555] cursor-pointer hover:bg-[#F7FAF9] transition-colors">
              <Paperclip size={14} />
              파일 선택
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={e => {
                  addFiles(e.target.files)
                  e.target.value = '' // 같은 파일을 다시 선택해도 onChange 가 나가도록
                }}
                className="hidden"
              />
            </label>
            {fileError && <p className="text-[11px] text-red-600 mt-1.5 m-0">{fileError}</p>}
            {files.length > 0 && (
              <ul className="flex flex-col gap-1.5 mt-2.5">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[#FAFAFA] text-[12px] text-[#555]">
                    <span className="truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="shrink-0 text-[#aaa] hover:text-[#333] cursor-pointer">
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
            disabled={submitInquiry.isPending}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60"
            style={{ background: '#2E7D6B' }}
          >
            {submitInquiry.isPending ? '접수 중…' : '문의하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
