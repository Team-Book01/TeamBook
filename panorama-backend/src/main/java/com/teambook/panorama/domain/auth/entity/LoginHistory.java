package com.teambook.panorama.domain.auth.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.teambook.panorama.domain.auth.enums.LoginResult;
import com.teambook.panorama.domain.user.enums.Provider;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "login_histories")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "login_history_id")
    private Long id;

    @Column(name = "user_id")               // 실패시 NULL
    private Long userId;

    @Column(name = "attempted_login_id", length = 20)   // FK 아님, 단순 String
    private String attemptedLoginId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Provider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoginResult result;

    @CreatedDate
    @Column(name = "attempted_at", updatable = false)
    private LocalDateTime attemptedAt;

    // 시도 시각 = 상속받은 createdAt(컬럼명 attempted_at), Auditing 자동 기록

    @Builder(access = AccessLevel.PRIVATE)
    private LoginHistory(Long userId, String attemptedLoginId,
                         Provider provider, LoginResult result) {
        this.userId = userId;
        this.attemptedLoginId = attemptedLoginId;
        this.provider = provider;
        this.result = result;
    }

    public static LoginHistory success(Long userId, Provider provider) {
        return LoginHistory.builder()
                .userId(userId)
                .provider(provider)
                .result(LoginResult.SUCCESS)
                .build();
    }

    public static LoginHistory failLocal(Long userIdOrNull, String attemptedLoginId,
                                         Provider provider) {
        return LoginHistory.builder()
                .userId(userIdOrNull)
                .attemptedLoginId(attemptedLoginId)   // 20자 truncate는 서비스에서
                .provider(provider)
                .result(LoginResult.FAIL)
                .build();
    }

}