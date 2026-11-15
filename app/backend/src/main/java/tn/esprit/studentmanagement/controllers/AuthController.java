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
            String msg = authService.loginStep1(
                req.get("email"), req.get("password"));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", msg));
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
}
