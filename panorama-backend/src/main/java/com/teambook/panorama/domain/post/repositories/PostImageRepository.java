package com.teambook.panorama.domain.post.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.post.entity.PostImage;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
  List<PostImage> findByImageKeyIn(List<String> imageKeys);
}
