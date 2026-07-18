package com.teambook.panorama.domain.post.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.book.entity.Book;
import com.teambook.panorama.domain.book.repository.BookRepository;
import com.teambook.panorama.domain.post.dto.PostDetailResponseDto;
import com.teambook.panorama.domain.post.dto.PostRequestDto;
import com.teambook.panorama.domain.post.dto.PostResponseDto;
import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.entity.PostImage;
import com.teambook.panorama.domain.post.enums.PostStatus;
import com.teambook.panorama.domain.post.repositories.PostImageRepository;
import com.teambook.panorama.domain.post.repositories.PostLikeRepository;
import com.teambook.panorama.domain.post.repositories.PostRepository;
import com.teambook.panorama.domain.post.repositories.PostScrapRepository;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
  private final PostRepository postRepository;
  private final UserRepository userRepository;
  private final PostImageRepository postImageRepository;
  private final BookRepository bookRepository;
  private final PostLikeRepository postLikeRepository;
  private final PostScrapRepository postScrapRepository;

  @Transactional
  public Long createPost(Long userId, PostRequestDto request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    Book book = findOrCreateBook(request);

    Post post = Post.builder().book(book)
        .user(user)
        .category(request.category())
        .title(request.title())
        .content(request.content()).build();

    Post saved = postRepository.save(post);

    if (request.imageKeys() != null && !request.imageKeys().isEmpty()) {
      List<PostImage> images = postImageRepository.findByImageKeyIn(request.imageKeys());
      if (images.size() != request.imageKeys().size()) {
        throw new BusinessException(ErrorCode.IMAGE_NOT_FOUND);
      }
      for (PostImage image : images) {
        image.attachTo(saved);
      }
    }

    return saved.getPostId();
  }

  @Transactional
  public PostDetailResponseDto getDetailAndIncreaseView(Long postId, Long userId) {
    Post post = checkAndGetPost(postId);
    post.increaseViewCount();
    
    long likeCount = postLikeRepository.countByPost(post);
    boolean liked = (userId == null) ? false : postLikeRepository.existsByPostAndUserId(post, userId);
    boolean scrapped = (userId == null) ? false : postScrapRepository.existsByPostAndUserId(post, userId);

    return new PostDetailResponseDto(postId, (post.getBook() != null ? (post.getBook().getBookId()) : null),
        post.getUser().getId(), post.getUser().getNickname(), post.getCategory(), post.getTitle(), post.getContent(),
        post.getViewCount(), post.getCreatedAt(), liked, scrapped, likeCount);
  }

  @Transactional(readOnly = true)
  public Slice<PostSummaryResponseDto> findActivePosts(Pageable pageable) {
    Slice<Post> sliceList = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE, pageable);
    return sliceList.map(PostSummaryResponseDto::from);
  }

  @Transactional
  public PostResponseDto updatePost(Long postId, Long userId, PostRequestDto request) {
    Post post = checkAndGetPost(postId);

    if (!userId.equals(post.getUser().getId())) {
      throw new BusinessException(ErrorCode.NOT_POST_OWNER);
    }

    Book book = findOrCreateBook(request);

    post.update(book, request.category(), request.title(), request.content());

    return new PostResponseDto(postId);
  }

  // DB에서 행을 읽어 객체로 만들었을 때 JPA의 감시 대상에 등록되어 스냅샷이 보관되므로 save()는 필요하지 않다
  @Transactional
  public void deletePost(Long postId, Long userId) {
    Post post = checkAndGetPost(postId);

    // 세번째 관문: 지우려는 사용자와 작성자가 같은 사람인가?
    if (!userId.equals(post.getUser().getId())) {
      throw new BusinessException(ErrorCode.NOT_POST_OWNER);
    }

    post.changeStatus(PostStatus.DELETED);
  }

  // 조정 주체가 없어서 서버에 상수 소유, 프론트에서 파라미터 형태로 변경 요구할 수 있음
  private static final long POPULAR_LIKE_THRESHOLD = 3;

  @Transactional(readOnly = true)
  public Slice<PostSummaryResponseDto> findPopularPosts(Pageable pageable) {
    Slice<Post> sliceList = postRepository.findPopular(PostStatus.ACTIVE, POPULAR_LIKE_THRESHOLD, pageable);
    return sliceList.map(PostSummaryResponseDto::from);
  }

  private Post checkAndGetPost(Long postId) {
    // 첫번째 관문: 글이 기존에 있던 글이었나?
    Post post = postRepository.findById(postId).orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

    // 두번째 관문: 일반 사용자가 볼 수 있는 글인가?
    if (post.getStatus() != PostStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.POST_NOT_FOUND);
    }

    return post;
  }

  private Book findOrCreateBook(PostRequestDto request) {
    if (request.isbn() == null) {
      return null;
    }
    return bookRepository.findByIsbn(request.isbn())
    .orElseGet(() -> bookRepository.save(Book.builder().isbn(request.isbn()).title(request.bookTitle()).author(request.bookAuthor()).imageUrl(request.bookImageUrl()).build()));
  }
}
