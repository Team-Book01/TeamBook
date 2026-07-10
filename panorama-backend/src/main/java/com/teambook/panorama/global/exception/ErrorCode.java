package com.teambook.panorama.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {

  // common
  INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "올바르지 않은 입력값입니다."),
  INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S001", "서버 내부 오류가 발생했습니다."),

  // user (도메인 접두어 U + 3자리 일련번호)
  USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "존재하지 않는 회원입니다."),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "U002", "이미 사용 중인 아이디입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "U003", "이미 사용 중인 닉네임입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "U004", "이미 사용 중인 이메일입니다."),

    // auth (A + 3자리)
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A001", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "A002", "만료된 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "A003", "저장된 리프레시 토큰이 없습니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "A004", "아이디 또는 비밀번호가 올바르지 않습니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "A005", "접근권한이 없습니다,");

  private final HttpStatus status;
  private final String code;
  private final String message;

  ErrorCode(HttpStatus status, String code, String message) {
    this.status = status;
    this.code = code;
    this.message = message;
  }
}
