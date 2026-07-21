import { Route, Routes } from 'react-router-dom'

import { useAuthBootstrap } from '@/hooks/useAuthBootstrap'
import { useAuthQuerySync } from '@/hooks/useAuthQuerySync'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'
import RequireAuth from '@/components/auth/RequireAuth'
import RequireAdmin from '@/components/auth/RequireAdmin'

// 일반 사용자 페이지
import HomePage from '@/pages/home/HomePage'
import BookSearchPage from '@/pages/book/BookSearchPage'
import BookDetailPage from '@/pages/book/BookDetailPage'
import CommunityPage from '@/pages/community/CommunityPage'
import CommunityMyListPage from '@/pages/community/CommunityMyListPage'
import CommunityDetailPage from '@/pages/community/CommunityDetailPage'
import CommunityWritePage from '@/pages/community/CommunityWritePage'
import LibraryMapPage from '@/pages/library/LibraryMapPage'
import MyPage from '@/pages/mypage/MyPage'
import NoticesPage from '@/pages/notice/NoticesPage'
import NoticeDetailPage from '@/pages/notice/NoticeDetailPage'

// 인증
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import SettingsPage from '@/pages/auth/SettingsPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage'

// 관리자 페이지
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminContentPage from '@/pages/admin/AdminContentPage'
import AdminReportsPage from '@/pages/admin/AdminReportsPage'
import AdminInquiriesPage from '@/pages/admin/AdminInquiriesPage'
import AdminNoticesPage from '@/pages/admin/AdminNoticesPage'

/**
 * App 은 라우팅만 담당한다. (화면 코드는 각 pages/<domain> 에 위치)
 *
 * - 일반 페이지  → Layout (상단 GNB + 푸터)
 * - 관리자 페이지 → AdminLayout (좌측 사이드바 + 상단바)
 */
export default function App() {
  // 앱 시작 시 refresh 쿠키로 로그인 세션 복원 (새로고침해도 유지)
  useAuthBootstrap()
  // 세션 복원/로그인/로그아웃으로 사용자가 바뀌면 사용자별 쿼리(북마크 하트 등)를 다시 받는다
  useAuthQuerySync()

  return (
    <Routes>
      {/* 일반 사용자 영역 (공통 GNB + 푸터) */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BookSearchPage />} />
        <Route path="/books/:isbn" element={<BookDetailPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/library-map" element={<LibraryMapPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/notices/:id" element={<NoticeDetailPage />} />
        {/* 커뮤니티 목록/상세는 비로그인도 열람 가능(작성·좋아요·스크랩·신고 등은 동작 시 로그인 유도) */}
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:id" element={<CommunityDetailPage />} />
      </Route>

      {/* 전체화면 독립 페이지 (자체 헤더/레이아웃 보유 → 공통 Layout 미적용) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* 로그인이 필요한 페이지 (비로그인 시 /login 으로 리다이렉트) */}
      <Route element={<RequireAuth />}>
        {/* 마이페이지·커뮤니티는 공통 GNB(Layout) 를 사용 */}
        {/* 커뮤니티는 백엔드 전 엔드포인트가 인증 필요 → 목록/상세 포함 전체 보호 */}
        <Route element={<Layout />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/community/my-posts" element={<CommunityMyListPage mode="posts" />} />
          <Route path="/community/my-scraps" element={<CommunityMyListPage mode="scraps" />} />
          <Route path="/community/write" element={<CommunityWritePage />} />
          <Route path="/community/:id/edit" element={<CommunityWritePage />} />
        </Route>
        {/* 설정은 자체 헤더(뒤로가기)를 써서 Layout 미적용 */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 관리자 영역 (ADMIN 권한만 접근, 그 외는 로그인/메인으로) */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="notices" element={<AdminNoticesPage />} />
        </Route>
      </Route>

      {/* 404 → 홈 대체 (간단 처리) */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
