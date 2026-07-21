package com.teambook.panorama.domain.auth.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.auth.dto.LoginDto;
import com.teambook.panorama.domain.auth.entity.RefreshToken;
import com.teambook.panorama.domain.auth.repository.RefreshTokenRepository;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.enums.Provider;
import com.teambook.panorama.domain.user.enums.Role;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.security.jwt.JwtProperties;
import com.teambook.panorama.global.security.jwt.JwtProvider;
import com.teambook.panorama.global.security.jwt.TokenHashUtil;
import com.teambook.panorama.global.security.userdetails.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final TokenHashUtil tokenHashUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final LoginHistoryService loginHistoryService;
    private final JwtProperties jwtProperties;

    @Transactional
    public LoginDto.IssueResult login(LoginDto.Request request) {
        try {
            // 1. 인증 (내부에서 UserDetailsService + PasswordEncoder 호출)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.loginId(), request.password()));

            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
            Long userId = principal.getUserId();
            Role role = principal.getRole();

            // 2. 토큰 발급
            String accessToken = jwtProvider.createAccessToken(userId, role);
            String rawRefresh = jwtProvider.createRefreshToken(userId);

            // 3. refresh 해시 저장 (원문 아님)
            saveRefreshToken(userId, rawRefresh);

            // 4. 로그인 성공 이력
            loginHistoryService.recordSuccess(userId, Provider.LOCAL);

            // 5. access는 바디, rawRefresh는 쿠키로 → 둘 다 반환
            return new LoginDto.IssueResult(accessToken, rawRefresh, Provider.LOCAL);

        } catch (AuthenticationException e) {
            // 실패 이력: loginId로 조회해 있으면 userId 채우고 없으면 null
            Long userId = userRepository.findByLoginId(request.loginId())
                    .map(User::getId)
                    .orElse(null);
            loginHistoryService.recordFailLocal(userId, request.loginId(), Provider.LOCAL);

            // 계정 상태별 사유 분리 (SUSPENDED→LockedException, DELETED→isEnabled에서 DisabledException)
            if (e instanceof LockedException) {
                throw new BusinessException(ErrorCode.ACCOUNT_SUSPENDED);
            }
            if (e instanceof DisabledException) {
                throw new BusinessException(ErrorCode.ACCOUNT_DELETED);
            }
            throw new BusinessException(ErrorCode.LOGIN_FAILED); // 그 외(비번 불일치 등)는 기존 A004
        }
    }

    @Transactional
    public String reissue(String rawRefresh) {
        // 1. 토큰 유효성 검증
        if (!jwtProvider.validateToken(rawRefresh)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
        Long userId = jwtProvider.getUserId(rawRefresh);

        // 2. 저장된 해시와 대조
        String hash = tokenHashUtil.sha256Hex(rawRefresh);
        RefreshToken saved = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> 
                    new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
        // saved.getExpiresAt() 만료 확인 등
        if (saved.isExpired()){
            throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
        }

        // 3. 새 access 발급 (Rotation이면 새 refresh도)
        User user = userRepository.findById(userId)
        .orElseThrow(() -> 
            new BusinessException(ErrorCode.USER_NOT_FOUND));

        return jwtProvider.createAccessToken(userId, user.getRole());
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
        // refresh 쿠키 만료는 컨트롤러에서 처리
    }

    // 항상 @Transactional 메서드(login·recordSocialLogin) 내부에서만 호출된다.
    private void saveRefreshToken(Long userId, String rawRefresh) {
        String hash = tokenHashUtil.sha256Hex(rawRefresh);
        LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(jwtProperties.refreshTokenExpiration()));
        refreshTokenRepository.findByUserId(userId)
                .ifPresentOrElse(
                        token -> token.updateTokenHash(hash, expiresAt), // 이미 있으면 교체(1인 1토큰 정책)
                        () -> refreshTokenRepository.save(RefreshToken.of(userId, hash, expiresAt)));
    }

    @Transactional
    public void recordSocialLogin(Long userId, String rawRefresh, Provider provider) {
        saveRefreshToken(userId, rawRefresh);
        loginHistoryService.recordSuccess(userId, provider);
    }

}