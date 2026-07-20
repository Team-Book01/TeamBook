import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 관리자 필터 바 공용 셀렉트.
 *
 * 브라우저 기본 드롭다운 화살표는 OS·브라우저마다 모양이 달라 appearance-none 으로 지우는데,
 * 그대로 두면 회색 상자가 되어 누를 수 있다는 단서가 사라진다. 그래서 화살표를 직접 그린다.
 * (pointer-events-none 이라 아이콘을 눌러도 셀렉트가 열린다)
 */
export const ADMIN_SELECT_CLS =
  'appearance-none pl-3 pr-8 py-2 rounded-xl border border-border text-sm text-foreground bg-gray-50 outline-none cursor-pointer focus:border-admin'

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
  /**
   * 기본 스타일(필터 바용)을 통째로 갈아끼울 때 쓴다. 상세 드로어의 입력 폼처럼
   * 다른 스타일 규칙을 따르는 자리를 위한 것이다. cn 은 단순 결합이라 className 으로
   * 덧씌워도 충돌하는 클래스가 서로를 덮지 못한다.
   * 넘길 때 appearance-none 과 화살표 자리(pr-8)를 반드시 포함할 것.
   */
  baseClassName?: string
}

export default function AdminSelect({ className, baseClassName = ADMIN_SELECT_CLS, children, ...rest }: Props) {
  return (
    <div className="relative shrink-0">
      <select className={cn(baseClassName, className)} {...rest}>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  )
}
