package com.teambook.panorama.domain.library.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.library.dto.LibraryResponse;
import com.teambook.panorama.domain.library.repository.LibraryQueryMapper;

import lombok.RequiredArgsConstructor;

/**
 * 도서관 공개 조회 서비스. 지도 화면(/library-map)에 뿌릴 목록을 제공한다.
 * (읽기라 MyBatis 매퍼 사용 — 쓰기 동기화는 {@link LibrarySyncService})
 */
@Service
@RequiredArgsConstructor
public class LibraryQueryService {

  private final LibraryQueryMapper libraryQueryMapper;

  @Transactional(readOnly = true)
  public List<LibraryResponse> getLibraries() {
    return libraryQueryMapper.selectAll();
  }
}
