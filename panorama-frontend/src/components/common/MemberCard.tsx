/**
 * 사이드바 회원 카드 (도서검색 / 커뮤니티 공용).
 *
 * - 상단: 아바타 + 별명(닉네임) + 그 아래 아이디(handle)만 표시.
 * - 하단: 2분할 카운트 버튼. 클릭하면 목록 영역이 해당 항목으로 바뀐다(부모가 처리).
 *   활성 항목은 초록색으로 강조된다.
 */

export interface MemberCardItem {
  key: string
  label: string
  /** 숫자, 미로그인/미조회면 null → '–' */
  count: number | null
  active?: boolean
  onClick: () => void
}

export function MemberCard({
  nickname,
  handle,
  items,
}: {
  nickname: string
  /** 아이디(@loginId) 또는 소셜 provider. 빈 값이면 표시하지 않음 */
  handle?: string
  items: MemberCardItem[]
}) {
  const initial = nickname.trim()?.[0] ?? '?'
  // @container + cqi 로 카드 폭에 맞춰 글씨가 유동적으로 줄고 는다(폭이 좁아져도 잘리지 않음).
  return (
    <div className="@container bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
      <div className="px-[clamp(14px,5cqi,20px)] pt-5 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-[clamp(38px,15cqi,48px)] h-[clamp(38px,15cqi,48px)] rounded-full flex items-center justify-center text-white text-[clamp(13px,5.5cqi,16px)] font-bold flex-shrink-0"
            style={{ background: '#2E7D6B' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-[clamp(12px,5.2cqi,14px)] font-bold text-[#1A1A1A] leading-none truncate">{nickname}</p>
            {handle && <p className="text-[clamp(10px,4.4cqi,12px)] text-[#aaa] mt-1.5 truncate">{handle}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F0F0F0]">
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              onClick={it.onClick}
              className="text-center group py-1 rounded-lg transition-colors hover:bg-[#F9F9F9]"
            >
              <p
                className="text-[clamp(16px,7.4cqi,20px)] font-bold leading-none"
                style={{ color: it.active ? '#2E7D6B' : '#1E4A38' }}
              >
                {it.count ?? '–'}
              </p>
              <p
                className={`text-[clamp(10px,4.4cqi,12px)] mt-1 transition-colors ${
                  it.active
                    ? 'text-[#2E7D6B] font-semibold'
                    : 'text-[#aaa] group-hover:text-[#2E7D6B]'
                }`}
              >
                {it.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
