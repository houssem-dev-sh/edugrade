package tn.esprit.studentmanagement.services;

import tn.esprit.studentmanagement.entities.User;
import tn.esprit.studentmanagement.repositories.UserRepository;
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

    public String loginStep1(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException(
                "Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(password,
                user.getPassword()))
            throw new RuntimeException(
                "Email ou mot de passe incorrect");

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
        return "Code OTP envoyé sur " + email;
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

        user.setPassword(
            passwordEncoder.encode(user.getPassword()));
        user.setRole("STUDENT");
        userRepository.save(user);
        return "Inscription réussie !";
    }
}
