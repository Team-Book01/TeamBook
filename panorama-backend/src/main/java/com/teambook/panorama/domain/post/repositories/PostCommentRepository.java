package com.teambook.panorama.domain.post.repositories;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.post.entity.Post;
import com.teambook.panorama.domain.post.entity.PostComment;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    @EntityGraph(attributePaths = "user")
    Slice<PostComment> findByPostAndParentIsNullOrderByCreatedAtAsc(Post post, Pageable pageable);
    @EntityGraph(attributePaths = "user")
    List<PostComment> findByParentInOrderByCreatedAtAsc(List<PostComment> parents);
}
