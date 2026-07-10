package com.teambook.panorama.domain.user.entity;

import java.time.LocalDateTime;
import java.util.List;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class User extends BaseTimeEntity{
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "user_id")
  private Long id;

  @Column(name = "login_id", nullable = false, unique = true, length = 20)
  private String loginId;

  @Column(nullable = true, columnDefinition = "CHAR(60)")
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Provider provider;

  @Column(nullable = false, unique = true, length = 20)
  private String nickname;

  @Column(nullable = true)
  private String email;

  @Column(name = "profile_image_url", nullable = true)
  private String profileImageUrl;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  @Builder(access = AccessLevel.PRIVATE)
  private User(Provider provider, String loginId, String password, String email,
              String nickname, Role role, Status status) {
      this.provider = provider;
      this.loginId = loginId;
      this.password = password;
      this.email = email;
      this.nickname = nickname;
      this.role = role;
      this.status = status;
  }

  public static User createLocalUser(String loginId, String encodedPassword,
                                      String email, String nickname) {
      return User.builder()
              .provider(Provider.LOCAL)
              .loginId(loginId)
              .password(encodedPassword)
              .email(email)
              .nickname(nickname)
              .role(Role.USER)
              .status(Status.ACTIVE)
              .build();
  }

  public static User createSocialUser(Provider provider, String nickname) {
      return User.builder()
              .provider(provider)         // GOOGLE / NAVER / KAKAO
              .nickname(nickname)          // loginId/password/email = null
              .role(Role.USER)
              .status(Status.ACTIVE)
              .build();
  }


  void updateNickname(String nickname) {
    this.nickname = nickname;
  }


  /** 계정 활성화 변경 */
  public void activate() {
      this.status = Status.ACTIVE;
  }

  public void suspend() {
      this.status = Status.SUSPENDED;
  }

  public void delete() {
      this.status = Status.DELETED;
  }
}
