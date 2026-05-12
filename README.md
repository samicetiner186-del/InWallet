# 🚀 Hackathon'26: InWallet - Kişisel Finans ve AI Asistanı

InWallet, **Hackathon'26** "Finans Temalı AI Uygulamaları" kategorisi için geliştirilmiş, üretken yapay zeka (GenAI) destekli akıllı bir kişisel finans ve portföy yönetim sistemidir. 

Sıradan bir cüzdan uygulamasından farklı olarak, InWallet kullanıcının gelirini, giderlerini ve yatırım hedeflerini (ev, araba vb.) anlık enflasyon ve piyasa verileriyle (Altın, Borsa, Kripto) analiz eder. İçerisinde barındırdığı **Agentic AI** yapısı sayesinde kullanıcının veritabanındaki portföyünü otonom olarak sorgulayabilir ve kişiselleştirilmiş finansal tavsiyeler verebilir.

---

## 🛠️ Teknik Altyapı ve Mimari

InWallet, yüksek ölçeklenebilirlik, performans ve yapay zeka entegrasyonu (Agentic Tools) hedeflenerek modern yazılım mimarisiyle tasarlanmıştır.

### Kullanılan Teknolojiler
- **Backend:** Java 17, Spring Boot 3, Spring Data JPA
- **Yapay Zeka (Agentic AI):** Spring AI (Google Gemini / OpenAI Entegrasyonu)
- **Veritabanı:** PostgreSQL (Kullanıcı, Hedef, Varlık ve İşlem verileri)
- **Önbellekleme:** Redis (Piyasa verilerinin hızlı okunması)
- **Olay Güdümlü Mimari (Event-Driven):** Apache Kafka & Zookeeper
- **Loglama ve RAG Verisi:** Elasticsearch
- **Konteynerleştirme:** Docker & Docker Compose
- **Frontend (Geliştirme Aşamasında):** ReactJS, TypeScript

### Temel Özellikler
1. **Dinamik Portföy Yönetimi:** Altın, Hisse Senedi ve Kripto gibi varlıkların canlı simüle edilen veriler üzerinden kar/zarar hesabı.
2. **AI Function Calling (Agentic Yapı):** Sistemdeki yapay zeka, doğrudan Java fonksiyonlarını (örn: `getUserPortfolio`) tetikleyerek kullanıcının verilerine erişebilir ve bağlamsal (RAG) cevaplar üretebilir.
3. **Akıllı Hedefler:** Belirlenen hedeflerin tahmini enflasyon oranlarıyla güncellenmesi.

---

## 📚 API Dokümantasyonu (Swagger & Postman)

Projenin tüm API uç noktaları profesyonel bir şekilde dokümante edilmiştir. Jürinin ve geliştiricilerin incelemesi için iki farklı yöntem sunulmaktadır:

### 1. Canlı Swagger Arayüzü
Uygulama çalışırken aşağıdaki adresten etkileşimli dokümantasyona erişebilirsiniz:
👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

### 2. Postman Koleksiyonu (OpenAPI Export)
Proje kök dizininde bulunan [openapi.json](./openapi.json) dosyası, projenin en güncel API tanımını içerir. Bu dosyayı Postman'e aktarmak için:
1. Postman uygulamasını açın.
2. Sol üstteki **"Import"** butonuna tıklayın.
3. [openapi.json](./openapi.json) dosyasını seçip içeri aktarın.
4. Artık tüm API'ler, parametreler ve **Bearer Token (JWT)** yetkilendirme şeması Postman'de hazır durumdadır.

---

## 💻 Projeyi Yerel Ortamda Çalıştırma (Kurulum)

Ekip arkadaşlarının ve jürinin projeyi ayağa kaldırması için aşağıdaki adımları izlemesi gerekmektedir.

### Gereksinimler
- Java 17+
- Maven
- Docker ve Docker Compose
- Geçerli bir OpenAI veya Google Gemini API Key.

### 1. Servisleri Ayağa Kaldırma (Altyapı)
Veritabanı, Redis, Kafka ve Elasticsearch'ü çalıştırmak için ana dizindeki docker dosyasını kullanın:
```bash
docker-compose up -d
```

### 2. Spring Boot Uygulamasını Başlatma
`application.yml` veya ortam değişkenleri (Environment Variables) üzerinden `OPENAI_API_KEY` tanımını yaptıktan sonra projeyi başlatın:
```bash
cd inwallet-service
./mvnw spring-boot:run
```

---

## 🤝 Takım Arkadaşları İçin Katkı Sağlama Rehberi (Contributing)

Bu proje Hackathon'26 için geliştirilmektedir. Birlikte daha hızlı ve çakışma (conflict) olmadan çalışabilmek için lütfen aşağıdaki kurallara uyalım:

### 1. Branch (Dal) Stratejisi
*   Ana dalımız (production) her zaman **`main`** dalıdır ve buraya doğrudan kod yazmak/pushlamak **yasaktır**.
*   Geliştirme yaparken kendi adınıza veya özelliğe göre bir dal açın:
    *   Özellik eklerken: `feature/ai-chat-ui` veya `feature/auth-service`
    *   Hata çözerken: `bugfix/redis-connection`
```bash
git checkout -b feature/kendi-ozelliginiz
```

### 2. Commit Mesajı Standartları (Conventional Commits)
Lütfen commit mesajlarınızın başına yapılan işin türünü ekleyin (İngilizce tercih edilir):
*   `feat:` Yeni bir özellik (örn: `feat: add goal calculation endpoint`)
*   `fix:` Bir hata düzeltmesi (örn: `fix: resolve database connection timeout`)
*   `refactor:` Kod iyileştirmesi
*   `docs:` Readme vb. dokümantasyon güncellemeleri

### 3. Pull Request (PR) Süreci
1. Kendi branch'inizde işinizi bitirdiğinizde kodunuzu GitHub'a gönderin: `git push origin feature/kendi-ozelliginiz`
2. GitHub üzerinden bir **Pull Request (PR)** açın.
3. PR'da ne yaptığınızı kısaca açıklayın. Ekipteki en az bir kişinin onayını (Approve) aldıktan sonra kodunuzu `main` dalına birleştirin (Merge).

### 4. Kod Standartları ve Uyarılar
*   Kodu göndermeden önce mutlaka localinizde projenin derlendiğinden (`./mvnw clean install`) emin olun.
*   Yapay Zeka (Agentic) yapılarına yeni bir fonksiyon ekliyorsanız, `AIAgentToolsConfig.java` içerisine `@Description` anotasyonu ile bu fonksiyonun ne işe yaradığını AI'ın anlayacağı dilde yazmayı unutmayın.

Takımımıza başarılar dilerim, Hackathon'da görüşmek üzere! 🏆
