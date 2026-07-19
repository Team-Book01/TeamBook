import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type Editor from '@toast-ui/editor'
import { BookPlus, ChevronRight, X } from 'lucide-react'

import type { AttachedBook, PostCategory, PostDetail } from '@/types/community'
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABEL,
  toApiImageUrl,
  uploadPostImages,
  useCreatePost,
  usePost,
  useUpdatePost,
} from '@/api/community'
import { extractIsbnFromImage, searchBooks } from '@/api/book'
import { getErrorMessage } from '@/api/client'
import ToastEditor from './components/ToastEditor'
import BookSearchModal from './components/BookSearchModal'
import BookCoverThumb from './components/BookCoverThumb'

/** 에디터가 비어 있을 때 내놓는 HTML(<p><br></p> 등)을 빈 값으로 판정 */
function isEmptyHtml(html: string): boolean {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').trim() === '' && doc.body.querySelector('img') == null
}

/**
 * 작성 폼. 수정 모드는 로드된 post 를 초기값으로 받아 마운트된다.
 *
 * 이미지 흐름
 * - 에디터 addImageBlobHook → POST /posts/images 업로드
 * - 응답 imageUrl(8080 오리진 기준)을 절대 URL 로 보정해 본문에 삽입
 * - imageKey 는 별도 수집해 저장(POST /posts) 시 imageKeys 로 동봉 (수정 PUT 은 서버가 무시 → 미전송)
 */
function WriteForm({ post }: { post?: PostDetail }) {
  const navigate = useNavigate()
  const isEditMode = post != null

  const editorRef = useRef<Editor>(null)
  // 업로드된 이미지 키 수집 (본문에서 지워도 키는 남는다 — 서버 정책에 위임)
  const imageKeysRef = useRef<string[]>([])

  const [title, setTitle] = useState(post?.title ?? '')
  const [category, setCategory] = useState<PostCategory>(post?.category ?? 'FREE')

  // 책 첨부. 수정 모드는 상세 응답(isbn·bookTitle·bookAuthor·bookImageUrl)으로 기존 첨부 카드를 복원하고,
  // 그대로 저장하면 같은 4필드가 PUT 에 실려 첨부가 유지된다.
  const [attachedBook, setAttachedBook] = useState<AttachedBook | null>(() =>
    isEditMode && post.isbn != null && post.bookTitle != null
      ? {
          isbn: post.isbn,
          title: post.bookTitle,
          author: post.bookAuthor ?? '',
          imageUrl: post.bookImageUrl ?? '',
        }
      : null,
  )
  const [bookModalOpen, setBookModalOpen] = useState(false)

  // 에디터는 마운트 시 1회만 생성되어 onImageUpload 클로저가 고정된다(ToastEditor deps []).
  // 훅 안에서 최신 첨부 상태를 보려면 ref 미러가 필요하다.
  const attachedBookRef = useRef(attachedBook)
  attachedBookRef.current = attachedBook
  // OCR 자동 첨부는 "제안" 이므로 1회만. 사용자가 해제한 뒤 다음 이미지에서 되살아나지 않게 한다.
  const bookSuggestedRef = useRef(false)

  /**
   * 이미지 OCR → ISBN → 도서 검색 → 결과 1건이면 자동 첨부(제안).
   * 이미지에 책이 없는 건 정상 상황이라 실패는 전부 침묵한다(토스트/alert 금지).
   */
  const suggestBookFromImage = async (blob: Blob | File) => {
    if (bookSuggestedRef.current || attachedBookRef.current) return

    const isbn = await extractIsbnFromImage(blob)
    if (!isbn) return

    const items = await searchBooks({ keyword: isbn }).then(
      (res) => res.items,
      () => [],
    )
    // 정확히 1건일 때만 자동 선택 — 후보가 여럿이면 사용자가 직접 고르게 둔다
    if (items.length !== 1) return
    const [book] = items
    if (!book.isbn) return

    // await 사이에 사용자가 직접 첨부했을 수 있으므로 재확인 (사용자 선택 우선)
    if (bookSuggestedRef.current || attachedBookRef.current) return
    bookSuggestedRef.current = true
    setAttachedBook({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      imageUrl: book.image,
    })
  }

  const createPost = useCreatePost()
  const updatePost = useUpdatePost(post?.postId ?? 0)
  const isSaving = createPost.isPending || updatePost.isPending

  const onSave = () => {
    const editor = editorRef.current
    if (!editor) return

    const trimmedTitle = title.trim()
    const content = editor.getHTML()

    if (!trimmedTitle) return alert('제목을 입력해주세요.')
    if (trimmedTitle.length > 255) return alert('제목은 255자 이내로 입력해주세요.')
    if (isEmptyHtml(content)) return alert('내용을 입력해주세요.')

    // 첨부 책 4필드 — 미첨부면 모두 미포함 (수정 PUT 에서 미포함이면 서버가 기존 첨부를 해제한다)
    const bookFields = attachedBook
      ? {
          isbn: attachedBook.isbn,
          bookTitle: attachedBook.title, // isbn 을 실으면 bookTitle 필수
          bookAuthor: attachedBook.author,
          bookImageUrl: attachedBook.imageUrl,
        }
      : {}

    if (isEditMode) {
      // PUT 은 imageKeys 를 서버가 무시하므로 보내지 않는다
      updatePost.mutate(
        { category, title: trimmedTitle, content, ...bookFields },
        {
          onSuccess: () => navigate(`/community/${post.postId}`),
          onError: (e) => alert(getErrorMessage(e, '게시글 수정에 실패했어요.')),
        },
      )
    } else {
      createPost.mutate(
        {
          category,
          title: trimmedTitle,
          content,
          ...(imageKeysRef.current.length > 0 ? { imageKeys: imageKeysRef.current } : {}),
          ...bookFields,
        },
        {
          onSuccess: (res) => navigate(`/community/${res.postId}`, { replace: true }),
          onError: (e) => alert(getErrorMessage(e, '게시글 등록에 실패했어요.')),
        },
      )
    }
  }

  return (
    <>
      {/* 첨부된 책 카드 — 상세 화면과 동일하게 제목 줄 위에 놓는다 */}
      {attachedBook && (
        <div className="flex items-center gap-3 border border-[#D5EAE4] bg-[#F7FAF9] rounded-xl px-4 py-3">
          <BookCoverThumb imageUrl={attachedBook.imageUrl} title={attachedBook.title} width={44} height={62} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#1A1A1A] truncate m-0">{attachedBook.title}</p>
            <p className="text-xs text-[#999] truncate mt-0.5 m-0">{attachedBook.author}</p>
          </div>
          <button
            onClick={() => setBookModalOpen(true)}
            className="text-xs font-semibold text-[#2E7D6B] px-3 py-1.5 rounded-lg border border-[#D5EAE4] bg-white cursor-pointer flex-shrink-0"
          >
            교체
          </button>
          <button
            onClick={() => setAttachedBook(null)}
            className="flex items-center gap-1 text-xs font-semibold text-[#888] px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white cursor-pointer flex-shrink-0"
          >
            <X size={12} /> 첨부 해제
          </button>
        </div>
      )}

      {/* 책 첨부 + 카테고리 + 제목 — 앞 두 요소는 min-w-[100px] 로 현재 크기를 하한 삼고, 라벨이 길어지면 내용만큼 늘어난다 */}
      <div className="flex gap-3">
        {!attachedBook && (
          <button
            onClick={() => setBookModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 min-w-[100px] text-sm font-semibold text-[#2E7D6B] px-4 py-2.5 rounded-xl border border-[#D5EAE4] bg-white hover:bg-[#EFF6F2] transition-colors cursor-pointer flex-shrink-0 whitespace-nowrap"
          >
            <BookPlus size={15} /> 책 첨부
          </button>
        )}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PostCategory)}
          className="min-w-[100px] text-sm font-semibold text-[#333] bg-white border border-[#E0E0E0] rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-[#2E7D6B] transition-colors flex-shrink-0"
        >
          {POST_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {POST_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          placeholder="제목을 입력하세요"
          className="flex-1 min-w-0 text-[15px] font-semibold text-[#1A1A1A] bg-white border border-[#E0E0E0] rounded-xl px-4 py-2.5 outline-none focus:border-[#2E7D6B] transition-colors placeholder:text-[#ccc]"
        />
      </div>

      {/* 에디터 (수정 모드는 initialHtml 로 기존 본문 주입) */}
      <ToastEditor
        editorRef={editorRef}
        initialHtml={post?.content}
        onImageUpload={async (blob, callback) => {
          // 책 표지 OCR 제안 — 업로드와 별개로 병행 실행하며 업로드 흐름을 막지 않는다
          void suggestBookFromImage(blob).catch(() => {})

          // 이미지 업로드: 서버에 올리고 절대 URL 로 본문 삽입 + imageKey 수집
          try {
            const [image] = await uploadPostImages([blob as File])
            imageKeysRef.current.push(image.imageKey)
            callback(toApiImageUrl(image.imageUrl), 'image')
          } catch (e) {
            alert(getErrorMessage(e, '이미지 업로드에 실패했어요.'))
          }
        }}
      />

      {/* 저장 */}
      <div className="flex justify-end gap-2.5">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold px-6 py-2.5 rounded-xl border border-[#E0E0E0] bg-white text-[#888] cursor-pointer"
        >
          취소
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="text-sm font-bold px-6 py-2.5 rounded-xl text-white transition-all cursor-pointer disabled:opacity-60"
          style={{ background: '#1E4A38', boxShadow: '0 2px 8px rgba(30,74,56,0.2)' }}
        >
          {isSaving ? '저장 중…' : isEditMode ? '수정하기' : '등록하기'}
        </button>
      </div>

      {/* 책 검색 모달 */}
      {bookModalOpen && (
        <BookSearchModal
          onSelect={(book) => {
            setAttachedBook(book)
            setBookModalOpen(false)
          }}
          onClose={() => setBookModalOpen(false)}
        />
      )}
    </>
  )
}

/** 글쓰기(/community/write) · 수정(/community/:id/edit) 페이지 — 동일 페이지 재활용 */
export default function CommunityWritePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const postId = Number(id)
  const isEditMode = Number.isFinite(postId) && postId > 0

  const { data: post, isLoading, isError, error } = usePost(isEditMode ? postId : 0)

  return (
    <div
      className="min-h-screen"
      style={{ background: '#F9F9F9', fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <div className="max-w-[960px] mx-auto px-10 py-8">
        {/* 상단: 돌아가기 + 타이틀 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mb-4 text-sm font-medium text-[#888] cursor-pointer"
        >
          <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> 돌아가기
        </button>
        <h1 className="text-2xl font-black tracking-tight mb-6" style={{ color: '#1A1A1A' }}>
          {isEditMode ? '글 수정' : '새 글 작성'}
        </h1>

        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 flex flex-col gap-4">
          {isEditMode && isLoading ? (
            <p className="text-sm text-[#ccc] py-10 text-center">게시글을 불러오는 중…</p>
          ) : isEditMode && (isError || !post) ? (
            <p className="text-sm text-[#ccc] py-10 text-center">
              {getErrorMessage(error, '게시글을 불러오지 못했어요.')}
            </p>
          ) : (
            <WriteForm key={post?.postId ?? 'new'} post={post} />
          )}
        </div>
      </div>
    </div>
  )
}
