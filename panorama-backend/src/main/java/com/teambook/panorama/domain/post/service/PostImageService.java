package com.teambook.panorama.domain.post.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.post.dto.PostImageResponseDto;
import com.teambook.panorama.domain.post.entity.PostImage;
import com.teambook.panorama.domain.post.repositories.PostImageRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostImageService {
  private final PostImageRepository postImageRepository;

  @Value("${app.upload.dir}")
  private String uploadDir;

  @Transactional
  public List<PostImageResponseDto> uploadImages(List<MultipartFile> files) {
    if (files.isEmpty()) {
      throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
    }

    Map<String, String> imageTypeMap = Map.of(
    "image/jpeg", ".jpg", "image/png", ".png", "image/gif", ".gif", "image/webp", ".webp");
    for (MultipartFile file : files) {
      if (file.isEmpty()) {
        throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
      }

      String contentType = file.getContentType();
      if (contentType == null || !imageTypeMap.containsKey(contentType)) {
        throw new BusinessException(ErrorCode.INVALID_IMAGE_TYPE);
      }

      // yml 상한(5MB)이 먼저 차단하지만, 설정 변경 시 무방비가 되지 않도록 방어층으로 유지.
      if (file.getSize() > (5 * 1024 * 1024)) {
        throw new BusinessException(ErrorCode.INVALID_IMAGE_SIZE);
      }
    }

    List<PostImageResponseDto> result = new ArrayList<>();
    Path dir = Paths.get(uploadDir);
    try {
      Files.createDirectories(dir);
    } catch (IOException e) {
      throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    for (MultipartFile file : files) {
      // 1) 확장자 발급: 검증된 MIME에서 (원본 이름은 기록용으로만)
      String originalName = file.getOriginalFilename();
      String ext = imageTypeMap.get(file.getContentType());

      // 2) 이름 발급
      String imageKey = UUID.randomUUID().toString() + ext;

      // 3) 디스크 저장
      try {
        file.transferTo(dir.resolve(imageKey).toAbsolutePath());
      } catch (IOException e) {
        throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
      }

      // 4) DB 기록 + 수집
      String imageUrl = "/images/" + imageKey;
      PostImage postImage = PostImage.builder().imageUrl(imageUrl)
      .imageKey(imageKey)
      .originalFileName(originalName)
      .contentType(file.getContentType())
      .fileSize(file.getSize())
      .build();

      postImageRepository.save(postImage);
      
      result.add(new PostImageResponseDto(imageKey, imageUrl));
    }

    return result;
  }
}
