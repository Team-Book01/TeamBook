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
import com.teambook.panorama.domain.post.dto.PostCommentResponseDto;
import com.teambook.panorama.domain.post.dto.PostCommentUpdateRequestDto;
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
  private final PostCommentRepository postCommentRepository;
  private final PostRepository postRepository;
  private final UserRepository userRepository;

  @Transactional
  public Long createComment(Long userId, Long postId, PostCommentRequestDto request) {
    // 관문 1: 작성자 존재
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    // 관문 2·3: 글 존재 + ACTIVE
    Post post = checkAndGetPost(postId);

    // 관문 4~6 (replyToCommentId 있을 때만): 대상 댓글 존재 + 같은 글 + ACTIVE
    PostComment target = null;
    if (request.replyToCommentId() != null) {
      target = checkAndGetComment(postId, request.replyToCommentId());
    }

    PostComment parent = null;
    if (target != null) {
      if (target.getParent() == null) {
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
  public Slice<PostCommentListResponseDto> findComments(Long postId, Pageable pageable) {
    Post post = checkAndGetPost(postId);

    Slice<PostComment> slice = postCommentRepository.findByPostAndParentIsNullOrderByCreatedAtAsc(post, pageable);
    List<PostComment> replies = postCommentRepository.findByParentInOrderByCreatedAtAsc(slice.getContent());

    Map<Long, List<PostCommentReplyResponseDto>> box = new HashMap<>();
    for (PostComment reply : replies) {
      box.computeIfAbsent(reply.getParent().getCommentId(), k -> new ArrayList<>()).add(new PostCommentReplyResponseDto(
          reply.getCommentId(), reply.getUser().getNickname(), maskComment(reply), reply.getCreatedAt()));
    }

    // slice(루트 댓글 목록)를 루트 DTO로 변환하고, 루트가 box에서 답글 꺼내서 붙이기
    return slice.map(rootComment -> new PostCommentListResponseDto(rootComment.getCommentId(),
        rootComment.getUser().getNickname(), maskComment(rootComment), rootComment.getCreatedAt(),
        box.getOrDefault(rootComment.getCommentId(), new ArrayList<>())));
  }

  @Transactional
  public PostCommentResponseDto updateComment(Long postId, Long commentId, Long userId,
      PostCommentUpdateRequestDto request) {
    checkAndGetPost(postId);

    PostComment postComment = checkAndGetComment(postId, commentId);

    if(!userId.equals(postComment.getUser().getId())) {
      throw new BusinessException(ErrorCode.NOT_COMMENT_OWNER);
    }

    postComment.updateContent(request.content());

    return new PostCommentResponseDto(commentId, postComment.getContent());
  }

  @Transactional
  public void deleteComment(Long postId, Long commentId, Long userId) {
    checkAndGetPost(postId);

    PostComment postComment = checkAndGetComment(postId, commentId);

    if(!userId.equals(postComment.getUser().getId())) {
      throw new BusinessException(ErrorCode.NOT_COMMENT_OWNER);
    }

    postComment.changeStatus(CommentStatus.DELETED);
  }

  private String maskComment(PostComment postComment) {
    String commentMask;
    if (postComment.getStatus() == CommentStatus.DELETED) {
      commentMask = "삭제된 댓글입니다.";
    } else if (postComment.getStatus() == CommentStatus.HIDDEN) {
      commentMask = "숨김 처리된 댓글입니다.";
    } else {
      commentMask = postComment.getContent();
    }
    return commentMask;
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

  private PostComment checkAndGetComment(Long postId, Long commentId) {
    PostComment target = postCommentRepository.findById(commentId)
        .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
    if (!postId.equals(target.getPost().getPostId())) { // Long은 equals
      throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
    }
    if (target.getStatus() != CommentStatus.ACTIVE) {
      throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
    }
    return target;
  }
}
