package com.wallet.ai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.model.Media;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

@Service
public class AIAssistantService {

    private final ChatClient chatClient;

    public AIAssistantService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultSystem("""
                        Sen, InWallet uygulamasının üst düzey, nesnel ve analitik Finans Uzmanı yapay zekasısın (Gemini Pro).
                        
                        Görevlerin ve Temel Kuralların:
                        1. Analitik Yaklaşım: Kullanıcının sana sunduğu (veya fonksiyonlarla elde ettiğin) portföy durumunu, gelirini ve hedeflerini her zaman analiz et.
                        2. Risk ve Çeşitlendirme: Her zaman risk yönetimi ve portföy çeşitlendirmesi (diversifikasyon) tavsiyelerinde bulun. Asla tüm parayı tek bir yatırım aracına yatırmayı önerme.
                        3. Enflasyon Gerçekliği: Tasarruf ve hedef hesaplamalarında enflasyon etkisini göz önünde bulundur. Hedeflerin zamanla pahalılaşacağını hatırlat.
                        4. Yapısal Yanıt: Cevaplarını her zaman anlaşılır, maddeler halinde ve profesyonel bir dille ver.
                        5. Kesinlik: Asla doğrudan "Şu hisseyi al", "Altın kesin yükselir" gibi kesin iddialarda bulunma. Olasılıklardan ve piyasa beklentilerinden bahset.
                        6. Yasal Uyarı: Her cevabının en sonuna mutlaka şu metni ekle: "Yasal Uyarı: Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir."
                        
                        Sana verilen fonksiyonları (Agentic Tools) kullanarak kullanıcının güncel durumunu öğrenebilir ve buna göre kişiselleştirilmiş finansal tavsiyeler verebilirsin.
                        """)
                .build();
    }

    public String chatWithAgent(String userMessage, Long userId) {
        String enrichedUserMessage = String.format(
                """
                Kullanıcı Mesajı: %s
                
                [Sistem Notu: Bu kullanıcının sistemdeki ID numarası %d. Lütfen tavsiye vermeden önce sana verilen fonksiyonları 
                (getUserPortfolio, getUserGoals, getUserTransactions) çağırarak kullanıcının güncel varlıklarını, hedeflerini ve gelir/gider akışını analiz et.
                Kullanıcıya id numarasıyla hitap etme.]
                """, 
                userMessage, userId);

        return chatClient.prompt()
                .user(enrichedUserMessage)
                .functions("getUserPortfolio", "getUserGoals", "getUserTransactions")
                .call()
                .content();
    }

    public byte[] chatWithVoice(Resource audioResource, Long userId) {
        // Gemini Multimodal: Sesi doğrudan modele gönderip transkripsiyon alabiliriz.
        String transcription = chatClient.prompt()
                .user(u -> u.text("Lütfen bu ses kaydını yazıya dök.")
                           .media(new Media(MimeTypeUtils.parseMimeType("audio/webm"), audioResource)))
                .call()
                .content();
        
        // Metni asistan ile işle
        String assistantResponse = chatWithAgent(transcription, userId);
        
        // NOT: Google Gemini şu an doğrudan Byte[] olarak ses döndürmez (Spring AI M1'de).
        // Bu yüzden metin cevabını dönüyoruz veya bir TTS servisi gerekecek.
        // Şimdilik hata almamak için metni dönüyoruz (Frontend bunu ses olarak çalmaya çalışacaktır).
        return assistantResponse.getBytes();
    }
}
