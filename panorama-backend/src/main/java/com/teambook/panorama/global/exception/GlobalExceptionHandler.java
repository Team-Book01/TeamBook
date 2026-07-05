package com.teambook.panorama.global.exception;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  // 400 - @RequestBody 검증 실패 (@Valid). 필드별 상세 오류를 함께 내려준다.
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException e) {
    List<ErrorResponse.FieldErrorDetail> fieldErrors = e.getBindingResult().getFieldErrors().stream()
        .map(error -> new ErrorResponse.FieldErrorDetail(
            error.getField(),
            error.getRejectedValue() == null ? "" : error.getRejectedValue().toString(),
            error.getDefaultMessage()))
        .toList();
    log.warn("Validation failed: {}", fieldErrors);
    return build(ErrorCode.INVALID_INPUT_VALUE, fieldErrors);
  }

  // 비즈니스 예외 (ErrorCode 가 상태/코드를 소유).
  // 메시지는 예외가 들고 온 값(e.getMessage())을 사용한다.
  // 단일 인자 생성자로 던졌다면 이 값은 ErrorCode 의 기본 메시지와 동일하므로 동작이 바뀌지 않는다.
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
    ErrorCode errorCode = e.getErrorCode();
    log.warn("Business exception: {}", errorCode.getCode());
    ErrorResponse body = ErrorResponse.of(errorCode, e.getMessage());
    return new ResponseEntity<>(body, errorCode.getStatus());
  }

  // 500 - 예상하지 못한 모든 예외.
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleException(Exception e) {
    log.error("Unhandled exception", e);
    return build(ErrorCode.INTERNAL_SERVER_ERROR, List.of());
  }

  private ResponseEntity<ErrorResponse> build(
      ErrorCode errorCode, List<ErrorResponse.FieldErrorDetail> errors) {
    ErrorResponse body = ErrorResponse.of(errorCode, errors);
    return new ResponseEntity<>(body, errorCode.getStatus());
  }
}