import {
  TrendingUp,
  ThumbsUp,
  FileText,
  Camera,
  Map,
  HelpCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
}

export type TabKey = '전체' | '책추천' | '독후감' | '독서인증'

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

export const POSTS: Record<TabKey, Post[]> = {
  전체: [
    { id: 1, type: '책추천', title: '올여름 꼭 읽어야 할 소설 5선', author: '책벌레김민수', views: 1240, likes: 87, date: '2026.07.01' },
    { id: 2, type: '독후감', title: '파친코를 읽고 — 역사의 무게를 느끼다', author: '이서연', views: 980, likes: 64, date: '2026.07.01' },
    { id: 3, type: '독서인증', title: '6월 독서 목표 달성! 10권 완독', author: '달리는독서가', views: 542, likes: 120, date: '2026.06.30' },
    { id: 4, type: '책추천', title: '요즘 자기계발서 추천드려요', author: '성장중인박준호', views: 876, likes: 55, date: '2026.06.30' },
    { id: 5, type: '독후감', title: '어린왕자 — 어른이 되어 다시 읽으니', author: '최유나', views: 1103, likes: 98, date: '2026.06.29' },
  ],
  책추천: [
    { id: 1, type: '책추천', title: '올여름 꼭 읽어야 할 소설 5선', author: '책벌레김민수', views: 1240, likes: 87, date: '2026.07.01' },
    { id: 2, type: '책추천', title: '요즘 자기계발서 추천드려요', author: '성장중인박준호', views: 876, likes: 55, date: '2026.06.30' },
    { id: 3, type: '책추천', title: '판타지 소설 입문자를 위한 추천 목록', author: '판타지덕후', views: 654, likes: 43, date: '2026.06.28' },
  ],
  독후감: [
    { id: 1, type: '독후감', title: '파친코를 읽고 — 역사의 무게를 느끼다', author: '이서연', views: 980, likes: 64, date: '2026.07.01' },
    { id: 2, type: '독후감', title: '어린왕자 — 어른이 되어 다시 읽으니', author: '최유나', views: 1103, likes: 98, date: '2026.06.29' },
    { id: 3, type: '독후감', title: '사피엔스를 다 읽었습니다. 충격이네요', author: '역사애호가', views: 724, likes: 71, date: '2026.06.27' },
  ],
  독서인증: [
    { id: 1, type: '독서인증', title: '6월 독서 목표 달성! 10권 완독', author: '달리는독서가', views: 542, likes: 120, date: '2026.06.30' },
    { id: 2, type: '독서인증', title: '오늘도 한 권 완독 인증합니다', author: '매일독서', views: 311, likes: 88, date: '2026.06.29' },
    { id: 3, type: '독서인증', title: '아이와 함께 그림책 5권 완독!', author: '육아맘독서', views: 428, likes: 95, date: '2026.06.28' },
  ],
}

export const NOTICES: Notice[] = [
  { id: 1, title: '파노라마북스 서비스 오픈 안내', date: '2026.07.01', isNew: true },
  { id: 2, title: '여름 독서 챌린지 이벤트 참여 안내', date: '2026.06.28', isNew: true },
  { id: 3, title: '도서 검색 기능 업데이트 안내', date: '2026.06.20', isNew: false },
  { id: 4, title: '이용약관 및 개인정보처리방침 개정 안내', date: '2026.06.10', isNew: false },
]

export const QUICK_LINKS: QuickLink[] = [
  { label: '인기 도서', icon: TrendingUp },
  { label: '책 추천', icon: ThumbsUp },
  { label: '독후감', icon: FileText },
  { label: '독서 인증', icon: Camera },
  { label: '도서관 지도', icon: Map },
  { label: '문의 게시판', icon: HelpCircle },
]

export const TYPE_BADGE: Record<string, string> = {
  책추천: 'bg-amber-100 text-amber-800',
  독후감: 'bg-blue-100 text-blue-800',
  독서인증: 'bg-purple-100 text-purple-800',
}
