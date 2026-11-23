package tn.esprit.studentmanagement.config;

import tn.esprit.studentmanagement.entities.User;
import tn.esprit.studentmanagement.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the admin account from ADMIN_EMAIL / ADMIN_PASSWORD at startup.
 * If the account already exists, its role and two-factor setting are kept in
 * line with the configuration, but its password is left as is.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final boolean adminTwoFactor;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.admin.email:}") String adminEmail,
                           @Value("${app.admin.password:}") String adminPassword,
                           @Value("${app.admin.two-factor:true}") boolean adminTwoFactor) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail.trim();
        this.adminPassword = adminPassword;
        this.adminTwoFactor = adminTwoFactor;
    }

    @Override
    public void run(String... args) {
        if (adminEmail.isEmpty() || adminPassword.isEmpty()) {
            log.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account seeded");
            return;
        }

        userRepository.findByEmail(adminEmail).ifPresentOrElse(user -> {
            user.setRole(ADMIN_ROLE);
            user.setTwoFactorEnabled(adminTwoFactor);
            userRepository.save(user);
            log.info("Admin account already exists: {}", adminEmail);
        }, () -> {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(ADMIN_ROLE);
            admin.setNom("Admin");
            admin.setPrenom("EduGrade");
            admin.setTwoFactorEnabled(adminTwoFactor);
            userRepository.save(admin);
            log.info("Admin account created: {}", adminEmail);
        });

        if (!adminTwoFactor) {
            log.warn("Two-factor sign-in is OFF for {} (ADMIN_TWO_FACTOR=false)", adminEmail);
        }
    }
}
