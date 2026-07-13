/**
 * API 배럴(barrel). 도메인별 API/훅을 한 곳에서 re-export 한다.
 * 페이지에서는 `import { useBookSearch } from '@/api'` 처럼 쓰거나,
 * 도메인 파일을 직접 가리켜 `import { useBookSearch } from '@/api/book'` 로 써도 된다.
 *
 * 폴더 구조
 * - client.ts     : axios 인스턴스 + 에러 헬퍼 (공통, 수정 시 팀 공유)
 * - book.ts       : 도서 (완전 구현)
 * - community.ts  : 커뮤니티 (골격)
 * - auth.ts       : 인증 (골격)
 * - user.ts       : 마이페이지/유저 (골격)
 * - admin.ts      : 관리자 (골격)
 */
export * from './client'
export * from './book'
export * from './community'
export * from './auth'
export * from './user'
export * from './admin'
