package com.teambook.panorama.global.security.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import com.teambook.panorama.domain.user.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtProviderTest {

    // 테스트용 Properties 직접 구성 (스프링 컨텍스트 없이 순수 단위 테스트)
    private final JwtProperties properties = new JwtProperties(
            "test-secret-key-that-is-at-least-32-bytes-long!!", // 32바이트 이상
            1800000L, // access 30분
            1209600000L // refresh 2주
    );
    private final JwtProvider jwtProvider = new JwtProvider(properties);

    @Test
    @DisplayName("access 토큰을 만들고 userId·role을 다시 꺼낼 수 있다")
    void createAndParseAccessToken() {
        // when
        String token = jwtProvider.createAccessToken(42L, Role.USER);

        // then
        assertThat(jwtProvider.validateToken(token)).isTrue();
        assertThat(jwtProvider.getUserId(token)).isEqualTo(42L);
        assertThat(jwtProvider.getRole(token)).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("refresh 토큰도 만들고 검증·userId 추출이 된다")
    void createAndParseRefreshToken() {
        String token = jwtProvider.createRefreshToken(42L);

        assertThat(jwtProvider.validateToken(token)).isTrue();
        assertThat(jwtProvider.getUserId(token)).isEqualTo(42L);
    }

    @Test
    @DisplayName("변조된 토큰은 검증에 실패한다")
    void invalidToken() {
        String token = jwtProvider.createAccessToken(42L, Role.USER);

        // 페이로드(가운데 부분)의 문자를 바꿔 서명과 불일치하게 만듦
        String[] parts = token.split("\\.");
        String tamperedPayload = parts[1].substring(0, parts[1].length() - 1)
                + (parts[1].endsWith("A") ? "B" : "A"); // 마지막 글자를 다른 걸로 교체
        String tampered = parts[0] + "." + tamperedPayload + "." + parts[2];

        assertThat(jwtProvider.validateToken(tampered)).isFalse();
    }
}
