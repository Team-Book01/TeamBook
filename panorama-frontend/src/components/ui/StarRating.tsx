import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  size?: number
}

/** 공통 별점 표시 (0~5, 반올림하여 채운다). */
export function StarRating({ rating, size = 14 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-[#F5B301]' : 'text-[#E0E0E0]'}
          fill={i <= Math.round(rating) ? '#F5B301' : 'none'}
        />
      ))}
    </div>
  )
}
