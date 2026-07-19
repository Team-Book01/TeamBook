package com.teambook.panorama.domain.book.service;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.teambook.panorama.domain.book.client.LibraryClient;
import com.teambook.panorama.domain.book.dto.library.LibBookAvailability;
import com.teambook.panorama.domain.book.dto.library.LibSrchResponse;
import com.teambook.panorama.domain.book.dto.library.LibWrapper;
import com.teambook.panorama.domain.book.dto.library.LibraryListResponse;
import com.teambook.panorama.domain.book.dto.library.LibraryResponseItem;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LibraryService {

  private final LibraryClient libraryClient;

  public LibraryListResponse findLibAndBook(String isbn, String regionCode){

    //소장 도서관 목록
    LibSrchResponse libSrchResponse = libraryClient.searchLib(isbn, regionCode);
    if (libSrchResponse == null || libSrchResponse.resultNum() == 0) {
      return new LibraryListResponse(0, List.of());
    }
    //도서관 수
    int total = libSrchResponse.resultNum();
    
    //도서관 코드 목록
    List<String> libCodes = libSrchResponse.libs().stream().map(wrapper -> wrapper.lib().libCode()).toList();

    //대출 가능 여부 조회 -> 도서관 코드와 맵으로 만들기
    Map<String, LibBookAvailability> bookAvMap = new HashMap<>();
    for (String libCode : libCodes) {
      var libBookAvailability = libraryClient.checkBookAvailability(libCode, isbn);
      bookAvMap.put(libCode, libBookAvailability);
    }

    //도서관 리스트
    var list = libSrchResponse.libs().stream().map(LibWrapper::lib).map(lib -> {
      return
      LibraryResponseItem.builder()
      .address(lib.address())
      .homepage(lib.homepage())
      .libCode(lib.libCode())
      .libName(lib.libName())
      .operatingTime(lib.operatingTime())
      .tel(lib.tel())
      .hasBook(toBoolean(bookAvMap.get(lib.libCode()).hasBook()))
      .loanAvailable(toBoolean(bookAvMap.get(lib.libCode()).loanAvailable()))
      .build();
    }).toList();
    return
    new LibraryListResponse(total, list);
  }
  //api오류로 null값 올 때 대응 -> 확인불가&대출불가로 나누기.
  private Boolean toBoolean(String value){
    if (value == null) return null;
    return value.equals("Y");

  }
}
