package com.teambook.panorama.domain.user.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.auth.service.AuthService;
import com.teambook.panorama.domain.user.dto.SignUpDto;
import com.teambook.panorama.domain.user.dto.UserDto;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Long signupLocal(SignUpDto.Request request) {
        // 1. 중복 검증
        if (userRepository.existsByLoginId(request.loginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_LOGIN_ID);
        }
        if (userRepository.existsByNickname(request.nickname())) {
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
        }

        // 2. 비밀번호 인코딩
        String encodedPassword = passwordEncoder.encode(request.password());

        // 3. User 생성 및 저장
        User user = User.createLocalUser(
                request.loginId(),
                encodedPassword,
                request.email(),
                request.nickname()
        );
        return userRepository.save(user).getId();
    }

    @Transactional(readOnly = true)
    public UserDto.Response getMyInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));   // U001
        return UserDto.Response.from(user);
    }

    // UserService
    @Transactional
    public UserDto.Response updateNickname(Long userId, String nickname) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));   // U001
        if (userRepository.existsByNickname(nickname))
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);                 // U003
        user.updateNickname(nickname);   // 변경 감지(dirty checking)
        return UserDto.Response.from(user);
    }

    @Transactional(readOnly = true)
    public boolean isLoginIdTaken(String loginId) {
        return userRepository.existsByLoginId(loginId);
    }

    @Transactional(readOnly = true)
    public boolean isNicknameTaken(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    @Transactional
    public void withdraw(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.delete();   // status = DELETED (updated_at이 탈퇴시각)
        authService.logout(userId);
    }
}