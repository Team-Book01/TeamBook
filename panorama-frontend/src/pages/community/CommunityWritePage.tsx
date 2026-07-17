import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type Editor from '@toast-ui/editor'
import { ChevronRight } from 'lucide-react'

import type { PostCategory, PostDetail } from '@/types/community'
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABEL,
  toApiImageUrl,
  uploadPostImages,
  useCreatePost,
  usePost,
  useUpdatePost,
} from '@/api/community'
import { getErrorMessage } from '@/api/client'
import ToastEditor from './components/ToastEditor'

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

    if (isEditMode) {
      // PUT 은 imageKeys 를 서버가 무시하므로 보내지 않는다
      updatePost.mutate(
        { category, title: trimmedTitle, content },
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
      {/* 카테고리 + 제목 */}
      <div className="flex gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PostCategory)}
          className="text-sm font-semibold text-[#333] bg-white border border-[#E0E0E0] rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-[#2E7D6B] transition-colors flex-shrink-0"
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
          className="flex-1 text-[15px] font-semibold text-[#1A1A1A] bg-white border border-[#E0E0E0] rounded-xl px-4 py-2.5 outline-none focus:border-[#2E7D6B] transition-colors placeholder:text-[#ccc]"
        />
      </div>

      {/* 에디터 (수정 모드는 initialHtml 로 기존 본문 주입) */}
      <ToastEditor
        editorRef={editorRef}
        initialHtml={post?.content}
        onImageUpload={async (blob, callback) => {
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
