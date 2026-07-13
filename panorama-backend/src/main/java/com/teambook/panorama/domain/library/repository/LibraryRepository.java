package com.teambook.panorama.domain.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.library.entity.Library;

/**
 * 도서관 쓰기 전용 JPA 리포지토리.
 * 동기화 upsert 는 findAll() 로 기존 목록을 lib_code 기준 맵으로 만든 뒤 saveAll() 로 반영한다.
 */
public interface LibraryRepository extends JpaRepository<Library, Long> {
}
