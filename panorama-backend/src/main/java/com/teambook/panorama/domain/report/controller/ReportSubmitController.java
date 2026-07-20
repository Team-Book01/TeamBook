package com.teambook.panorama.domain.report.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.teambook.panorama.domain.admin.dto.report.ReportCreateRequest;
import com.teambook.panorama.domain.admin.service.ReportService;
import com.teambook.panorama.domain.report.dto.ReportSubmitRequestDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportSubmitController {
  private final ReportService reportService;

  @PostMapping
  public ResponseEntity<Void> submit(@AuthenticationPrincipal Long userId,
      @Valid @RequestBody ReportSubmitRequestDto request) {
    // dto는 enum 수신(허용 외 값은 역직렬화 400) — 저장 파이프라인은 문자열이라 .name()으로 넘긴다.
    // @NotNull 검증이 선행되므로 이 지점에서 null 아님이 보장된다.
    Long reportId = reportService.createReport(new ReportCreateRequest(
        userId, request.targetType().name(), request.targetId(),
        request.reasonType().name(), request.content()));
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(reportId).toUri();
    return ResponseEntity.created(location).build();
  }
}
