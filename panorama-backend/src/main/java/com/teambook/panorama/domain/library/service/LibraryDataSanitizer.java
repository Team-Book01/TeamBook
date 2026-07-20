package com.teambook.panorama.domain.library.service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 정보나루(data4library) 원본 데이터를 동기화 시점에 우리 기준으로 맞춘다.
 *
 * <p>값이 없거나 형식이 다른 일반 정규화는 {@link LibrarySyncWriter} 의 emptyToNull/toBigDecimal 이
 * 담당하고, 여기서는 아래 두 가지만 다룬다.
 *
 * <ol>
 *   <li><b>시/도 명칭 통일</b> — 전남·광주 통합으로 {@code 전남광주통합특별시} 가 신설되면서, 원본이
 *       신·구 명칭을 <b>혼용</b>하고 있다(마이그레이션이 진행 중인 것으로 보인다). 확인 시점 기준
 *       1,600건 중 새 명칭은 18건뿐이고 나머지 1,595건은 여전히 {@code 광주광역시}/{@code 전라남도} 다.
 *       <p>지역 필터는 주소 첫 토큰을 시/도로 쓰므로 한 데이터셋 안에 두 어휘가 섞이면 목록이 갈라진다.
 *       그래서 <b>압도적 다수인 구 명칭으로 통일</b>한다. 통합이 실제 행정구역 개편이라는 점에서 장기적으로는
 *       반대 방향(구 → 신)이 맞지만, 그건 광주와 전남을 한 지역으로 합치는 제품 결정이라 원본이 충분히
 *       마이그레이션된 뒤에 다시 판단한다. — 되돌릴 지점이므로 여기 남겨둔다.</li>
 *   <li><b>주소와 동떨어진 좌표</b> — 예: 주소는 광주 북구인데 좌표는 서울 노원.
 *       지도 서비스에서 이런 값은 "없는 것"보다 나쁘다. 엉뚱한 도시에 도서관이 찍혀 사용자를 오도한다.</li>
 * </ol>
 */
final class LibraryDataSanitizer {

  /** 전남·광주 통합으로 신설된 시/도 명칭. 원본이 이 이름과 구 명칭을 혼용한다. */
  private static final String UNIFIED_SIDO = "전남광주통합특별시";

  // 특별자치도 전환으로 이름이 바뀐 세 곳. 원본이 신·구 명칭을 혼용할 수 있어 양쪽 다 키로 등록한다.
  // (표에 없는 이름은 sidoOf 가 null 을 돌려주고, 그러면 좌표 검증이 통째로 통과 처리된다.
  //  즉 키 하나가 빠지면 그 시/도만 검증이 조용히 꺼진다 — 빠뜨리면 알아채기 어려운 종류의 구멍이다)
  private static final double[] BBOX_GANGWON = {36.95, 38.65, 127.00, 129.42};
  private static final double[] BBOX_JEONBUK = {35.25, 36.35, 126.25, 128.00};
  private static final double[] BBOX_JEJU = {33.05, 33.65, 126.05, 127.00};

  /**
   * 시/도별 대략적인 경계 상자 {minLat, maxLat, minLng, maxLng}.
   *
   * <p>넉넉하게 잡았다. 목적은 "경계선 근처 판정"이 아니라 광주→서울처럼 명백히 다른 시/도에 찍힌
   * 좌표만 잡아내는 것이라, 오탐(정상 데이터를 버리는 것)을 피하는 쪽으로 여유를 뒀다.
   * 시/도 전체를 감싸는 상자이므로 그 안에 있는 지점은 반드시 상자 안에 든다 → 오탐이 구조적으로 없다.
   * (인천/경북은 백령도·울릉도·독도 같은 도서 지역 때문에 넓다)
   */
  private static final Map<String, double[]> SIDO_BBOX = Map.ofEntries(
      Map.entry("서울특별시", new double[] {37.40, 37.72, 126.73, 127.22}),
      Map.entry("부산광역시", new double[] {34.85, 35.42, 128.72, 129.35}),
      // 대구는 2023년 군위군 편입으로 북쪽이 크게 늘었다(군위 ≈ lat 36.2~36.36).
      // 편입 전 기준으로 잡으면 삼국유사군위도서관 같은 멀쩡한 데이터가 오탐으로 걸린다.
      Map.entry("대구광역시", new double[] {35.55, 36.40, 128.28, 128.80}),
      Map.entry("인천광역시", new double[] {36.90, 38.05, 124.55, 126.85}),
      Map.entry("광주광역시", new double[] {35.02, 35.30, 126.60, 127.03}),
      Map.entry("대전광역시", new double[] {36.15, 36.53, 127.22, 127.60}),
      Map.entry("울산광역시", new double[] {35.40, 35.82, 128.92, 129.50}),
      Map.entry("세종특별자치시", new double[] {36.38, 36.75, 127.05, 127.45}),
      Map.entry("경기도", new double[] {36.80, 38.35, 126.28, 127.90}),
      Map.entry("강원특별자치도", BBOX_GANGWON),
      Map.entry("강원도", BBOX_GANGWON),
      Map.entry("충청북도", new double[] {35.95, 37.30, 127.20, 128.70}),
      Map.entry("충청남도", new double[] {35.95, 37.10, 125.90, 127.70}),
      Map.entry("전북특별자치도", BBOX_JEONBUK),
      Map.entry("전라북도", BBOX_JEONBUK),
      Map.entry("전라남도", new double[] {33.85, 35.55, 125.00, 127.95}),
      Map.entry("경상북도", new double[] {35.50, 37.60, 127.75, 131.95}),
      Map.entry("경상남도", new double[] {34.50, 35.95, 127.50, 129.35}),
      Map.entry("제주특별자치도", BBOX_JEJU),
      Map.entry("제주도", BBOX_JEJU));

  /** 대한민국 전체 대략 범위. 0,0 이나 위경도가 뒤바뀐 값 같은 극단적 오류를 먼저 거른다. */
  private static final double KR_MIN_LAT = 33.0;
  private static final double KR_MAX_LAT = 38.7;
  private static final double KR_MIN_LNG = 124.5;
  private static final double KR_MAX_LNG = 132.0;

  private LibraryDataSanitizer() {}

  /**
   * 주소가 통합 명칭으로 시작하면 구 명칭(광주광역시/전라남도)으로 되돌린다. 그 외 주소는 그대로 둔다.
   *
   * <p>어느 쪽으로 되돌릴지는 <b>두 번째 토큰</b>으로 가른다. 통합시 안에서 광주 쪽은 자치구(동/서/남/북/광산구)
   * 이고 전남 쪽은 시·군(여수시·순천시·담양군…)이라, 접미사만으로 안전하게 구분된다.
   *
   * <p>무조건 광주로 보내면 안 된다. 확인 시점엔 통합 명칭 주소가 전부 "북구"라 광주만 나왔지만,
   * 원본 마이그레이션이 진행되면 전남 쪽 주소에도 통합 명칭이 붙는다. 그때 일괄 광주로 바꾸면
   * 여수·순천 도서관이 광주로 둔갑한다.
   */
  static String normalizeAddress(String address) {
    if (address == null || !address.startsWith(UNIFIED_SIDO)) {
      return address;
    }
    String rest = address.substring(UNIFIED_SIDO.length()).trim();
    return legacySidoOf(rest) + " " + rest;
  }

  /** 통합시 하위 지역명으로 통합 이전 시/도를 판별한다. 자치구(…구) → 광주, 시·군 → 전남. */
  private static String legacySidoOf(String rest) {
    int space = rest.indexOf(' ');
    String area = (space < 0) ? rest : rest.substring(0, space);
    return area.endsWith("구") ? "광주광역시" : "전라남도";
  }

  /**
   * 도서관명에 들어간 통합 명칭을, 그 레코드의 주소가 가리키는 시/도로 바꿔 주소와 어휘를 맞춘다.
   *
   * <p>원본은 {@code 전라남도교육청...} 과 {@code 광주광역시교육청...} 을 모두 통합 명칭으로 덮어써서
   * 이름만 봐선 어느 쪽이었는지 알 수 없다. 그래서 그 레코드 자신의 주소에서 시/도를 가져와 되돌린다.
   * 주소의 시/도를 못 알아보면 손대지 않는다(추측해서 바꾸지 않는다).
   *
   * @param name            도서관명
   * @param normalizedAddress {@link #normalizeAddress}를 이미 거친 주소
   */
  static String normalizeName(String name, String normalizedAddress) {
    if (name == null || !name.contains(UNIFIED_SIDO)) {
      return name;
    }
    String sido = sidoOf(normalizedAddress);
    if (sido == null) {
      return name;
    }
    return name.replace(UNIFIED_SIDO, sido);
  }

  /**
   * 좌표가 주소의 시/도와 앞뒤가 맞는지.
   *
   * <p>false 면 원본이 깨진 것이므로 저장하지 않는다. 지도에 엉뚱한 도시로 찍히는 것보다
   * 빠지는 편이 낫다(잘못된 위치는 사용자를 적극적으로 오도한다).
   * 시/도를 못 알아보는 주소는 검증할 근거가 없으므로 통과시킨다.
   */
  static boolean isCoordinatePlausible(String normalizedAddress, BigDecimal latitude, BigDecimal longitude) {
    double lat = latitude.doubleValue();
    double lng = longitude.doubleValue();

    if (lat < KR_MIN_LAT || lat > KR_MAX_LAT || lng < KR_MIN_LNG || lng > KR_MAX_LNG) {
      return false;
    }
    String sido = sidoOf(normalizedAddress);
    if (sido == null) {
      return true; // 판단 근거 없음 → 통과
    }
    double[] box = SIDO_BBOX.get(sido);
    if (box == null) {
      return true; // 표에 없는 시/도 → 통과
    }
    return lat >= box[0] && lat <= box[1] && lng >= box[2] && lng <= box[3];
  }

  /** 주소 첫 토큰을 시/도로 본다. 표에 없으면 null. */
  private static String sidoOf(String address) {
    if (address == null) {
      return null;
    }
    String trimmed = address.trim();
    int space = trimmed.indexOf(' ');
    String head = (space < 0) ? trimmed : trimmed.substring(0, space);
    return SIDO_BBOX.containsKey(head) ? head : null;
  }
}
