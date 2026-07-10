package com.teambook.panorama.domain.book.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.teambook.panorama.domain.book.dto.internal.BookStatsDto;

@Mapper
public interface BookStatsMapper {
  List<BookStatsDto> selectBookStatsByIsbns(@Param("isbns") List<String> isbns);

  List<String> selectBookmarkedIsbns(@Param("userId") Long userId, @Param("isbns") List<String> isbn);
}
