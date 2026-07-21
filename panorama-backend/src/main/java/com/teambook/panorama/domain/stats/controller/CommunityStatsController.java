package com.teambook.panorama.domain.stats.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.stats.dto.CommunityStatsResponse;
import com.teambook.panorama.domain.stats.service.StatsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 홈 화면 공개 통계 API. 로그인 여부와 무관하게 조회 가능(SecurityConfig 에서 GET /api/v1/stats/** permitAll).
 *
 * <p>관리자 대시보드(/api/v1/admin/dashboard)는 ADMIN 전용이라 일반/비로그인 사용자가
 * 쓸 수 없으므로, 홈에 노출할 방문자·게시글 수만 별도 공개 엔드포인트로 제공한다.</p>
 */
@Tag(name = "통계 (공개)", description = "홈 커뮤니티 현황 등 로그인 없이 조회 가능한 공개 통계")
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class CommunityStatsController {

  private final StatsService statsService;

  @Operation(summary = "홈 커뮤니티 현황 조회", description = "오늘 방문자 수와 전체 게시글 수를 조회한다.")
  @GetMapping("/community")
  public ResponseEntity<CommunityStatsResponse> getCommunityStats() {
    return ResponseEntity.ok(statsService.getCommunityStats());
  }
}
