package com.teambook.panorama.global.constant;

/**
 * 검증 정규식/길이/메시지 공통 상수.
 *
 * <p>닉네임·로그인 아이디·비밀번호 규칙이 여러 DTO 의 {@code @Pattern}/{@code @Size} 에서
 * 중복 선언되는 것을 막는다. 규칙을 바꿀 때 이 파일 한 곳만 수정하면 된다.
 * ({@code @Pattern(regexp = ...)}·{@code @Size(min = ..., max = ...)} 는 컴파일 타임 상수만
 * 허용하므로 {@code static final} 로 둔다. 프론트엔드는 {@code src/lib/validation.ts} 와 동기화한다.)
 */
public final class ValidationPattern {

    private ValidationPattern() {}

    // ── 닉네임: 한글·영문·숫자·밑줄(_), 1~10자 ─────────────────────────
    public static final String NICKNAME = "^[가-힣a-zA-Z0-9_]+$";
    public static final String NICKNAME_MESSAGE = "한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다";
    public static final int NICKNAME_MIN = 1;
    public static final int NICKNAME_MAX = 10;

    // ── 로그인 아이디: 영문·숫자·밑줄(_)만(공백 불가), 6~15자 ──────────
    public static final String LOGIN_ID = "^[a-zA-Z0-9_]+$";
    public static final String LOGIN_ID_MESSAGE = "영문, 숫자, 밑줄(_)만 사용할 수 있습니다";
    public static final int LOGIN_ID_MIN = 6;
    public static final int LOGIN_ID_MAX = 15;

    // ── 비밀번호: 대소문자·특수문자 포함, 공백 불가, 8~15자 ────────────
    public static final String PASSWORD = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\\s])\\S+$";
    public static final String PASSWORD_MESSAGE = "대소문자와 특수문자를 포함해야 하며, 공백을 포함할 수 없습니다";
    public static final int PASSWORD_MIN = 8;
    public static final int PASSWORD_MAX = 15;
}
