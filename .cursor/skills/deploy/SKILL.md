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
2. **Pi'ye deploy** — tek SSH komutuyla pull + rebuild:
   ```bash
   ssh mennano@192.168.1.60 'cd agora-voice-chatbot-web && git pull origin main && docker compose down && docker compose up -d --build'
   ```
3. SSH çıktısını oku, build'in bittiğini (`Container ... Started`) doğrula ve
   kullanıcıya özet ver.

## Hedef bilgileri

| Alan | Değer |
|---|---|
| Pi host | `192.168.1.60` |
| Pi user | `mennano` |
| Repo dizini | `agora-voice-chatbot-web` |
| Branch | `main` |

## Sorun giderme

- **SSH passphrase istiyor** → SSH key passphrase'li (`id_rsa`). Komut takılırsa
  kullanıcıdan terminalde `ssh-add` ile key'i agent'a eklemesini iste, ya da
  deploy'u manuel çalıştırmasını söyle.
- **`git pull` çakışma/behind** → Pi'de lokal değişiklik olabilir; kullanıcıya
  bildir, otomatik `reset` yapma.
- **docker build hatası** → SSH çıktısındaki build log'unu kullanıcıya ilet.

## Not — downtime

Bu skill kullanıcının manuel akışını birebir izler: `docker compose down &&
up -d --build`. Bu, build süresince siteyi kısa süre kapatır. Sıfır/az downtime
isteniyorsa `down` atlanıp `docker compose up -d --build --remove-orphans`
kullanılabilir (bkz. `tools/review-commit` `PI_DEPLOY_CMD`).
