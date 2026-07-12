export interface Post {
  id: number;
  category: string;
  title: string;
  certified: boolean;
  author: string;
  views: number;
  comments: number;
  likes: number;
  status: string;
  date: string;
  thumbnail: boolean;
  flagged?: boolean;
}

export interface Comment {
  id: number;
  postTitle: string;
  isReply: boolean;
  content: string;
  author: string;
  likes: number;
  status: string;
  date: string;
  flagged?: boolean;
}

export interface Review {
  id: number;
  book: string;
  author: string;
  cover: string;
  rating: number;
  content: string;
  reviewer: string;
  status: string;
  date: string;
  likes: number;
  flagged?: boolean;
}

export const TABS = [
  { id: "posts", label: "게시글 관리", count: "14,320" },
  { id: "comments", label: "댓글 관리", count: "38,204" },
  { id: "reviews", label: "리뷰 관리", count: "5,182" },
];

export const POSTS: Post[] = [
  {
    id: 2847,
    category: "추천",
    title: "한강 작가 신작 함께 읽어요 — 『빛과 어둠의 계절』 읽기 모임",
    certified: true,
    author: "책읽는달팽이",
    views: 4821,
    comments: 63,
    likes: 217,
    status: "ACTIVE",
    date: "2026.07.06 14:23",
    thumbnail: true,
  },
  {
    id: 2846,
    category: "리뷰",
    title: "82년생 김지영 독후감 — 10년이 지나도 변하지 않는 것들",
    certified: true,
    author: "조용한독자",
    views: 3104,
    comments: 41,
    likes: 189,
    status: "ACTIVE",
    date: "2026.07.06 11:07",
    thumbnail: false,
  },
  {
    id: 2845,
    category: "자유",
    title: "요즘 읽고 있는 책 공유해요 (7월 여름 추천 리스트)",
    certified: false,
    author: "북카페소녀",
    views: 1872,
    comments: 28,
    likes: 94,
    status: "ACTIVE",
    date: "2026.07.05 22:51",
    thumbnail: false,
  },
  {
    id: 2844,
    category: "추천",
    title: "『채식주의자』 한강 노벨문학상 이후 다시 읽기",
    certified: true,
    author: "문학청년",
    views: 6320,
    comments: 88,
    likes: 341,
    status: "ACTIVE",
    date: "2026.07.05 18:30",
    thumbnail: true,
  },
  {
    id: 2841,
    category: "자유",
    title: "특정 작가 비방 및 인신공격 댓글 (신고 3건)",
    certified: false,
    author: "익명사용자22",
    views: 208,
    comments: 14,
    likes: 2,
    status: "HIDDEN",
    date: "2026.07.05 09:14",
    thumbnail: false,
    flagged: true,
  },
  {
    id: 2839,
    category: "리뷰",
    title: "파친코 이민진 — 4대에 걸친 가족서사의 힘 ★★★★★",
    certified: true,
    author: "이민진팬",
    views: 2941,
    comments: 37,
    likes: 156,
    status: "ACTIVE",
    date: "2026.07.04 16:45",
    thumbnail: true,
  },
  {
    id: 2837,
    category: "추천",
    title: "이 책은 읽었습니까! — 사실 아님 (허위정보 신고 접수)",
    certified: false,
    author: "황당한유저",
    views: 89,
    comments: 3,
    likes: 0,
    status: "DELETED",
    date: "2026.07.04 11:22",
    thumbnail: false,
    flagged: true,
  },
  {
    id: 2835,
    category: "자유",
    title: "독서 슬럼프 극복하는 나만의 방법 공유합니다",
    certified: false,
    author: "슬럼프탈출",
    views: 1543,
    comments: 52,
    likes: 203,
    status: "ACTIVE",
    date: "2026.07.03 20:10",
    thumbnail: false,
  },
  {
    id: 2833,
    category: "리뷰",
    title: "도둑맞은 집중력 — 스마트폰 없이 책 읽기 도전 후기",
    certified: false,
    author: "디지털디톡스",
    views: 2210,
    comments: 29,
    likes: 118,
    status: "ACTIVE",
    date: "2026.07.03 14:38",
    thumbnail: false,
  },
  {
    id: 2830,
    category: "추천",
    title: "동일 내용 반복 게시 (10회 이상) — 스팸 처리 예정",
    certified: false,
    author: "반복게시자",
    views: 34,
    comments: 1,
    likes: 0,
    status: "HIDDEN",
    date: "2026.07.03 09:05",
    thumbnail: false,
    flagged: true,
  },
];

export const COMMENTS: Comment[] = [
  {
    id: 8821,
    postTitle: "한강 작가 신작 함께 읽어요",
    isReply: false,
    content: "저도 꼭 참여하고 싶어요! 신청 방법이 따로 있나요?",
    author: "책향기가득",
    likes: 12,
    status: "ACTIVE",
    date: "2026.07.06 14:55",
  },
  {
    id: 8820,
    postTitle: "82년생 김지영 독후감",
    isReply: true,
    content: "저도 같은 부분에서 눈물이 났어요. 공감이에요.",
    author: "조용한독자2",
    likes: 8,
    status: "ACTIVE",
    date: "2026.07.06 13:20",
  },
  {
    id: 8819,
    postTitle: "특정 작가 비방 및 인신공격 댓글",
    isReply: false,
    content: "이 작가는 진짜 최악이에요. [욕설 포함 — 신고 5건]",
    author: "익명사용자22",
    likes: 0,
    status: "HIDDEN",
    date: "2026.07.05 09:20",
    flagged: true,
  },
  {
    id: 8818,
    postTitle: "파친코 이민진 — 4대에 걸친 가족서사",
    isReply: false,
    content: "번역본도 정말 훌륭하더라고요. 원서로도 도전해보고 싶어요.",
    author: "번역덕후",
    likes: 19,
    status: "ACTIVE",
    date: "2026.07.04 17:10",
  },
  {
    id: 8816,
    postTitle: "독서 슬럼프 극복하는 나만의 방법",
    isReply: true,
    content: "저는 짧은 단편소설부터 다시 시작했더니 도움이 됐어요!",
    author: "단편소설러버",
    likes: 24,
    status: "ACTIVE",
    date: "2026.07.03 21:05",
  },
  {
    id: 8814,
    postTitle: "동일 내용 반복 게시",
    isReply: false,
    content: "광고성 댓글입니다. 무시해주세요.",
    author: "반복게시자",
    likes: 0,
    status: "DELETED",
    date: "2026.07.03 09:08",
    flagged: true,
  },
];

export const REVIEWS: Review[] = [
  {
    id: 1041,
    book: "채식주의자",
    author: "한강",
    cover: "🌿",
    rating: 5,
    content: "언어가 이렇게 날카롭고 아름다울 수 있다는 걸 처음 알았습니다. 노벨문학상 수상 후 다시 읽으니...",
    reviewer: "문학청년",
    status: "ACTIVE",
    date: "2026.07.06 10:20",
    likes: 47,
  },
  {
    id: 1040,
    book: "파친코",
    author: "이민진",
    cover: "🏯",
    rating: 5,
    content: "4대에 걸친 가족의 이야기가 이렇게 촘촘하게 짜여있을 줄 몰랐어요. 재일교포의 삶을...",
    reviewer: "이민진팬",
    status: "ACTIVE",
    date: "2026.07.05 19:30",
    likes: 38,
  },
  {
    id: 1039,
    book: "도둑맞은 집중력",
    author: "요한 하리",
    cover: "📵",
    rating: 4,
    content: "스마트폰 중독 문제를 이렇게 체계적으로 다룬 책은 처음이에요. 다만 후반부가 조금...",
    reviewer: "디지털디톡스",
    status: "ACTIVE",
    date: "2026.07.05 14:15",
    likes: 22,
  },
  {
    id: 1038,
    book: "82년생 김지영",
    author: "조남주",
    cover: "👩",
    rating: 4,
    content: "읽는 내내 불편했지만 그 불편함이 바로 핵심이라는 생각이 들었어요. 우리 사회의...",
    reviewer: "조용한독자",
    status: "ACTIVE",
    date: "2026.07.04 20:48",
    likes: 61,
  },
  {
    id: 1037,
    book: "아몬드",
    author: "손원평",
    cover: "🌰",
    rating: 3,
    content: "흥미로운 소재였지만 개인적으로는 주인공의 감정 표현 방식이 조금 아쉬웠습니다.",
    reviewer: "솔직한리뷰어",
    status: "HIDDEN",
    date: "2026.07.04 11:30",
    likes: 3,
    flagged: true,
  },
  {
    id: 1036,
    book: "해리포터와 마법사의 돌",
    author: "J.K. 롤링",
    cover: "⚡",
    rating: 5,
    content: "어릴 때 읽고 어른이 되어 다시 읽었어요. 새로운 감동이 있더라고요. 호그와트로 돌아...",
    reviewer: "마법사팬",
    status: "ACTIVE",
    date: "2026.07.03 16:55",
    likes: 29,
  },
];
