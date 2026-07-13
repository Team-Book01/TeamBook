package com.teambook.panorama.global.security.userdetails;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  @Transactional(readOnly = true)
  public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
    // TODO: userRepository.findByLoginId(loginId)
    //       존재하면 CustomUserDetails.from(user) 반환
    User user = userRepository.findByLoginId(loginId)
          .orElseThrow(
            () -> new UsernameNotFoundException("존재하지 않는 로그인 아이디" + loginId)
          );
        
    return CustomUserDetails.from(user);
  }

}
