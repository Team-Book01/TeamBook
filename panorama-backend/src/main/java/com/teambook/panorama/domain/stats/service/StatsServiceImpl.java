package com.teambook.panorama.domain.stats.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.teambook.panorama.domain.stats.dto.CommunityStatsResponse;
import com.teambook.panorama.domain.stats.repository.StatsMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsServiceImpl implements StatsService {

  private final StatsMapper statsMapper;

  @Override
  public CommunityStatsResponse getCommunityStats() {
    return statsMapper.selectCommunityStats();
  }
}
