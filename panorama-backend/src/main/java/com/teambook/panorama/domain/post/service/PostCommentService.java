package com.teambook.panorama.domain.post.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.post.dto.PostCommentListResponseDto;
import com.teambook.panorama.domain.post.dto.PostCommentReplyResponseDto;
import com.teambook.panorama.domain.post.dto.PostCommentRequestDto;
import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.entity.PostComment;
import com.teambook.panorama.domain.post.enums.CommentStatus;
import com.teambook.panorama.domain.post.enums.PostStatus;
import com.teambook.panorama.domain.post.repositories.PostCommentRepository;
import com.teambook.panorama.domain.post.repositories.PostRepository;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostCommentService {
  private final PostCommentListResponseDto postCommentListResponseDto;
  private final PostCommentRepository postCommentRepository;
  private final PostRepository postRepository;
  private final UserRepository userRepository;

  @Transactional
  public Long createComment(Long userId, Long postId, PostCommentRequestDto request) {
    // 관문 1: 작성자 존재
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    // 관문 2·3: 글 존재 + ACTIVE
    Post post = postRepository.findById(postId)
      .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    if (post.getStatus() != PostStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.POST_NOT_FOUND);
    }

    // 관문 4~6 (replyToCommentId 있을 때만): 대상 댓글 존재 + 같은 글 + ACTIVE
    PostComment target = null;
    if (request.replyToCommentId() != null) {
      target = postCommentRepository.findById(request.replyToCommentId())
        .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
      if (!postId.equals(target.getPost().getPostId())) {    // Long은 equals
        throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
      }
      if (target.getStatus() != CommentStatus.ACTIVE) {
        throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
      }
    }

    PostComment parent = null;
    if(target != null) {
        if(target.getParent() == null) {
            parent = target;
        } else {
            parent = target.getParent();
        }
    }

    PostComment comment = PostComment.builder().post(post)
        .user(user)
        .parent(parent)
        .content(request.content())
        .build();
    
    return postCommentRepository.save(comment).getCommentId();
  }

  @Transactional(readOnly = true)
  public Slice<PostCommentReplyResponseDto> findComments (Long postId, Pageable pageable) {
    // Post post = postRepository.findById(postId)
    //   .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
    // if (post.getStatus() != PostStatus.ACTIVE) {
    //   throw new BusinessException(ErrorCode.POST_NOT_FOUND);
    // }

    // Slice<PostComment> slice = postCommentRepository.findByPostAndParentIsNullOrderByCreatedAtAsc(post, pageable);
    // List<PostComment> replies = postCommentRepository.findByParentInOrderByCreatedAtAsc(slice.getContent());

    // Map<Long, List<PostCommentReplyResponseDto>> box = new HashMap<>();
    // for(PostComment reply : replies) {
    //   String commentMask;
    //   if(reply.getStatus() == PostCommentStatus.DELETED) {
    //     commentMask = "삭제된 댓글입니다.";
    //   } else if(reply.getStatus() == PostCommentStatus.HIDDEN) {
    //     commentMask = "숨김 처리된 댓글입니다.";
    //   } else {
    //     commentMask = replies.getContent();
    //   }

    //   box.computeIfAbsent(replies.getParent().getCommentId(), k -> new ArrayList<>()).add(new PostCommentReplyResponseDto);
    // }

    // TODO 7/14: 조회 구현 재개 — 슬립 7건 목록은 세션 기록 참조
    throw new UnsupportedOperationException("댓글 목록 조회 구현 중");
  }
}
