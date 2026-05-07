# review-commit · konuşma-tabanlı git agent

Doğal dilde verilen tek bir Türkçe/İngilizce komutu — örn. *"en son değişiklikleri gönder"* — alıp **git commit + git push + Raspberry Pi deploy** zincirine çevirir.

- AI (varsayılan: Ollama / `qwen2.5:3b`, lokal & ücretsiz) commit mesajını üretir ve doğal-dil komutu plana çevirir.
- Pre-tanımlı keyword'ler AI'ya gitmeden direkt eşleşir → hızlı.
- Hem interaktif (`npm run review`) hem otomatik (`--yes`) modda çalışır → CI / Cursor agent / cron'dan çağrılabilir.

## 1. Kurulum

```bash
cd tools/review-commit
npm install
cp .env.example .env  # ardından .env içindeki değerleri doldur
```

### Ollama (varsayılan, ücretsiz)

```bash
brew install ollama          # mac (yoksa)
ollama serve                 # background daemon
ollama pull qwen2.5:3b
```

### Cursor SDK (opsiyonel)

`.env` içinde `AI_PROVIDER=cursor` ve `CURSOR_API_KEY=cursor_...` ayarla, sonra:

```bash
npm i @cursor/sdk
```

## 2. Hızlı sağlık testi

```bash
npm run smoke
# Provider: ollama (qwen2.5:3b @ http://localhost:11434)
# Ready: { ok: true }
# Cevap: 8
```

## 3. Kullanım

```bash
# İnteraktif: ne yapacağını sorar, plan + onay alır
npm run review

# Tek komutla, onaylarla
npm run review -- "en son değişiklikleri gönder"

# Otomatik (CI / Cursor agent / cron)
npm run review -- --yes "deploy"
npm run review -- --yes "en son değişiklikleri gönder"
```

### Tanınan komutlar (keyword fallback, AI'a gitmez)

| Komut | Plan |
|---|---|
| `commit` / `kaydet` | commit |
| `push` / `pushla` / `yükle` / `gönder` | commit + push |
| `deploy` / `pi'ye at` | deploy |
| `en son değişiklikleri gönder` / `hepsini yap` / `pi'ye gönder` | commit + push + deploy |

Diğer her şey AI'a gider; AI parse edemezse fallback `commit` planı çalışır.

## 4. Exit code'lar

| Kod | Anlamı |
|---|---|
| 0 | Başarılı / kullanıcı iptal etti |
| 1 | Provider hazır değil (env eksik, Ollama açık değil, model yok) |
| 2 | AI çağrısı hatası |
| 3 | git commit başarısız |
| 4 | git push başarısız |
| 5 | SSH veya Pi deploy başarısız |
| 6 | Pi config eksik (.env eksik alan) |

## 5. Mimari

Detaylı mimari için → [ARCHITECTURE.md](./ARCHITECTURE.md)

Özet:

- `review.ts` — orchestrator (plan üret, onay al, sırayla çalıştır)
- `ai.ts` — AI provider abstraction (Ollama, Cursor SDK)
- `deploy.ts` — SSH client (ssh2) + uzak komut çalıştırıcı

## 6. Hata ayıklama

| Belirti | Çözüm |
|---|---|
| `Ollama'ya bağlanılamadı` | `ollama serve` çalışıyor mu? `curl http://localhost:11434/api/tags` |
| `Ollama modeli bulunamadı` | `ollama pull qwen2.5:3b` |
| `Pi config eksik` | `.env` içinde `PI_HOST`, `PI_USER`, `PI_PASSWORD` (veya `PI_SSH_KEY`) dolu mu? |
| `SSH timeout` | Pi'nin IP'si doğru mu? `ssh mennano@192.168.1.60` el ile çalışıyor mu? |
