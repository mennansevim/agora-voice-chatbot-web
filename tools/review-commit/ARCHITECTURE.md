# Agent Mimarisi: Konuşma-Tabanlı Commit / Push / Deploy CLI

Bu doküman, `tools/review-commit/` altındaki agent'ın mimarisini ve onu **başka bir uygulamaya** taşırken neyi nasıl uyarlayacağını anlatır.

---

## 1. Tek cümleyle ne yapar?

Doğal dilde verilen tek bir Türkçe/İngilizce komutu — örn. *"en son değişiklikleri gönder"* — alıp, **git commit + git push + uzak sunucuya SSH deploy** zincirine çevirir; her aşamada interactive onay alır veya `--yes` ile sessiz çalışır.

```
Kullanıcı:  "en son değişiklikleri gönder"
   ↓
[Plan]   commit  →  push  →  deploy
   ↓
[Onay]   E/h
   ↓
[Çalıştır] git add -A && git commit + git push + ssh → docker compose
```

---

## 2. Tasarım hedefleri

| # | Hedef | Nasıl karşılandı |
|---|---|---|
| 1 | **Konuşma odaklı** | Plain-Türkçe komut → action plan'a çevrilir |
| 2 | **AI-bağımsız** | Provider abstraction; Ollama (lokal/ücretsiz) ↔ Cursor SDK ↔ vs. takılabilir |
| 3 | **Cürbel** (interactive ↔ otomatik) | Aynı binary `npm run review` ile insan, `--yes` ile makine kullanır |
| 4 | **Ucuz / ücretsiz default** | `qwen2.5:3b` lokal, internet gerekmiyor, kota yok |
| 5 | **Idempotent ve güvenli** | Her aşama ayrı exit code, push/deploy onayları, parola repo dışı (`.env`) |
| 6 | **Cursor agent ile entegre** | `.cursor/skills/<name>/SKILL.md` ile chat'ten otomatik çağırılır |

---

## 3. Yüksek seviye mimari

```
┌────────────────────────────────────────────────────────────────┐
│                          KULLANICI                             │
│           (terminal / Cursor chat / CI script)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ doğal dil komutu
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                      review.ts (orchestrator)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  interpretCommand()                                       │  │
│  │   ├─ defaultPlanForKeywords()  ← hızlı yol (AI yok)      │  │
│  │   └─ aiPrompt()                ← anlaşılmazsa AI yorumlar│  │
│  └──────────────────────┬────────────────────────────────────┘  │
│                          ▼ Plan { actions[], rationale }        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  executePlan()                                            │  │
│  │   ├─ runCommitFlow()  ─→ git status/diff + AI msg + git  │  │
│  │   ├─ runPushFlow()    ─→ git push                         │  │
│  │   └─ runDeployFlow()  ─→ deploy.ts (SSH)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────┴───────────┐
                ▼                      ▼
       ┌──────────────────┐    ┌──────────────────┐
       │     ai.ts        │    │    deploy.ts     │
       │  Provider abstr. │    │   SSH client     │
       │  ┌─Ollama────┐   │    │   (ssh2 lib)     │
       │  ├─Cursor    │   │    │  Pi → docker     │
       │  └─...       │   │    │     compose      │
       └──────────────────┘    └──────────────────┘
```

---

## 4. Katmanlar

### 4.1. Orchestrator (`review.ts`)

| Fonksiyon | Sorumluluk |
|---|---|
| `main()` | CLI arg parse (`--yes`), readline, plan onayı |
| `interpretCommand(input)` | Komutu `Plan`'a çevir |
| `defaultPlanForKeywords(input)` | Ön-tanımlı keyword eşleşmesi (hızlı yol) |
| `executePlan(plan)` | Action listesini sırayla çalıştır |
| `runCommitFlow()` | `git status`/`diff` → AI msg → onay → `git commit` |
| `runPushFlow(branch)` | branch doğrulama → `git push origin <branch>` |
| `runDeployFlow()` | `loadPiConfig()` + `runOnPi()` |
| `ask(question, autoAnswer)` | Readline wrapper, `AUTO_YES` modunda otomatik cevap |

### 4.2. AI Provider Abstraction (`ai.ts`)

```ts
interface AiResult { text: string; provider: AiProvider; model: string; }
async function aiPrompt(prompt: string): Promise<AiResult>;
function describeProvider(): string;
function ensureProviderReady(): { ok: true } | { ok: false; reason: string };
```

Yeni provider eklemek = `ai.ts` içine 1 fonksiyon (örn. `geminiPrompt()`) + `aiPrompt()`'a 1 if dalı + `.env`'de `AI_PROVIDER=gemini`.

### 4.3. Remote Execution (`deploy.ts`)

```ts
loadPiConfig(env): { config?: PiDeployConfig; missing: string[] };
runOnPi(config): Promise<{ exitCode, signal? }>;
```

`pty: true` ile stream'lenen output `process.stdout`'a real-time yazılır.

### 4.4. Konfigürasyon (`.env` + `dotenv`)

Tüm sırlar `.env`'de. Repo'ya `.env.example` template gider, `.env` `.gitignore`'da.

---

## 5. Veri Akışı: `Plan` & `Action`

```ts
type Action =
  | { type: "commit" }
  | { type: "push"; branch?: string }
  | { type: "deploy" };

interface Plan {
  actions: Action[];
  rationale: string;
}
```

Plan AI/keyword tarafından üretilen, kullanıcıya gösterilen ve onaylanan iş listesidir.

### 5.1. Keyword fallback

`defaultPlanForKeywords()` 5-6 yaygın ifadeyi anında yakalar → AI çağrısı yapılmaz. AI sadece nadir ifadelerde devreye girer (~%20).

### 5.2. AI fallback

`interpretCommand()` keyword bulamazsa AI'ya yapılandırılmış prompt yollar; cevap JSON parse edilir. Parse edilemezse **asla** crash olmaz: fallback `commit` planı döner.

---

## 6. Commit Flow Detayı

```
git status (porcelain)        ──→ değişiklik var mı?
git diff --staged --no-color  ──→ AI'a context (clip 100KB)
git diff --no-color           ──→ AI'a context (clip 100KB)
                                  ↓
buildCommitPrompt(...)            ↓
                                  ↓
aiPrompt(prompt)                  ↓ ~5s (Ollama 3b)
                                  ↓
parseCommitOutput(text):
  ── Yorum (Türkçe) ──
  ── Commit Mesajı ── (Conventional Commits)
                                  ↓
ask("[E]vet [D]üzenle [İ]ptal")
  E → git add -A && git commit -m
  D → readline ile yeni mesaj
  İ → return 0
```

---

## 7. Cürbel (interactive ↔ otomatik)

Tek bir `AUTO_YES` flag ve `ask()` wrapper'ı:

```ts
let AUTO_YES = false;
async function ask(q: string, autoAnswer = "e") {
  if (AUTO_YES) { console.log(`${q}[auto: ${autoAnswer}]`); return autoAnswer; }
  // ...readline
}
```

- İnsan: `npm run review`
- CI / Cursor agent / cron: `npm run review -- --yes "deploy"`

---

## 8. Exit Code Sözleşmesi

```
0  → success / kullanıcı iptal etti
1  → provider not ready (env eksik, Ollama açık değil)
2  → AI run hatası
3  → git commit başarısız
4  → git push başarısız
5  → SSH veya deploy başarısız
6  → Pi config eksik
```

Her dış sistem ayrı kod aralığına sahip; CI script'leri `$?` ile spesifik hatayı yakalayabilir.

---

## 9. Hata Yönetimi

`AiError` özel sınıfı `provider` ve `retryable` taşır. `ExecaError` shell komutları için yakalanır, `stdout`/`stderr` korunur. Plan üretme garantisi: AI parse edilemese bile asla crash olmaz, `commit` fallback'i çalışır.

---

## 10. Cursor Skill Entegrasyonu

`.cursor/skills/<skill-name>/SKILL.md` agent'a şunları öğretir:

1. **Trigger ifadeleri**: hangi Türkçe/İngilizce ifadeler bu tool'u tetikler
2. **Çağrı şekli**: `cd <tool-dir> && npm run review -- --yes "<command>"`
3. **Onay protokolü**: push/deploy gibi geri-dönülemez aksiyonlar için chat'te kullanıcıya `AskQuestion` ile sor
4. **Exit code yorumu**: kod → kullanıcı dostu mesaj

---

## 11. Bağımlılıklar

| Paket | Neden |
|---|---|
| `tsx` | TypeScript runner, derleme yok |
| `execa` | Promise tabanlı subprocess |
| `dotenv` | `.env` standart |
| `ssh2` | Saf JS SSH client, password+key destekler |
| `@cursor/sdk` (opsiyonel) | Sadece `AI_PROVIDER=cursor` kullanılırsa |

---

## 12. Klasör Yapısı

```
<repo-root>/
├── .gitignore                   # .env, node_modules
├── tools/
│   └── review-commit/
│       ├── .env                 # parolalar, NEVER commit
│       ├── .env.example
│       ├── .gitignore
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md
│       ├── ARCHITECTURE.md
│       ├── review.ts            # orchestrator
│       ├── ai.ts                # provider abstraction
│       ├── deploy.ts            # SSH/uzak çalıştırma
│       └── _smoke.ts            # provider sağlık testi
└── .cursor/
    └── skills/
        └── agoravoice-deploy/
            └── SKILL.md         # Cursor agent → tool eşlemesi
```

---

## 13. Başka Bir Uygulamaya Taşıma

Yeni proje, farklı action set'i:

1. **Klasörü kopyala**: `cp -R tools/review-commit/ ../yeni-proje/tools/api-redeploy/`
2. **`.env`'yi sil**: eski sırlar gitsin
3. **`Action` union'ını güncelle**: domain'e özel action tipleri ekle
4. **`runXFlow()` fonksiyonu yaz**: action başına bir tane
5. **`executePlan` switch'ine ekle**
6. **`defaultPlanForKeywords`'e domain keyword'lerini ekle**
7. **AI prompt şablonundaki `MEVCUT ACTIONS` listesini güncelle**
8. **`.env.example`'a domain env vars ekle**
9. **`.cursor/skills/<yeni-proje>-deploy/SKILL.md` yaz**
10. **Gerekmeyen parçaları sil** (SSH yoksa `deploy.ts` + `ssh2`; AI yoksa `ai.ts` + sadece keyword)

---

## 14. Genişletme Örnekleri

### 14.1. Yeni AI provider (Gemini, Anthropic, OpenAI)

`ai.ts`'ye yeni fonksiyon + `aiPrompt()` switch'ine branch:

```ts
async function geminiPrompt(prompt: string): Promise<AiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiError("GEMINI_API_KEY yok", "gemini");
  // ...fetch + parse
  return { text, provider: "gemini", model };
}
```

### 14.2. Yeni action (lint, test, migrate, notify-slack)

Pattern: Action union → runXFlow() → executePlan switch → keyword fallback → AI prompt → SKILL.md.

---

## 15. Anti-Patterns

| ❌ | ✅ |
|---|---|
| Tüm logic'i tek `main()` içinde | Action/provider'ları ayrı katmanlar |
| AI'ı senkronize tek path | Keyword fallback ile %80 vakayı AI'sız çöz |
| Onay sadece interactive | Hem interactive hem `--yes` |
| Parolayı kodda hardcode | `.env` + `.gitignore` |
| Tüm hatalar exit 1 | Sistem başına ayrı kod aralığı |
| Cursor agent stdin'e cevap göndersin | Tool'a `--yes` flag, agent onu kullansın |

---

## 16. Test ve Doğrulama

```bash
# Provider doğru kurulu mu?
npm run smoke

# Keyword fallback (AI'a gitmemeli, hızlı)
time npm run review -- --yes "deploy"

# AI yorumlama
echo "test" >> README.md
npm run review -- --yes "commit"

# Tüm zincir
npm run review -- --yes "en son değişiklikleri gönder"
```

---

## 17. Sözlük

| Terim | Anlamı |
|---|---|
| **Plan** | Yapılacak action'ların sıralı listesi + Türkçe rationale |
| **Action** | Tek bir atomik iş (commit, push, deploy) |
| **Provider** | AI'nın geldiği kaynak (Ollama, Cursor, ...) |
| **Flow** | Bir action'ı yerine getiren async fonksiyon (`runXFlow()`) |
| **Auto-yes** | İnteraktif promptları otomatik onaylayan mod |
| **Skill** | Cursor agent'a tool'un nasıl çağrılacağını öğreten markdown |

---

**Sonuç**: Bu mimari, `Plan + Action + Provider abstraction + Auto-yes flag + Cursor skill` olarak 5 küçük desenin birleşimidir. Her biri bağımsız taşınabilir.
