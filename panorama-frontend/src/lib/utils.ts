/** 조건부 className 을 합쳐 문자열로 만든다. (clsx 없이 가볍게) */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
