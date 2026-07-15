package com.teambook.panorama.domain.post.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
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

    List<String> imageTypeList = List.of("image/jpeg", "image/png", "image/gif", "image/webp");
    for (MultipartFile file : files) {
      if (file.isEmpty()) {
        throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
      }

      if (!imageTypeList.contains(file.getContentType())) {
        throw new BusinessException(ErrorCode.INVALID_IMAGE_TYPE);
      }

      if (file.getSize() > (5 * 1024 * 1024)) {
        throw new BusinessException(ErrorCode.INVALID_IMAGE_SIZE);
      }
    }

    List<PostImageResponseDto> result = new ArrayList<>();

    for (MultipartFile file : files) {
      // 1) 확장자 추출: 원본 이름에서
      String originalName = file.getOriginalFilename();
      String ext = "";
      if (originalName != null) {
        int typeIndex = originalName.lastIndexOf(".");
        if (typeIndex != -1) {
          ext = originalName.substring(typeIndex);
        }
      }

      // 2) 이름 발급
      String imageKey = UUID.randomUUID().toString() + ext;

      // 3) 디스크 저장
      try {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
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
