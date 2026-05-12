# 🚀 InWallet - Hackathon'26 Kurulum ve Geliştirme Rehberi

InWallet, üretken yapay zeka destekli akıllı bir kişisel finans ve portföy yönetim sistemidir. Bu rehber, ekibinizin projeyi sorunsuz bir şekilde ayağa kaldırması ve beraber çalışabilmesi için hazırlanmıştır.

---

## 🛠️ Tek Komutla Başlatma (Hızlı Kurulum)

Projeyi ilk kez ayağa kaldırırken tüm servislerin (Veritabanı, Redis, Kafka, Backend, Frontend) birbiriyle uyumlu çalışması için Docker kullanıyoruz.

**Önemli:** Bilgisayarınızda **Docker Desktop**'ın kurulu ve çalışır durumda olduğundan emin olun.

### 1. Adım: API Anahtarlarını Ayarlama
Proje kök dizininde bir `.env` dosyası oluşturun (veya `.env.example` dosyasını kopyalayın) ve içine API anahtarlarınızı yazın:
```bash
OPENAI_API_KEY=your_openai_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_key_here
```

### 2. Adım: Tüm Sistemi Başlatma
Terminalinizi açın ve ana dizinde şu komutu çalıştırın:
```bash
docker compose up --build -d
```
*Bu komut; veritabanını hazırlar, backend servislerini derler ve frontend'i ayağa kaldırır.*

---

## 🔍 Servislerin Durumu (Nereden Erişirim?)

Sistem ayağa kalktığında şu adresleri kullanabilirsiniz:

| Servis | Adres | Açıklama |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) | Kullanıcı arayüzü |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Ana servis |
| **Swagger UI** | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | API Dokümantasyonu |
| **AI Service** | [http://localhost:8081](http://localhost:8081) | Yapay zeka asistanı |

---

## 🆘 Olası Hatalar ve Çözümleri (Troubleshooting)

### 1. "Port 8080 (veya 5173) is already in use"
**Hata:** Bilgisayarınızda başka bir uygulama bu portu kullanıyor olabilir.
**Çözüm:** Terminalden `docker compose down` komutunu çalıştırın ve portu kullanan diğer uygulamaları kapatın.

### 2. Backend Veritabanına Bağlanamıyor (Connection Refused)
**Çözüm:** Docker konteynerlerinin tam olarak hazır olması bazen zaman alabilir. `docker compose logs -f portfolio-service` komutuyla hatayı takip edin. Eğer hata devam ederse:
```bash
docker compose down -v  # Tüm verileri ve konteynerleri temizler
docker compose up -d    # Yeniden başlatır
```

### 3. Frontend'de Veri Görünmüyor / Giriş Yapılamıyor
**Çözüm:** Tarayıcıda `http://localhost:5173` adresine girdiğinizden emin olun. Eğer frontend'i Docker dışında (`npm run dev`) çalıştırıyorsanız, backend'in portuna (`localhost:8080`) erişebildiğinden emin olun (Vite proxy ayarları otomatik yapılmıştır).

---

## 🌿 Git Kullanım Rehberi (Takım Çalışması)

Ekibimiz Fork-Pull Request modeliyle çalışmaktadır. İşte her gün yapmanız gerekenler:

### 1. Kendi Fork'unuzu Güncel Tutun (Her Sabah)
Projenin ana deposundaki (upstream) değişiklikleri kendi bilgisayarınıza çekmek için:
```bash
# Sadece ilk seferde: Ana depoyu 'upstream' olarak ekleyin
git remote add upstream https://github.com/YusaEmirMetin/InWallet.git

# Her sabah: Değişiklikleri çekin ve kendi main branch'inize birleştirin
git checkout main
git pull upstream main
git push origin main
```

### 2. Yeni Bir Özellik Eklerken (Branch Açma)
Asla doğrudan `main` üzerinde çalışmayın! Her özellik için yeni bir dal (branch) açın:
```bash
git checkout -b feature/eklenecek-ozellik-adi
```

### 3. Değişiklikleri Gönderme (Commit & Push)
İşiniz bittiğinde anlamlı mesajlarla kaydedin:
```bash
git add .
git commit -m "feat: hedefleri düzenleme özelliği eklendi"
git push origin feature/eklenecek-ozellik-adi
```

### 4. Pull Request (PR) Açma
GitHub arayüzüne gidin ve kendi branch'inizden ana deponun `main` dalına bir **Pull Request** oluşturun. Takım arkadaşlarınızdan onay aldıktan sonra merge edebilirsiniz.

---

## 📝 Önemli Notlar
- **Veritabanı Resetleme:** Veritabanını sıfırlamak isterseniz Docker'da `inwallet-postgres` volume'ünü silmeniz yeterlidir.
- **Frontend Geliştirme:** Eğer frontend kodunda hızlı değişiklik yapıp anında görmek istiyorsanız, Docker yerine yerel olarak `cd inwallet-frontend && npm run dev` komutunu kullanabilirsiniz. (Docker'daki frontend konteynerini durdurmayı unutmayın).

🚀 **Hackathon'da başarılar dilerim! Birlikte harika bir iş çıkaracağız.**
