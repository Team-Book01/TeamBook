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

  @Column(name = "login_id", nullable = true, unique = true, length = 20)
  private String loginId;

  @Column(nullable = true, columnDefinition = "CHAR(60)")
  private String password;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Provider provider;

  @Column(nullable = false, unique = true, length = 20)
  private String nickname;

  // email 에는 "인증이 완료된 주소"만 저장한다. 인증 대기 중인 주소는 여기 넣지 않고
  // email_verifications.target_email 에 보관하다가, 인증 성공 시점에만 이 컬럼으로 승격한다.
  @Column(nullable = true, unique = true)
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


  public void updateNickname(String nickname) {
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

  /**
   * 이메일 인증 완료 여부. 인증된 주소만 email 에 저장하므로 "email 존재 ⟺ 인증 완료"가 된다.
   * 호출부에서 getEmail()!=null 을 흩뿌리지 말고 이 메서드로 모은다.
   */
  public boolean hasVerifiedEmail() {
    return this.email != null;
  }

  /** 인증이 완료된 email 을 승격 저장한다. (confirmVerification 성공 시점에만 호출) */
  public void registerVerifiedEmail(String email) {
    this.email = email;
  }

  public void updatePassword(String encodedPassword){
    this.password = encodedPassword;
  }
}
