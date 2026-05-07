/**
 * AI provider abstraction.
 *
 * Provider seçimi `process.env.AI_PROVIDER` ile yapılır.
 * Yeni provider eklemek için: yeni bir `xxxPrompt()` fonksiyonu yaz,
 * `aiPrompt()` switch'ine bir branch ekle.
 */

export type AiProvider = "ollama" | "cursor";

export interface AiResult {
  text: string;
  provider: AiProvider;
  model: string;
}

export class AiError extends Error {
  constructor(
    message: string,
    public readonly provider: AiProvider,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "AiError";
  }
}

function getProvider(): AiProvider {
  const raw = (process.env.AI_PROVIDER ?? "ollama").toLowerCase().trim();
  if (raw === "ollama" || raw === "cursor") return raw;
  throw new AiError(
    `Bilinmeyen AI_PROVIDER='${raw}'. Geçerli: ollama, cursor`,
    "ollama",
  );
}

function ollamaUrl(): string {
  return (process.env.OLLAMA_URL ?? "http://localhost:11434").replace(/\/$/, "");
}

function ollamaModel(): string {
  return process.env.OLLAMA_MODEL ?? "qwen2.5:3b";
}

export function describeProvider(): string {
  try {
    const provider = getProvider();
    if (provider === "ollama") {
      return `ollama (${ollamaModel()} @ ${ollamaUrl()})`;
    }
    if (provider === "cursor") {
      const model = process.env.CURSOR_MODEL ?? "default";
      return `cursor (${model})`;
    }
    return provider;
  } catch (err) {
    return `INVALID (${(err as Error).message})`;
  }
}

export function ensureProviderReady(): { ok: true } | { ok: false; reason: string } {
  let provider: AiProvider;
  try {
    provider = getProvider();
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }

  if (provider === "ollama") {
    const url = ollamaUrl();
    const model = ollamaModel();
    if (!url) return { ok: false, reason: "OLLAMA_URL boş." };
    if (!model) return { ok: false, reason: "OLLAMA_MODEL boş." };
    return { ok: true };
  }

  if (provider === "cursor") {
    if (!process.env.CURSOR_API_KEY) {
      return { ok: false, reason: "CURSOR_API_KEY tanımlı değil." };
    }
    return { ok: true };
  }

  return { ok: false, reason: `Bilinmeyen provider: ${provider}` };
}

async function ollamaPrompt(prompt: string): Promise<AiResult> {
  const url = ollamaUrl();
  const model = ollamaModel();
  let res: Response;
  try {
    res = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_ctx: 8192,
        },
      }),
    });
  } catch (err) {
    throw new AiError(
      `Ollama'ya bağlanılamadı (${url}): ${(err as Error).message}. ` +
        `Ollama açık mı? 'ollama serve' çalışıyor mu?`,
      "ollama",
      true,
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 404 && body.toLowerCase().includes("model")) {
      throw new AiError(
        `Ollama modeli bulunamadı: '${model}'. ` +
          `Çekmek için: ollama pull ${model}`,
        "ollama",
        false,
      );
    }
    throw new AiError(
      `Ollama HTTP ${res.status}: ${body.slice(0, 500)}`,
      "ollama",
      res.status >= 500,
    );
  }

  const data = (await res.json()) as { response?: string };
  const text = (data.response ?? "").trim();
  if (!text) {
    throw new AiError("Ollama boş cevap döndü.", "ollama", true);
  }
  return { text, provider: "ollama", model };
}

async function cursorPrompt(prompt: string): Promise<AiResult> {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new AiError("CURSOR_API_KEY yok.", "cursor", false);
  }

  let sdk: { Agent: { prompt: (args: { apiKey: string; model: string; prompt: string }) => Promise<unknown> } };
  try {
    // Dynamic import — kurulu değilse runtime hata, default ollama kullananları etkilemez.
    sdk = (await import(/* @vite-ignore */ "@cursor/sdk" as string)) as typeof sdk;
  } catch {
    throw new AiError(
      "@cursor/sdk kurulu değil. 'npm i @cursor/sdk' ile kur.",
      "cursor",
      false,
    );
  }

  const model = process.env.CURSOR_MODEL ?? "composer-2-fast";
  try {
    const out = await sdk.Agent.prompt({ apiKey, model, prompt });
    const text =
      typeof out === "string"
        ? out
        : ((out as { text?: string })?.text ?? JSON.stringify(out));
    return { text: text.trim(), provider: "cursor", model };
  } catch (err) {
    throw new AiError(
      `Cursor SDK hatası: ${(err as Error).message}`,
      "cursor",
      true,
    );
  }
}

export async function aiPrompt(prompt: string): Promise<AiResult> {
  const provider = getProvider();
  if (provider === "ollama") return ollamaPrompt(prompt);
  if (provider === "cursor") return cursorPrompt(prompt);
  throw new AiError(`Bilinmeyen provider: ${provider as string}`, "ollama");
}
