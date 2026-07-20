package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.admin.dto.notice.NoticeImageResponse;

public interface NoticeImageService {

  List<NoticeImageResponse> uploadImages(List<MultipartFile> files);
}
