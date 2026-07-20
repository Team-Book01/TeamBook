// 에디터 산출 HTML(제목/리스트/이미지 등)의 표시 스타일 — toastui-editor-contents 클래스와 짝
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Heart,
  Bookmark,
  MessageCircle,
  Eye,
  Flag,
  MoreVertical,
  CornerDownRight,
  ChevronRight,
  Edit3,
  Trash2,
  Calendar,
} from 'lucide-react'

import type { PostComment, PostCommentReply, PostDetail } from '@/types/community'
import {
  useCreateComment,
  useDeleteComment,
  useDeletePost,
  useLikePostMutation,
  usePost,
  usePostComments,
  useScrapPostMutation,
  useUpdateComment,
} from '@/api/community'
import { getErrorCode, getErrorMessage, getErrorStatus } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import BookCoverThumb from './components/BookCoverThumb'
import CategoryBadge from './components/CategoryBadge'
import CommunityLayout from './components/CommunityLayout'
import ReportModal from './components/ReportModal'
import { formatDateTime, formatRelativeTime, sanitizePostHtml } from './utils'

// ─── Avatar (닉네임 이니셜) ───────────────────────────────────────────────────
function Avatar({ nickname, size = 38 }: { nickname: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 text-white"
      style={{ width: size, height: size, background: '#2E7D6B', fontSize: size * 0.38 }}
    >
      {nickname.slice(0, 1)}
    </span>
  )
}

// ─── 게시글 메타 (제목/작성자/더보기 메뉴) ──────────────────────────────────
function PostMeta({ post, isMine }: { post: PostDetail; isMine: boolean }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const deletePost = useDeletePost()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onDelete = () => {
    if (!window.confirm('게시글을 삭제할까요? 삭제 후에는 되돌릴 수 없어요.')) return
    deletePost.mutate(post.postId, {
      onSuccess: () => navigate('/community', { replace: true }),
      onError: (e) => alert(getErrorMessage(e, '게시글 삭제에 실패했어요.')),
    })
  }

  return (
    <div>
      {/* 카테고리 & 도서 정보 */}
      <div className="flex items-center gap-3 mb-5">
        <CategoryBadge category={post.category} />
        {post.bookTitle != null && (
          <div className="flex items-center gap-2 min-w-0">
            <BookCoverThumb imageUrl={post.bookImageUrl} title={post.bookTitle} width={27} height={40} />
            <span className="text-[13px] font-semibold text-[#1A1A1A] truncate max-w-[220px]">
              {post.bookTitle}
            </span>
            {post.bookAuthor && (
              <>
                <span className="text-[13px] text-[#CCCCCC]">·</span>
                <span className="text-[13px] text-[#888] truncate max-w-[120px]">{post.bookAuthor}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 제목 */}
      <h1
        className="font-bold text-[#1A1A1A] mb-5"
        style={{ fontSize: 27, lineHeight: 1.45, letterSpacing: '-0.6px' }}
      >
        {post.title}
      </h1>

      {/* 작성자 + 날짜/조회수 한 줄 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar nickname={post.nickname} />
          <span className="text-sm font-semibold text-[#1A1A1A]">{post.nickname}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[13px] text-[#AAAAAA]">
            <Calendar size={13} />
            {formatDateTime(post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-[#AAAAAA]">
            <Eye size={13} />
            {post.viewCount.toLocaleString()}
          </span>
          {/* 더보기: 내 글일 때만 수정/삭제 노출 */}
          {isMine && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center p-1 rounded-md text-[#BBBBBB] hover:text-[#888] cursor-pointer"
              >
                <MoreVertical size={17} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-black/10 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden z-20 min-w-[110px]">
                  <button
                    onClick={() => navigate(`/community/${post.postId}/edit`)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-[13px] text-[#1A1A1A] hover:bg-[#F7F7F7] cursor-pointer"
                  >
                    <Edit3 size={13} /> 수정
                  </button>
                  <button
                    onClick={onDelete}
                    disabled={deletePost.isPending}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-[13px] text-[#D4183D] hover:bg-[#FFF5F6] cursor-pointer"
                  >
                    <Trash2 size={13} /> 삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <hr className="border-0 border-t border-black/[0.07] mt-5" />
    </div>
  )
}

// ─── 좋아요/스크랩/신고 버튼 ─────────────────────────────────────────────────
/**
 * 초기 상태는 상세 응답의 liked·scrapped·likeCount 로 렌더한다. (재진입 시 초기화 문제 수리)
 * - 토글은 낙관적 반영 후 응답값으로 확정. 등록이 409(P003/P004)면 "이미 처리됨"으로 재동기화 (에러 토스트 X)
 * - 취소는 멱등(항상 200)이라 실패 처리 불요
 */
function PostActions({ post }: { post: PostDetail }) {
  const postId = post.postId
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [scrapped, setScrapped] = useState(post.scrapped)
  const [reportOpen, setReportOpen] = useState(false)

  const likeMutation = useLikePostMutation(postId)
  const scrapMutation = useScrapPostMutation(postId)

  const toggleLike = () => {
    const prev = { liked, likeCount }
    const next = !liked
    setLiked(next) // 낙관적 반영
    setLikeCount(likeCount + (next ? 1 : -1))
    likeMutation.mutate(next, {
      onSuccess: (res) => {
        setLiked(res.liked)
        setLikeCount(res.likeCount)
      },
      onError: (e) => {
        if (getErrorStatus(e) === 409 && getErrorCode(e) === 'P003') {
          // 이미 좋아요한 글 → 눌린 상태로 재동기화 (카운트는 이전 값 유지)
          setLiked(true)
          setLikeCount(prev.likeCount)
          return
        }
        setLiked(prev.liked) // 그 외 실패 → 원복
        setLikeCount(prev.likeCount)
      },
    })
  }

  const toggleScrap = () => {
    const next = !scrapped
    setScrapped(next)
    scrapMutation.mutate(next, {
      onSuccess: (res) => setScrapped(res.scrapped),
      onError: (e) => {
        if (getErrorStatus(e) === 409 && getErrorCode(e) === 'P004') {
          setScrapped(true)
          return
        }
        setScrapped(!next)
      },
    })
  }

  return (
    <div className="mt-12 pt-8 border-t border-black/[0.07] flex items-center justify-end gap-2.5">
      <button
        onClick={toggleLike}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all"
        style={{
          border: `1.5px solid ${liked ? '#2E7D6B' : 'rgba(0,0,0,0.12)'}`,
          backgroundColor: liked ? '#E8F5F1' : '#FFFFFF',
        }}
      >
        <Heart size={17} color={liked ? '#2E7D6B' : '#888'} fill={liked ? '#2E7D6B' : 'none'} />
        <span className="text-sm font-semibold" style={{ color: liked ? '#2E7D6B' : '#888' }}>
          추천 {likeCount}
        </span>
      </button>

      <button
        onClick={toggleScrap}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all"
        style={{
          border: `1.5px solid ${scrapped ? '#1E4A38' : 'rgba(0,0,0,0.12)'}`,
          backgroundColor: scrapped ? '#F0F4F2' : '#FFFFFF',
        }}
      >
        <Bookmark size={17} color={scrapped ? '#1E4A38' : '#888'} fill={scrapped ? '#1E4A38' : 'none'} />
        <span className="text-sm font-semibold" style={{ color: scrapped ? '#1E4A38' : '#888' }}>
          {scrapped ? '스크랩됨' : '스크랩'}
        </span>
      </button>

      {/* 신고 */}
      <button
        onClick={() => setReportOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-all bg-white hover:bg-[#FFF5F6]"
        style={{ border: '1.5px solid rgba(0,0,0,0.12)' }}
      >
        <Flag size={15} color="#D4183D" />
        <span className="text-sm font-semibold text-[#888]">신고</span>
      </button>

      {reportOpen && <ReportModal targetId={postId} onClose={() => setReportOpen(false)} />}
    </div>
  )
}

// ─── 댓글 입력창 ─────────────────────────────────────────────────────────────
function CommentInput({
  postId,
  replyToCommentId,
  replyToNickname,
  onDone,
  onCancel,
  autoFocus = false,
}: {
  postId: number
  replyToCommentId?: number
  /** 답댓글에 대한 답글일 때 placeholder 안내("○○님에게 답글")용 대상 닉네임 — 전송 content 에는 반영하지 않는다 */
  replyToNickname?: string
  onDone?: () => void
  onCancel?: () => void
  autoFocus?: boolean
}) {
  const [text, setText] = useState('')
  const createComment = useCreateComment(postId)
  const isReply = replyToCommentId != null

  const submit = () => {
    const content = text.trim()
    if (!content) return
    createComment.mutate(
      { replyToCommentId: replyToCommentId ?? null, content },
      {
        onSuccess: () => {
          setText('')
          onDone?.()
        },
        onError: (e) => alert(getErrorMessage(e, '댓글 등록에 실패했어요.')),
      },
    )
  }

  const placeholder = replyToNickname
    ? `${replyToNickname}님에게 답글`
    : isReply
      ? '답글을 입력하세요...'
      : '따뜻한 댓글은 작성자에게 큰 힘이 됩니다 :)'

  return (
    <div className="flex-1">
      <textarea
        placeholder={placeholder}
        value={text}
        autoFocus={autoFocus}
        maxLength={500}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-[10px] text-[15px] text-[#1A1A1A] outline-none box-border resize-y bg-[#FAFAFA] focus:bg-white border-[1.5px] border-black/10 focus:border-[#2E7D6B] transition-colors px-4 py-3"
        style={{ minHeight: isReply ? 74 : 92, lineHeight: 1.65 }}
      />
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg border-[1.5px] border-black/10 text-[13px] text-[#888] bg-white cursor-pointer"
          >
            취소
          </button>
        )}
        <button
          onClick={submit}
          disabled={!text.trim() || createComment.isPending}
          className="text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{
            backgroundColor: text.trim() ? '#1E4A38' : '#AAAAAA',
            cursor: text.trim() ? 'pointer' : 'default',
          }}
        >
          등록
        </button>
      </div>
    </div>
  )
}

// ─── 댓글 본문 (수정 모드 지원) ──────────────────────────────────────────────
function CommentBody({
  postId,
  commentId,
  content,
  isMine,
  mentionNickname,
  onDeleted,
}: {
  postId: number
  commentId: number
  content: string
  isMine: boolean
  /** 답글 대상 닉네임 뱃지 (서버 도출 mentionNickname, null 이면 미표시) */
  mentionNickname?: string | null
  onDeleted?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(content)
  const updateComment = useUpdateComment(postId)
  const deleteComment = useDeleteComment(postId)

  const submitEdit = () => {
    const next = text.trim()
    if (!next) return
    updateComment.mutate(
      { commentId, content: next },
      {
        onSuccess: () => setEditing(false),
        onError: (e) => alert(getErrorMessage(e, '댓글 수정에 실패했어요.')),
      },
    )
  }

  const onDelete = () => {
    if (!window.confirm('댓글을 삭제할까요?')) return
    deleteComment.mutate(commentId, {
      onSuccess: onDeleted,
      onError: (e) => alert(getErrorMessage(e, '댓글 삭제에 실패했어요.')),
    })
  }

  if (editing) {
    return (
      <div>
        <textarea
          value={text}
          maxLength={500}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg text-sm text-[#1A1A1A] outline-none box-border resize-none bg-white border-[1.5px] border-[#2E7D6B] px-3.5 py-2.5"
          style={{ minHeight: 74, lineHeight: 1.6 }}
        />
        <div className="flex justify-end gap-2 mt-1.5">
          <button
            onClick={() => {
              setEditing(false)
              setText(content)
            }}
            className="px-3.5 py-1.5 rounded-md border border-black/10 text-xs text-[#888] bg-white cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={submitEdit}
            disabled={!text.trim() || updateComment.isPending}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-white cursor-pointer"
            style={{ background: '#1E4A38' }}
          >
            저장
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[15px] text-[#3A3A3A] m-0" style={{ lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
        {mentionNickname != null && (
          <span
            className="inline-flex items-center rounded-md px-1.5 py-0.5 mr-1.5 text-[13px] font-bold align-[1px]"
            style={{ background: '#E8F5F1', color: '#2E7D6B' }}
          >
            @{mentionNickname}
          </span>
        )}
        {content}
      </p>
      {isMine && (
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-[#999] hover:text-[#2E7D6B] cursor-pointer"
          >
            <Edit3 size={11} /> 수정
          </button>
          <button
            onClick={onDelete}
            disabled={deleteComment.isPending}
            className="flex items-center gap-1 text-xs text-[#999] hover:text-[#D4183D] cursor-pointer"
          >
            <Trash2 size={11} /> 삭제
          </button>
        </div>
      )}
    </div>
  )
}

// ─── 답댓글 아이템 ───────────────────────────────────────────────────────────
function ReplyItem({
  postId,
  reply,
  myNickname,
}: {
  postId: number
  reply: PostCommentReply
  myNickname?: string
}) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className="pl-5 pt-2.5 border-t border-black/5">
      <div className="rounded-[10px] px-4 py-3.5 bg-[#F7FAF9] border border-[#2E7D6B]/[0.12]">
        <div className="flex items-center gap-2 mb-2">
          <CornerDownRight size={13} color="#2E7D6B" strokeWidth={2} className="flex-shrink-0" />
          <Avatar nickname={reply.nickname} size={26} />
          <span className="text-[13px] font-semibold text-[#1A1A1A]">{reply.nickname}</span>
          <span className="text-xs text-[#BBBBBB]">{formatRelativeTime(reply.createdAt)}</span>
        </div>
        <div className="pl-[21px]">
          <CommentBody
            postId={postId}
            commentId={reply.commentId}
            content={reply.content}
            isMine={myNickname != null && reply.nickname === myNickname}
            mentionNickname={reply.mentionNickname}
          />
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-xs text-[#888] cursor-pointer"
            >
              <MessageCircle size={11} color="#AAAAAA" />
              답글 달기
            </button>
          </div>
        </div>
      </div>

      {/* 답댓글에 대한 답글 — 서버가 루트 댓글로 재부모화(1단계 평탄화)해 같은 루트 밑 시간순으로 붙는다.
          placeholder 로 대상만 안내하고 전송 content 에는 아무것도 덧붙이지 않는다 */}
      {showReply && (
        <div className="flex gap-2.5 mt-3 mb-1 pl-5">
          <CommentInput
            postId={postId}
            replyToCommentId={reply.commentId}
            replyToNickname={reply.nickname}
            autoFocus
            onDone={() => setShowReply(false)}
            onCancel={() => setShowReply(false)}
          />
        </div>
      )}
    </div>
  )
}

// ─── 원댓글 아이템 ───────────────────────────────────────────────────────────
function CommentItem({
  postId,
  comment,
  myNickname,
}: {
  postId: number
  comment: PostComment
  myNickname?: string
}) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className="pt-6 pb-2 border-t border-black/[0.06]">
      <div className="flex gap-3">
        <Avatar nickname={comment.nickname} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-[#1A1A1A]">{comment.nickname}</span>
            <span className="text-xs text-[#BBBBBB]">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <CommentBody
            postId={postId}
            commentId={comment.commentId}
            content={comment.content}
            isMine={myNickname != null && comment.nickname === myNickname}
          />
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-[13px] text-[#888] cursor-pointer"
            >
              <MessageCircle size={13} color="#AAAAAA" />
              답글 달기
            </button>
          </div>
        </div>
      </div>

      {showReply && (
        <div className="flex gap-2.5 mt-3 mb-1 pl-[52px]">
          <CommentInput
            postId={postId}
            replyToCommentId={comment.commentId}
            autoFocus
            onDone={() => setShowReply(false)}
            onCancel={() => setShowReply(false)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-2 mb-2 flex flex-col gap-1">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.commentId} postId={postId} reply={reply} myNickname={myNickname} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 댓글 섹션 ───────────────────────────────────────────────────────────────
function CommentSection({ postId, myNickname }: { postId: number; myNickname?: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostComments(postId)
  const comments = data?.pages.flatMap((p) => p.content) ?? []
  // 백엔드에 총 댓글수 API 가 없어 "불러온 루트 + 답댓글" 개수로 표기
  const loadedCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={18} color="#1E4A38" />
        <h2 className="text-lg font-bold text-[#1A1A1A] m-0">
          댓글 {loadedCount}
          {hasNextPage ? '+' : ''}개
        </h2>
      </div>

      <div className="flex gap-3 mb-9">
        {myNickname && <Avatar nickname={myNickname} />}
        <CommentInput postId={postId} />
      </div>

      {isLoading ? (
        <p className="text-sm text-[#ccc] py-4">댓글을 불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[#ccc] py-4">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              postId={postId}
              comment={comment}
              myNickname={myNickname}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-4 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-[13px] font-semibold text-[#2E7D6B] px-6 py-2 rounded-lg bg-[#F5F5F5] hover:bg-[#EBEBEB] transition-colors cursor-pointer"
          >
            {isFetchingNextPage ? '불러오는 중…' : '댓글 더 보기'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function CommunityDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const postId = Number(id)
  const user = useAuthStore((s) => s.user)

  // isLoading 이 아니라 isPending: 세션 복원 대기(enabled:false) 구간에서 isLoading 은 false 라
  // isLoading 으로 판단하면 부팅 중 잠깐 "불러오지 못했어요" 가 스친다.
  const { data: post, isPending, isError, error } = usePost(postId)

  // 본문은 다른 사용자가 작성한 HTML → sanitize 후 렌더 (이미지 오리진 보정 포함)
  const safeHtml = useMemo(() => (post ? sanitizePostHtml(post.content) : ''), [post])

  // 내 글 여부: /users/me 로 채워진 authStore user.id 와 상세 userId 비교 (isMine API 없음)
  const isMine = user != null && post != null && user.id === post.userId

  return (
    <CommunityLayout>
      {/* 목록으로 돌아가기 */}
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-1 mb-4 text-sm font-medium text-[#888] cursor-pointer"
      >
        <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> 목록으로
      </button>

      {isPending ? (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-16 text-center text-sm text-[#ccc]">
          게시글을 불러오는 중…
        </div>
      ) : isError || !post ? (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-16 text-center text-sm text-[#ccc]">
          {getErrorMessage(error, '게시글을 불러오지 못했어요.')}
        </div>
      ) : (
        <>
          <article className="bg-white rounded-2xl border border-[#EAEAEA] shadow-[0_2px_16px_rgba(0,0,0,0.04)] mb-5 px-6 py-8 md:px-[52px] md:py-10">
            <PostMeta post={post} isMine={isMine} />
            {/* 에디터 산출 HTML 본문 (sanitize 적용) */}
            <div
              className="toastui-editor-contents pt-9 text-[#2C2C2C]"
              style={{ lineHeight: 1.85, fontSize: 16, overflowWrap: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
            <PostActions post={post} />
          </article>

          <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-[0_2px_16px_rgba(0,0,0,0.04)] px-6 py-8 md:px-[52px] md:py-9">
            <CommentSection postId={post.postId} myNickname={user?.nickname} />
          </div>
        </>
      )}
    </CommunityLayout>
  )
}
