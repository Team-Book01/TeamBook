package com.teambook.panorama.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {

  // common
  INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "올바르지 않은 입력값입니다."),
  INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S001", "서버 내부 오류가 발생했습니다."),
  
  HTTP_MESSAGE_NOT_READABLE(HttpStatus.BAD_REQUEST, "C002", "잘못된 요청 형식입니다."),
  MISSING_HEADER(HttpStatus.BAD_REQUEST, "C003", "헤더가 존재하지 않습니다."),

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
  ACCESS_DENIED(HttpStatus.FORBIDDEN, "A005", "접근권한이 없습니다,"),
  REFRESH_TOKEN_MISSING(HttpStatus.UNAUTHORIZED, "A006", "쿠키에 리프레시 토큰이 없습니다."),
  UNSUPPORTED_PROVIDER(HttpStatus.BAD_REQUEST, "A007", "지원하지 않은 소셜로그인 입니다."),
  INVALID_RESET_TOKEN(HttpStatus.BAD_REQUEST, "A008", "유효하지 않거나 만료된 비밀번호 재설정 토큰입니다."),
  PASSWORD_MISMATCH(HttpStatus.UNAUTHORIZED, "A009", "현재 비밀번호가 일치하지 않습니다."),
  EMAIL_ALREADY_USED(HttpStatus.CONFLICT, "A010", "이미 사용 중인 이메일입니다."),
  INVALID_VERIFICATION_TOKEN(HttpStatus.BAD_REQUEST, "A011", "유효하지 않은 인증 토큰입니다."),
  SOCIAL_PASSWORD_NOT_SUPPORTED(HttpStatus.BAD_REQUEST, "A012", "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다."),

  // report (도메인 접두어 R)
  REPORT_NOT_FOUND(HttpStatus.NOT_FOUND, "R001", "존재하지 않는 신고입니다."),
  ALREADY_PROCESSED(HttpStatus.CONFLICT, "R002", "이미 처리된 신고입니다."),
  DUPLICATE_REPORT(HttpStatus.CONFLICT, "R003", "이미 신고한 대상입니다."),

  // inquiry (도메인 접두어 Q)
  INQUIRY_NOT_FOUND(HttpStatus.NOT_FOUND, "Q001", "존재하지 않는 문의입니다."),

  // community content (도메인 접두어 P)
  CONTENT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "존재하지 않는 콘텐츠입니다."),
  
  // book(임시작업용)
  BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "B001", "존재하지 않는 책입니다."),
  
  // post (도메인 접두어 P + 3자리 일련번호)
  POST_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "존재하지 않는 게시글입니다."),
  NOT_POST_OWNER(HttpStatus.FORBIDDEN, "P002", "게시글 소유자가 아닙니다."),
  
  // comment (도메인 접두어 CM + 3자리 일련번호)
  COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "CM001", "존재하지 않는 댓글입니다."),
  NOT_COMMENT_OWNER(HttpStatus.FORBIDDEN, "CM002", "댓글 소유자가 아닙니다."),

  // notice (도메인 접두어 N)
  NOTICE_NOT_FOUND(HttpStatus.NOT_FOUND, "N001", "존재하지 않는 공지입니다."),

  // library (도메인 접두어 L)
  LIBRARY_SYNC_FAILED(HttpStatus.BAD_GATEWAY, "L001",
      "도서관 동기화에 실패했습니다. 외부 API 인증키/상태를 확인하세요."),
  LIBRARY_SYNC_IN_PROGRESS(HttpStatus.CONFLICT, "L002", "이미 도서관 동기화가 진행 중입니다.");

  private final HttpStatus status;
  private final String code;
  private final String message;

  ErrorCode(HttpStatus status, String code, String message) {
    this.status = status;
    this.code = code;
    this.message = message;
  }
}
