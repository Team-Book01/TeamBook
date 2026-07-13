// ── Types ────────────────────────────────────────────────────────────────────

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  price: string;
  coverColor: string;
  coverAccent: string;
  ratingType: "star" | "review";
  rating?: number;
  reviewCount?: number;
  reviewText?: string;
  bookmarked: boolean;
  likes: number;
}

export interface LibraryItem {
  id: number;
  name: string;
  district: string;
  address: string;
  available: boolean;
  total: number;
  loan: number;
}

export interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  likes: number;
}

// ── Static data ───────────────────────────────────────────────────────────────

export const ALL_BOOKS: Book[] = [
  { id: 1, title: "채식주의자", author: "한강", publisher: "창비", publishDate: "2007.10", price: "12,600원", coverColor: "#1E4A38", coverAccent: "#2E7D6B", ratingType: "star", rating: 4.6, reviewCount: 2847, bookmarked: false, likes: 4821 },
  { id: 2, title: "82년생 김지영", author: "조남주", publisher: "민음사", publishDate: "2016.10", price: "13,500원", coverColor: "#3A5F8A", coverAccent: "#5B8FCA", ratingType: "review", rating: 4.4, reviewCount: 1921, reviewText: "우리 시대 모든 여성의 이야기가 담긴 필독서입니다", bookmarked: true, likes: 1853 },
  { id: 3, title: "아몬드", author: "손원평", publisher: "창비", publishDate: "2017.03", price: "14,400원", coverColor: "#6B3E8A", coverAccent: "#9B6ECA", ratingType: "star", rating: 4.3, reviewCount: 1284, bookmarked: false, likes: 974 },
  { id: 4, title: "아버지의 해방일지", author: "정지아", publisher: "창비", publishDate: "2022.11", price: "15,300원", coverColor: "#2E7D6B", coverAccent: "#4AADA0", ratingType: "review", rating: 4.2, reviewCount: 743, reviewText: "인생 책이에요, 여운이 오래 남습니다", bookmarked: false, likes: 632 },
  { id: 5, title: "흰", author: "한강", publisher: "문학동네", publishDate: "2018.04", price: "11,700원", coverColor: "#7A4A2A", coverAccent: "#B07040", ratingType: "star", rating: 4.5, reviewCount: 987, bookmarked: false, likes: 1204 },
  { id: 6, title: "작별하지 않는다", author: "한강", publisher: "문학동네", publishDate: "2021.09", price: "14,400원", coverColor: "#3A5A3A", coverAccent: "#5A8A5A", ratingType: "review", rating: 4.8, reviewCount: 1632, reviewText: "매 페이지마다 눈물이 났어요. 꼭 읽어보세요", bookmarked: false, likes: 2109 },
  { id: 7, title: "파과", author: "구병모", publisher: "위즈덤하우스", publishDate: "2013.06", price: "13,050원", coverColor: "#2A4A6A", coverAccent: "#4A7AAA", ratingType: "star", rating: 4.1, reviewCount: 642, bookmarked: false, likes: 388 },
  { id: 8, title: "밤의 여행자들", author: "윤고은", publisher: "민음사", publishDate: "2013.04", price: "12,600원", coverColor: "#8A4A3A", coverAccent: "#CA7A6A", ratingType: "review", rating: 3.8, reviewCount: 412, reviewText: "상상력이 넘치는 독특한 세계관에 완전히 빠져들었어요", bookmarked: false, likes: 521 },
  { id: 9, title: "소년이 온다", author: "한강", publisher: "창비", publishDate: "2014.05", price: "13,500원", coverColor: "#1A3A5A", coverAccent: "#2A6A9A", ratingType: "star", rating: 4.7, reviewCount: 2341, bookmarked: true, likes: 3017 },
  { id: 10, title: "지구에서 한아름", author: "이기호", publisher: "민음사", publishDate: "2019.04", price: "14,400원", coverColor: "#4A3A2A", coverAccent: "#8A6A4A", ratingType: "review", rating: 3.9, reviewCount: 318, reviewText: "삶에 대한 따뜻한 위로를 건네는 소설", bookmarked: false, likes: 277 },
];

export const MORE_BOOKS: Book[] = [
  { id: 11, title: "불편한 편의점", author: "김호연", publisher: "나무옆의자", publishDate: "2021.04", price: "14,400원", coverColor: "#2A5A3A", coverAccent: "#4A9A6A", ratingType: "star", rating: 4.2, reviewCount: 3102, bookmarked: false, likes: 3102 },
  { id: 12, title: "달러구트 꿈 백화점", author: "이미예", publisher: "팩토리나인", publishDate: "2020.07", price: "14,220원", coverColor: "#5A3A8A", coverAccent: "#9A6ACA", ratingType: "review", rating: 4.1, reviewCount: 2184, reviewText: "잠들기 전 읽으면 정말 달콤한 꿈을 꿀 것 같아요", bookmarked: false, likes: 2947 },
  { id: 13, title: "7년의 밤", author: "정유정", publisher: "은행나무", publishDate: "2011.04", price: "15,300원", coverColor: "#1A2A4A", coverAccent: "#3A5A8A", ratingType: "star", rating: 4.4, reviewCount: 1876, bookmarked: false, likes: 1124 },
  { id: 14, title: "완전한 행복", author: "정유정", publisher: "은행나무", publishDate: "2021.08", price: "15,300원", coverColor: "#5A1A1A", coverAccent: "#9A3A3A", ratingType: "review", rating: 4.3, reviewCount: 702, reviewText: "읽는 내내 손에 땀을 쥐게 만드는 완벽한 스릴러!", bookmarked: false, likes: 865 },
  { id: 15, title: "구의 증명", author: "최진영", publisher: "은행나무", publishDate: "2015.04", price: "13,500원", coverColor: "#1E4A38", coverAccent: "#2E7D6B", ratingType: "star", rating: 4.7, reviewCount: 2897, bookmarked: false, likes: 1247 },
];

export const POPULAR = [
  { rank: 1, title: "채식주의자", author: "한강", likes: 4821 },
  { rank: 2, title: "불편한 편의점", author: "김호연", likes: 3102 },
  { rank: 3, title: "달러구트 꿈 백화점", author: "이미예", likes: 2947 },
  { rank: 4, title: "82년생 김지영", author: "조남주", likes: 1853 },
  { rank: 5, title: "구의 증명", author: "최진영", likes: 1247 },
];

export const BOOK_DESCRIPTIONS: Record<number, string> = {
  1: "《채식주의자》는 한강의 연작소설로, 어느 날 갑자기 채식주의자가 되기로 결심한 영혜와 그녀를 둘러싼 사람들의 이야기를 담고 있습니다. 영혜의 선택은 단순한 식습관의 변화가 아니라, 인간의 폭력성과 욕망, 그리고 자유에 대한 근원적인 질문을 던집니다. 부커상을 수상하며 전 세계적으로 주목받은 작품으로, 인간 존재의 본질을 탐구하는 한강 특유의 문체가 빛을 발하는 소설입니다. 세 편의 연작으로 구성된 이 소설은 각각 다른 화자의 시점에서 영혜를 바라보며, 억압과 해방, 광기와 순수 사이의 경계를 섬세하게 그려냅니다.",
  9: "《소년이 온다》는 1980년 5월 광주민주화운동을 배경으로 한 한강의 소설입니다. 열다섯 살 소년 동호를 중심으로, 그 사건에 휩쓸린 사람들의 내면을 깊고도 아프게 들여다봅니다. 죽음과 상실, 살아남은 자의 죄책감, 그리고 역사의 폭력 앞에서 인간의 존엄을 지키려 했던 이들의 이야기를 담았습니다. 한강은 이 작품을 통해 역사적 사건을 단순히 기록하는 것이 아니라, 그 속에서 살아가고 죽어간 인간들의 숨결을 되살려냅니다.",
};

export const DEFAULT_DESCRIPTION = "이 책은 오늘날 한국 문학의 새로운 지평을 열었다는 평가를 받고 있습니다. 작가 특유의 섬세하고 깊이 있는 문체로 인간의 내면을 탐구하며, 독자로 하여금 오랜 여운을 남깁니다. 국내외 각종 문학상을 수상하며 그 작품성을 인정받았으며, 수십만 독자의 사랑을 받고 있는 현대 한국 문학의 수작입니다. 삶과 죽음, 사랑과 상실, 기억과 망각이라는 보편적 주제를 독창적인 시각으로 풀어내어 독자에게 깊은 감동을 선사합니다.";

export const BOOK_EXTRA: Record<number, { isbn: string; pages: number; category: string; postCount: number }> = {
  1:  { isbn: "978-89-364-6133-1", pages: 247, category: "한국소설", postCount: 312 },
  2:  { isbn: "978-89-374-3527-5", pages: 190, category: "한국소설", postCount: 204 },
  3:  { isbn: "978-89-364-6202-4", pages: 264, category: "한국소설", postCount: 178 },
  4:  { isbn: "978-89-364-6265-9", pages: 232, category: "한국소설", postCount: 95 },
  5:  { isbn: "978-89-546-4476-2", pages: 136, category: "한국소설", postCount: 143 },
  6:  { isbn: "978-89-546-7864-4", pages: 324, category: "한국소설", postCount: 267 },
  7:  { isbn: "978-89-597-0741-2", pages: 288, category: "한국소설", postCount: 61 },
  8:  { isbn: "978-89-374-2987-8", pages: 312, category: "한국소설", postCount: 77 },
  9:  { isbn: "978-89-364-6237-6", pages: 216, category: "한국소설", postCount: 389 },
  10: { isbn: "978-89-374-4283-9", pages: 280, category: "한국소설", postCount: 42 },
};

export const SEOUL_DISTRICTS = [
  "전체", "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구",
  "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구",
  "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구",
  "은평구", "종로구", "중구", "중랑구",
];

export const ALL_LIBRARIES: LibraryItem[] = [
  { id: 1,  name: "국립중앙도서관",          district: "서초구",   address: "반포대로 201",     available: true,  total: 3, loan: 1 },
  { id: 2,  name: "서울도서관",              district: "중구",     address: "세종대로 110",     available: true,  total: 2, loan: 0 },
  { id: 3,  name: "강남구립도서관",           district: "강남구",   address: "개포로 617",       available: false, total: 2, loan: 2 },
  { id: 4,  name: "마포구립도서관",           district: "마포구",   address: "독막로 324",       available: true,  total: 2, loan: 1 },
  { id: 5,  name: "노원구립도서관",           district: "노원구",   address: "노해로 437",       available: true,  total: 1, loan: 0 },
  { id: 6,  name: "송파구립도서관",           district: "송파구",   address: "올림픽로 240",     available: false, total: 3, loan: 3 },
  { id: 7,  name: "성북구립도서관",           district: "성북구",   address: "보문로 168",       available: true,  total: 2, loan: 1 },
  { id: 8,  name: "은평구립도서관",           district: "은평구",   address: "통일로 1049",      available: true,  total: 1, loan: 0 },
  { id: 9,  name: "서대문구립도서관",          district: "서대문구", address: "연희로 273",       available: false, total: 2, loan: 2 },
  { id: 10, name: "동작구립도서관",           district: "동작구",   address: "사당로 83",        available: true,  total: 2, loan: 0 },
  { id: 11, name: "관악구립도서관",           district: "관악구",   address: "관악로 145",       available: true,  total: 1, loan: 0 },
  { id: 12, name: "종로구립도서관",           district: "종로구",   address: "율곡로 282",       available: false, total: 2, loan: 2 },
  { id: 13, name: "광진구립도서관",           district: "광진구",   address: "구천면로 375",     available: true,  total: 2, loan: 1 },
  { id: 14, name: "중랑구립도서관",           district: "중랑구",   address: "봉화산로 174",     available: true,  total: 1, loan: 0 },
  { id: 15, name: "강서구립도서관",           district: "강서구",   address: "방화대로 212",     available: false, total: 2, loan: 2 },
  { id: 16, name: "양천구립도서관",           district: "양천구",   address: "오목로 268",       available: true,  total: 1, loan: 0 },
  { id: 17, name: "영등포구립도서관",          district: "영등포구", address: "도신로 200",       available: true,  total: 2, loan: 1 },
  { id: 18, name: "구로구립도서관",           district: "구로구",   address: "구로중앙로 113",   available: false, total: 1, loan: 1 },
  { id: 19, name: "금천구립도서관",           district: "금천구",   address: "시흥대로 73길 70", available: true,  total: 2, loan: 0 },
  { id: 20, name: "강북구립도서관",           district: "강북구",   address: "도봉로 348",       available: true,  total: 1, loan: 0 },
  { id: 21, name: "도봉구립도서관",           district: "도봉구",   address: "마들로 657",       available: false, total: 2, loan: 2 },
  { id: 22, name: "강동구립도서관",           district: "강동구",   address: "천호대로 1212",    available: true,  total: 2, loan: 1 },
  { id: 23, name: "성동구립도서관",           district: "성동구",   address: "왕십리로 399",     available: true,  total: 1, loan: 0 },
  { id: 24, name: "용산구립도서관",           district: "용산구",   address: "한강대로 405",     available: false, total: 2, loan: 2 },
  { id: 25, name: "동대문구립도서관",          district: "동대문구", address: "무학로 16길 4",    available: true,  total: 1, loan: 0 },
  { id: 26, name: "서초구립도서관",           district: "서초구",   address: "서초중앙로 96",    available: true,  total: 2, loan: 1 },
  { id: 27, name: "마포중앙도서관",           district: "마포구",   address: "마포대로 195",     available: false, total: 3, loan: 3 },
  { id: 28, name: "강남구청 어린이도서관",     district: "강남구",   address: "테헤란로 114",     available: true,  total: 1, loan: 0 },
  { id: 29, name: "서울시립 어린이도서관",     district: "종로구",   address: "사직로9길 7",      available: true,  total: 2, loan: 1 },
  { id: 30, name: "국회도서관",               district: "영등포구", address: "의사당대로 1",     available: false, total: 2, loan: 2 },
  { id: 31, name: "이진아기념도서관",          district: "서대문구", address: "증가로 45",        available: true,  total: 1, loan: 0 },
  { id: 32, name: "정독도서관",               district: "종로구",   address: "북촌로5길 48",     available: true,  total: 2, loan: 0 },
  { id: 33, name: "남산도서관",               district: "용산구",   address: "소월로 109",       available: false, total: 1, loan: 1 },
];

export const SAMPLE_REVIEWS: Review[] = [
  { id: 1,  author: "달빛독서가",    avatar: "달", rating: 5, text: "인생에서 손에 꼽을 만한 독서 경험이었습니다. 마지막 페이지를 덮고 나서도 한참 동안 멍하니 앉아 있었어요. 문장 하나하나가 날카롭게 마음을 파고듭니다.", date: "2024.05.12", likes: 42 },
  { id: 2,  author: "북스타그램",    avatar: "북", rating: 5, text: "번역으로 읽었는데도 이 정도인데, 원문은 얼마나 아름다울까요. 한강 작가의 필력에 완전히 압도당했습니다.", date: "2024.04.28", likes: 31 },
  { id: 3,  author: "책과함께",      avatar: "책", rating: 4, text: "불편하고 불쾌한 느낌이 드는 소설이지만, 그게 이 소설의 힘이라고 생각해요. 쉽게 읽히진 않지만 읽고 나면 많은 것을 생각하게 됩니다.", date: "2024.04.15", likes: 27 },
  { id: 4,  author: "문학소녀77",    avatar: "문", rating: 5, text: "영혜가 내리는 선택의 의미를 곱씹으며 읽었습니다. 여성의 몸, 자유 의지, 그리고 사회의 폭력에 대해 이토록 강렬하게 말하는 소설은 처음이에요.", date: "2024.03.30", likes: 38 },
  { id: 5,  author: "활자중독자",    avatar: "활", rating: 3, text: "기대가 너무 컸던 탓인지 조금 아쉬웠습니다. 하지만 세 편의 연작이 각자 다른 방식으로 영혜를 조명하는 구성은 탁월했어요.", date: "2024.03.20", likes: 14 },
  { id: 6,  author: "독서왕",        avatar: "독", rating: 5, text: "부커상 수상이 전혀 과하지 않은 작품. 오히려 더 큰 상을 받아야 마땅하다고 느꼈습니다. 한국 문학의 자랑입니다.", date: "2024.03.10", likes: 55 },
  { id: 7,  author: "책바람",        avatar: "바", rating: 4, text: "세 번째 이야기 '나무 불꽃'이 가장 인상 깊었어요. 인체를 예술로 표현하는 부분이 충격적이면서도 아름다웠습니다.", date: "2024.02.28", likes: 22 },
  { id: 8,  author: "봄날독서",      avatar: "봄", rating: 4, text: "읽는 내내 숨이 막히는 느낌이었는데, 그 압박감이 오히려 이 소설의 매력인 것 같아요. 다음 작품들도 빨리 읽고 싶어졌습니다.", date: "2024.02.14", likes: 19 },
  { id: 9,  author: "오후의독서",    avatar: "오", rating: 5, text: "영혜의 침묵이 그 어떤 언어보다 강렬하게 말을 걸어옵니다. 오랫동안 잊지 못할 소설입니다.", date: "2024.01.30", likes: 33 },
  { id: 10, author: "책방고양이",    avatar: "냥", rating: 3, text: "문체는 아름답지만 소재가 워낙 무거워서 가볍게 읽기는 어렵습니다. 마음의 준비를 하고 읽는 것을 권장합니다.", date: "2024.01.15", likes: 17 },
  { id: 11, author: "한국문학팬",    avatar: "팬", rating: 5, text: "한강 작가의 모든 작품을 읽었지만 이 책이 단연 최고입니다. 번역된 영어 버전도 읽어봤는데 두 언어 모두에서 빛나는 작품이에요.", date: "2024.01.02", likes: 28 },
  { id: 12, author: "독서노트",      avatar: "노", rating: 4, text: "주인공의 선택을 이해하기 어려웠지만, 그 이해할 수 없음 자체가 이 소설이 던지는 질문인 것 같습니다.", date: "2023.12.20", likes: 21 },
  { id: 13, author: "서재주인",      avatar: "서", rating: 5, text: "몇 년이 지나도 첫 장면이 선명하게 기억납니다. 그 정도로 강렬한 소설입니다. 강력 추천!", date: "2023.12.05", likes: 44 },
  { id: 14, author: "밤의독서",      avatar: "밤", rating: 4, text: "한 번에 읽기 너무 벅차서 세 편을 나눠서 읽었어요. 그럼에도 매번 읽고 나면 한참 동안 멍하게 됩니다.", date: "2023.11.22", likes: 16 },
  { id: 15, author: "느린독서가",    avatar: "느", rating: 5, text: "이 책을 읽고 나서 우리 사회가 개인에게 얼마나 많은 것을 강요하는지 다시 생각해보게 됐습니다. 대단한 소설입니다.", date: "2023.11.08", likes: 39 },
];
