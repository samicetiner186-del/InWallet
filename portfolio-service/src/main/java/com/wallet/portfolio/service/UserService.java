package com.wallet.portfolio.service;

import com.wallet.portfolio.dto.ChangePasswordRequest;
import com.wallet.portfolio.dto.UpdateProfileRequest;
import com.wallet.portfolio.entity.User;
import com.wallet.portfolio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @CacheEvict(value = "users", key = "#id")
    public User updateUserProfile(Long id, UpdateProfileRequest req) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (req.getFirstName() != null) {
            existingUser.setFirstName(req.getFirstName());
        }
        if (req.getLastName() != null) {
            existingUser.setLastName(req.getLastName());
        }
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            existingUser.setUsername(req.getUsername());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            existingUser.setEmail(req.getEmail());
        }
        return userRepository.save(existingUser);
    }

    @CacheEvict(value = "users", key = "#id")
    public void changePassword(Long id, ChangePasswordRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mevcut şifre hatalı");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new RuntimeException("Yeni şifre en az 6 karakter olmalıdır");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // Legacy — kept for internal use
    @CacheEvict(value = "users", key = "#id")
    public User updateUser(Long id, User updatedUser) {
        User existingUser = getUserById(id);
        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isBlank()) {
            existingUser.setUsername(updatedUser.getUsername());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isBlank()) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getMonthlyIncome() != null) {
            existingUser.setMonthlyIncome(updatedUser.getMonthlyIncome());
        }
        if (updatedUser.getMonthlyExpense() != null) {
            existingUser.setMonthlyExpense(updatedUser.getMonthlyExpense());
        }
        return userRepository.save(existingUser);
    }
}
