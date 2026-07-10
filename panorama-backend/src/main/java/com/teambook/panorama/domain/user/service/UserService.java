package com.teambook.panorama.domain.user.service;

import com.teambook.panorama.domain.user.dto.SignUpDto;
import com.teambook.panorama.domain.user.dto.UserDto;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Long signupLocal(SignUpDto.Request request) {
        // 1. 중복 검증
        if (userRepository.existsByLoginId(request.loginId())) {
            // throw new CustomException(ErrorCode.DUPLICATE_LOGIN_ID);
        }
        if (userRepository.existsByNickname(request.nickname())) {
            // throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
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
                .orElseThrow(() -> null /* new CustomException(ErrorCode.USER_NOT_FOUND) */);
        return UserDto.Response.from(user);
    }
}