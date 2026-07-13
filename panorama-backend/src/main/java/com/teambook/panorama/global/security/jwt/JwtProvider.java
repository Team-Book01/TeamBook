package com.teambook.panorama.global.security.jwt;

import com.teambook.panorama.domain.user.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {

  private final SecretKey key;
  private final JwtProperties jwtProperties;

  public JwtProvider(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
    // TODO: jwtProperties.secret() 을 SecretKey 로 변환 (Keys.hmacShaKeyFor 등)
    this.key = Keys.hmacShaKeyFor(jwtProperties.secretKey().getBytes(StandardCharsets.UTF_8));
  }

  public String createAccessToken(Long userId, Role role) {
    // TODO: subject=userId, claim=role, 만료=accessTokenValidity 로 JWT 생성
    Date now = new Date();
    Date expiry = new Date(now.getTime() + jwtProperties.accessTokenExpiration());
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("role", role.name())
        .issuedAt(now)
        .expiration(expiry)
        .signWith(key)
        .compact();
  }

  public String createRefreshToken(Long userId) {
    // TODO: subject=userId, 만료=refreshTokenValidity 로 JWT 생성 (claim 최소화)
    Date now = new Date();
    Date expiry = new Date(now.getTime() + jwtProperties.refreshTokenExpiration());
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .issuedAt(now)
        .expiration(expiry)
        .signWith(key)
        .compact();
  }

  public boolean validateToken(String token) {
    // TODO: 서명·만료 검증. 실패 시 false 또는 예외 (정책 결정)
    try {
      parseClaims(token);
      return true;
    } catch (ExpiredJwtException e) {
      // 만료시 오류
      return false;
    } catch (JwtException | IllegalArgumentException e) {
      // 위조, 형식 오류
      return false;
    }
  }

  public Long getUserId(String token) {
    // TODO: parseClaims 후 subject → Long 변환
    return Long.valueOf(parseClaims(token).getSubject());
  }

  public Role getRole(String token) {
    return Role.valueOf(parseClaims(token).get("role", String.class));
  }

  private Claims parseClaims(String token) {
    // TODO: key로 서명 검증하며 Claims 파싱 (만료 토큰 처리 정책 포함)
    return Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}