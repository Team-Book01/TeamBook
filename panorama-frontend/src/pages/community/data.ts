// ─── Types ────────────────────────────────────────────────────────────────────

export type MainTab = "전체" | "인기" | "책 추천" | "독후감" | "독서 인증";
export type PeriodChip = "주간" | "월간" | "전체기간";

export interface Post {
  id: number;
  category: Exclude<MainTab, "전체" | "인기">;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  title: string;
  preview: string;
  author: string;
  authorInitial: string;
  authorColor: string;
  timeAgo: string;
  views: number;
  likes: number;
  comments: number;
  image?: string;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

export const ALL_POSTS: Post[] = [
  {
    id: 1,
    category: "책 추천",
    bookTitle: "아몬드",
    bookAuthor: "손원평",
    bookCover:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=60&h=80&fit=crop&auto=format",
    title: "감정을 잘 못 느끼는 주인공, 그런데 왜 이렇게 감동적일까 — 아몬드 추천",
    preview:
      "공감 능력이 없는 소년의 이야기를 담담하게 서술한 이 소설이 어떻게 이렇게 큰 감동을 줄 수 있는지 처음엔 의아했어요. 읽어나가다 보면 역설적으로 감정이 없는 인물이 우리의 감정을 가장 잘 건드린다는 걸 알게 됩니다.",
    author: "여름밤독서",
    authorInitial: "여",
    authorColor: "#2E7D6B",
    timeAgo: "어제",
    views: 2105,
    likes: 132,
    comments: 58,
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=140&h=110&fit=crop&auto=format",
  },
  {
    id: 2,
    category: "독후감",
    bookTitle: "도둑맞은 집중력",
    bookAuthor: "요한 하리",
    bookCover:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=60&h=80&fit=crop&auto=format",
    title: "스마트폰을 잠깐 내려놓게 만든 책 — 도둑맞은 집중력 독후감",
    preview:
      "이 책을 읽는 동안만큼은 스마트폰을 옆에 두지 않았습니다. 내 집중력이 왜 이렇게 산산조각 났는지, 그리고 그게 단지 개인의 의지력 문제가 아님을 설득력 있게 설명해줘서 자책이 좀 줄었어요.",
    author: "사색하는곰",
    authorInitial: "사",
    authorColor: "#4A7DB5",
    timeAgo: "4일 전",
    views: 1430,
    likes: 108,
    comments: 41,
  },
  {
    id: 3,
    category: "책 추천",
    bookTitle: "불편한 편의점",
    bookAuthor: "김호연",
    bookCover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=60&h=80&fit=crop&auto=format",
    title: "올해 읽은 한국 소설 중 단연 최고, 이 책을 강력히 추천합니다",
    preview:
      "처음엔 그냥 술술 읽히는 가벼운 소설인 줄 알았는데, 읽다 보니 너무 많은 감정이 올라와서 마지막 페이지에서 한참을 멍하니 있었어요. 주인공 독고 씨의 하루하루가 담담하게 그려지는데, 그 담담함이 오히려 더 깊은 여운을 남깁니다.",
    author: "달빛독서가",
    authorInitial: "달",
    authorColor: "#7B69B5",
    timeAgo: "2시간 전",
    views: 1240,
    likes: 87,
    comments: 34,
  },
  {
    id: 4,
    category: "독후감",
    bookTitle: "82년생 김지영",
    bookAuthor: "조남주",
    bookCover:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=60&h=80&fit=crop&auto=format",
    title: "82년생 김지영을 다시 읽으며 — 5년 전과 완전히 달라진 내 감상",
    preview:
      "처음 읽었을 때는 20대 초반이었고 지금은 30대가 됐습니다. 같은 책인데 읽히는 부분이 완전히 달라졌어요. 특히 직장 생활 관련 챕터에서는 제 이야기 같아서 책을 덮고 한참을 생각했습니다.",
    author: "지훈이아빠",
    authorInitial: "지",
    authorColor: "#1E4A38",
    timeAgo: "어제",
    views: 1780,
    likes: 94,
    comments: 47,
  },
  {
    id: 5,
    category: "책 추천",
    bookTitle: "미드나잇 라이브러리",
    bookAuthor: "매트 헤이그",
    bookCover:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=60&h=80&fit=crop&auto=format",
    title: "인생의 수많은 선택들에 대해 다시 생각하게 해준 소설, 꼭 읽어보세요",
    preview:
      "죽음과 삶의 경계에서 평행 우주 속 자신의 다른 선택들을 경험하는 이야기인데요, 읽는 내내 내가 하지 못한 선택들이 떠올라서 울다 웃다를 반복했습니다. 결말이 너무 예쁩니다.",
    author: "북클럽멤버",
    authorInitial: "북",
    authorColor: "#9B8BC4",
    timeAgo: "3일 전",
    views: 890,
    likes: 71,
    comments: 29,
  },
  {
    id: 6,
    category: "독서 인증",
    bookTitle: "사피엔스",
    bookAuthor: "유발 하라리",
    bookCover:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=60&h=80&fit=crop&auto=format",
    title: "드디어 사피엔스 완독! 형광펜이 이렇게 많아진 책은 처음이에요",
    preview:
      "3개월 전부터 조금씩 읽었는데 결국 오늘 마지막 장을 덮었습니다. 농업혁명 챕터에서 한 번, 인지혁명 부분에서 한 번 멈추고 생각에 잠겼어요. 우리가 '진보'라고 부르는 것들이 정말 진보인지 묻게 만드는 책입니다.",
    author: "독서습관중",
    authorInitial: "독",
    authorColor: "#B08000",
    timeAgo: "8시간 전",
    views: 540,
    likes: 45,
    comments: 16,
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=140&h=110&fit=crop&auto=format",
  },
  {
    id: 7,
    category: "독서 인증",
    bookTitle: "파친코",
    bookAuthor: "이민진",
    bookCover:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=60&h=80&fit=crop&auto=format",
    title: "파친코 완독 챌린지 달성! 4권짜리 대하소설과 함께한 두 달의 기록",
    preview:
      "영어 원서로 도전했다가 결국 번역본으로 바꿨지만 그래도 해냈습니다. 이민 1세대부터 4세대까지의 이야기가 이렇게 촘촘하게 엮여 있을 줄은 몰랐어요. 선자 할머니의 삶이 특히 마음을 울렸습니다.",
    author: "책읽는직장인",
    authorInitial: "책",
    authorColor: "#C45C2E",
    timeAgo: "2일 전",
    views: 320,
    likes: 28,
    comments: 9,
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=140&h=110&fit=crop&auto=format",
  },
  {
    id: 8,
    category: "독후감",
    bookTitle: "채식주의자",
    bookAuthor: "한강",
    bookCover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=60&h=80&fit=crop&auto=format",
    title: "한강 작가의 문체가 이렇게 섬세한지 몰랐다 — 채식주의자 독후감",
    preview:
      "노벨문학상 수상 이후 처음 읽은 한강의 소설이었는데, 예상보다 훨씬 강렬하고 불편하고, 그래서 더 오래 기억에 남는 작품이었습니다. '꿈'에 대한 서술 방식이 특히 인상적이었어요.",
    author: "책벌레_수현",
    authorInitial: "수",
    authorColor: "#4A7DB5",
    timeAgo: "5시간 전",
    views: 892,
    likes: 63,
    comments: 21,
  },
];

export const HOT_POSTS = [
  { rank: 1, title: "감정을 잘 못 느끼는 주인공, 그런데 왜 이렇게 감동적일까 — 아몬드 추천", likes: 132 },
  { rank: 2, title: "스마트폰을 잠깐 내려놓게 만든 책 — 도둑맞은 집중력 독후감", likes: 108 },
  { rank: 3, title: "82년생 김지영을 다시 읽으며 — 5년 전과 달라진 내 감상", likes: 94 },
  { rank: 4, title: "올해 읽은 한국 소설 중 단연 최고, 불편한 편의점 강력 추천", likes: 87 },
  { rank: 5, title: "인생의 수많은 선택들에 대해 다시 생각하게 해준 소설", likes: 71 },
];

export const POPULAR_BOOKS = [
  {
    title: "아몬드",
    author: "손원평",
    cover:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=72&h=96&fit=crop&auto=format",
    count: 42,
  },
  {
    title: "불편한 편의점",
    author: "김호연",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=72&h=96&fit=crop&auto=format",
    count: 38,
  },
  {
    title: "채식주의자",
    author: "한강",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=72&h=96&fit=crop&auto=format",
    count: 27,
  },
];

// ─── Badge ────────────────────────────────────────────────────────────────────

export const BADGE: Record<
  Exclude<MainTab, "전체" | "인기">,
  { bg: string; text: string; dot: string }
> = {
  "책 추천": { bg: "#F2EFFE", text: "#7B69B5", dot: "#9B8BC4" },
  독후감: { bg: "#EBF3FC", text: "#3A6EA0", dot: "#6B9BD1" },
  "독서 인증": { bg: "#FEF8E0", text: "#996A00", dot: "#F5C451" },
};

export const MAIN_TABS: MainTab[] = ["전체", "인기", "책 추천", "독후감", "독서 인증"];
export const PERIOD_CHIPS: PeriodChip[] = ["주간", "월간", "전체기간"];
