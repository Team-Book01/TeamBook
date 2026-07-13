package com.teambook.panorama.global.security.userdetails;

import com.teambook.panorama.domain.user.entity.User;
import com.teambook.panorama.domain.user.enums.Role;
import com.teambook.panorama.domain.user.enums.Status;
import java.util.Collection;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class CustomUserDetails implements UserDetails {

    private final Long userId;
    private final String loginId;
    private final String password;                 // getPassword() 자동 생성 → 인터페이스 충족
    private final Role role;
    private final Status status;
    private final Collection<? extends GrantedAuthority> authorities;  // getAuthorities() 자동

    public static CustomUserDetails from(User user) {
        List<GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new CustomUserDetails(
                user.getId(),
                user.getLoginId(),
                user.getPassword(),
                user.getRole(),
                user.getStatus(),
                authorities
        );
    }

    // 아래는 Lombok이 못 만드는 UserDetails 계약 메소드 → 직접 구현
    @Override
    public String getUsername() {
        return loginId;                            // 필드명과 다르므로 직접
    }

    @Override
    public boolean isEnabled() {
        return status == Status.ACTIVE;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != Status.SUSPENDED;
    }

    @Override
    public boolean isAccountNonExpired() {
        return status != Status.DELETED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}