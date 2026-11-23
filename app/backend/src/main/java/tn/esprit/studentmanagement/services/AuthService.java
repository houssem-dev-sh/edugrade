package tn.esprit.studentmanagement.services;

import tn.esprit.studentmanagement.entities.User;
import tn.esprit.studentmanagement.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private OtpService otpService;
    @Autowired private EmailService emailService;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;

    /** Result of the first login step: a JWT when no code is needed, otherwise null. */
    public record LoginStart(String token, String message) {}

    public LoginStart loginStep1(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException(
                "Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(password,
                user.getPassword()))
            throw new RuntimeException(
                "Email ou mot de passe incorrect");

        if (!user.isTwoFactorEnabled())
            return new LoginStart(
                jwtService.generateToken(email, user.getRole()),
                "Connexion réussie !");

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
        return new LoginStart(null, "Code OTP envoyé sur " + email);
    }

    public String loginStep2(String email, String otp) {
        if (!otpService.validateOtp(email, otp))
            throw new RuntimeException(
                "Code OTP invalide ou expiré");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException(
                "Utilisateur non trouvé"));

        return jwtService.generateToken(
            email, user.getRole());
    }

    public String register(User user) {
        if (userRepository.existsByEmail(user.getEmail()))
            throw new RuntimeException("Email déjà utilisé");

        // Only email, password and names come from the client: never trust an id
        // (would overwrite another row) or a two-factor / enabled flag from the request.
        user.setId(null);
        user.setPassword(
            passwordEncoder.encode(user.getPassword()));
        user.setRole("STUDENT");
        user.setEnabled(true);
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        return "Inscription réussie !";
    }

    // ===== Mot de passe oublié =====
    // Codes de reset stockés sous une clé distincte des codes de login,
    // pour qu'un code OTP de connexion ne puisse pas réinitialiser un mot de passe.
    private static final String RESET_PREFIX = "reset:";
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    public String requestPasswordReset(String email) {
        if (email == null || email.isBlank())
            throw new RuntimeException("Email requis");

        // Réponse identique que le compte existe ou non (pas d'énumération d'emails).
        userRepository.findByEmail(email).ifPresent(user -> {
            String code = otpService.generateOtp(RESET_PREFIX + email);
            try {
                emailService.sendPasswordResetEmail(email, code);
            } catch (RuntimeException e) {
                log.error("Échec d'envoi du code de réinitialisation", e);
            }
        });
        return "Si un compte existe pour cet email, un code de réinitialisation a été envoyé.";
    }

    public String resetPassword(String email, String code, String newPassword) {
        if (newPassword == null || newPassword.length() < MIN_PASSWORD_LENGTH)
            throw new RuntimeException(
                "Le mot de passe doit contenir au moins 8 caractères");

        if (email == null || code == null
                || !otpService.validateOtp(RESET_PREFIX + email, code))
            throw new RuntimeException("Code de réinitialisation invalide ou expiré");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException(
                "Code de réinitialisation invalide ou expiré"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "Mot de passe réinitialisé avec succès";
    }
}
