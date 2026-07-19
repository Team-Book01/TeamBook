import { useState } from 'react'

/**
 * 책 표지 썸네일. 이미지가 없거나 로드 실패 시 단색 배경 + 제목 폴백
 * (책 상세 페이지의 BookCoverLarge 처리 방식 차용).
 */
export default function BookCoverThumb({
  imageUrl,
  title,
  width = 56,
  height = 78,
}: {
  imageUrl?: string | null
  title: string
  width?: number
  height?: number
}) {
  const [imgError, setImgError] = useState(false)

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={title}
        onError={() => setImgError(true)}
        className="object-cover rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.18)] flex-shrink-0"
        style={{ width, height }}
      />
    )
  }

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
      style={{ width, height, background: '#1E4A38' }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: 'linear-gradient(135deg, #2E7D6B 0%, transparent 60%)' }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-1.5">
        <div className="w-full h-[1px] bg-white opacity-30 mb-1" />
        <p
          className="text-white font-bold leading-tight opacity-90 line-clamp-3 m-0"
          style={{ fontSize: 8, wordBreak: 'keep-all' }}
        >
          {title}
        </p>
      </div>
    </div>
  )
}
