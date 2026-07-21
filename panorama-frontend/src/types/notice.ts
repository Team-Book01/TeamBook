/**
 * 공지사항 공개 조회 타입. types/admin.ts 의 Notice* 타입과 일부러 분리했다 —
 * 그쪽은 status(HIDDEN/DELETED)·userId 등 관리자 전용 필드를 담고 있어, 공개 화면이
 * 그 타입을 그대로 쓰면 "왜 여기서 관리자 타입을 쓰지"라는 혼란과 함께 있지도 않을
 * 필드에 의존하는 코드가 생기기 쉽다.
 */
export type NoticeCategory = 'GENERAL' | 'EVENT' | 'UPDATE' | 'MAINTENANCE'

export interface NoticeSummary {
  noticeId: number
  category: NoticeCategory
  title: string
  pinned: boolean
  important: boolean
  createdAt: string
}

export interface NoticeDetail {
  noticeId: number
  category: NoticeCategory
  title: string
  content: string
  pinned: boolean
  important: boolean
  viewCount: number
  nickname: string
  createdAt: string
}
