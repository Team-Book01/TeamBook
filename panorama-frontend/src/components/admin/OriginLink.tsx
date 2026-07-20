import { ExternalLink } from 'lucide-react'

/**
 * 관리자 화면에서 원본(사용자 화면)으로 건너뛰는 링크. 신고 관리·콘텐츠 관리 공용.
 *
 * 서버는 식별자만 주고 경로 조립은 여기서 한다(라우트 형태는 프론트가 아는 문제).
 *
 * 링크를 붙이는 대상은 게시글과 댓글뿐이다. 리뷰는 도서 상세로 보내도 그 리뷰로
 * 스크롤되지 않아 관리자가 결국 눈으로 찾아야 하는데, 원본 전문은 관리자 화면에 이미
 * 다 나와 있어 건너갈 이유가 없다. 사용자는 공개 프로필 화면 자체가 없다.
 */
interface Props {
  /** 이동할 게시글 ID. 게시글이면 자기 자신, 댓글이면 부모 글. 없으면 링크를 만들지 않는다. */
  postId: number | null | undefined
  /** 원본 상태(ACTIVE/HIDDEN/DELETED). ACTIVE 가 아니면 사용자 화면에서 열리지 않는다. */
  status: string | null | undefined
}

export default function OriginLink({ postId, status }: Props) {
  if (postId == null) return null

  // 숨김·삭제된 원본은 일반 화면에서 안 보인다. 링크를 살려두면 관리자가 빈 페이지를 보고
  // 링크가 깨진 줄 알게 되므로, 왜 못 여는지를 대신 적는다.
  if (status !== 'ACTIVE') {
    return (
      <span className="text-[10px] text-muted-foreground shrink-0">
        {status === 'DELETED' ? '삭제되어' : '숨김 처리되어'} 원본을 열 수 없습니다
      </span>
    )
  }

  return (
    // 처리 중이던 상세 화면을 잃지 않도록 새 탭으로 연다.
    <a
      href={`/community/${postId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[10px] font-semibold text-admin hover:underline shrink-0"
    >
      원본 보기 <ExternalLink size={11} />
    </a>
  )
}
