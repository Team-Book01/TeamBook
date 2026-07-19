package com.teambook.panorama.domain.post.service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.teambook.panorama.global.exception.BusinessException;
import com.teambook.panorama.global.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BookOcrServiceImpl implements BookOcrService {

    private static final Set<String> ALLOWED_TYPES =
        Set.of("image/jpeg", "image/png", "image/gif", "image/webp");
    private static final long MAX_SIZE = 5 * 1024 * 1024;
    // 97[89]로 시작, 하이픈·공백 허용, 숫자 총 13자리 (줄바꿈 허용하지 않음)
    private static final Pattern ISBN_PATTERN =
        Pattern.compile("97[89][- ]?(?:\\d[- ]?){9}\\d");

    @Value("${vision.api.key}")
    private String apiKey;

    @Override
    public String extractIsbn(MultipartFile image) {
        validate(image);
        String text = extractText(image);
        return parseIsbn(text);
    }

    private void validate(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        if (image.getSize() > MAX_SIZE) {
            throw new BusinessException(ErrorCode.INVALID_IMAGE_SIZE);
        }
    }

    private String extractText(MultipartFile image) {
        String base64Image;
        try {
            base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        } catch (IOException e) {
            log.error("OCR용 이미지 읽기 실패", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        Map<String, Object> imageBox = Map.of("content", base64Image);
        Map<String, Object> featureBox = Map.of("type", "TEXT_DETECTION");
        Map<String, Object> requestBox = Map.of(
            "image", imageBox,
            "features", List.of(featureBox)
        );
        Map<String, Object> body = Map.of("requests", List.of(requestBox));

        String response = RestClient.create()
            .post()
            .uri("https://vision.googleapis.com/v1/images:annotate?key=" + apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .body(String.class);

        String text;
        try {
            JsonNode root = new ObjectMapper().readTree(response);
            text = root.path("responses").path(0)
                       .path("textAnnotations").path(0)
                       .path("description").asText();
        } catch (JsonProcessingException e) {
            log.error("Vision 응답 파싱 실패", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        if (text.isEmpty()) {
            throw new BusinessException(ErrorCode.ISBN_NOT_FOUND);
        }
        return text;
    }

    private String parseIsbn(String text) {
        Matcher matcher = ISBN_PATTERN.matcher(text);
        while (matcher.find()) {
            String digits = matcher.group().replaceAll("[^0-9]", "");
            if (digits.length() == 13 && isValidIsbn13(digits)) {
                return digits;
            }
        }
        throw new BusinessException(ErrorCode.ISBN_NOT_FOUND);
    }

    // ISBN-13 체크섬: 홀수번 ×1, 짝수번 ×3 합이 10의 배수
    private boolean isValidIsbn13(String digits) {
        int sum = 0;
        for (int i = 0; i < 13; i++) {
            int digit = digits.charAt(i) - '0';
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        return sum % 10 == 0;
    }
}