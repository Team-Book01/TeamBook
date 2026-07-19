package com.teambook.panorama.global.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * 메일 발송 인프라. (현재 Mailtrap Sandbox — spring.mail.* 설정 사용)
 *
 * - 원문 토큰은 여기(메일 본문)에만 존재한다. DB에는 SHA-256 지문만 저장한다.
 * - 메일 링크는 백엔드가 아니라 프론트 라우트(app.frontend.verify-url / reset-url)를 가리킨다.
 *   프론트가 ?token= 을 꺼내 백엔드 콜백(이메일 인증 / 비밀번호 재설정)을 호출한다.
 */
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend.verify-url}")
    private String verifyUrl;

    @Value("${app.frontend.reset-url}")
    private String resetUrl;

    /** 이메일 등록·인증 메일 발송. (EMAIL_VERIFY, C) */
    public void sendEmailVerificationMail(String toEmail, String rawToken) {
        send(toEmail,
                "[파노라마북스] 이메일 인증을 완료해 주세요",
                "아래 링크를 눌러 이메일 인증을 완료해 주세요. (30분 내 유효)",
                verifyUrl + "?token=" + rawToken);
    }

    /** 비밀번호 재설정 메일 발송. (PASSWORD_RESET, B) */
    public void sendPasswordResetMail(String toEmail, String rawToken) {
        send(toEmail,
                "[파노라마북스] 비밀번호 재설정 안내",
                "아래 링크를 눌러 비밀번호를 재설정해 주세요. (15분 내 유효)",
                resetUrl + "?token=" + rawToken);
    }

    private void send(String toEmail, String subject, String guide, String link) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(guide + "\n\n" + link + "\n\n본인이 요청하지 않았다면 이 메일을 무시하세요.");
        mailSender.send(message);
    }
}
