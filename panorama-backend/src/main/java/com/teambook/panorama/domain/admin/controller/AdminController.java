package com.teambook.panorama.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.admin.dto.dashboard.DashboardResponse;
import com.teambook.panorama.domain.admin.service.AdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "관리자 - 대시보드", description = "관리자 대시보드 통계 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class AdminController {

  private final AdminService adminService;

  /**
   * 대시보드 집계 조회.
   * 상단 통계 카드 + 처리 대기(신고/문의) + 최근 콘텐츠 + 최근 가입 회원 + 도서관 동기화 요약을 한 번에 반환한다.
   */
  @Operation(summary = "관리자 대시보드 조회",
      description = "대시보드 화면에 필요한 집계(통계 카드, 처리 대기 신고/문의, 최근 콘텐츠, 최근 가입 회원, 도서관 동기화 요약)를 한 번에 조회한다.")
  @GetMapping("/dashboard")
  public ResponseEntity<DashboardResponse> getDashboard() {
    DashboardResponse dashboard = adminService.getDashboard();
    return ResponseEntity.ok(dashboard);
  }
}
