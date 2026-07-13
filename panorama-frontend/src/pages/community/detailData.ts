/* ─────────────── 이미지 상수 ─────────────── */
export const BOOK_COVER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=120&fit=crop&auto=format";
export const POST_IMAGE_1 =
  "https://images.unsplash.com/photo-1630343710506-89f8b9f21d31?w=720&h=480&fit=crop&auto=format";
export const POST_IMAGE_2 =
  "https://images.unsplash.com/photo-1586380951230-e6703d9f6833?w=720&h=900&fit=crop&auto=format";

export const AVATAR_1 =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format";
export const AVATAR_2 =
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop&auto=format";
export const AVATAR_3 =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format";
export const AVATAR_4 =
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&auto=format";
export const AVATAR_5 =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format";
export const MY_AVATAR =
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop&auto=format";

/* ─────────────── 데이터 ─────────────── */
export const HOT_POSTS = [
  { id: 1, title: "채사장의 지적 대화를 위한 넓고 얕은 지식, 드디어 완독했습니다", views: 3204, category: "독후감" },
  { id: 2, title: "김영하 작가의 신작 읽고 나서 한동안 멍했던 이야기", views: 2891, category: "리뷰" },
  { id: 3, title: "올해 읽은 책 50권 중 최고를 꼽자면...", views: 2540, category: "책 추천" },
  { id: 4, title: "어린왕자를 스물다섯에 다시 읽었더니 완전히 다르게 보였다", views: 2103, category: "에세이" },
  { id: 5, title: "요즘 과학책에 빠진 이유, 코스모스부터 시작했어요", views: 1872, category: "책 추천" },
];

export interface Reply {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  mentionTo?: string; // 멘션 대상 닉네임
}

export interface Comment {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  replies: Reply[];
}

export const COMMENTS: Comment[] = [
  {
    id: 1,
    author: "책벌레김민준",
    avatar: AVATAR_2,
    time: "2025.07.04 14:23",
    content:
      "정말 공감이 가는 리뷰예요. 저도 처음엔 윤재가 감정이 없다는 설정이 낯설었는데, 읽다 보니 오히려 그렇기 때문에 더 순수하게 세상을 바라본다는 게 느껴져서 더 마음이 아팠어요. 작가님이 이 캐릭터를 통해 하고 싶은 말이 참 많았겠구나 싶었습니다.",
    likes: 24,
    replies: [
      {
        id: 11,
        author: "글읽는곰",
        avatar: AVATAR_3,
        time: "2025.07.04 15:01",
        content:
          "맞아요, 저도 그 부분에서 많이 생각했어요. 감정을 못 느끼는 게 결핍이 아니라 오히려 다른 방식으로 세상을 보는 창이 되는 것 같더라고요. 윤재 덕분에 제 감정도 돌아보게 됐습니다.",
        likes: 11,
      },
      {
        id: 12,
        author: "새벽독서클럽",
        avatar: AVATAR_4,
        time: "2025.07.04 15:47",
        content:
          "두 분 말씀에 완전 동의해요! 저는 곤이 캐릭터가 더 인상적이었어요. 그 아이가 보여주는 우정의 방식이 어떻게 보면 가장 순수한 형태 아닐까요?",
        likes: 7,
        mentionTo: "글읽는곰",
      },
    ],
  },
  {
    id: 2,
    author: "달빛독서",
    avatar: AVATAR_5,
    time: "2025.07.04 15:12",
    content:
      "이 책을 읽고 나서 며칠 동안 윤재가 머릿속에서 떠나질 않았어요. 감정을 표현하는 방법을 몰랐던 게 아니라, 처음부터 배운 적이 없었다는 설정이 너무 슬프면서도 현실적으로 느껴졌거든요. 글쓴이님 표현 중에 '침묵이 언어가 된다'는 부분, 정말 찰떡같은 표현이에요.",
    likes: 18,
    replies: [
      {
        id: 21,
        author: "책방주인장",
        avatar: AVATAR_1,
        time: "2025.07.04 16:03",
        content:
          "저도 그 문장 보고 따로 노트에 적었어요. 작성자분이 글을 정말 잘 쓰시는 것 같아요. 다음 독후감도 기대됩니다 :)",
        likes: 5,
      },
      {
        id: 22,
        author: "책벌레김민준",
        avatar: AVATAR_2,
        time: "2025.07.04 16:41",
        content:
          "저도 그 문장에서 한참 멈췄어요. 감정 없이도 연결될 수 있다는 게 이 소설의 가장 큰 울림인 것 같습니다.",
        likes: 8,
        mentionTo: "책방주인장",
      },
    ],
  },
  {
    id: 3,
    author: "북마크수집가",
    avatar: AVATAR_3,
    time: "2025.07.04 16:35",
    content:
      "아직 안 읽었는데 이 글 보고 바로 장바구니에 담았어요. 스포 없이도 충분히 읽고 싶어지는 글이네요. 오늘 퇴근하고 서점 들러야겠어요!",
    likes: 9,
    replies: [],
  },
];
