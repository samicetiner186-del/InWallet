package com.wallet.portfolio.controller;

import com.wallet.portfolio.entity.User;
import com.wallet.portfolio.repository.UserRepository;
import com.wallet.portfolio.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        if (userRepository.findByUsername(req.get("username")).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Kullanıcı adı zaten kullanılıyor."));
        }

        User user = User.builder()
                .username(req.get("username"))
                .email(req.get("email"))
                .password(passwordEncoder.encode(req.get("password")))
                .role("ROLE_USER")
                .build();

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Kayıt başarılı!"));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.get("username"), req.get("password"))
        );

        String token = jwtUtil.generateToken(auth.getName());
        return ResponseEntity.ok(Map.of("token", token));
    }
}
