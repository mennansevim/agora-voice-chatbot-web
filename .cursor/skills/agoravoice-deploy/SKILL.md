---
name: agoravoice-deploy
description: >-
  Run the project's review-commit tool to handle git commit, push, and Raspberry
  Pi deployment from natural-language commands. Use when the user says "commit
  et", "pushla", "deploy et", "en son değişiklikleri gönder", "Pi'ye gönder",
  "hepsini yap", or English equivalents like "commit", "push", "deploy", "ship
  it", "deploy to pi".
---

# agoravoice-deploy

`tools/review-commit/` altındaki agent ile commit + push + Pi-deploy zincirini çalıştır.

## Tetikleme ifadeleri (TR / EN)

- `commit`, `commit et`, `kaydet`
- `push`, `pushla`, `yükle`, `gönder`
- `deploy`, `deploy et`, `pi'ye at`, `raspberry'ye at`
- `en son değişiklikleri gönder`, `hepsini yap`, `pi'ye gönder`, `tam zincir`
- İngilizce: `commit`, `push to main`, `deploy to pi`, `ship it`

## Çağrı şekli

Her zaman `--yes` flag ile çağır (chat/agent contextinde stdin yok):

```bash
cd tools/review-commit && npm run review -- --yes "<kullanıcının ham komutu>"
```

Örnek:

```bash
cd tools/review-commit && npm run review -- --yes "en son değişiklikleri gönder"
```

## Workflow

1. **ÖNCE onay al** — geri-dönülemez aksiyon (push, deploy) içeren komutlarda `AskQuestion` ile kullanıcıdan açık onay iste:
   - Sadece `commit` ise direkt çalıştırabilirsin.
   - `push` veya `deploy` varsa onay zorunlu.
2. Onay sonrası `Shell` ile `cd tools/review-commit && npm run review -- --yes "..."` çalıştır.
3. Çıktıyı oku, exit code'u yorumla, kullanıcıya özet ver.

## Exit code yorumu

| Kod | Anlam | Kullanıcıya söyle |
|---|---|---|
| 0 | Başarılı | "Tamam, [yapılanlar listesi] çalıştı." |
| 1 | Provider hazır değil | "Ollama açık değil veya .env eksik — `ollama serve` çalışıyor mu?" |
| 2 | AI hatası | "AI cevap vermedi, tekrar dene." |
| 3 | git commit başarısız | "Commit atılamadı (örn. boş mesaj, hook hatası). Loglara bak." |
| 4 | git push başarısız | "Remote push reddedildi (örn. behind, auth)." |
| 5 | SSH/deploy hatası | "Pi'ye bağlanılamadı veya deploy komutu hata verdi." |
| 6 | Pi config eksik | "`.env` içinde `PI_HOST/PI_USER/PI_PASSWORD` boş olabilir." |

## Ne zaman kullanma

- Kullanıcı **sadece kod sorusu** soruyorsa, mimariyi tartışıyorsa veya henüz değişiklik yoksa.
- Kullanıcı **belirli bir branch'e merge / PR** istiyorsa (bu tool sadece `origin/<current-branch>` push yapar).
- Kullanıcı **Pi dışında bir hedefe** deploy istiyorsa.

## Güvenlik guard'ı (otomatik)

Plan AI (lokal `qwen2.5:3b`) veya keyword ile üretilir; küçük model bazen
`commit`'i atlayabilir. Bunu engellemek için tool, planı çalıştırmadan önce git
durumuna göre **otomatik düzeltir** (`normalizePlan`):

- Plan `push`/`deploy` içeriyor **ve** commit'lenmemiş değişiklik varsa → başa `commit` eklenir.
- Plan `deploy` içeriyorsa → öncesine `push` eklenir (Pi `git pull` ile çeker;
  push'lanmamış commit Pi'ye gitmez, yoksa **eski kod deploy edilir**).
- Sıralama her zaman **commit → push → deploy** olur.

Yani "deploy" desen bile, commit'lenmemiş değişiklik varsa tool önce commit + push yapar.
Planda `[güvenlik: ...]` notu görürsen guard devreye girmiş demektir.

## Notlar

- Tool, `tools/review-commit/.env` içindeki `PI_*` değerlerini kullanır. Eksik alan varsa exit 6 döner; `.env.example` referans olarak bakılabilir.
- AI provider varsayılan **Ollama** (lokal, ücretsiz, `qwen2.5:3b`). Cursor SDK'ya geçmek için `.env` `AI_PROVIDER=cursor`.
- Tool her zaman idempotent: değişiklik yoksa commit atılmaz (exit 0).
- **Deploy komutu** (`PI_DEPLOY_CMD`) artık ayrı `docker compose down` yapmaz:
  `git pull && docker compose up -d --build --remove-orphans`. Eski container
  build bitene kadar ayakta kalır → site dakikalarca kapalı kalmaz, yeni image
  hazır olunca saniyeler içinde yenilenir.
