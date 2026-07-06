package com.teambook.panorama.domain.user.entity;

import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.enums.Role;
import com.teambook.panorama.domain.user.enums.Status;
import com.teambook.panorama.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class User extends BaseTimeEntity{
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "user_id")
  private Long id;

  @Column(name = "login_id", nullable = false, unique = true, length = 20)
  private String loginId;

  @Column(nullable = true, length = 60)
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Provider provider;

  @Column(nullable = false, unique = true, length = 20)
  private String nickname;

  @Column(nullable = true)
  private String email;

  @Column(name = "profile_image_url", nullable = true)
  private String profileImageUrl;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;
  // private List<OAuthAccount> oauthAccounts;   // @OneToMany (로그인 수단 연동)

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  // static User createLocalUser(loginId, encodedPassword, nickname)  // 정적 팩토리
  // void addOAuthAccount(OAuthAccount account)          // 연관관계 편의 메소드
  void updateNickname(String nickname) {
    this.nickname = nickname;
  }
}
