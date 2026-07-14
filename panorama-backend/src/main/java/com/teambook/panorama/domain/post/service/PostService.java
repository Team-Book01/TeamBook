package com.teambook.panorama.domain.post.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.post.dto.PostDetailResponseDto;
import com.teambook.panorama.domain.post.dto.PostRequestDto;
import com.teambook.panorama.domain.post.dto.PostResponseDto;
import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.enums.PostStatus;
import com.teambook.panorama.domain.post.repositories.PostRepository;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

// TODO: 책 첨부는 팀 BookRepository(findByIsbn) develop 머지 후 ISBN find-or-create로 연동
@Service
@RequiredArgsConstructor
public class PostService {
  private final PostRepository postRepository;
  private final UserRepository userRepository;

  @Transactional
  public Long createPost(Long userId, PostRequestDto request) {
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    Post post = Post.builder().user(user)
      .category(request.category())
      .title(request.title())
      .content(request.content()).build();
    return postRepository.save(post).getPostId();
  }

  @Transactional
  public PostDetailResponseDto getDetailAndIncreaseView(Long postId) {
    Post post = checkAndGetPost(postId);
    post.increaseViewCount();
    
    return new PostDetailResponseDto(postId, (post.getBook() != null ? (post.getBook().getBookId()) : null), post.getUser().getId(), post.getUser().getNickname(), post.getCategory(), post.getTitle(), post.getContent(), post.getViewCount(), post.getCreatedAt());
  }

  @Transactional(readOnly = true)
  public Slice<PostSummaryResponseDto> findActivePosts(Pageable pageable) {
    Slice<Post> sliceList = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE, pageable);
    return sliceList.map(PostSummaryResponseDto::from);
  }

  @Transactional
  public PostResponseDto updatePost(Long postId, Long userId, PostRequestDto request) {
    Post post = checkAndGetPost(postId);

    if(!userId.equals(post.getUser().getId())) {
      throw new BusinessException(ErrorCode.NOT_POST_OWNER);
    }

    post.update(null, request.category(), request.title(), request.content());

    return new PostResponseDto(postId);
  }

  // DB에서 행을 읽어 객체로 만들었을 때 JPA의 감시 대상에 등록되어 스냅샷이 보관되므로 save()는 필요하지 않다
  @Transactional
  public void deletePost(Long postId, Long userId) {
    Post post = checkAndGetPost(postId);
    
    // 세번째 관문: 지우려는 사용자와 작성자가 같은 사람인가?
    if(!userId.equals(post.getUser().getId())) {
      throw new BusinessException(ErrorCode.NOT_POST_OWNER);
    }

    post.changeStatus(PostStatus.DELETED);
  }

  private Post checkAndGetPost(Long postId) {
    // 첫번째 관문: 글이 기존에 있던 글이었나?
    Post post = postRepository.findById(postId).orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

    // 두번째 관문: 일반 사용자가 볼 수 있는 글인가?
    if(post.getStatus() != PostStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.POST_NOT_FOUND);
    }

    return post;
  }
}
