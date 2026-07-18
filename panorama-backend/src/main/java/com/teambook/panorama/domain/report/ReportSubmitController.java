package com.teambook.panorama.domain.report;

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
    Long reportId = reportService.createReport(new ReportCreateRequest(
        userId, request.targetType(), request.targetId(),
        request.reasonType(), request.content()));
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(reportId).toUri();
    return ResponseEntity.created(location).build();
  }
}