package com.teambook.panorama.global.security.oauth;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.user.entity.SocialAccount;
import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.SocialAccountRepository;
import com.teambook.panorama.domain.user.repository.UserRepository;
import com.teambook.panorama.global.util.NicknameGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final NicknameGenerator nicknameGenerator;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1) 부모가 구글 userinfo 호출 → 속성 맵 획득, userRequest에는 구글 설정, 엑세스 토큰 등 이 담겨있음
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2) provider별 파싱 (google , sub/email)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuthAttributes attributes = OAuthAttributes.of(registrationId, oAuth2User.getAttributes());

        // 3) (provider, providerUserId)로 조회 → 있으면 그 User, 없으면 새로 생성
        User user = socialAccountRepository
                .findByProviderAndProviderUserId(attributes.getProvider(), attributes.getProviderUserId())
                .map(SocialAccount::getUser)
                .orElseGet(() -> createSocialUser(attributes));

        // 4) 우리 userId를 담은 principal 반환
        return CustomOAuth2User.of(
                user.getId(), attributes.getProvider(), user.getRole(), oAuth2User.getAttributes());
    }

    private User createSocialUser(OAuthAttributes attributes) {
        String nickname;
        do { nickname = nicknameGenerator.generate(); }        // 닉네임 중복 회피 루프
        while (userRepository.existsByNickname(nickname));

        User user = userRepository.save(
                User.createSocialUser(attributes.getProvider(), nickname));   // loginId/pw/email=null
        socialAccountRepository.save(
                SocialAccount.of(user, attributes.getProvider(),
                        attributes.getProviderUserId(), attributes.getProviderEmail()));
        return user;
    }
}
