package com.teambook.panorama.domain.post.service;

import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.post.dto.PostLikeResponseDto;
import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.entity.PostLike;
import com.teambook.panorama.domain.post.enums.PostStatus;
import com.teambook.panorama.domain.post.repositories.PostLikeRepository;
import com.teambook.panorama.domain.post.repositories.PostRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostLikeServiceImpl implements PostLikeService {
  private final PostRepository postRepository;
  private final PostLikeRepository postLikeRepository;

  @Transactional
  public PostLikeResponseDto like(Long postId, Long userId) {
    Post post = checkAndGetPost(postId);

    // 1차 방어: 대부분의 중복을 여기서 걸러 409로 답한다.
    if (postLikeRepository.existsByPostAndUserId(post, userId)) {
      throw new BusinessException(ErrorCode.ALREADY_LIKED_POST);
    }

    PostLike postLike = PostLike.builder().post(post)
        .userId(userId)
        .build();

    // 2차 방어(TOCTOU): exists 통과와 save 사이에 동시 요청이 끼어들면
    // UK_POST_LIKES_POST_USER 위반이 최후 심판이 된다. flush를 당겨(saveAndFlush)
    // 이 catch 블록 안에서 터지게 하고, 500이 아닌 409(P003)로 번역한다.
    // (save만 쓰면 flush가 트랜잭션 끝으로 밀려 catch 밖에서 터진다)
    try {
      postLikeRepository.saveAndFlush(postLike);
    } catch (DataIntegrityViolationException e) {
      throw new BusinessException(ErrorCode.ALREADY_LIKED_POST);
    }

    long likeCount = postLikeRepository.countByPost(post);

    return new PostLikeResponseDto(true, likeCount);
  }

  @Transactional
  public PostLikeResponseDto unlike(Long postId, Long userId) {
    Post post = checkAndGetPost(postId);

    // 미추천 상태에서 취소 요청은 에러 없이 통과 — 최종 상태(안 누름)가 이미 달성돼 있으므로
    Optional<PostLike> found = postLikeRepository.findByPostAndUserId(post, userId);
    if (found.isPresent()) {
      postLikeRepository.delete(found.get());
    }

    long likeCount = postLikeRepository.countByPost(post);

    return new PostLikeResponseDto(false, likeCount);
  }

  private Post checkAndGetPost(Long postId) {
    // 글이 기존에 있던 글이었나?
    Post post = postRepository.findById(postId).orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

    // 일반 사용자가 볼 수 있는 글인가?
    if (post.getStatus() != PostStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.POST_NOT_FOUND);
    }

    return post;
  }
}
