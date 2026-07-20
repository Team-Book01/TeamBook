package com.teambook.panorama.domain.post.service;

import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.post.dto.PostScrapResponseDto;
import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.entity.PostScrap;
import com.teambook.panorama.domain.post.enums.PostStatus;
import com.teambook.panorama.domain.post.repositories.PostRepository;
import com.teambook.panorama.domain.post.repositories.PostScrapRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostScrapServiceImpl implements PostScrapService {
  private final PostRepository postRepository;
  private final PostScrapRepository postScrapRepository;

  @Transactional
  public PostScrapResponseDto scrap(Long postId, Long userId) {
    Post post = checkAndGetPost(postId);

    // 1차 방어: 대부분의 중복을 여기서 걸러 409로 답한다.
    if (postScrapRepository.existsByPostAndUserId(post, userId)) {
      throw new BusinessException(ErrorCode.ALREADY_SCRAPPED_POST);
    }

    // 2차 방어(TOCTOU): 동시 요청이 exists를 함께 통과한 경우
    // UK_POST_SCRAPS_POST_USER 위반을 이 지점에서 잡아 409(P004)로 번역. (좋아요와 동일 패턴)
    try {
      postScrapRepository.saveAndFlush(PostScrap.builder().post(post).userId(userId).build());
    } catch (DataIntegrityViolationException e) {
      throw new BusinessException(ErrorCode.ALREADY_SCRAPPED_POST);
    }

    return new PostScrapResponseDto(true);
  }

  @Transactional
  public PostScrapResponseDto unscrap(Long postId, Long userId) {
    Post post = checkAndGetPost(postId);

    // 미스크랩 상태에서 취소 요청은 에러 없이 통과 — 최종 상태가 이미 달성돼 있으므로 (좋아요와 동일 정책)
    Optional<PostScrap> found = postScrapRepository.findByPostAndUserId(post, userId);
    if (found.isPresent()) {
      postScrapRepository.delete(found.get());
    }

    return new PostScrapResponseDto(false);
  }

  @Transactional(readOnly = true)
  public Slice<PostSummaryResponseDto> findMyScraps(Long userId, Pageable pageable) {
    Slice<PostScrap> scraps = postScrapRepository.findByUserIdAndPost_StatusOrderByCreatedAtDesc(userId, PostStatus.ACTIVE, pageable);

    return scraps.map(scrap -> PostSummaryResponseDto.from(scrap.getPost()));
  }

  private Post checkAndGetPost(Long postId) {
    Post post = postRepository.findById(postId)
        .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    if (post.getStatus() != PostStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.POST_NOT_FOUND);
    }
    return post;
  }
}
