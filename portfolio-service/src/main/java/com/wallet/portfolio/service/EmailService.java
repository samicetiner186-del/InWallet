package com.wallet.portfolio.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("InWallet - Hesap Doğrulama");
        message.setText("Merhaba,\n\nInWallet dünyasına hoş geldin! Hesabını aktif etmek için doğrulama kodun:\n\n" 
                        + code + "\n\nKeyifli yatırımlar!");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Geliştirme aşamasında hata alırsak loglayalım ama süreci bloklamayalım
            System.err.println("E-posta gönderilemedi: " + e.getMessage());
        }
    }

    public void sendBudgetWarning(String to, String category, String limit) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("DİKKAT: Bütçe Sınırına Yaklaştın!");
        message.setText("Merhaba,\n\n" + category + " kategorisindeki harcamaların belirlenen " + limit + " TL limitini aşmıştır.\n\n"
                        + "Finansal sağlığın için harcamalarını gözden geçirebilirsin.");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Bütçe uyarısı gönderilemedi: " + e.getMessage());
        }
    }

    public void sendGoalReachedEmail(String to, String goalName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("TEBRİKLER: Hedefine Ulaştın! 🎉");
        message.setText("Harika haber!\n\n" + goalName + " hedefin için belirlediğin tutara başarıyla ulaştın.\n\n"
                        + "Finansal disiplinin için seni tebrik ederiz. InWallet ile yeni hedefler belirlemeye ne dersin?");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Hedef maili gönderilemedi: " + e.getMessage());
        }
    }
}
