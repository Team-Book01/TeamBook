package com.teambook.panorama.domain.library.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.teambook.panorama.domain.library.dto.LibraryResponse;

/**
 * 도서관 조회 전용 MyBatis 매퍼. (읽기 MyBatis · 쓰기 JPA 규약)
 * 쓰기(동기화 upsert)는 {@link LibraryRepository}(JPA) 가 담당한다.
 */
@Mapper
public interface LibraryQueryMapper {

  /** 좌표가 있는 전체 도서관 목록. 지도 마커용. */
  List<LibraryResponse> selectAll();
}
