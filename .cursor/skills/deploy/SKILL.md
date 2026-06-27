---
name: deploy
description: >-
  Değişiklikleri commit + push'la, sonra Raspberry Pi'ye SSH ile bağlanıp
  git pull + docker compose ile yeniden build et. Kullanıcı "deploy", "deploy et",
  "Pi'ye gönder", "raspberry'ye at", "yayına al", "hepsini yap" dediğinde kullan.
---

# deploy

Tam zincir: **commit → push → Raspberry Pi'de pull + docker rebuild**.

Kullanıcının manuel yaptığı işlemlerin otomatik hali:

```bash
ssh mennano@192.168.1.60
cd agora-voice-chatbot-web
git pull origin main
docker compose down && docker compose up -d --build
```

## Tetikleme ifadeleri

- `deploy`, `deploy et`, `yayına al`, `canlıya al`
- `pi'ye gönder`, `pi'ye at`, `raspberry'ye at`, `hepsini yap`, `tam zincir`
- İngilizce: `deploy`, `deploy to pi`, `ship it`

## Adımlar

1. **Önce commit + push** — Pi `git pull origin main` ile çektiği için, lokal
   değişiklikler push'lanmamışsa **eski kod deploy edilir**. Bu yüzden:
   - Commit'lenmemiş değişiklik varsa [commit] skill'inin adımlarını uygula
     (`git add -A` → anlamlı Türkçe commit mesajı → `git commit` → `git push origin main`).
   - Değişiklik yoksa doğrudan deploy adımına geç.
2. **Pi'ye deploy** — agent/non-interaktif context'ten **şifreyle** bağlan
   (SSH key passphrase'li; düz `ssh` non-interaktif ortamda passphrase prompt'unda
   **asılı kalır**). `sshpass` + şifre `tools/review-commit/.env` içindeki
   `PI_PASSWORD`'tan, ve mutlaka `PubkeyAuthentication=no` (yoksa şifreli key
   denenip takılır):
   ```bash
   export SSHPASS="$(grep '^PI_PASSWORD=' tools/review-commit/.env | cut -d= -f2-)"
   sshpass -e ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no \
     -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -o NumberOfPasswordPrompts=1 \
     -o ServerAliveInterval=15 -o ServerAliveCountMax=40 \
     mennano@192.168.1.60 'cd agora-voice-chatbot-web && git pull origin main && docker compose down && docker compose up -d --build'
   ```
   Build Pi'de birkaç dakika sürebilir → uzun komutu `run_in_background` ile çalıştır,
   çıktıyı dosyaya yaz; `tr`/`grep` pipe'ları çıktıyı buffer'lar, **doğrudan dosyaya
   yönlendir**.
3. SSH çıktısını oku, build'in bittiğini (`Container ... Started`, HTTP `200`)
   doğrula ve kullanıcıya özet ver. Sitenin host portu **3003** (`curl http://localhost:3003/`).

## Hedef bilgileri

| Alan | Değer |
|---|---|
| Pi host | `192.168.1.60` |
| Pi user | `mennano` |
| Repo dizini | `agora-voice-chatbot-web` |
| Branch | `main` |

## Sorun giderme

- **SSH passphrase'inde asılı kalıyor** → düz `ssh`/`sshpass` kullanırken
  `PubkeyAuthentication=no` koymayı unutma. Aksi halde `ssh` önce şifreli
  `id_rsa`/`id_ed25519` anahtarlarını dener, passphrase prompt'unda takılır
  (stdin yok → sonsuz bekler). Şifre auth'u 1 sn'de bağlanır.
- **Komut çıktısız "asılı" görünüyor** → `tr`/`grep` pipe'ı çıktıyı buffer'lıyor
  olabilir; SSH çıktısını doğrudan bir log dosyasına yönlendirip `Read` ile izle.
- **`git pull` çakışma/behind** → Pi'de lokal değişiklik olabilir; kullanıcıya
  bildir, otomatik `reset` yapma.
- **docker build hatası** → SSH çıktısındaki build log'unu kullanıcıya ilet.

## Not — downtime

Bu skill kullanıcının manuel akışını birebir izler: `docker compose down &&
up -d --build`. Bu, build süresince siteyi kısa süre kapatır. Sıfır/az downtime
isteniyorsa `down` atlanıp `docker compose up -d --build --remove-orphans`
kullanılabilir (bkz. `tools/review-commit` `PI_DEPLOY_CMD`).
