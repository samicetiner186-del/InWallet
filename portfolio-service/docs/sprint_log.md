# InWallet: Sprint Logları

Bu dosya, projenin Çevik (Agile) prensiplere göre Sprint (Koşu) döngüleriyle geliştirilmesini takip etmek ve her Sprint sonunda ortaya çıkan ürün parçasını belgelemek amacıyla oluşturulmuştur.

---

## 🏃‍♂️ Sprint 1: Altyapı ve Veri Modelleri (Tamamlandı)
**Odak:** Backend altyapısının kurulması, Hackathon klasör yapısının ayarlanması ve veritabanı CRUD operasyonlarının çalıştırılabilir hale getirilmesi.

**Yapılan İşler:**
- `portfolio-service` olan yapı Hackathon yarışmasına uygun şekilde `inwallet-service` olarak yeniden isimlendirildi ve tüm paketler refactor edildi.
- PostgreSQL, Redis, Kafka ve Elasticsearch'ü barındıran `docker-compose.yml` altyapısı kuruldu.
- Temel veri modelleri (`User`, `Asset`, `Goal`, `Transaction`) oluşturuldu ve PostgreSQL entegrasyonu tamamlandı.
- Varlık ve işlemleri yönetebilmek için `Repository`, `Service` ve `Controller` katmanları yazıldı.
- AI asistanın analiz edebilmesi adına canlı piyasayı (Altın, Apple, BTC) simüle eden `MarketDataMockService` arka planda çalışacak şekilde kodlandı.

**Sprint 1 Çıktısı:** Tamamen derlenebilir (`Build Success`), veritabanına bağlanabilen ve mock fiyatları hafızada tutan sağlam bir Spring Boot mikroservis temeli.

---

## 🏃‍♂️ Sprint 2: Agentic AI Asistanı Entegrasyonu (Tamamlandı)
**Odak:** Sisteme bir yapay zeka (LLM) modeli entegre edilmesi ve bu modelin kullanıcı verilerini okuyarak (RAG) otonom kararlar verebilen bir finans asistanına dönüştürülmesi.

**Yapılan İşler:**
- `pom.xml` dosyasına Spring AI Milestone bağımlılıkları eklendi.
- `application.yml` dosyasına OpenAI / Gemini API anahtarları için tanımlamalar yapıldı.
- AI asistanı konfigüre edilip `AIAssistantService` yazıldı. Asistana yarışmada talep edilen **Agentic** yapısını kazandırmak için sistem komutları eklendi.
- AI'ın Java fonksiyonlarını tetikleyebilmesi (Function Calling) için `AIAgentToolsConfig` ayarlandı. Asistana `getUserPortfolio` yeteneği verildi (AI artık sorulan sorulara göre veritabanından kullanıcının cüzdanındaki varlık miktarını çekebiliyor).
- Chatbot frontend'inin haberleşebilmesi için `/api/ai/chat` endpoint'i `AIChatController` ile dışarı açıldı.

**Sprint 2 Çıktısı:** Hackathon kriterlerinden en önemlisi olan "Agentic Yapı" kuruldu. Kullanıcının cüzdanına erişebilen fonksiyonel bir AI Asistanı backend'de çalışır duruma getirildi.

---

## 🏃‍♂️ Sprint 3: Frontend ve Gerçek Zamanlı Arayüz (Aktif)
**Odak:** Uygulamaya Premium/Dark Mode bir arayüz kazandırmak ve yapay zeka asistanını bir chatbot penceresi ile önyüze entegre etmek.
