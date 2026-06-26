---
name: commit
description: >-
  Değişiklikleri stage'le, anlamlı bir Türkçe commit mesajı üret ve main'e
  push'la. Kullanıcı "commit", "commit et", "kaydet", "pushla", "gönder",
  "değişiklikleri kaydet" dediğinde kullan. Sadece kaydetme/yükleme istendiğinde;
  Pi'ye deploy istenirse [deploy] skill'ini kullan.
---

# commit

Çalışma ağacındaki değişiklikleri commit'le ve `origin main`'e push'la.

## Tetikleme ifadeleri

- `commit`, `commit et`, `kaydet`, `değişiklikleri kaydet`
- `push`, `pushla`, `yükle`, `gönder`
- İngilizce: `commit`, `save`, `push to main`

## Adımlar

1. Önce `git status` ve `git diff` ile neyin değiştiğine bak.
   - Değişiklik yoksa kullanıcıya "değişiklik yok" de ve dur.
2. `git add -A` ile tüm değişiklikleri stage'le.
3. Değişikliklere bakarak **anlamlı bir Türkçe conventional-commit mesajı** üret.
   - Format: `feat(...)`, `fix(...)`, `refactor(...)`, `chore(...)` vb.
   - Örnek: `feat(admin): serbest şarkı kaydı badge'i ekle`
4. Commit'le:
   ```bash
   git commit -m "<üretilen mesaj>"
   ```
5. `main`'e push'la (Pi `git pull origin main` ile çekiyor — push'lanmazsa
   eski kod deploy edilir):
   ```bash
   git push origin main
   ```
6. Kullanıcıya kısa özet ver: commit mesajı + push sonucu.

## Notlar

- Bu skill `main` branch'ine **doğrudan** commit + push yapar (projenin yerleşik
  akışı; Pi doğrudan `main`'den çeker). Branch açma.
- Push başarısız olursa (behind/auth) kullanıcıya net hata mesajını ilet.
- Deploy de isteniyorsa [deploy] skill'ini çağır — o önce bu commit adımını
  yapar, sonra Pi'ye gider.
