package tn.esprit.studentmanagement.config;

import tn.esprit.studentmanagement.entities.User;
import tn.esprit.studentmanagement.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@studentops.com")) {
            User admin = new User();
            admin.setEmail("admin@studentops.com");
            // NOSONAR
            admin.setPassword(passwordEncoder.encode("HoussemSara@2001"));// NOSONAR
            // NOSONAR
            admin.setRole("ADMIN");
            admin.setNom("Admin");
            admin.setPrenom("StudentOps");
            userRepository.save(admin);
            System.out.println("✅ Admin créé : admin@studentops.com");
        } else {
            System.out.println("✅ Admin existe déjà");
        }
    }
}
