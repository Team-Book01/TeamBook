package com.teambook.panorama.global.exception;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ErrorResponse(
    int status,
    String code,
    String message,
    List<FieldErrorDetail> errors,
    LocalDateTime timestamp) {

  public static ErrorResponse of(ErrorCode errorCode, List<FieldErrorDetail> errors) {
    return new ErrorResponse(
        errorCode.getStatus().value(),
        errorCode.getCode(),
        errorCode.getMessage(),
        errors,
        LocalDateTime.now());
  }

  // 상태·코드는 ErrorCode에서 가져오되, 메시지만 런타임 값으로 덮어쓸 때 사용한다.
  public static ErrorResponse of(ErrorCode errorCode, String message) {
    return new ErrorResponse(
        errorCode.getStatus().value(),
        errorCode.getCode(),
        message,
        List.of(),
        LocalDateTime.now());
  }

  public record FieldErrorDetail(
      String field,
      String value,
      String reason) {
  }
}