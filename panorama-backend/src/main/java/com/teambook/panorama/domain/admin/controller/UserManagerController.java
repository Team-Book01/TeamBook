package com.teambook.panorama.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.admin.dto.user.UserDetailResponse;
import com.teambook.panorama.domain.admin.dto.user.UserProcessRequest;
import com.teambook.panorama.domain.admin.dto.user.UserResponse;
import com.teambook.panorama.domain.admin.dto.user.UserSearchRequest;
import com.teambook.panorama.domain.admin.service.UserManagerService;
import com.teambook.panorama.global.response.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "관리자 - 사용자 관리", description = "사용자 목록/상세 조회 및 정지·해제·탈퇴 처리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/users")
public class UserManagerController {

  private final UserManagerService userService;

  // 사용자 관리
  /** 사용자 - 목록 (+검색). body 생략 시 기본(필터 없음) */
  @Operation(summary = "사용자 목록 조회(+검색)", description = "검색 조건에 맞는 사용자 목록을 페이지 단위로 조회한다. body 를 생략하면 필터 없이 조회한다.")
  @PostMapping
  public ResponseEntity<PageResponse<UserResponse>> getUsers(
      @RequestBody(required = false) UserSearchRequest request) {
    if (request == null) {
      request = UserSearchRequest.ofDefaults();
    }
    return ResponseEntity.ok(userService.getUsers(request));
  }

  /** 사용자 - 상세 (프로필 + 받은 신고 수) */
  @Operation(summary = "사용자 상세 조회", description = "사용자 단건의 프로필과 해당 사용자가 받은 신고 수를 함께 조회한다.")
  @GetMapping("/{userId}")
  public ResponseEntity<UserDetailResponse> getUserDetail(@PathVariable("userId") Long userId) {
    return ResponseEntity.ok(userService.getUserDetail(userId));
  }

  /** 사용자 - 처리 (정지/해제/탈퇴). status 변경 + 조치 로그 */
  @Operation(summary = "사용자 처리 (정지/해제/탈퇴)", description = "사용자 status 를 변경하고 조치 로그를 남긴다. 처리 후 최신 데이터는 프론트가 재조회한다.")
  @PatchMapping("/{userId}/process")
  public ResponseEntity<Void> processUser(
      @PathVariable("userId") Long userId,
      @RequestBody @Valid UserProcessRequest request) {
    userService.processUser(userId, request);
    return ResponseEntity.ok().build(); // 처리 후 최신 데이터는 프론트가 재조회
  }

  // 사용자 - 신고 -> 원본 이동 ? (보류: 의미 확정 후 구현)

}
