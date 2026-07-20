package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.admin.dto.notice.NoticeImageResponse;
import com.teambook.panorama.domain.admin.entity.NoticeImage;
import com.teambook.panorama.domain.admin.repository.NoticeImageRepository;
import com.teambook.panorama.global.storage.ImageStorageService;
import com.teambook.panorama.global.storage.StoredImage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeImageServiceImpl implements NoticeImageService {

  private final NoticeImageRepository noticeImageRepository;
  // 검증·디스크 저장은 공통 처리. 여기는 notice_images 행을 남기는 일만 한다.
  private final ImageStorageService imageStorageService;

  @Override
  @Transactional
  public List<NoticeImageResponse> uploadImages(List<MultipartFile> files) {
    return imageStorageService.store(files).stream()
        .map(this::save)
        .toList();
  }

  /** notice_id 는 아직 null — 에디터가 공지 저장 전에 올리므로 소유자가 없다. 저장 시 연결된다. */
  private NoticeImageResponse save(StoredImage image) {
    noticeImageRepository.save(NoticeImage.builder()
        .imageUrl(image.imageUrl())
        .imageKey(image.imageKey())
        .originalFileName(image.originalFileName())
        .contentType(image.contentType())
        .fileSize(image.fileSize())
        .build());
    return new NoticeImageResponse(image.imageKey(), image.imageUrl());
  }
}
