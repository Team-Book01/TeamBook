package com.teambook.panorama.global.security.util;

import java.security.SecureRandom;
import java.util.Base64;

import org.springframework.stereotype.Component;

/**
 * 이메일 인증·비밀번호 재설정용 원문 토큰 생성기.
 *
 * - SecureRandom 32바이트(256비트) → URL-safe Base64 무패딩(43자).
 * - java.util.Random 금지(예측 가능). 반드시 SecureRandom.
 * - 링크 쿼리(?token=)에 실으므로 URL-safe·무패딩으로 고정.
 * - 여기서 만든 "원문"은 메일에만 존재하고, DB에는 SHA-256 지문(TokenHashUtil)으로만 저장한다.
 */
@Component
public class TokenGenerator {

    private static final int TOKEN_BYTES = 32; // 256비트
    private final SecureRandom secureRandom = new SecureRandom();
    private final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();

    public String generate() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return encoder.encodeToString(bytes);
    }
}
