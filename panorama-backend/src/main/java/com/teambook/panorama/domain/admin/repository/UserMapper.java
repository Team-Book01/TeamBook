package com.teambook.panorama.domain.admin.repository;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.teambook.panorama.domain.admin.dto.user.UserDetailResponse;
import com.teambook.panorama.domain.admin.dto.user.UserResponse;
import com.teambook.panorama.domain.admin.dto.user.UserSearchRequest;

/**
 * 사용자 관리 전용 MyBatis 매퍼. (User 엔티티가 없어 조회·제재 모두 MyBatis)
 */
@Mapper
public interface UserMapper {

  // 목록
  List<UserResponse> selectUsers(UserSearchRequest request);

  long countUsers(UserSearchRequest request);

  // 상세
  Optional<UserDetailResponse> selectUserDetail(@Param("userId") Long userId);

  // 처리
  /** 존재 확인 + 현재 상태 (없으면 empty) */
  Optional<String> selectUserStatus(@Param("userId") Long userId);

  /** 상태 변경 (ACTIVE/SUSPENDED/DELETED). 변경 행 수 반환 */
  int updateUserStatus(@Param("userId") Long userId, @Param("status") String status);

  /** 관리자 조치 로그 1건 */
  int insertAdminActionLog(
      @Param("userId") Long userId,
      @Param("targetType") String targetType,
      @Param("targetId") Long targetId,
      @Param("actionType") String actionType,
      @Param("reason") String reason);
}
