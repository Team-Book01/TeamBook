package com.teambook.panorama.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.admin.dto.user.UserDetailResponse;
import com.teambook.panorama.domain.admin.dto.user.UserProcessRequest;
import com.teambook.panorama.domain.admin.dto.user.UserResponse;
import com.teambook.panorama.domain.admin.dto.user.UserSearchRequest;
import com.teambook.panorama.domain.admin.entity.type.UserAction;
import com.teambook.panorama.domain.admin.repository.UserMapper;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;
import com.teambook.panorama.global.response.PageResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

  private final UserMapper userMapper;   // User 엔티티가 없어 조회·제재 모두 MyBatis

  @Override
  public PageResponse<UserResponse> getUsers(UserSearchRequest request) {
    List<UserResponse> content = userMapper.selectUsers(request);
    long total = userMapper.countUsers(request);
    return PageResponse.of(content, request.page(), request.size(), total);
  }

  @Override
  public UserDetailResponse getUserDetail(Long userId) {
    return userMapper.selectUserDetail(userId)
        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
  }

  @Override
  @Transactional
  public void processUser(Long userId, UserProcessRequest request) {
    // 존재 확인 (현재 상태는 필요 시 재처리 가드에 활용 가능)
    userMapper.selectUserStatus(userId)
        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    String newStatus = toStatus(request.action());
    userMapper.updateUserStatus(userId, newStatus);
    userMapper.insertAdminActionLog(request.handlerUserId(), "USER", userId,
        request.action().name(), request.reason());
  }

  private String toStatus(UserAction action) {
    return switch (action) {
      case SUSPEND -> "SUSPENDED";
      case ACTIVATE -> "ACTIVE";
      case DELETE -> "DELETED";
    };
  }
}
