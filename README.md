# 🚀 Hackathon'26: InWallet - Kişisel Finans ve AI Asistanı

InWallet, **Hackathon'26** "Finans Temalı AI Uygulamaları" kategorisi için geliştirilmiş, üretken yapay zeka (GenAI) destekli akıllı bir kişisel finans ve portföy yönetim sistemidir. 

Sıradan bir cüzdan uygulamasından farklı olarak, InWallet kullanıcının gelirini, giderlerini ve yatırım hedeflerini anlık enflasyon ve piyasa verileriyle (Altın, Borsa, Kripto) analiz eder. İçerisinde barındırdığı **Agentic AI** yapısı sayesinde kullanıcının veritabanındaki portföyünü otonom olarak sorgulayabilir ve kişiselleştirilmiş finansal tavsiyeler verebilir.

---

## 🛠️ Teknik Altyapı ve Mimari

InWallet, yüksek ölçeklenebilirlik, performans ve yapay zeka entegrasyonu (Agentic Tools) hedeflenerek modern yazılım mimarisiyle tasarlanmıştır.

### Kullanılan Teknolojiler
- **Backend:** Java 17, Spring Boot 3, Spring Data JPA
- **Yapay Zeka (Agentic AI):** Spring AI (Google Gemini / OpenAI Entegrasyonu)
- **Veritabanı:** PostgreSQL (Kullanıcı, Hedef, Varlık ve İşlem verileri)
- **Önbellekleme:** Redis (Piyasa verilerinin hızlı okunması)
- **Olay Güdümlü Mimari (Event-Driven):** Apache Kafka & Zookeeper
- **Konteynerleştirme:** Docker & Docker Compose
- **Frontend:** ReactJS, TypeScript (Vite)

### Temel Özellikler
1. **Dinamik Portföy Yönetimi:** Altın, Hisse Senedi ve Kripto gibi varlıkların canlı veriler üzerinden kar/zarar hesabı.
2. **AI Function Calling:** Yapay zeka, Java fonksiyonlarını (örn: `getUserPortfolio`) tetikleyerek gerçek zamanlı analiz yapabilir.
3. **Akıllı Hedefler:** Tahmini enflasyon oranlarıyla güncellenen dinamik hedef takibi.

---

## 🚀 Hızlı Kurulum Rehberi (Docker)

Takım arkadaşlarının ve jürinin projeyi sorunsuz ayağa kaldırması için en güvenilir yöntem Docker kullanımıdır.

### 1. API Anahtarlarını Ayarlama
Ana dizinde bir `.env` dosyası oluşturun ve içine anahtarlarınızı ekleyin (Bkz: `.env.example`):
```bash
OPENAI_API_KEY=your_key_here
GOOGLE_GEMINI_API_KEY=your_key_here
```

### 2. Sistemi Başlatma
Terminalden ana dizinde şu komutu çalıştırın:
```bash
docker compose up --build -d
```

### 3. Erişim Adresleri
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 📚 API Dokümantasyonu (Swagger & Postman)

### 1. Canlı Swagger Arayüzü
Uygulama çalışırken etkileşimli dokümantasyona buradan erişebilirsiniz: [Swagger UI](http://localhost:8080/swagger-ui/index.html)

### 2. Postman Koleksiyonu
Kök dizinde bulunan `openapi.json` dosyasını Postman'e "Import" ederek tüm API koleksiyonuna erişebilirsiniz.

---

## 🆘 Olası Hatalar ve Çözümleri (Troubleshooting)

- **Port Çakışması (8080/5173):** Başka bir uygulamanın bu portları kullanmadığından emin olun veya `docker compose down` yapıp tekrar deneyin.
- **Veritabanı Bağlantı Hatası:** Konteynerlerin tam hazır olması için 10-15 saniye bekleyin. Sorun devam ederse `docker compose down -v` ile volume'leri temizleyip tekrar başlatın.
- **AI Yanıt Vermiyor:** `.env` dosyasındaki API anahtarlarınızın geçerli olduğunu kontrol edin.

---

## 🤝 Takım Arkadaşları İçin Çalışma Rehberi

Ekibimizin beraber sorunsuz çalışabilmesi için lütfen şu kurallara dikkat edelim:

### 1. Git İş Akışı ve Güncel Kalma
Her sabah ana depodaki değişiklikleri kendi bilgisayarınıza çekmeyi unutmayın:
```bash
git checkout main
git pull upstream main  # Ana depodan güncel kodu al
git push origin main    # Kendi fork'unu güncelle
```

### 2. Yeni Özellik Geliştirme (Branching)
Doğrudan `main` dalına kod pushlamak **yasaktır**. Her iş için yeni bir dal açın:
```bash
git checkout -b feature/eklenecek-ozellik-adi
```

### 3. Commit ve PR Süreci
- Mesajlarınızın başına `feat:`, `fix:`, `docs:` gibi etiketler ekleyin (Conventional Commits).
- İşiniz bittiğinde GitHub üzerinden `main` dalına bir **Pull Request (PR)** açın ve ekipteki bir arkadaşınızdan onay isteyin.

### 4. Kod Standartları
- Kodu göndermeden önce mutlaka localinizde projenin derlendiğinden (`./mvnw clean install` veya Docker'da hata almadığından) emin olun.

Takımımıza başarılar dilerim, Hackathon'da görüşmek üzere! 🏆
