package com.teambook.panorama.domain.post.entity;

import com.teambook.panorama.domain.book.entity.Book;
import com.teambook.panorama.domain.post.enums.PostCategory;
import com.teambook.panorama.domain.post.enums.PostStatus;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity    // 상태, 행위를 가지고, 해당 클래스의 필드들을 테이블의 컬럼으로 매칭시킨다. 서비스에서 DTO <-> 엔티티 변환 과정을 거친다.
/**
 * @NoArgsConstructor(access = AccessLevel.PROTECTED)
 * JPA는 기본 생성자(기능이 아무것도 없음)를 반드시 필요로 하는데, @NoArgsConstructor를 붙이면 기본 생성자를 생성해 준다.
 * access = AccessLevel.PROTECTED는 생성된 기본 생성자의 접근 제한자를 PROTECTED로 설정한다는 의미이다.
 * 이름은 No Args + Constructor의 조합으로 인자(매개변수) 가 없는 생성자라는 의미 
 */
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter    // 외부에서 값을 변경해야 할 이유가 없으므로 @Setter은 사용하지 않는다
@Table(name = "posts")
public class Post extends BaseTimeEntity {
  @Id    // 이 필드는 PK임을 의미한다
  @GeneratedValue(strategy = GenerationType.IDENTITY)    // PK의 생성 전략을 설정한다. strategy = GenerationType.IDENTITY는 DB에 기본 키 생성을 위임하는 방식으로, AUTO_INCREMENT를 사용해서 PK를 만들게 되며 INSERT가 실행된 후에야 PK값을 알 수 있게 된다.
  @Column(name = "post_id")    // 일반 컬럼에 상세 조건을 설정해야 할 때 사용한다. name 속성의 경우 컬럼 이름은 스네이크 케이스인데 필드 이름은 카멜 케이스이므로 수동으로 이름을 매핑시키기 위해 사용하였다.
  private Long postId;

  @ManyToOne(fetch = FetchType.LAZY)    // 연관관계를 나타내는 어노테이션으로, Many에 해당하는 쪽(FK를 가진 쪽)에 붙인다. FetchType: 연관관계를 어떻게 설정할 것인가. LAZY = 실제로 쓸 때까지 로딩을 미룸 (프록시(가짜 객체)로 자리만 채워둠)
  @JoinColumn(name = "book_id")    // 외래 키 컬럼에 상세 조건을 설정하기 위해 사용하나 생략할 경우 관계 매핑 전체가 망가질 수 있어 생략하지 않는 편이 낫다
  private Book book;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)    // Enum을 DB 컬럼에 매핑할 때 어떤 타입으로 저장할지 지정한다.
  @Column(nullable = false, length = 20)    // 
  private PostCategory category;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "MEDIUMTEXT")    // MEDIUMTEXT: 약 16MB
  private String content;

  @Column(name = "view_count", nullable = false)
  private int viewCount = 0;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PostStatus status = PostStatus.ACTIVE;

  @Column(name = "ocr_isbn", length = 20)
  private String ocrIsbn;

  @Column(name = "is_book_verified", nullable = false)
  private boolean isBookVerified = false;

  @Builder
  public Post(Book book, User user, PostCategory category, String title, String content) {
    this.book = book;
    this.user = user;
    this.category = category;
    this.title = title;
    this.content = content;
  }

  public void increaseViewCount() {
    viewCount++;
  }

  public void update(Book book, PostCategory category, String title, String content) {
    this.book = book;
    this.category = category;
    this.title = title;
    this.content = content;
  }

  public void changeStatus(PostStatus status) {
    this.status = status;
  }
}
