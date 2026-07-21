package com.teambook.panorama.domain.stats.service;

import com.teambook.panorama.domain.stats.dto.CommunityStatsResponse;

public interface StatsService {

  /** 홈 커뮤니티 현황(공개) 통계 — 오늘 방문자 수 + 전체 게시글 수. */
  CommunityStatsResponse getCommunityStats();
}
