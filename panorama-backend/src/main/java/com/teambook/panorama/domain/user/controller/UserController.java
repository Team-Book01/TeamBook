package com.teambook.panorama.domain.user.controller;

import com.teambook.panorama.domain.user.dto.SignUpDto;
import com.teambook.panorama.domain.user.dto.UserDto;
import com.teambook.panorama.domain.user.service.UserService;
import com.teambook.panorama.global.security.userdetails.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 로컬 회원가입.
     * 성공 시 201 Created + 생성된 리소스 위치(/api/users/{id})를 Location 헤더로.
     */
    @PostMapping
    public ResponseEntity<Void> signup(@RequestBody @Valid SignUpDto.Request request) {
        Long userId = userService.signupLocal(request);
        return ResponseEntity
                .created(java.net.URI.create("/api/users/" + userId))
                .build();
    }

    /**
     * 내 정보 조회. JWT 인증을 통과한 사용자의 principal에서 userId를 꺼내 조회.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto.Response> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails principal) {
        UserDto.Response response = userService.getMyInfo(principal.getUserId());
        return ResponseEntity.ok(response);
    }
}