package com.teambook.panorama.domain.book.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.teambook.panorama.domain.book.entity.PopularBook;

public interface PopularBookRepository extends JpaRepository<PopularBook, Long>{

 @Query("select p from PopularBook p join fetch p.book order by p.ranking asc")
List<PopularBook> findAllWithBook();

}
