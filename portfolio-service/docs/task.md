# InWallet: Görev Listesi (Taskboard)

## Aşama 1: Temel Veri ve Altyapı
- `[x]` Proje adının `inwallet-service` olarak güncellenmesi ve temel klasör/bağımlılık ayarları.
- `[x]` `docker-compose.yml` (PostgreSQL, Redis, Kafka, Elasticsearch).
- `[x]` Veritabanı (PostgreSQL) bağlantı ayarlarının `application.yml` dosyasına eklenmesi.
- `[x]` Entity modellerinin oluşturulması (`User`, `Asset`, `Transaction`, `Goal`).
- `[x]` Repository, Service ve Controller katmanlarının yazılması (CRUD API'ler).
- `[/]` Borsa/Altın verisi için temel Mock API entegrasyonu.

## Aşama 2: Agentic AI Entegrasyonu (Tamamlandı)
- `[x]` Spring AI (veya LangChain4j) bağımlılıklarının projeye eklenmesi.
- `[x]` LLM API anahtarı konfigürasyonu (Gemini/OpenAI placeholder eklendi).
- `[x]` Kullanıcı verilerini (Transaction ve Portfolio) okuyacak RAG altyapısının Elasticsearch/Redis ile kurulması (Fonksiyon tabanlı Tool olarak eklendi).
- `[x]` AI Asistanı için "Agentic Tool" (Fonksiyonlar) yazılması (`getUserPortfolio` eklendi).
- `[x]` AI servisinin mantıksal sorgulara doğal dille cevap veren ucu (Chat API) oluşturulması.

## Aşama 3: Frontend ve Chatbot Arayüzü
- `[ ]` ReactJS ve TypeScript ile frontend projesinin oluşturulması.
- `[ ]` Premium / Dark Mode konseptli Dashboard tasarımı.
- `[ ]` AI Asistanı ile gerçek zamanlı konuşmak için Chatbot arayüzü ve WebSocket entegrasyonu.

## Aşama 4: Hackathon Teslim Süreci
- `[ ]` Uygulamanın tam Dockerize edilmesi (`Dockerfile` ve Frontend eklenmesi).
- `[ ]` `README.md` dosyasının jüri standartlarına göre Agentic özellikleri açıklayacak şekilde yazılması.
- `[ ]` 1 dakikalık demo videosu için örnek bir senaryo ve veri tabanı popülasyon betiği (mock data script) hazırlanması.
- `[ ]` GitHub repomuzun Public'e çekilmesi için son kontrollerin yapılması.
