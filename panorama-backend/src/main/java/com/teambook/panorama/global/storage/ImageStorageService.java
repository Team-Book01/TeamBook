package com.teambook.panorama.global.storage;

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
import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 이미지 업로드의 공통 처리 — 검증(MIME·용량) + 파일명 발급 + 디스크 저장.
 *
 * <p>도메인별 이미지 테이블에 행을 넣는 일은 각 도메인 서비스가 한다. 여기는 "어디에 쓰이든
 * 똑같은 부분"만 갖는다. 허용 MIME, 용량 상한, 저장 위치처럼 바뀌기 쉬운 규칙이 도메인마다
 * 복사돼 있으면 한쪽만 고쳐져 조용히 갈라진다.</p>
 *
 * <p>DB 를 건드리지 않으므로 트랜잭션 경계를 갖지 않는다. 호출하는 도메인 서비스의 트랜잭션
 * 안에서 실행되며, 그 트랜잭션이 롤백되어도 디스크 파일은 남는다 — 소유자가 없는 이미지는
 * 고아로 남았다가 배치로 정리되는 기존 설계와 같은 취급이다.</p>
 */
@Service
@RequiredArgsConstructor
public class ImageStorageService {

  /** 허용 MIME → 확장자. 원본 파일명의 확장자는 믿지 않고 이 표에서 발급한다. */
  private static final Map<String, String> IMAGE_TYPES = Map.of(
      "image/jpeg", ".jpg",
      "image/png", ".png",
      "image/gif", ".gif",
      "image/webp", ".webp");

  private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

  @Value("${app.upload.dir}")
  private String uploadDir;

  /**
   * 여러 이미지를 검증하고 디스크에 저장한다.
   *
   * <p>검증을 전부 끝낸 뒤에 저장을 시작한다. 섞어서 처리하면 뒤쪽 파일이 반려될 때
   * 앞쪽 파일만 디스크에 남는다.</p>
   */
  public List<StoredImage> store(List<MultipartFile> files) {
    if (files == null || files.isEmpty()) {
      throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
    }

    for (MultipartFile file : files) {
      if (file.isEmpty()) {
        throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
      }
      String contentType = file.getContentType();
      if (contentType == null || !IMAGE_TYPES.containsKey(contentType)) {
        throw new BusinessException(ErrorCode.INVALID_IMAGE_TYPE);
      }
      // yml 상한(5MB)이 먼저 차단하지만, 설정 변경 시 무방비가 되지 않도록 방어층으로 유지.
      if (file.getSize() > MAX_FILE_SIZE) {
        throw new BusinessException(ErrorCode.INVALID_IMAGE_SIZE);
      }
    }

    Path dir = Paths.get(uploadDir);
    try {
      Files.createDirectories(dir);
    } catch (IOException e) {
      throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    List<StoredImage> stored = new ArrayList<>();
    for (MultipartFile file : files) {
      String imageKey = UUID.randomUUID() + IMAGE_TYPES.get(file.getContentType());
      try {
        file.transferTo(dir.resolve(imageKey).toAbsolutePath());
      } catch (IOException e) {
        throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
      }
      stored.add(new StoredImage(
          imageKey,
          "/images/" + imageKey,
          file.getOriginalFilename(),
          file.getContentType(),
          file.getSize()));
    }
    return stored;
  }
}
