// ─── Types ───────────────────────────────────────────────────────────────────

export interface Library {
  id: number;
  name: string;
  address: string;
  distance: string;
  hours: string;
  closedDay: string;
  isOpen: boolean;
  phone: string;
  type: "국립" | "공공";
  mx: number; // % x on map
  my: number; // % y on map
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const LIBRARIES: Library[] = [
  { id: 1, name: "국립중앙도서관", address: "서초구 반포대로 201", distance: "0.8km", hours: "09:00–18:00", closedDay: "월요일 휴관", isOpen: true, phone: "02-535-4142", type: "국립", mx: 52, my: 63 },
  { id: 2, name: "관악구립 중앙도서관", address: "관악구 관악로 145", distance: "1.2km", hours: "09:00–21:00", closedDay: "매주 화요일 휴관", isOpen: true, phone: "02-879-6100", type: "공공", mx: 38, my: 75 },
  { id: 3, name: "서울도서관", address: "중구 세종대로 110", distance: "2.1km", hours: "09:00–20:00", closedDay: "매주 월요일 휴관", isOpen: true, phone: "02-2133-0300", type: "공공", mx: 62, my: 35 },
  { id: 4, name: "용산구립 도서관", address: "용산구 청파로 73", distance: "2.9km", hours: "09:00–21:00", closedDay: "매주 월요일 휴관", isOpen: true, phone: "02-798-6262", type: "공공", mx: 70, my: 48 },
  { id: 5, name: "서대문구립 이진아도서관", address: "서대문구 증가로 50", distance: "3.4km", hours: "09:00–20:00", closedDay: "매주 월요일 휴관", isOpen: false, phone: "02-330-1910", type: "공공", mx: 28, my: 30 },
  { id: 6, name: "마포구립 도서관", address: "마포구 월드컵북로 400", distance: "3.8km", hours: "09:00–21:00", closedDay: "매주 화요일 휴관", isOpen: true, phone: "02-3153-8370", type: "공공", mx: 18, my: 44 },
  { id: 7, name: "강남구립 논현도서관", address: "강남구 봉은사로 125", distance: "4.7km", hours: "09:00–21:00", closedDay: "매주 월요일 휴관", isOpen: true, phone: "02-3443-7173", type: "공공", mx: 82, my: 66 },
  { id: 8, name: "종로도서관", address: "종로구 창덕궁길 164", distance: "5.2km", hours: "09:00–18:00", closedDay: "매주 화요일 휴관", isOpen: false, phone: "02-2148-2826", type: "공공", mx: 58, my: 22 },
  { id: 9, name: "동대문구립도서관", address: "동대문구 답십리로 49", distance: "5.8km", hours: "09:00–20:00", closedDay: "매주 월요일 휴관", isOpen: true, phone: "02-2127-4724", type: "공공", mx: 84, my: 30 },
  { id: 10, name: "성동구립 왕십리도서관", address: "성동구 왕십리로 410", distance: "6.1km", hours: "09:00–21:00", closedDay: "매주 월요일 휴관", isOpen: true, phone: "02-2297-8080", type: "공공", mx: 77, my: 40 },
  { id: 11, name: "송파구립도서관", address: "송파구 올림픽로 269", distance: "7.3km", hours: "09:00–20:00", closedDay: "매주 화요일 휴관", isOpen: true, phone: "02-2147-2370", type: "공공", mx: 88, my: 76 },
  { id: 12, name: "은평구립도서관", address: "은평구 진흥로 232", distance: "7.8km", hours: "09:00–20:00", closedDay: "매주 월요일 휴관", isOpen: false, phone: "02-388-1945", type: "공공", mx: 12, my: 18 },
];

export const FILTERS = ["전체", "영업중", "거리순", "국립", "공공"];
