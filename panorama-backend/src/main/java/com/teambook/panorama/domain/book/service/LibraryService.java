package com.teambook.panorama.domain.book.service;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.teambook.panorama.domain.book.client.LibraryClient;
import com.teambook.panorama.domain.book.dto.library.BookAvResponseWrapper;
import com.teambook.panorama.domain.book.dto.library.BookAvailabilityResult;
import com.teambook.panorama.domain.book.dto.library.LibSrchResponse;
import com.teambook.panorama.domain.book.dto.library.LibSrchResponseWrapper;
import com.teambook.panorama.domain.book.dto.library.LibSrchItemWrapper;
import com.teambook.panorama.domain.book.dto.library.LibraryListResponse;
import com.teambook.panorama.domain.book.dto.library.LibraryResponseItem;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LibraryService {

  private final LibraryClient libraryClient;

  public LibraryListResponse findLibAndBook(String isbn, String regionCode, String dtlRegion, Integer pageNo, Integer pageSize){

    //첫번째 겹 호출
    LibSrchResponseWrapper apiResponse = libraryClient.searchLib(isbn, regionCode, dtlRegion, pageNo, pageSize);
    if (apiResponse == null || apiResponse.response() == null) {
    throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
}
    LibSrchResponse libSrchResponse = apiResponse.response();
    //null 방어
    if (libSrchResponse.numFound() == null || libSrchResponse.resultNum() == null) {
      throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    }
    if (libSrchResponse.numFound() == 0 || libSrchResponse.libs() == null) {
      return new LibraryListResponse(0, List.of());
    }
    //도서관 수
    int total = libSrchResponse.numFound();
    
    //도서관 코드 목록
    List<String> libCodes = libSrchResponse.libs().stream().map(wrapper -> wrapper.lib().libCode()).toList();

    //대출 가능 여부 조회 -> 도서관 코드와 맵으로 만들기
    Map<String, BookAvailabilityResult> bookAvMap = new HashMap<>();
    for (String libCode : libCodes) {
      BookAvResponseWrapper bookAvResponseWrapper =  libraryClient.checkBookAvailability(libCode, isbn);
      BookAvailabilityResult result = extraResult(bookAvResponseWrapper);
      //result 값도 null일 수 있음.
      bookAvMap.put(libCode, result);
    }

    //도서관 리스트
    var list = libSrchResponse.libs().stream().map(LibSrchItemWrapper::lib).map(lib -> {
      BookAvailabilityResult result = bookAvMap.get(lib.libCode());
      return
      LibraryResponseItem.builder()
      .address(lib.address())
      .homepage(lib.homepage())
      .libCode(lib.libCode())
      .libName(lib.libName())
      .operatingTime(lib.operatingTime())
      .tel(lib.tel())
      .hasBook(result != null ? toBoolean(result.hasBook()) : null)
      .loanAvailable(result != null ? toBoolean(result.loanAvailable()) : null)
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
  //null 방어 / 에러 처리
  private BookAvailabilityResult extraResult(BookAvResponseWrapper responseWrapper) {
    if(responseWrapper == null || responseWrapper.response() == null) return null;
    if ("authErr".equals(responseWrapper.response().errCode())) throw new BusinessException(ErrorCode.LIBRARY_API_ERROR);
    if (responseWrapper.response().result() == null) 
      return null;
    return responseWrapper.response().result();
  }
  
}
