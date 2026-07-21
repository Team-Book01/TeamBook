package com.teambook.panorama.domain.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teambook.panorama.domain.book.dto.library.LibraryListResponse;
import com.teambook.panorama.domain.book.service.LibraryService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/library")
@RequiredArgsConstructor
public class LibrarySrchController {
  private final LibraryService libraryService;

  @GetMapping("/{isbn}")
  public ResponseEntity<LibraryListResponse> getLibraryList(@PathVariable("isbn") String isbn,
  @RequestParam("regionCode") String regionCode,
  @RequestParam(value = "dtlRegion", required = false) String dtlRegion,
  @RequestParam(value = "pageNo", defaultValue = "1") @Min(0) Integer pageNo,
  @RequestParam(value = "pageSize", defaultValue = "10") @Min(1) @Max(10) Integer pageSize
) {
    return ResponseEntity.ok(libraryService.findLibAndBook(isbn, regionCode, dtlRegion, pageNo, pageSize));
  }
}
