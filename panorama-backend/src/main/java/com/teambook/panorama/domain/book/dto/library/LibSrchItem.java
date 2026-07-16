package com.teambook.panorama.domain.book.dto.library;

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
