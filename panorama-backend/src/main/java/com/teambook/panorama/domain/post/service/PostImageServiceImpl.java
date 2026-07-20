package com.teambook.panorama.domain.post.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.post.dto.PostImageResponseDto;
import com.teambook.panorama.domain.post.entity.PostImage;
import com.teambook.panorama.domain.post.repositories.PostImageRepository;
import com.teambook.panorama.global.storage.ImageStorageService;
import com.teambook.panorama.global.storage.StoredImage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostImageServiceImpl implements PostImageService {

  private final PostImageRepository postImageRepository;
  // 검증·디스크 저장은 공통 처리. 여기는 post_images 행을 남기는 일만 한다.
  private final ImageStorageService imageStorageService;

  @Transactional
  public List<PostImageResponseDto> uploadImages(List<MultipartFile> files) {
    return imageStorageService.store(files).stream()
        .map(this::save)
        .toList();
  }

  /** post_id 는 아직 null — 에디터가 글 저장 전에 올리므로 소유자가 없다. 글 저장 시 연결된다. */
  private PostImageResponseDto save(StoredImage image) {
    postImageRepository.save(PostImage.builder()
        .imageUrl(image.imageUrl())
        .imageKey(image.imageKey())
        .originalFileName(image.originalFileName())
        .contentType(image.contentType())
        .fileSize(image.fileSize())
        .build());
    return new PostImageResponseDto(image.imageKey(), image.imageUrl());
  }
}
