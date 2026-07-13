package com.teambook.panorama.domain.user.entity;

import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "social_accounts",
       uniqueConstraints = @UniqueConstraint(
        name = "UK_SOCIAL_PROVIDER_USER",
        columnNames = {"provider", "provider_user_id"})
       )
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SocialAccount extends BaseTimeEntity{

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "social_account_id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Provider provider;              // GOOGLE / NAVER / KAKAO (LOCAL 저장 안 함)

  @Column(name = "provider_user_id", nullable = false)
  private String providerUserId;

  @Column(name = "provider_email")
  private String providerEmail;

  @Builder(access = AccessLevel.PRIVATE)
  private SocialAccount(User user, Provider provider, String providerUserId, String providerEmail){
    this.user = user;
    this.provider = provider;
    this.providerUserId = providerUserId;
    this.providerEmail = providerEmail;
  }

  public static SocialAccount of (User user, Provider provider, String providerUserId, String providerEmail){
    return SocialAccount.builder()
            .user(user)
            .provider(provider)
            .providerUserId(providerUserId)
            .providerEmail(providerEmail)
            .build();
  }
}
