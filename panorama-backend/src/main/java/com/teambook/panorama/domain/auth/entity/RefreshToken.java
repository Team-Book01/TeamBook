package com.teambook.panorama.domain.auth.entity;

import com.teambook.panorama.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "refresh_tokens")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", unique = true, nullable = false, columnDefinition = "CHAR(64)")
    private String tokenHash;               // SHA-256 hex (원문 아님)

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Builder(access = AccessLevel.PRIVATE)
    private RefreshToken(Long userId, String tokenHash, LocalDateTime expiresAt) {
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public static RefreshToken of(Long userId, String tokenHash, LocalDateTime expiresAt) {
        return RefreshToken.builder()
                .userId(userId)
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .build();
    }

    public void updateTokenHash(String newHash, LocalDateTime newExpiresAt) {
        this.tokenHash = newHash;
        this.expiresAt = newExpiresAt;      // Rotation 시 만료도 갱신
    }

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }
}