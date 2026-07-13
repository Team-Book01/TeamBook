package com.teambook.panorama.global.security.jwt;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.stereotype.Component;

@Component
public class TokenHashUtil {

    public String sha256Hex(String rawToken) {
        // TODO: rawToken 을 SHA-256 해싱 후 hex 문자열(64자)로 반환
        //       (MessageDigest.getInstance("SHA-256") 활용) null을 반환할수 있어서 try/catch문 필요
        try {
          MessageDigest digest = MessageDigest.getInstance("SHA-256");
          byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
          return toHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Token Hashing에 필요한 알고리즘을 찾을수 없습니다.",e);
        }
    }

    private String toHex(byte[] bytes){
      StringBuilder sb = new StringBuilder(bytes.length *2);
      for (byte b : bytes){
        sb.append(String.format("%02x", b));
      }
      return sb.toString();
    }
}