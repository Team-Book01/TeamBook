package com.teambook.panorama.domain.library.entity;

import java.math.BigDecimal;

import com.teambook.panorama.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(name = "library")
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Library extends BaseTimeEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "lib_id", nullable = false)
  private Long libId;

  @Column(name = "lib_code", nullable = false)
  private String libCode;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "address", nullable = false)
  private String address;

  @Column(name = "tel")
  private String tel;

  @Column(name = "fax")
  private String fax;

  @Column(name = "latitude", nullable = false)
  private BigDecimal latitude;

  @Column(name = "longitude", nullable = false)
  private BigDecimal longitude;

  @Column(name = "homepage_url")
  private String homepageUrl;

  @Column(name = "closed_days")
  private String closedDays;

  @Column(name = "operating_hours")
  private String operatingHours;

  @Column(name = "book_count")
  private Integer bookCount;

  @Builder
  private Library(String libCode, String name, String address, String tel, String fax,
      BigDecimal latitude, BigDecimal longitude, String homepageUrl, String closedDays,
      String operatingHours, Integer bookCount) {
    this.libCode = libCode;
    this.name = name;
    this.address = address;
    this.tel = tel;
    this.fax = fax;
    this.latitude = latitude;
    this.longitude = longitude;
    this.homepageUrl = homepageUrl;
    this.closedDays = closedDays;
    this.operatingHours = operatingHours;
    this.bookCount = bookCount;
  }

  /**
   * 동기화 반영: lib_code(식별자) 는 그대로 두고 나머지 값만 최신으로 덮어쓴다.
   * (upsert 의 update 경로에서 더티체킹으로 UPDATE)
   */
  public void update(String name, String address, String tel, String fax,
      BigDecimal latitude, BigDecimal longitude, String homepageUrl, String closedDays,
      String operatingHours, Integer bookCount) {
    this.name = name;
    this.address = address;
    this.tel = tel;
    this.fax = fax;
    this.latitude = latitude;
    this.longitude = longitude;
    this.homepageUrl = homepageUrl;
    this.closedDays = closedDays;
    this.operatingHours = operatingHours;
    this.bookCount = bookCount;
  }
}
