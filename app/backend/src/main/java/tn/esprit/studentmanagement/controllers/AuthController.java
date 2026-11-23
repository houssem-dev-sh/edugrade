package tn.esprit.studentmanagement.controllers;

import tn.esprit.studentmanagement.entities.User;
import tn.esprit.studentmanagement.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> req) {
        try {
            AuthService.LoginStart result = authService.loginStep1(
                req.get("email"), req.get("password"));
            // A token here means the account skips the email code.
            if (result.token() != null)
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", result.token(),
                    "message", result.message()));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", result.message()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> req) {
        try {
            String token = authService.loginStep2(
                req.get("email"), req.get("otp"));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "token", token,
                "message", "Connexion réussie !"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {
        try {
            String msg = authService.register(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> req) {
        try {
            String msg = authService.requestPasswordReset(
                req.get("email"));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> req) {
        try {
            String msg = authService.resetPassword(
                req.get("email"), req.get("code"), req.get("password"));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()));
        }
    }
}
