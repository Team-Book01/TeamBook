# 파노라마북스 Frontend

도서 검색 + 독서 커뮤니티 서비스 **파노라마북스**의 프론트엔드.
팀원 4명이 Figma Make로 각각 만든 화면들을 **하나의 React 앱**으로 통합한 구조입니다.

- 스택: React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · React Router v7 · Zustand · Axios
- 백엔드: Spring Boot (`http://localhost:8080`) — 개발 시 `/api` 프록시로 호출

## 실행 방법

```bash
npm install      # 의존성 설치 (최초 1회)
npm run dev      # 개발 서버 (Vite, HMR) → http://localhost:5173
npm run build    # 타입체크 + 프로덕션 빌드
npm run lint     # ESLint
npm run format   # Prettier 정리
```

> 백엔드 연동: `npm run dev` 상태에서 `/api/*` 요청은 `vite.config.ts`의 프록시를 통해
> `http://localhost:8080` 으로 전달됩니다(CORS 회피). API base URL은 `.env`의 `VITE_API_BASE_URL`.

## 폴더 구조

```
src/
├─ App.tsx                 # 라우팅만 담당 (경로 → 페이지 매핑)
├─ main.tsx                # 진입점 (BrowserRouter 세팅)
├─ index.css               # 전역 스타일 + 디자인 토큰(@theme) + 폰트
│
├─ components/
│  ├─ layout/              # 공통 레이아웃
│  │  ├─ Header.tsx        # 사이트 공통 상단 GNB (통합本)
│  │  ├─ Footer.tsx        # 공통 푸터
│  │  ├─ Layout.tsx        # GNB + 콘텐츠 + 푸터 (일반 페이지용)
│  │  ├─ AdminSidebar.tsx  # 관리자 좌측 사이드바 (통합本, 8개 메뉴)
│  │  └─ AdminLayout.tsx   # 사이드바 + 상단바 + 콘텐츠 (관리자 페이지용)
│  └─ ui/                  # 공통 UI 컴포넌트 (Card, Badge, Avatar, StarRating, PagePlaceholder)
│
├─ pages/                  # ★ 기능(도메인)별 폴더 — 각 팀원 작업 위치
│  ├─ home/                # 홈 (/)
│  ├─ book/                # 도서 검색·상세 (/books, /books/:isbn)
│  ├─ community/           # 커뮤니티 (/community, /community/:id)
│  ├─ library/             # 도서관 지도 (/library-map)
│  ├─ admin/               # 관리자 (/admin, /admin/*)
│  ├─ mypage/              # 마이페이지 (빈 페이지)
│  └─ auth/                # 로그인·회원가입·계정설정 (빈 페이지)
│
├─ store/                  # zustand 전역 상태 (authStore.ts)
├─ lib/                    # api.ts(axios 인스턴스), utils.ts(cn)
├─ types/                  # 공통 타입 정의
└─ styles/                 # (필요 시 추가 전역 스타일)
```

각 도메인 폴더는 페이지 컴포넌트 + 그 페이지 전용 하위 컴포넌트(`components/`)와
더미 데이터(`data.ts`)를 함께 둡니다. 더미 데이터는 추후 `lib/api.ts`를 통한 실제 API 호출로 교체하세요.

## 라우팅

| 경로 | 화면 | 파일 |
|------|------|------|
| `/` | 홈 | `pages/home/HomePage.tsx` |
| `/books` | 도서 검색 목록 | `pages/book/BookSearchPage.tsx` |
| `/books/:isbn` | 도서 상세 | `pages/book/BookDetailPage.tsx` |
| `/community` | 커뮤니티 게시판 | `pages/community/CommunityPage.tsx` |
| `/community/:id` | 커뮤니티 글 상세 | `pages/community/CommunityDetailPage.tsx` |
| `/library-map` | 도서관 지도 | `pages/library/LibraryMapPage.tsx` |
| `/admin` | 관리자 대시보드 | `pages/admin/AdminDashboardPage.tsx` |
| `/admin/users` | 사용자 관리 | `pages/admin/AdminUsersPage.tsx` |
| `/admin/content` | 콘텐츠 관리 | `pages/admin/AdminContentPage.tsx` |
| `/admin/reports` | 신고 관리 | `pages/admin/AdminReportsPage.tsx` |
| `/admin/inquiries` | 문의 관리 | `pages/admin/AdminInquiriesPage.tsx` |
| `/admin/notices` | 공지사항 관리 | `pages/admin/AdminNoticesPage.tsx` |
| `/admin/clubs`, `/admin/sync` | (준비 중) | placeholder |
| `/mypage` | 마이페이지 | `pages/mypage/MyPage.tsx` *(빈 페이지)* |
| `/login`, `/signup`, `/settings` | 인증 | `pages/auth/*` *(빈 페이지)* |

## 팀원별 작업 위치

프론트도 백엔드처럼 **기능(도메인) 단위로 분리**되어 있습니다. 각자 자기 도메인 폴더 안에서만 작업하세요.

| 담당(도메인) | 작업 폴더 | 대응 백엔드 |
|---|---|---|
| **도서 검색** | `src/pages/book/` | `domain/book` |
| **커뮤니티** | `src/pages/community/` | `domain/community` |
| **도서관 지도** | `src/pages/library/` | `domain/libMap` |
| **관리자** | `src/pages/admin/` | `domain/admin` |
| (공통) 홈 | `src/pages/home/` | — |
| (예정) 인증·마이페이지 | `src/pages/auth/`, `src/pages/mypage/` | `domain/user` |

### 공통 규칙
- **상단 GNB / 관리자 사이드바는 절대 페이지 안에 다시 만들지 마세요.**
  `components/layout/`의 `Header` / `AdminSidebar`가 공통本입니다. 메뉴 추가는 이 파일에서.
- 색상·폰트는 `index.css`의 디자인 토큰(`@theme`)을 사용하세요.
  - 브랜드 그린: `bg-brand`(#1E4A38) · `text-brand-point`(#2E7D6B) · `bg-brand-light`(#EFF6F2)
  - 시맨틱: `bg-primary` `text-foreground` `bg-muted` `border-border` 등
  - 폰트: 본문 Noto Sans KR / 제목 Noto Serif KR (전역 적용)
- 경로 별칭 `@/` → `src/` (예: `import { api } from '@/lib/api'`).
- API 호출은 `@/lib/api`의 axios 인스턴스를, 로그인 상태는 `@/store/authStore`를 사용하세요.

## 통합 시 반영된 정리 사항
- 5가지로 제각각이던 상단 GNB → **BookSearch_List 기준**으로 하나의 `Header`로 통합
  (메뉴: 홈 · 도서 검색 · 커뮤니티 · 도서관 지도 / 우측: 로그인 버튼).
- 관리자 5개 화면의 좌측 사이드바 → 하나의 `AdminSidebar`로 통합(다크그린 #1E4A38, lucide 아이콘).
- 브랜드 색상을 딥그린 `#1E4A38` 계열로 통일, 브랜드명 표기 "파노라마북스"로 통일.
- 각 팀원 `App.tsx`의 화면 코드를 해당 `pages/<domain>/` 페이지로 이전하고, 더미 데이터를 `data.ts`로 분리.
