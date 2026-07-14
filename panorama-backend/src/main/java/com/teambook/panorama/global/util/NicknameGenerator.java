package com.teambook.panorama.global.util;

import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Component;

@Component
public class NicknameGenerator {

    private static final String PREFIX = "u_";
    private static final String CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final int SUFFIX_LEN = 8;

    public String generate() {
        StringBuilder sb = new StringBuilder(PREFIX);
        for (int i = 0; i < SUFFIX_LEN; i++) {
            int idx = ThreadLocalRandom.current().nextInt(CHARS.length());
            sb.append(CHARS.charAt(idx));
        }
        return sb.toString();   // 예: u_a3f9kzsg
    }
}
