package com.teambook.panorama.domain.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long>{
  Optional<RefreshToken> findByTokenHash(String tokenHash);
  Optional<RefreshToken> findByUserId(Long userId);
  void deleteByUserId(Long userId);

}
