package com.teambook.panorama.domain.book.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
@Entity
@Table(name = "popular_books")
public class PopularBook {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "popular_id", nullable = false)
  private Long popularId;

  @Column(name = "ranking", nullable = false)
  private Integer ranking;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "book_id", nullable = false)
  private Book book;

  @Column(name = "loan_count", nullable = false)
  private String loanCount;

  @Builder
  public PopularBook(Integer ranking, Book book, String loanCount) {
    this.ranking = ranking;
    this.book = book;
    this.loanCount = loanCount;
  }

  

  
}
