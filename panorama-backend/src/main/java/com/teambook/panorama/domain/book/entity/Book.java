package com.teambook.panorama.domain.book.entity;

import com.teambook.panorama.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
@Entity
@Table(name = "books", uniqueConstraints = {
  @UniqueConstraint(name = "ISBN", columnNames = {"isbn"})})
public class Book extends BaseTimeEntity {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "book_id", nullable = false)
  private Long bookId;

  @Column(name = "isbn", nullable = true, length = 20)
  private String isbn;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "author", nullable = true)
  private String author;

  @Column(name = "publisher", nullable = true)
  private String publisher;

  @Column(name = "pubdate", nullable = true)
  private String pubdate;

  @Lob
  @Column(name = "description", nullable = true)
  private String description;

  @Column(name = "image", nullable = true)
  private String imageUrl;
  
  @Column(name = "link", nullable = true) 
  private String shopUrl;

  public Book(String isbn, String title, String author, String publisher, String pubdate, String description,
      String imageUrl, String shopUrl) {
    this.isbn = isbn;
    this.title = title;
    this.author = author;
    this.publisher = publisher;
    this.pubdate = pubdate;
    this.description = description;
    this.imageUrl = imageUrl;
    this.shopUrl = shopUrl;
  }

  

}
