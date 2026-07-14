package com.teambook.panorama.domain.book.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.book.dto.bookmark.BookmarkRequest;
import com.teambook.panorama.domain.book.dto.bookmark.BookmarkResponse;
import com.teambook.panorama.domain.book.entity.Book;
import com.teambook.panorama.domain.book.entity.Bookmark;
import com.teambook.panorama.domain.book.repository.BookRepository;
import com.teambook.panorama.domain.book.repository.BookmarkRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookmarkService {

  private final BookmarkRepository bookmarkRepository;
  private final BookRepository bookRepository;

  @Transactional
  public BookmarkResponse toggleBookmark(BookmarkRequest request, Long userId) {
    
    
    //책DB확인, 없으면 생성
    Book book = bookRepository.findByIsbn(request.isbn())
    .orElseGet(() -> bookRepository.save(createBook(request)));

    //북마크 확인 -> 삭제 또는 생성
    boolean isBookmarked;
    Optional<Bookmark> found = bookmarkRepository.findByUserIdAndBook_BookId(userId, book.getBookId());
    if (found.isPresent()) {
      bookmarkRepository.delete(found.get());
      isBookmarked = false;
    } else {
      bookmarkRepository.save(Bookmark.builder().book(book).userId(userId).build());
      isBookmarked = true;
    }

    //북마크 수 카운트
    int bookmarkCount = (int) bookmarkRepository.countByBook_BookId(book.getBookId());

    return BookmarkResponse.builder()
    .bookmarkCount(bookmarkCount)
    .isBookmarked(isBookmarked)
    .build();
    }







    private Book createBook(BookmarkRequest request){
     return Book.builder()
    .author(request.author())
    .description(request.description())
    .imageUrl(request.image())
    .isbn(request.isbn())
    .pubdate(request.pubdate())
    .publisher(request.publisher())
    .shopUrl(request.link())
    .title(request.title())
    .build();
    
  }



}
