package tn.esprit.studentmanagement.services;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        send(toEmail,
            "🔐 StudentOps — Votre code de vérification",
            "Code de vérification", otp);
    }

    public void sendPasswordResetEmail(String toEmail, String code) {
        send(toEmail,
            "🔑 StudentOps — Réinitialisation du mot de passe",
            "Réinitialisation du mot de passe", code);
    }

    private void send(String toEmail, String subject,
                      String title, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildEmailContent(title, code), true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException(
                "Erreur envoi email : " + e.getMessage());
        }
    }

    private String buildEmailContent(String title, String otp) {
        return """
            <html>
            <body style="font-family:Arial,sans-serif;padding:20px;">
                <div style="background:#1f497d;padding:20px;
                    border-radius:10px;text-align:center;">
                    <h1 style="color:white;">🎓 StudentOps</h1>
                </div>
                <div style="padding:30px;border:1px solid #ddd;
                    border-radius:10px;margin-top:20px;">
                    <h2 style="color:#1f497d;">
                        %s
                    </h2>
                    <p>Voici votre code OTP :</p>
                    <div style="background:#f5f5f5;padding:20px;
                        text-align:center;border-radius:8px;
                        margin:20px 0;">
                        <h1 style="color:#1f497d;font-size:40px;
                            letter-spacing:10px;">%s</h1>
                    </div>
                    <p style="color:#e74c3c;">
                        ⚠️ Ce code expire dans
                        <strong>5 minutes</strong>.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(title, otp);
    }
}

