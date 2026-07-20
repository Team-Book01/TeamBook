package com.teambook.panorama.global.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
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
                "이메일 인증하기",
                verifyUrl + "?token=" + rawToken);
    }

    /** 비밀번호 재설정 메일 발송. (PASSWORD_RESET, B) */
    public void sendPasswordResetMail(String toEmail, String rawToken) {
        send(toEmail,
                "[파노라마북스] 비밀번호 재설정 안내",
                "아래 링크를 눌러 비밀번호를 재설정해 주세요. (15분 내 유효)",
                "비밀번호 재설정하기",
                resetUrl + "?token=" + rawToken);
    }

    private void send(String toEmail, String subject, String guide, String buttonLabel, String link) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // 두 번째 인자 false = 첨부 없음(단순 메시지), UTF-8로 한글 인코딩
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildHtml(guide, buttonLabel, link), true);   // true = HTML 본문 → <a> 링크 클릭 가능
            mailSender.send(message);
        } catch (MessagingException e) {
            // 기존 SimpleMailMessage와 동일하게 unchecked 예외로 전파
            throw new MailSendException("메일 발송에 실패했습니다.", e);
        }
    }

    /** 클릭 가능한 버튼 + 링크 원문(버튼이 안 눌릴 때 대비)을 담은 HTML 본문. */
    private String buildHtml(String guide, String buttonLabel, String link) {
        // HTML 문맥 삽입 전 이스케이프. 지금은 서버 통제 값이지만, 링크에 & 등이 붙어도 깨지지 않도록 방어.
        String safeGuide = HtmlUtils.htmlEscape(guide);
        String safeLabel = HtmlUtils.htmlEscape(buttonLabel);
        String safeLink = HtmlUtils.htmlEscape(link);
        return """
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#333;">
              <p style="font-size:15px;line-height:1.6;">%s</p>
              <p style="margin:24px 0;">
                <a href="%s"
                   style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;
                          text-decoration:none;border-radius:6px;font-weight:bold;">
                  %s
                </a>
              </p>
              <p style="font-size:13px;color:#666;">버튼이 눌리지 않으면 아래 주소를 복사해 브라우저에 붙여넣으세요.</p>
              <p style="font-size:13px;"><a href="%s">%s</a></p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
              <p style="font-size:12px;color:#999;">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
            </div>
            """.formatted(safeGuide, safeLink, safeLabel, safeLink, safeLink);
    }
}
