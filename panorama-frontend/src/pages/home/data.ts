import {
  Megaphone,
  ThumbsUp,
  FileText,
  MessagesSquare,
  Map,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PostCategory } from '@/types/community'

export interface Book {
  id: number
  title: string
  author: string
  cover: string
  rating: number
  category: string
}

export interface Post {
  id: number
  type: string
  title: string
  author: string
  views: number
  likes: number
  date: string
}

export interface Notice {
  id: number
  title: string
  date: string
  isNew: boolean
}

export interface QuickLink {
  label: string
  icon: LucideIcon
  /** 클릭 시 이동할 라우트 (react-router) */
  to: string
}

export type TabKey = '전체' | '인기' | '책추천' | '독후감' | '자유게시판'

/** 홈 게시판 탭 → 커뮤니티 카테고리(enum). '전체'·'인기'는 카테고리 없음. */
export const TAB_TO_CATEGORY: Record<TabKey, PostCategory | undefined> = {
  전체: undefined,
  인기: undefined,
  책추천: 'RECOMMEND',
  독후감: 'REVIEW',
  자유게시판: 'FREE',
}

export const HOME_TABS: TabKey[] = ['전체', '인기', '책추천', '독후감', '자유게시판']

export const POPULAR_BOOKS: Book[] = [
  { id: 1, title: '파친코', author: '이민진', cover: 'https://images.unsplash.com/photo-1555252586-d77e8c828e41?w=180&h=260&fit=crop&auto=format', rating: 4.8, category: '소설' },
  { id: 2, title: '82년생 김지영', author: '조남주', cover: 'https://images.unsplash.com/photo-1711185898226-beea7eee0611?w=180&h=260&fit=crop&auto=format', rating: 4.6, category: '소설' },
  { id: 3, title: '채식주의자', author: '한강', cover: 'https://images.unsplash.com/photo-1716892001555-c05f13f4362a?w=180&h=260&fit=crop&auto=format', rating: 4.7, category: '소설' },
  { id: 4, title: '아몬드', author: '손원평', cover: 'https://images.unsplash.com/photo-1529521818954-c76995518833?w=180&h=260&fit=crop&auto=format', rating: 4.5, category: '성장' },
  { id: 5, title: '해리포터와 마법사의 돌', author: 'J.K. 롤링', cover: 'https://images.unsplash.com/photo-1771765413413-65c53d3b5bf6?w=180&h=260&fit=crop&auto=format', rating: 4.9, category: '판타지' },
  { id: 6, title: '어린 왕자', author: '생텍쥐페리', cover: 'https://images.unsplash.com/photo-1714146997042-352ffcbc2631?w=180&h=260&fit=crop&auto=format', rating: 4.8, category: '고전' },
  { id: 7, title: '사피엔스', author: '유발 하라리', cover: 'https://images.unsplash.com/photo-1714146999251-aaa8f1fb4920?w=180&h=260&fit=crop&auto=format', rating: 4.7, category: '역사' },
  { id: 8, title: '미움받을 용기', author: '기시미 이치로', cover: 'https://images.unsplash.com/photo-1650735310293-307be67b3236?w=180&h=260&fit=crop&auto=format', rating: 4.5, category: '자기계발' },
  { id: 9, title: '불편한 편의점', author: '김호연', cover: 'https://images.unsplash.com/photo-1714146998587-be7c5070da2f?w=180&h=260&fit=crop&auto=format', rating: 4.4, category: '소설' },
]

export const NOTICES: Notice[] = [
  { id: 1, title: '파노라마북스 서비스 오픈 안내', date: '2026.07.01', isNew: true },
  { id: 2, title: '여름 독서 챌린지 이벤트 참여 안내', date: '2026.06.28', isNew: true },
  { id: 3, title: '도서 검색 기능 업데이트 안내', date: '2026.06.20', isNew: false },
  { id: 4, title: '이용약관 및 개인정보처리방침 개정 안내', date: '2026.06.10', isNew: false },
]

export const QUICK_LINKS: QuickLink[] = [
  { label: '공지사항', icon: Megaphone, to: '/notices' },
  { label: '책 추천', icon: ThumbsUp, to: '/community?tab=책추천' },
  { label: '독후감', icon: FileText, to: '/community?tab=독후감' },
  { label: '자유게시판', icon: MessagesSquare, to: '/community?tab=자유게시판' },
  { label: '도서관 지도', icon: Map, to: '/library-map' },
]

/** 커뮤니티 카테고리 enum → 배지 색 (홈 인기글 목록에서 사용) */
export const CATEGORY_BADGE: Record<PostCategory, string> = {
  RECOMMEND: 'bg-amber-100 text-amber-800',
  REVIEW: 'bg-blue-100 text-blue-800',
  FREE: 'bg-emerald-100 text-emerald-800',
}
