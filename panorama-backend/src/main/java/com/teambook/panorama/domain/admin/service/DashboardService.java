package com.teambook.panorama.domain.admin.service;

import com.teambook.panorama.domain.admin.dto.dashboard.DashboardResponse;

public interface DashboardService {

  /** 관리자 대시보드 화면에 필요한 집계 데이터를 한 번에 조회한다. */
  DashboardResponse getDashboard();
}
