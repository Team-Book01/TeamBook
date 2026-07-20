package com.teambook.panorama.domain.admin.service;

import com.teambook.panorama.domain.admin.dto.user.UserDetailView;
import com.teambook.panorama.domain.admin.dto.user.UserProcessRequest;
import com.teambook.panorama.domain.admin.dto.user.UserResponse;
import com.teambook.panorama.domain.admin.dto.user.UserSearchRequest;
import com.teambook.panorama.global.response.PageResponse;

/**
 * 관리자 사용자 관리 서비스. (조회·제재 모두 MyBatis)
 */
public interface UserManagerService {

  PageResponse<UserResponse> getUsers(UserSearchRequest request);

  UserDetailView getUserDetail(Long userId);

  void processUser(Long userId, UserProcessRequest request);
}
