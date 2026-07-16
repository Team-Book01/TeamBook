package com.teambook.panorama.domain.book.dto.review;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ReviewRequest(
  @NotBlank
  @DecimalMin(value = "0.5")
  @DecimalMax(value = "5.0")
  BigDecimal rating,
  @Size(min = 0, max = 500)
  String content){

}
