package com.teambook.panorama.domain.book.dto.library;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public record LibSrchItem(
    String libCode,
    String libName,
    String address,
    String tel,
    String latitude,
    String longitude,
    String homepage,
    String closed,
    String operatingTime
) {}
