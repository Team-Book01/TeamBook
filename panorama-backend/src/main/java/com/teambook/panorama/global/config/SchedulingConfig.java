package com.teambook.panorama.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 스프링 스케줄링(@Scheduled) 활성화.
 * 도서관 데이터 월 1회 자동 동기화 등 주기 작업에 사용한다.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
