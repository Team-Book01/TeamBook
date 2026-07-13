export interface Notice {
  id: string
  title: string
  category: '일반' | '이벤트' | '업데이트' | '점검'
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED'
  views: number
  date: string
  author: string
  pinned: boolean
  important: boolean
  content: string
  draft?: boolean
}

export const SAMPLE_NOTICES: Notice[] = [
  {
    id: 'NTC-0048',
    title: '서버 점검 안내 (7/10 02:00~04:00)',
    category: '점검',
    status: 'ACTIVE',
    views: 1842,
    date: '2026-07-07',
    author: '김관리자',
    pinned: true,
    important: true,
    content:
      '안녕하세요, 파노라마북스 운영팀입니다.\n\n아래와 같이 서버 정기 점검을 진행할 예정입니다. 점검 시간 동안 서비스 이용이 일시 중단되오니 이용에 참고 부탁드립니다.\n\n■ 점검 일시: 2026년 7월 10일(금) 02:00 ~ 04:00 (2시간)\n■ 점검 내용: 서버 인프라 업그레이드 및 DB 최적화\n\n점검 종료 후 더 빠르고 안정적인 서비스로 찾아뵙겠습니다.\n감사합니다.',
  },
  {
    id: 'NTC-0047',
    title: '독서모임 신규 오픈 — 7월 추천 도서 그룹',
    category: '이벤트',
    status: 'ACTIVE',
    views: 3210,
    date: '2026-07-05',
    author: '김관리자',
    pinned: true,
    important: false,
    content:
      '이번 달 신규 독서모임이 개설되었습니다.\n\n7월의 추천 도서 "소년이 온다"를 함께 읽고 이야기 나눌 멤버를 모집합니다.\n\n■ 모집 인원: 20명 (선착순)\n■ 모임 기간: 7월 14일 ~ 7월 28일\n■ 참여 방법: 앱 내 독서모임 탭에서 신청\n\n많은 참여 부탁드립니다!',
  },
  {
    id: 'NTC-0046',
    title: '도서관 데이터 동기화 완료',
    category: '업데이트',
    status: 'ACTIVE',
    views: 987,
    date: '2026-07-04',
    author: '김관리자',
    pinned: false,
    important: false,
    content:
      '국립중앙도서관과의 도서 메타데이터 동기화가 완료되었습니다.\n\n이번 업데이트로 신규 도서 12,400권이 추가되었으며 기존 데이터의 오류가 수정되었습니다.\n\n검색 결과가 이전보다 정확해졌으니 많이 이용해 주세요.',
  },
  {
    id: 'NTC-0045',
    title: '리뷰 이벤트 당첨자 발표',
    category: '이벤트',
    status: 'ACTIVE',
    views: 5430,
    date: '2026-07-03',
    author: '김관리자',
    pinned: false,
    important: false,
    content:
      '6월 독서 리뷰 이벤트에 참여해 주신 모든 분들께 감사드립니다.\n\n당첨자 명단은 다음과 같습니다.\n\n■ 1등 (도서 상품권 5만원): park****\n■ 2등 (도서 상품권 3만원): lee**** , choi****\n■ 3등 (독서 노트 세트): jung****, kim****, 외 7명\n\n당첨자는 7월 10일까지 마이페이지에서 주소를 등록해 주세요.',
  },
  {
    id: 'NTC-0044',
    title: '앱 v2.4 업데이트: 밑줄 노트 기능 추가',
    category: '업데이트',
    status: 'ACTIVE',
    views: 2156,
    date: '2026-07-01',
    author: '김관리자',
    pinned: false,
    important: false,
    content:
      'v2.4 업데이트가 배포되었습니다.\n\n주요 변경사항:\n- 전자책 밑줄 표시 및 노트 기능 추가\n- 독서 통계 대시보드 개선\n- 성능 최적화 (앱 로딩 속도 40% 향상)\n\n업데이트 후 앱을 재시작해 주세요.',
  },
  {
    id: 'NTC-0043',
    title: '개인정보처리방침 개정 안내',
    category: '일반',
    status: 'ACTIVE',
    views: 1240,
    date: '2026-06-28',
    author: '김관리자',
    pinned: false,
    important: true,
    content:
      '2026년 7월 15일부로 개인정보처리방침이 개정됩니다.\n\n주요 변경 내용:\n- 제3자 데이터 제공 범위 명확화\n- 보관 기간 세분화\n\n변경된 방침은 홈 하단 "개인정보처리방침" 링크에서 확인하실 수 있습니다.',
  },
  {
    id: 'NTC-0042',
    title: '여름 독서 챌린지 참가 신청 안내',
    category: '이벤트',
    status: 'HIDDEN',
    views: 688,
    date: '2026-06-25',
    author: '김관리자',
    pinned: false,
    important: false,
    content:
      '2026 여름 독서 챌린지에 참가해 보세요!\n\n8월 한 달간 5권 이상 독서 인증 시 파노 포인트 10,000점을 드립니다.\n\n■ 챌린지 기간: 2026년 8월 1일 ~ 31일\n■ 참가 신청: 7월 15일부터',
  },
  {
    id: 'NTC-0041',
    title: '긴급 보안 패치 완료 (XSS 취약점)',
    category: '점검',
    status: 'ACTIVE',
    views: 2890,
    date: '2026-06-20',
    author: '김관리자',
    pinned: false,
    important: true,
    content:
      '리뷰 입력 창에서 발견된 XSS 취약점을 긴급 패치하였습니다.\n\n취약점 노출 기간 (6/18 ~ 6/20) 중 악용 사례는 확인되지 않았습니다.\n\n앞으로도 보안 강화에 최선을 다하겠습니다. 양해해 주셔서 감사합니다.',
  },
]
