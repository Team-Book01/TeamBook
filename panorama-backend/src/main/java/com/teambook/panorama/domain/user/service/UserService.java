package com.teambook.panorama.domain.user.service;

import com.teambook.panorama.domain.user.dto.SignUpDto;
import com.teambook.panorama.domain.user.dto.UserDto;
import com.teambook.panorama.domain.user.dto.WithdrawDTO;

/**
 * 유저(user) 도메인 서비스. 구현체는 {@link UserServiceImpl}.
 */
public interface UserService {

    /** 로컬 회원가입. 생성된 회원 ID 반환. */
    Long signupLocal(SignUpDto.Request request);

    /** 내 정보 조회. */
    UserDto.Response getMyInfo(Long userId);

    /** 닉네임 변경 후 변경된 내 정보 반환. */
    UserDto.Response updateNickname(Long userId, String nickname);

    /** 아이디 사용 중 여부 (true=이미 사용 중). */
    boolean isLoginIdTaken(String loginId);

    /** 닉네임 사용 중 여부 (true=이미 사용 중). */
    boolean isNicknameTaken(String nickname);

    /** 회원 탈퇴 (status=DELETED 처리). */
    void withdraw(Long userId, WithdrawDTO.WithdrawRequest request);
}
