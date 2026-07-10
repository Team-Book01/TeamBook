package com.teambook.panorama.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{
  Optional<User> findById(Long id);
  Optional<User> findByLoginId(String loginId);
  boolean existsByLoginId(String loginId);
  boolean existsByNickname(String nickname);
}
