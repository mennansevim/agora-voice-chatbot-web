/**
 * AI provider'ın doğru kurulduğunu doğrulayan minimal smoke test.
 * Kullanım: npm run smoke
 */

import "dotenv/config";
import { aiPrompt, describeProvider, ensureProviderReady } from "./ai.ts";

async function main() {
  console.log("Provider:", describeProvider());
  const ready = ensureProviderReady();
  console.log("Ready:", ready);
  if (!ready.ok) {
    console.error("Provider hazır değil — abort.");
    process.exit(1);
  }
  const result = await aiPrompt(
    "Test prompt: '5+3 kaç?' Sadece sayıyı tek satır olarak döndür.",
  );
  console.log("Provider:", result.provider);
  console.log("Model:", result.model);
  console.log("Cevap:", result.text);
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
