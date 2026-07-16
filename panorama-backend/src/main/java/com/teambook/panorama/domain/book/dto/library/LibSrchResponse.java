package com.teambook.panorama.domain.book.dto.library;

import java.util.List;

public record LibSrchResponse(
  Integer resultNum,
  List<LibWrapper> libs
) {}