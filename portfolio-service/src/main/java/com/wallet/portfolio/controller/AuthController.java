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
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final com.wallet.portfolio.service.RefreshTokenService refreshTokenService;
    private final com.wallet.portfolio.service.EmailService emailService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          com.wallet.portfolio.service.RefreshTokenService refreshTokenService,
                          com.wallet.portfolio.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody com.wallet.portfolio.dto.RegisterRequest req) {
        if (userRepository.findByUsername(req.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Kullanıcı adı zaten kullanılıyor."));
        }

        String verificationCode = String.valueOf((int) (Math.random() * 900000) + 100000); // 6 haneli kod

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role("ROLE_USER")
                .isEnabled(true) // Şimdilik otomatik aktif
                .verificationCode(verificationCode)
                .build();

        userRepository.save(user);
        
        // E-posta gönder (Altyapı kalsın ama zorunlu değil)
        emailService.sendVerificationEmail(user.getEmail(), verificationCode);
        
        return ResponseEntity.ok(Map.of("message", "Kayıt başarılı! Giriş yapabilirsiniz."));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String code = req.get("code");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
            user.setEnabled(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Hesabınız başarıyla doğrulandı!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Geçersiz doğrulama kodu."));
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody com.wallet.portfolio.dto.LoginRequest req) {
        // Kullanıcıyı bulmamız gerekiyor (ID bilgisi token için lazım)
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Şimdilik doğrulama kontrolünü pas geçiyoruz (Yorum satırı)
        /*
        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body(Map.of("error", "Hesabınız henüz doğrulanmamış."));
        }
        */

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        String token = jwtUtil.generateToken(auth.getName(), user.getId());
        
        // Önce varsa eski token'ları temizle
        refreshTokenService.deleteByUserId(user.getId());
        // Yeni refresh token oluştur
        com.wallet.portfolio.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "refreshToken", refreshToken.getToken()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> req) {
        String requestRefreshToken = req.get("refreshToken");

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.wallet.portfolio.entity.RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getUsername(), user.getId());
                    return ResponseEntity.ok(Map.of("token", token, "refreshToken", requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token veritabanında bulunamadı!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody Map<String, Long> req) {
        refreshTokenService.deleteByUserId(req.get("userId"));
        return ResponseEntity.ok(Map.of("message", "Çıkış başarılı!"));
    }
}
