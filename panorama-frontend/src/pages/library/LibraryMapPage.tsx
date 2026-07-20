import { useEffect, useMemo, useState } from "react";

import { useLibraries } from "@/api/library";
import { getErrorMessage } from "@/api/client";
import {
  toLibrary,
  inBounds,
  boundsCenter,
  centroidOf,
  haversineKm,
  matchRank,
  RADIUS_KM,
  RESULT_LIMIT,
  SEOUL_CITY_HALL,
  type LatLng,
  type Bounds,
} from "./data";
import { LocationModal, Sidebar, MapPanel } from "./components";

// ─── 위치 권한 상태 ───────────────────────────────────────────────────────────
// checking     : Permissions API 조회 중 (아직 모름)
// granted      : 이미 허용됨 → 모달 없이 바로 조회
// prompt       : 아직 안 물어봄 → 우리 모달로 맥락 설명 후 요청
// denied       : 브라우저가 차단 → 사이트가 프롬프트를 띄울 수 없다. 해제 방법 안내만 가능
// unsupported  : geolocation 자체 미지원
// unknown      : geolocation 은 있으나 Permissions API 미지원(구형 Safari 등) → prompt 처럼 취급
type PermState = "checking" | "granted" | "prompt" | "denied" | "unsupported" | "unknown";

// 차단 상태에서 보여줄 안내. 브라우저 정책상 우리가 프롬프트를 다시 띄울 방법은 없다.
const DENIED_HINT = "위치가 차단되어 서울시청 기준으로 표시합니다.";

// ─── LibraryMapPage ───────────────────────────────────────────────────────────

export default function LibraryMapPage() {
  const [showModal, setShowModal] = useState(false);
  const [permission, setPermission] = useState<PermState>("checking");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // 지역(시/도). '전체'면 제한 없음. 자유 텍스트 대신 구조화 필터로 지역을 고른다.
  const [region, setRegion] = useState("전체");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  // "이 지역에서 검색"으로 고정한 지도 영역. null 이면 내 주변(반경) 모드.
  const [areaBounds, setAreaBounds] = useState<Bounds | null>(null);

  const { data, isLoading, isError, error } = useLibraries();

  // 검색은 지역 모드를 벗어난다.
  // (안 그러면 검색어를 지웠을 때 지도는 검색 결과 위치인데 마커는 예전 지역 것이라 서로 어긋난다)
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) setAreaBounds(null);
  };

  // 지역 선택도 지역(지도영역) 모드를 벗어난다. 같은 이유로.
  const handleRegionChange = (r: string) => {
    setRegion(r);
    if (r !== "전체") setAreaBounds(null);
  };

  // 현재 위치 요청(위치 허용 버튼 · 사이드바 타겟 버튼 · 지도 현재위치 버튼 공용).
  // 누르면 지역 모드에서 빠져나와 "내 주변"으로 돌아온다.
  const requestLocation = () => {
    setAreaBounds(null);
    if (!("geolocation" in navigator)) {
      setLocError("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    // 차단 상태면 getCurrentPosition 을 불러도 프롬프트 없이 즉시 실패한다.
    // 헛되이 호출하지 말고 해제 방법 안내(deniedHelp 배너)로 유도한다.
    if (permission === "denied") {
      setLocError(DENIED_HINT);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError(null);
      },
      (err) =>
        setLocError(
          err.code === err.PERMISSION_DENIED
            ? DENIED_HINT
            : "위치를 가져오지 못해 서울시청 기준으로 표시합니다.",
        ),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // 위치 권한 상태를 확정하고, 사용자가 브라우저 설정에서 바꾸면 실시간으로 따라간다.
  // (onchange 덕분에 설정에서 "허용"으로 바꾸는 순간 새로고침 없이 아래 효과가 자동 복구시킨다)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setPermission("unsupported");
      return;
    }
    if (!navigator.permissions?.query) {
      setPermission("unknown"); // Permissions API 미지원 → 물어보는 수밖에 없다
      return;
    }
    let status: PermissionStatus | null = null;
    let alive = true;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((s) => {
        if (!alive) return;
        status = s;
        setPermission(s.state);
        s.onchange = () => setPermission(s.state);
      })
      .catch(() => alive && setPermission("unknown"));
    return () => {
      alive = false;
      if (status) status.onchange = null;
    };
  }, []);

  // 권한 상태가 확정되면 그에 맞게 행동한다.
  //  - granted : 모달 없이 즉시 조회 (설정에서 허용으로 바뀐 순간의 자동 복구도 여기서 처리)
  //  - prompt  : 우리 모달로 맥락을 설명한 뒤 사용자가 누르면 요청
  //  - denied  : 모달을 띄워도 "위치 허용" 버튼이 아무 일도 못 하는 죽은 버튼 → 안내 배너로 대체
  useEffect(() => {
    if (permission === "checking") return;
    if (permission === "granted") {
      requestLocation();
      return;
    }
    if (permission === "prompt" || permission === "unknown") setShowModal(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  // 기준점: 위치를 허용했으면 내 위치, 아니면 서울시청.
  const basePos = userPos ?? SEOUL_CITY_HALL;

  // 서버 응답을 뷰모델로 변환(기준점 대비 거리 포함). 기준점이 바뀌면 재계산.
  const libraries = useMemo(
    () => (data ?? []).map((dto) => toLibrary(dto, basePos)),
    [data, basePos.lat, basePos.lng],
  );

  // 기준점 반경 RADIUS_KM 이내만 노출(전국 1600곳 → 주변만).
  const nearby = useMemo(
    () => libraries.filter((lib) => lib.distanceKm <= RADIUS_KM),
    [libraries],
  );

  const query = searchQuery.trim();
  const isSearching = query.length > 0;
  const hasRegion = region !== "전체";
  // 지역이나 이름으로 좁히면 전국을 대상으로 하는 "탐색" 모드.
  const isExploring = isSearching || hasRegion;
  // 모드 우선순위: 탐색(전국) > 이 지역(지도 영역) > 내 주변(반경)
  const mode: "explore" | "area" | "nearby" = isExploring ? "explore" : areaBounds ? "area" : "nearby";

  // 반드시 메모이즈할 것: list 의 identity 가 바뀌면 MapPanel 이 마커를 전부 재생성하고
  // 지도를 다시 맞춘다. 메모이즈하지 않으면 hover(리렌더)마다 그 일이 벌어져 핀이 튕긴다.
  const { list: filteredLibraries, matchedCount, limit, fitCount } = useMemo(() => {
    const needle = query.toLowerCase();
    const scope =
      mode === "explore"
        ? libraries
        : mode === "area"
          ? libraries.filter((lib) => inBounds(lib.lat, lib.lng, areaBounds as Bounds))
          : nearby;

    const matched = scope.filter((lib) => {
      if (hasRegion && lib.sido !== region) return false;
      if (needle && matchRank(lib, needle) < 0) return false;
      return true;
    });

    // 탐색·지역 모드는 대상이 넓어 수백~수천이 될 수 있다 → 상한을 둔다.
    if (mode === "explore" || mode === "area") {
      // 지역 필터만 걸었으면 대상이 이미 한 시/도로 한정돼 있다 → 자르지 않는다.
      // (자르면 "경기"를 골랐는데 경기 일부만 나온다)
      const cap = hasRegion && !needle ? Infinity : RESULT_LIMIT;

      // 상한을 자를 때의 정렬 기준을 "지금 보고 있는 대상의 한가운데"로 둔다.
      // 기준점(내 위치/서울시청)이 아니다.
      //
      // 기준점으로 자르면: 지도를 전국이 보이게 축소하고 검색해도 상한(200곳)이
      //   서울시청에서 가까운 순으로 채워져 서울만 나온다. 화면은 전국인데 마커는 서울뿐.
      // 같은 편향이 지역 필터에도 걸린다 — "경기"를 고르면 서울에 가까운 북서부만 남고
      //   평택·여주가 사라진다. 그래서 지역 모드는 그 지역 도서관들의 무게중심을 기준으로 쓴다.
      // (카드에 적히는 '1.2km' 거리 자체는 그대로 기준점 대비 값이다. 그건 "나에게서 얼마나 먼가"라 의미가 다르다)
      const center =
        mode === "area"
          ? boundsCenter(areaBounds as Bounds)
          : hasRegion
            ? centroidOf(matched)
            : null;
      const rank = center
        ? new Map(matched.map((lib) => [lib.id, haversineKm(center, lib)]))
        : null;
      const dist = (lib: (typeof matched)[number]) => rank?.get(lib.id) ?? lib.distanceKm;

      // 검색어가 있으면 매칭 강도(이름 > 주소)를 먼저, 같으면 거리순.
      matched.sort((a, b) =>
        needle
          ? matchRank(a, needle) - matchRank(b, needle) || dist(a) - dist(b)
          : dist(a) - dist(b),
      );
      const list = matched.slice(0, cap);

      // 지도는 "가장 강한 매칭"에만 맞춘다.
      //
      // 예: "강남"을 치면 강남구 도서관들(이름 매칭)뿐 아니라 안동시 '강남5길',
      //     여수시 '강남해안로' 같은 도로명 주소도 걸린다(약한 매칭). 그걸 bounds 에 넣으면
      //     지도가 전국으로 벌어져 정작 보려던 강남이 안 보인다.
      //     list 는 (매칭강도, 거리)로 정렬돼 있으니 최상위 등급은 앞쪽에 몰려 있다 → 그만큼만 카메라에 쓴다.
      //     (약한 매칭 마커도 지도에 그려지긴 한다. 카메라만 따라가지 않을 뿐)
      let fit = list.length;
      if (needle && list.length > 0) {
        const best = matchRank(list[0], needle);
        const firstWorse = list.findIndex((lib) => matchRank(lib, needle) !== best);
        if (firstWorse > 0) fit = firstWorse;
      }
      return { list, matchedCount: matched.length, limit: cap, fitCount: fit };
    }
    // 내 주변 모드는 "가까운 곳"이 목적이므로 항상 거리순.
    matched.sort((a, b) => a.distanceKm - b.distanceKm);
    return { list: matched, matchedCount: matched.length, limit: Infinity, fitCount: matched.length };
  }, [libraries, nearby, mode, query, hasRegion, region, areaBounds]);

  const handleSelectLibrary = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const basePosName = userPos ? "현재 위치" : "서울시청";

  // 거리를 어디 기준으로 쟀는지. 개수 문구 오른쪽에 작게 붙는다.
  // (내 주변 모드에선 반경도 같이 알려준다. 무엇이 목록을 좁히고 있는지가 그 값이므로)
  const basisLabel =
    mode === "nearby" ? `${basePosName} ${RADIUS_KM}km 기준` : `${basePosName} 기준`;

  // 목록을 못 보여주는 상황이면 개수 대신 이 문구를 띄운다.
  const statusMessage = isLoading
    ? "도서관 목록 불러오는 중…"
    : isError
      ? getErrorMessage(error, "목록을 불러오지 못했습니다.")
      : undefined;

  // 차단됐고 아직 내 위치가 없을 때만 해제 방법을 안내한다.
  // (허용으로 바뀌면 permission onchange → 자동 조회 → 이 배너는 스스로 사라진다)
  const deniedHelp = permission === "denied" && !userPos;

  // 위치를 요청해볼 수 있는 상태인지. 차단·미지원이면 눌러도 브라우저가 응답하지 않는다.
  const canLocate = permission !== "denied" && permission !== "unsupported";

  // 목록 개수 문구. 지역·이름 중 무엇으로 좁혔는지 그대로 드러낸다.
  const countPrefix =
    mode === "explore"
      ? [hasRegion ? `${region} 지역` : null, isSearching ? `'${query}' 검색` : null]
          .filter(Boolean)
          .join(" · ") + " 결과"
      : mode === "area"
        ? "이 지도의 도서관"
        : "내 주변 도서관";
  // "가까운"이 무엇으로부터 가까운지는 모드마다 다르다(기준점이 아닌 경우가 있다) → 문구를 맞춘다.
  const nearLabel = mode === "area" ? "화면 중심에서 가까운" : hasRegion ? "지역 중심에서 가까운" : "가까운";
  const countNote =
    matchedCount > limit
      ? `${matchedCount.toLocaleString()}곳 중 ${nearLabel} ${limit}곳만 표시`
      : undefined;

  return (
    <div
      className="h-[calc(100vh-68px)] flex flex-col overflow-hidden"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {showModal && (
        <LocationModal
          onAllow={() => {
            requestLocation();
            setShowModal(false);
          }}
          onLater={() => setShowModal(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          libraries={filteredLibraries}
          totalCount={filteredLibraries.length}
          countPrefix={countPrefix}
          countNote={countNote}
          selectedId={selectedId}
          hoveredId={hoveredId}
          searchQuery={searchQuery}
          region={region}
          onRegionChange={handleRegionChange}
          isOpen={sidebarOpen}
          basisLabel={basisLabel}
          statusMessage={statusMessage}
          deniedHelp={deniedHelp}
          canLocate={canLocate}
          onLocate={requestLocation}
          onToggle={() => setSidebarOpen(false)}
          onSelectLibrary={handleSelectLibrary}
          onHoverLibrary={setHoveredId}
          onSearchChange={handleSearchChange}
        />

        <MapPanel
          libraries={filteredLibraries}
          selectedId={selectedId}
          hoveredId={hoveredId}
          centerPos={basePos}
          userPos={userPos}
          canLocate={canLocate}
          // 검색 모드에선 기준점을 bounds 에 넣지 않는다.
          // (넣으면 "부산" 검색 시 서울시청까지 담으려고 전국이 보임)
          includeCenterInBounds={mode === "nearby"}
          fitCount={fitCount}
          // 지역 모드에선 사용자가 맞춰둔 화면을 그대로 둔다(다시 맞추면 조작과 싸움).
          autoFit={mode !== "area"}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          onSelectLibrary={handleSelectLibrary}
          onHoverLibrary={setHoveredId}
          onLocate={requestLocation}
          onSearchThisArea={setAreaBounds}
        />
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
