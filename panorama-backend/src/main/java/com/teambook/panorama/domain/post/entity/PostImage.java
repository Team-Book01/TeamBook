package com.teambook.panorama.domain.post.entity;

import com.teambook.panorama.global.entity.BaseTimeEntity;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "post_images")
@Getter
public class PostImage extends BaseTimeEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "post_image_id")
  private Long postImageId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id")
  private Post post;

  @Column(name = "image_url", length = 1000, nullable = false)
  private String imageUrl;

  @Column(name = "image_key", length = 500, nullable = false)
  private String imageKey;

  @Column(name = "original_file_name", length = 255)
  private String originalFileName;

  @Column(name = "content_type", length = 100, nullable = false)
  private String contentType;

  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  @Builder
  public PostImage(String imageUrl, String imageKey, String originalFileName, String contentType, Long fileSize) {
    this.imageUrl = imageUrl;
    this.imageKey = imageKey;
    this.originalFileName = originalFileName;
    this.contentType = contentType;
    this.fileSize = fileSize;
  }

  public void attachTo(Post post) {
    if (this.post != null) {
      throw new BusinessException(ErrorCode.ALREADY_ATTACHED_IMAGE);
    }

    this.post = post;
  }
}
