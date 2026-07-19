import type { PostCategory } from '@/types/community'
import { POST_CATEGORY_LABEL } from '@/api/community'

/** 카테고리별 배지 색상 (enum 기준) */
const BADGE: Record<PostCategory, { bg: string; text: string; dot: string }> = {
  RECOMMEND: { bg: '#F2EFFE', text: '#7B69B5', dot: '#9B8BC4' },
  REVIEW: { bg: '#EBF3FC', text: '#3A6EA0', dot: '#6B9BD1' },
  FREE: { bg: '#FEF8E0', text: '#996A00', dot: '#F5C451' },
}

export default function CategoryBadge({ category }: { category: PostCategory }) {
  const s = BADGE[category] ?? BADGE.FREE
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-[11px] font-bold leading-none"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {POST_CATEGORY_LABEL[category] ?? category}
    </span>
  )
}
