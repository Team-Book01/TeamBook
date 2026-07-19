package com.teambook.panorama.domain.library.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 도서관 지도(공개) 조회 응답. 1건 = 1행.
 *
 * <p>지도 렌더에 필요한 좌표(latitude/longitude)와 표시 정보만 내려준다.
 * lib_code 등 내부 식별자는 제외한다. record 라 매퍼는 생성자 resultMap 으로 매핑한다.</p>
 */
@Schema(description = "도서관 지도 조회 응답. 1건 = 1행.")
public record LibraryResponse(

    @Schema(description = "도서관 ID", example = "1")
    Long libId,

    @Schema(description = "도서관명", example = "국립중앙도서관")
    String name,

    @Schema(description = "주소", example = "서울특별시 서초구 반포대로 201")
    String address,

    @Schema(description = "전화번호", example = "02-535-4142")
    String tel,

    @Schema(description = "위도", example = "37.4989")
    BigDecimal latitude,

    @Schema(description = "경도", example = "127.0044")
    BigDecimal longitude,

    @Schema(description = "홈페이지 URL", example = "https://www.nl.go.kr")
    String homepageUrl,

    @Schema(description = "운영시간", example = "09:00~18:00")
    String operatingHours,

    @Schema(description = "휴관일", example = "매월 둘째·넷째 월요일")
    String closedDays,

    @Schema(description = "장서 수", example = "1200000")
    Integer bookCount
) {
}
