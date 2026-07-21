import { Megaphone } from 'lucide-react'
import { NOTICES } from '@/pages/home/data'

/**
 * 공지사항 목록 (일반 사용자용).
 *
 * ⚠️ 현재 백엔드에는 일반 사용자용 공지 조회 API 가 없다(/admin/notices 는 ADMIN 전용).
 *    → 임시로 홈에서 쓰던 목업(NOTICES)을 그대로 노출한다.
 *    백엔드에 공개 GET /api/v1/notices 가 생기면 useQuery 로 교체하면 된다.
 */
export default function NoticesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <Megaphone size={20} className="text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">공지사항</h1>
      </div>

      <ul className="flex flex-col divide-y divide-[#F0F0F0] rounded-2xl border border-[#EAEAEA] bg-white">
        {NOTICES.map((n) => (
          <li key={n.id} className="flex items-start gap-3 px-6 py-5">
            {n.isNew && (
              <span className="mt-0.5 shrink-0 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                NEW
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium leading-snug text-foreground">{n.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
