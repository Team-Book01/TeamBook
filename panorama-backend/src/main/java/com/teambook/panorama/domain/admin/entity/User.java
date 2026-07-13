package com.teambook.panorama.domain.admin.entity;

import com.teambook.panorama.global.entity.BaseTimeEntity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "users")
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class User extends BaseTimeEntity{

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name="user_id", nullable = false)
  private Long userId;

  @Column(name="login_id", length = 20)
  private String loginId;

  // BCrypt 해시는 항상 60자 고정 → DB는 CHAR(60). String 기본 매핑(VARCHAR)과 달라
  // ddl-auto=validate 가 CHAR≠VARCHAR 로 튕기므로 JDBC 타입을 CHAR 로 명시한다.
  @JdbcTypeCode(SqlTypes.CHAR)
  @Column(name="password", length = 60)
  private String password;

  @Column(name="provider", nullable = false)
  private String provider;

  @Column(name="nickname", nullable = false)
  private String nickname;

  @Column(name="email")
  private String email;

  @Column(name="profile_image_url")
  private String profileImageUrl;

  @Column(name="role", nullable = false)
  private String role;

  @Column(name="status", nullable = false)
  private String status;

}
