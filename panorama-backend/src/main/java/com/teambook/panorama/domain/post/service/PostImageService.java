package com.teambook.panorama.domain.post.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.teambook.panorama.domain.post.dto.PostImageResponseDto;

public interface PostImageService {

  List<PostImageResponseDto> uploadImages(List<MultipartFile> files);
}
