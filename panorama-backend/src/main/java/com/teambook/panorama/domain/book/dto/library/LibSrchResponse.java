package com.teambook.panorama.domain.book.dto.library;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public record LibSrchResponse(
  Integer pageNo,
  Integer pageSize,
  Integer resultNum,
  Integer numFound,
  List<LibSrchItemWrapper> libs
) {}