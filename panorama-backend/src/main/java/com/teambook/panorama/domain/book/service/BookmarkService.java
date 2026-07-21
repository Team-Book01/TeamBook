package com.teambook.panorama.domain.book.service;

import java.util.List;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.teambook.panorama.domain.book.dto.bookmark.BookmarkRequest;
import com.teambook.panorama.domain.book.dto.bookmark.BookmarkResponse;
import com.teambook.panorama.domain.book.dto.bookmark.MyBookmarkItem;
import com.teambook.panorama.domain.book.dto.bookmark.MyBookmarkResponse;
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
    Book book = findOrCreateBook(request);

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
  //마이페이지 북마크 수 가져오기
  public Long findMyBookmarkCount(Long userId){
    return bookmarkRepository.countByUserId(userId);
  }
  //마이페이지용 북마크 리스트 가져오기
  public MyBookmarkResponse findMyBookmarks(Long userId) {
    //북마크 리스트 가져오기
    List<Bookmark> myBookmarks = bookmarkRepository.findByUserIdWithBook(userId);
    //북마크아이템리스트
    List<MyBookmarkItem> myBookmarkItems = myBookmarks.stream().map(bookmark -> {
      return
      MyBookmarkItem.builder()
      .author(bookmark.getBook().getAuthor())
      .bookImage(bookmark.getBook().getImageUrl())
      .bookTitle(bookmark.getBook().getTitle())
      .createdAt(bookmark.getCreatedAt())
      .isbn(bookmark.getBook().getIsbn())
      .build();
    }).toList();
    return new MyBookmarkResponse(myBookmarkItems.size(), myBookmarkItems);


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
  //동시성 표준 패턴이래~
  private Book findOrCreateBook(BookmarkRequest request) {
    return bookRepository.findByIsbn(request.isbn()).orElseGet(() -> {
      try {
        return bookRepository.save(createBook(request));
      } catch (DataIntegrityViolationException e) {
        //동시에 생성되면 다시 조회
        return bookRepository.findByIsbn(request.isbn()).orElseThrow(() -> e);
      }
    });
  }



}
