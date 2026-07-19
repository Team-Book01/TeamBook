package com.teambook.panorama.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.enums.Provider;

public interface UserRepository extends JpaRepository<User, Long>{
  Optional<User> findById(Long id);
  Optional<User> findByLoginId(String loginId);
  boolean existsByLoginId(String loginId);
  boolean existsByNickname(String nickname);
  // email 전역 유일성 검사(provider 로 좁히지 않음). 소셜은 email=null 이라 자연히 안 걸린다.
  boolean existsByEmail(String email);
  // 비밀번호 재설정(B) 대상 조회 — LOCAL 계정만(의도 명시·미래 방어). 소셜은 비번이 없어 제외.
  Optional<User> findByEmailAndProvider(String email, Provider provider);
}
