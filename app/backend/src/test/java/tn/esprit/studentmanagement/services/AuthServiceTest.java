package tn.esprit.studentmanagement.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.esprit.studentmanagement.entities.User;
import tn.esprit.studentmanagement.repositories.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private OtpService otpService;
    @Mock private EmailService emailService;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("admin@example.com");
        user.setPassword("hash");
        user.setRole("ADMIN");
    }

    @Test
    void loginWithoutTwoFactorReturnsTokenAndSendsNoEmail() {
        user.setTwoFactorEnabled(false);
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(jwtService.generateToken("admin@example.com", "ADMIN")).thenReturn("jwt");

        AuthService.LoginStart result = authService.loginStep1("admin@example.com", "secret");

        assertEquals("jwt", result.token());
        verifyNoInteractions(emailService, otpService);
    }

    @Test
    void loginWithTwoFactorEmailsACodeAndReturnsNoToken() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(otpService.generateOtp("admin@example.com")).thenReturn("123456");

        AuthService.LoginStart result = authService.loginStep1("admin@example.com", "secret");

        assertNull(result.token());
        verify(emailService).sendOtpEmail("admin@example.com", "123456");
        verifyNoInteractions(jwtService);
    }

    @Test
    void loginWithWrongPasswordFails() {
        user.setTwoFactorEnabled(false);
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThrows(RuntimeException.class,
            () -> authService.loginStep1("admin@example.com", "wrong"));
        verifyNoInteractions(jwtService);
    }

    @Test
    void registerIgnoresIdRoleAndTwoFactorSentByTheClient() {
        User request = new User();
        request.setId(1L);
        request.setEmail("new@example.com");
        request.setPassword("plain");
        request.setRole("ADMIN");
        request.setTwoFactorEnabled(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        authService.register(request);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertNull(saved.getValue().getId());
        assertEquals("STUDENT", saved.getValue().getRole());
        assertTrue(saved.getValue().isTwoFactorEnabled());
        assertEquals("encoded", saved.getValue().getPassword());
    }
}
