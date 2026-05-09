# InWallet: Kişisel Finans ve Yapay Zeka Asistanı (Hackathon'26)

Bu belge, "InWallet" adlı projenin, **Hackathon'26** "Finans Temalı AI Uygulamaları - Kişisel Finans Asistanı" kategorisine ve yarışma jürisinin değerlendirme kriterlerine (Örn. Agentic Yapılar, Performans, Kullanıcı Değeri) tam uyumlu olacak şekilde baştan tasarlanmış mimari planını içerir.

## User Review Required

> [!IMPORTANT]
> Projeyi hackathon kurallarına (GenAI, Agentic Mimari) uyarlamak için mimariye **Spring AI (veya LangChain)** entegrasyonu ekledim. Böylece sistem, kullanıcının verilerini okuyup analiz yapabilen bağımsız bir AI ajanı içerecek. Bu yeni AI-odaklı planı inceleyip onaylamanızı bekliyorum.

## Open Questions

> [!CAUTION]
> 1. **GenAI Modeli:** AI analizleri için hangi LLM modelini (örn. OpenAI GPT-4, Google Gemini, Anthropic Claude) kullanmayı tercih edersiniz? API anahtarına ihtiyacımız olacak.
> 2. **Takvim:** 19 Mayıs 2026 ürün teslimi. Bu süreye kadar 1 dakikalık video ve GitHub public repo gibi metrikleri ne zaman hazırlamaya başlayalım?

## Proje Hedefi ve Kapsamı (Yarışma Konsepti)
*Hackathon Konsepti: Kişisel Finans Asistanı*

- **Gelir/Gider ve Bütçe Takibi:** Kullanıcının nakit akışını yönetmesi.
- **Yatırım ve Dinamik Hedefler:** Altın, borsa gibi verilerin gerçek zamanlı takibi. Hedeflerin (Ev, Araba) enflasyona göre güncellenmesi.
- **Agentic Yapılar (AI):** Sistemin merkezinde duran, kullanıcının finansal profilini (RAG ile) analiz eden bir Yapay Zeka Asistanı.
    - *Senaryo:* "Bu ay neden daha fazla harcadım?" sorusuna veritabanındaki expense loglarını (Elasticsearch) analiz ederek doğal dilde yanıt vermesi.
    - *Senaryo:* "5 yılda ev almak için nasıl para biriktiririm?" sorusuna kullanıcının varlıklarını ve enflasyon oranlarını (Goal entity) hesaplayıp (Agentic Tools) dinamik yatırım önerisi sunması.

---

## Önerilen Mimari (Yapay Zeka Destekli Mikroservis Yapısı)

Yarışmada **Teknik Puan (20 Puan)** ve **Agentic Yapılar (10 Puan)** kriterlerinden tam not almak için şu modern ve kompleks yapı kurulacaktır:

### 1. InWallet Backend Servisi (Spring Boot 3 + Java)
*   **Core Management:** Kullanıcı, portföy ve gelir/gider CRUD işlemleri. (PostgreSQL)
*   **Market Data Aggregator:** Dış finansal API'lerden (Borsa, Altın) veri çeker ve Redis'e atar.
*   **AI Agent Service (Spring AI / LangChain4j):** 
    *   Sistemin beyni. LLM ile entegre çalışır.
    *   *Agentic Tools (Function Calling):* AI, kullanıcının portföyünü getirmek, hedeflerini hesaplamak veya piyasa verisini çekmek için Java'da yazılmış fonksiyonları (tools) otonom olarak tetikleyebilir.
*   **Event-Driven Flow (Kafka):** Piyasa verisi anlık değiştiğinde Kafka'ya mesaj atılır, AI asistanı bunu dinleyip "Hedefinden %5 uzaklaştın" diye proaktif (agentic) bildirim üretebilir.

### 2. Frontend (ReactJS / TypeScript)
*   Hackathon jürisine şık görünecek modern "Premium/Dark" bir UI. (Kullanıcı Dostu Çalışma - 10 Puan)
*   Finansal verilerin grafiklerle gösterilmesi (Recharts veya Chart.js).
*   Sağ altta **"InWallet AI Assistant"** chatbot arayüzü. Chat üzerinden WebSockets ile anlık mesajlaşma.

### 3. Altyapı ve DevOps (Docker)
*   Jüriye ve GitHub repo'suna sunulacak "tek tıkla çalışma" konsepti (`docker-compose up`).

---

## Geliştirme Aşamaları (Hackathon Takvimi)

### Aşama 1: Temel Veri ve Altyapı
- [x] InWallet Backend ve Entity'lerinin (User, Asset, Goal, Transaction) oluşturulması.
- [ ] CRUD API'lerinin ve Servislerin yazılması.
- [ ] Borsa/Altın için Mock (veya gerçek) Data API entegrasyonu.

### Aşama 2: Agentic AI Entegrasyonu (Kritik Aşama)
- [ ] Spring AI entegrasyonu ve LLM (Gemini/OpenAI) yapılandırması.
- [ ] **RAG (Retrieval-Augmented Generation):** Elasticsearch ile loglanmış kullanıcı harcamalarını AI'ın bağlamına eklemek.
- [ ] **Function Calling (Tools):** AI asistanına "Portföyü Getir", "Enflasyonu Hesapla" gibi yeteneklerin (tool) kodlanması.

### Aşama 3: Frontend ve Chatbot Arayüzü
- [ ] React UI tasarımı ve gösterge panelleri (Dashboard).
- [ ] AI asistan için Chat arayüzünün yapılması ve Backend ile bağlanması.

### Aşama 4: Hackathon Teslim Süreci
- [ ] Projenin tamamen Dockerize edilmesi ve `README.md` dosyasının jüriye uygun şablonla hazırlanması.
- [ ] 1 Dakikalık tanıtım videosunun çekimi için senaryo hazırlanması.
- [ ] GitHub Repository'nin public hale getirilmesi.

## Teslimat (19 Mayıs 2026)
1. **GitHub Reposu:** Temiz, dokümante edilmiş ve AI-Agentic yapıları ön plana çıkaran repo.
2. **Demo Videosu:** Yapay zekanın "Bu ay neden fazla harcadım?" sorusuna nasıl agentic araçlarla cevap bulduğunu vurgulayan 1 dakikalık video.
3. **Canlı Sunum (Web App):** Uygulamanın bir bulut sunucuda (veya jüriye local'de) gösterimi.
