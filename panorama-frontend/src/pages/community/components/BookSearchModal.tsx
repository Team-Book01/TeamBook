import { useState } from 'react'
import { Search, X } from 'lucide-react'

import type { AttachedBook } from '@/types/community'
import { useBookSearch } from '@/api/book'
import { getErrorMessage } from '@/api/client'
import BookCoverThumb from './BookCoverThumb'

/**
 * 글쓰기 책 첨부용 검색 모달.
 * 검색은 팀 도서 API(useBookSearch, GET /books/search)를 재활용하고,
 * 결과에서 한 권을 선택하면 AttachedBook 으로 변환해 돌려준다.
 */
export default function BookSearchModal({
  onSelect,
  onClose,
}: {
  onSelect: (book: AttachedBook) => void
  onClose: () => void
}) {
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('') // 검색 실행된 키워드 (빈 값이면 요청 안 나감)

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBookSearch({ keyword })
  const items = data?.pages.flatMap((p) => p.items) ?? []

  const search = () => setKeyword(input.trim())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[560px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <h2 className="text-base font-bold text-[#1A1A1A] m-0">책 첨부</h2>
          <button onClick={onClose} className="p-1 rounded-md text-[#aaa] hover:text-[#333] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* 검색 입력 */}
        <div className="flex gap-2 px-5 py-4">
          <div className="flex items-center gap-2 flex-1 border border-[#E0E0E0] focus-within:border-[#2E7D6B] rounded-xl px-3 py-2.5 transition-colors">
            <Search size={15} color="#2E7D6B" className="flex-shrink-0" />
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) search()
              }}
              placeholder="책 제목·저자를 검색하세요"
              className="flex-1 text-sm text-[#333] outline-none bg-transparent placeholder:text-[#ccc]"
            />
          </div>
          <button
            onClick={search}
            className="text-sm font-bold px-5 rounded-xl text-white cursor-pointer"
            style={{ background: '#1E4A38' }}
          >
            검색
          </button>
        </div>

        {/* 결과 목록 */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {keyword === '' ? (
            <p className="text-sm text-[#ccc] text-center py-10">첨부할 책을 검색해 보세요.</p>
          ) : isLoading ? (
            <p className="text-sm text-[#ccc] text-center py-10">검색 중…</p>
          ) : isError ? (
            <p className="text-sm text-[#ccc] text-center py-10">
              {getErrorMessage(error, '검색에 실패했어요.')}
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#ccc] text-center py-10">검색 결과가 없어요.</p>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-[#F5F5F5]">
                {items.map((book) => {
                  // isbn 없는 항목은 첨부 불가 (서버 find-or-create 키)
                  const canAttach = book.isbn.length > 0
                  return (
                    <li key={book.isbn || book.link}>
                      <button
                        disabled={!canAttach}
                        onClick={() =>
                          onSelect({
                            isbn: book.isbn,
                            title: book.title,
                            author: book.author,
                            imageUrl: book.image,
                            description: book.description,
                            pubdate: book.pubdate,
                            publisher: book.publisher,
                            shopUrl: book.link,
                            discount: book.discount,
                          })
                        }
                        className="flex items-center gap-3 w-full text-left py-3 px-2 rounded-xl hover:bg-[#F7FAF9] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                      >
                        <BookCoverThumb imageUrl={book.image} title={book.title} width={44} height={62} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate m-0">{book.title}</p>
                          <p className="text-xs text-[#999] truncate mt-0.5 m-0">
                            {book.author}
                            {book.publisher ? ` · ${book.publisher}` : ''}
                          </p>
                          {!canAttach && <p className="text-[11px] text-[#ccc] mt-0.5 m-0">ISBN 없음 — 첨부 불가</p>}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {hasNextPage && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-[13px] font-semibold text-[#2E7D6B] px-6 py-2 rounded-lg bg-[#F5F5F5] hover:bg-[#EBEBEB] transition-colors cursor-pointer"
                  >
                    {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
