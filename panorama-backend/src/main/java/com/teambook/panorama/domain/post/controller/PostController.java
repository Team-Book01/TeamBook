package com.teambook.panorama.domain.post.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.teambook.panorama.domain.post.dto.PostDetailResponseDto;
import com.teambook.panorama.domain.post.dto.PostRequestDto;
import com.teambook.panorama.domain.post.dto.PostResponseDto;
import com.teambook.panorama.domain.post.dto.PostSummaryResponseDto;
import com.teambook.panorama.domain.post.service.PostService;
import com.teambook.panorama.global.response.SliceResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.net.URI;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController    // @Controller + @ResponseBody, 컨트롤러에 붙여야 하는 어노테이션인 @Controller과 데이터를 반환하기 위한 @ResponseBody의 기능을 합침
@RequestMapping("/api/posts")    // 이 클래스가 담당하는 기본 주소(/api/posts)에 매핑함
@RequiredArgsConstructor    // final이나 @NonNull이 붙은 필드를 파라미터로 받는 생성자를 자동 생성
public class PostController {
  private final PostService postService;    // 재할당을 막아 불변성을 보장하고, @RequiredArgsConstructor가 생성자 주입 대상으로 삼도록 final 사용

  @PostMapping    // Post 요청과 매핑함
  public ResponseEntity<PostResponseDto> create(@RequestHeader("X-USER-ID") Long userId,    // HTTP 요청(Request)의 헤더(Header)에서 값을 꺼내오는데(@RequestHeader) X-USER-ID(임의로 지은 이름, X- 접두어는 비표준 커스텀 헤더임을 명시하는 관례. 이름은 중요하지 않음)라는 헤더값을 userId 변수로  // TODO: JWT 연동 후 @AuthenticationPrincipal로 교체
  @Valid @RequestBody PostRequestDto request) {    // @RequestBody로 JSON 요청 본문을 자바 객체(PostRequestDto)로 변환한 뒤, @Valid로 DTO에 정의된 제약조건을 만족하는지 검증(@RequestBody)
    Long postId = postService.createPost(userId, request);    // PostService에 매개변수 userId와 request를 넘겨줘서 createPost를 실행하고 postId를 반환받는다
    /**
     * ServletUriComponentsBuilder: 현재 요청의 URL(/api/posts)을 출발점으로 새 주소를 조립하는 빌더.
     * path로 /{id}를 덧붙이고 buildAndExpand로 구멍을 채운 뒤 toUri()로 URI 객체 완성.
     * 용도: 201 Created의 Location 헤더에 "새로 태어난 자원의 주소"를 실어 보내기 위함.
     * fromCurrentRequest(): 지금 처리중인 요청의 주소를 출발점으로
     * .path("/id"): 그 뒤에 /{id} 템플릿을 붙이고
     * .buildAndExpand(postId): {id}에 받아온 postId를 넣는다
     * .toUri(): 완성된 주소를 URI 타입 객체로 포장
     */
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
      .path("/{id}").buildAndExpand(postId).toUri();
    return ResponseEntity.created(location).body(new PostResponseDto(postId));
  }

  @GetMapping("/{id}")    // Get 요청과 매핑함
  // @PathVariable = 경로(path)의 변수(variable). @PathVariable("id")는 @GetMapping("/{id}")의 {id}에 @PathVariable이 붙은 Long id를 집어넣겠다는 의미.
  public ResponseEntity<PostDetailResponseDto> findById(@PathVariable("id") Long id) {
    PostDetailResponseDto response = postService.getDetailAndIncreaseView(id);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  public ResponseEntity<SliceResponse<PostSummaryResponseDto>> findActivePosts(@PageableDefault(size = 10) Pageable pageable) {
    Slice<PostSummaryResponseDto> postlists = postService.findActivePosts(pageable);
      return ResponseEntity.ok(SliceResponse.of(postlists));
  }

  @PutMapping("/{id}")    // Put 요청과 매핑함, 수정하려면 id값이 필요함
  public ResponseEntity<PostResponseDto> update(@PathVariable("id") Long postId, @RequestHeader("X-USER-ID") Long userId, @Valid @RequestBody PostRequestDto request) {
    PostResponseDto response = postService.updatePost(postId, userId, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable("id") Long postId, @RequestHeader("X-USER-ID") Long userId) {
    postService.deletePost(postId, userId);
    return ResponseEntity.noContent().build();    // 204
  }
}
