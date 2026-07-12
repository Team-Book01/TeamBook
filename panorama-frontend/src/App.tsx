import { Routes, Route } from 'react-router-dom'

import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'

// 일반 사용자 페이지
import HomePage from '@/pages/home/HomePage'
import BookSearchPage from '@/pages/book/BookSearchPage'
import BookDetailPage from '@/pages/book/BookDetailPage'
import CommunityPage from '@/pages/community/CommunityPage'
import CommunityDetailPage from '@/pages/community/CommunityDetailPage'
import LibraryMapPage from '@/pages/library/LibraryMapPage'
import MyPage from '@/pages/mypage/MyPage'

// 인증(빈 페이지)
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import SettingsPage from '@/pages/auth/SettingsPage'

// 관리자 페이지
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminContentPage from '@/pages/admin/AdminContentPage'
import AdminClubsPage from '@/pages/admin/AdminClubsPage'
import AdminReportsPage from '@/pages/admin/AdminReportsPage'
import AdminInquiriesPage from '@/pages/admin/AdminInquiriesPage'
import AdminNoticesPage from '@/pages/admin/AdminNoticesPage'
import AdminSyncPage from '@/pages/admin/AdminSyncPage'

/**
 * App 은 라우팅만 담당한다. (화면 코드는 각 pages/<domain> 에 위치)
 *
 * - 일반 페이지  → Layout (상단 GNB + 푸터)
 * - 관리자 페이지 → AdminLayout (좌측 사이드바 + 상단바)
 */
export default function App() {
  return (
    <Routes>
      {/* 일반 사용자 영역 */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BookSearchPage />} />
        <Route path="/books/:isbn" element={<BookDetailPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:id" element={<CommunityDetailPage />} />
        <Route path="/library-map" element={<LibraryMapPage />} />
        <Route path="/mypage" element={<MyPage />} />

        {/* 인증 (빈 페이지 — auth 담당자 작업 예정) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 관리자 영역 */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="clubs" element={<AdminClubsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="inquiries" element={<AdminInquiriesPage />} />
        <Route path="notices" element={<AdminNoticesPage />} />
        <Route path="sync" element={<AdminSyncPage />} />
      </Route>

      {/* 404 → 홈 대체 (간단 처리) */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
