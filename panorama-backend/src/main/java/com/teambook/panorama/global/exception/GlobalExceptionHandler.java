package com.teambook.panorama.global.exception;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

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
  
  // 400 - HttpMessageNotReadableException
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
    log.warn("Message not readable: {}", e.getMessage());
    return build(ErrorCode.HTTP_MESSAGE_NOT_READABLE, List.of());
  }

  // 400 - MissingRequestHeaderException
  @ExceptionHandler(MissingRequestHeaderException.class)
  public ResponseEntity<ErrorResponse> handleMissingRequestHeaderException(MissingRequestHeaderException e) {
    log.warn("Missing Header: {}", e.getMessage());
    return build(ErrorCode.MISSING_HEADER, List.of());
  }

  // 400 - multipart 파싱 단계에서 파일 크기 상한(yml) 초과.
  // 서비스의 getSize() 검사보다 먼저 터지므로 여기서 IMG004로 번역한다.
  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
    log.warn("Upload size exceeded: {}", e.getMessage());
    return build(ErrorCode.INVALID_IMAGE_SIZE, List.of());
  }

  // 400 - multipart 요청에 필수 part(예: images)가 없음.
  @ExceptionHandler(MissingServletRequestPartException.class)
  public ResponseEntity<ErrorResponse> handleMissingServletRequestPart(MissingServletRequestPartException e) {
    log.warn("Missing multipart part: {}", e.getMessage());
    return build(ErrorCode.INVALID_INPUT_VALUE, List.of());
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
