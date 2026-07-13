package com.teambook.panorama.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teambook.panorama.domain.user.entity.SocialAccount;
import com.teambook.panorama.domain.user.enums.Provider;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long>{
  Optional<SocialAccount> findByProviderAndProviderUserId(Provider provider, String providerUserId);

}
