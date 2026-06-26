#!/usr/bin/env tsx
/**
 * Konuşma-tabanlı commit / push / deploy CLI.
 *
 * Kullanım:
 *   npm run review                              # interaktif, stdin'den komut iste
 *   npm run review -- "en son değişiklikleri gönder"
 *   npm run review -- --yes "deploy"            # otomatik onay (CI/cron için)
 */

import "dotenv/config";
import { execa, ExecaError } from "execa";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  aiPrompt,
  AiError,
  describeProvider,
  ensureProviderReady,
} from "./ai.ts";
import { loadPiConfig, runOnPi } from "./deploy.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Repo root = tools/review-commit/../../
const REPO_ROOT = resolve(__dirname, "..", "..");

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const c = (color: keyof typeof colors, s: string) =>
  `${colors[color]}${s}${colors.reset}`;

let AUTO_YES = false;

// ─── Tipler ────────────────────────────────────────────────────────

type Action =
  | { type: "commit" }
  | { type: "push"; branch?: string }
  | { type: "deploy" };

interface Plan {
  actions: Action[];
  rationale: string;
}

// ─── Yardımcılar ───────────────────────────────────────────────────

async function ask(question: string, autoAnswer = "e"): Promise<string> {
  if (AUTO_YES) {
    process.stdout.write(`${question}${c("dim", `[auto: ${autoAnswer}]`)}\n`);
    return autoAnswer;
  }
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(question);
    return answer.trim();
  } finally {
    rl.close();
  }
}

function isYes(answer: string): boolean {
  const a = answer.toLowerCase().trim();
  return a === "" || a === "e" || a === "evet" || a === "y" || a === "yes";
}

async function git(args: string[], opts: { stdio?: "inherit" | "pipe" } = {}): Promise<string> {
  const { stdout } = await execa("git", args, {
    cwd: REPO_ROOT,
    stdio: opts.stdio === "inherit" ? "inherit" : "pipe",
  });
  return stdout ?? "";
}

/** Working tree'de commit'lenmemiş (staged/unstaged/untracked) değişiklik var mı? */
async function gitHasUncommitted(): Promise<boolean> {
  const s = await git(["status", "--porcelain"]).catch(() => "");
  return s.trim().length > 0;
}

/** HEAD, origin/<branch>'in önünde mi? (push edilmemiş local commit var mı) */
async function gitHasUnpushed(branch: string): Promise<boolean> {
  try {
    const count = await git(["rev-list", "--count", `origin/${branch}..HEAD`]);
    return Number(count.trim()) > 0;
  } catch {
    // origin/<branch> ref'i yoksa (ilk push vs.) → push gerekebilir, güvenli taraf.
    return true;
  }
}

async function currentBranch(): Promise<string> {
  try {
    return (await git(["rev-parse", "--abbrev-ref", "HEAD"])).trim() || "main";
  } catch {
    return "main";
  }
}

// ─── Plan üretimi ──────────────────────────────────────────────────

function defaultPlanForKeywords(input: string): Plan | null {
  const t = input.toLowerCase().trim();

  if (!t) {
    return {
      actions: [{ type: "commit" }],
      rationale: "Boş komut → varsayılan: sadece commit.",
    };
  }

  if (/^(commit|kaydet|kaydet et|commit et)$/.test(t)) {
    return {
      actions: [{ type: "commit" }],
      rationale: "Sadece commit yapılacak.",
    };
  }

  if (/^(push|pushla|yükle|gönder)$/.test(t)) {
    return {
      actions: [{ type: "commit" }, { type: "push" }],
      rationale: "Commit + push (uzaktaki branch'e gönder).",
    };
  }

  if (/^(deploy|deploy et|pi'?ye at|raspberry'?ye at)$/.test(t)) {
    return {
      actions: [{ type: "deploy" }],
      rationale: "Yalnızca Pi'de redeploy (commit yok).",
    };
  }

  // Compound: tam zincir — commit + push + deploy (her sıralama, +/-/, ile)
  const tokens = t.split(/[\s,+\-/]+/).filter(Boolean);
  const hasCommit = tokens.some((x) => /^(commit|kaydet)$/.test(x));
  const hasPush = tokens.some((x) => /^(push|pushla|yükle|gönder)$/.test(x));
  const hasDeploy = tokens.some((x) => /^(deploy|deployla)$/.test(x));

  if (hasCommit && hasPush && hasDeploy) {
    return {
      actions: [{ type: "commit" }, { type: "push" }, { type: "deploy" }],
      rationale: "Tam zincir: commit + push + Pi deploy.",
    };
  }
  if (hasCommit && hasPush) {
    return {
      actions: [{ type: "commit" }, { type: "push" }],
      rationale: "Commit + push.",
    };
  }
  if (hasPush && hasDeploy) {
    return {
      actions: [{ type: "push" }, { type: "deploy" }],
      rationale: "Push + Pi deploy.",
    };
  }
  if (hasCommit && hasDeploy) {
    return {
      actions: [{ type: "commit" }, { type: "push" }, { type: "deploy" }],
      rationale: "Commit + deploy istendi → push da gerekli, tam zincir.",
    };
  }

  if (
    /(en son değişiklikleri gönder|hepsini yap|her şeyi gönder|pi'?ye gönder|tam zincir|full deploy|ship it)/.test(
      t,
    )
  ) {
    return {
      actions: [{ type: "commit" }, { type: "push" }, { type: "deploy" }],
      rationale: "Tam zincir: commit + push + Pi deploy.",
    };
  }

  return null;
}

function parseAiPlan(text: string): Plan | null {
  const match = text.match(/\{[\s\S]*"actions"[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]) as {
      actions?: unknown;
      rationale?: unknown;
    };
    if (!Array.isArray(obj.actions)) return null;
    const actions: Action[] = [];
    for (const raw of obj.actions) {
      if (!raw || typeof raw !== "object") return null;
      const a = raw as { type?: unknown; branch?: unknown };
      if (a.type === "commit") actions.push({ type: "commit" });
      else if (a.type === "push")
        actions.push({
          type: "push",
          branch: typeof a.branch === "string" ? a.branch : undefined,
        });
      else if (a.type === "deploy") actions.push({ type: "deploy" });
      else return null;
    }
    return {
      actions,
      rationale:
        typeof obj.rationale === "string" && obj.rationale.trim()
          ? obj.rationale.trim()
          : "AI tarafından üretildi.",
    };
  } catch {
    return null;
  }
}

async function interpretCommand(input: string): Promise<Plan> {
  const keyword = defaultPlanForKeywords(input);
  if (keyword) return keyword;

  const prompt =
    `Kullanıcı CLI tool'a Türkçe/İngilizce komut verdi. Bu komutu action'lara çevir.\n\n` +
    `KOMUT: "${input}"\n\n` +
    `MEVCUT ACTIONS:\n` +
    `- {"type":"commit"}              → git add -A + git commit (AI mesaj üretir)\n` +
    `- {"type":"push","branch":"..."} → git push origin <branch> (branch opsiyonel)\n` +
    `- {"type":"deploy"}              → SSH ile Raspberry Pi'ye deploy\n\n` +
    `KURALLAR:\n` +
    `- Sıralama önemli: önce commit, sonra push, sonra deploy.\n` +
    `- Anlamadıysan SADECE commit'i seç.\n` +
    `- "deploy" varsa ondan önce push gerekir mi diye düşün.\n` +
    `- Cevap SADECE şu formatta tek bir JSON objesi olsun (markdown YOK, açıklama YOK):\n` +
    `{"actions":[{"type":"commit"}],"rationale":"<1-2 cümle Türkçe gerekçe>"}`;

  try {
    const result = await aiPrompt(prompt);
    const plan = parseAiPlan(result.text);
    if (plan) return plan;
  } catch (err) {
    console.error(c("yellow", `⚠ AI yorumlama başarısız: ${(err as Error).message}`));
  }

  return {
    actions: [{ type: "commit" }],
    rationale: "AI parse edilemedi → varsayılan commit'e düşüldü.",
  };
}

/**
 * Planı git durumuna göre güvenli hale getirir. AI/keyword planı eksik veya
 * tutarsız olsa bile şu değişmezleri (invariant) zorlar:
 *
 *  - push veya deploy isteniyorsa ve commit'lenmemiş değişiklik varsa → önce commit.
 *  - deploy isteniyorsa → önce push (Pi `git pull` ile güncel kodu çeker; push
 *    edilmemiş commit'ler Pi'ye gitmez, eski kod deploy edilir).
 *  - Sıralama her zaman commit → push → deploy olur; tekrarlar ayıklanır.
 *
 * Böylece yerel küçük model (qwen 3B) "commit"i atlasa bile araç asla
 * commit'lenmemiş/push'lanmamış kodu deploy etmez.
 */
async function normalizePlan(plan: Plan): Promise<Plan> {
  const wantsDeploy = plan.actions.some((a) => a.type === "deploy");
  const wantsPush = plan.actions.some((a) => a.type === "push");

  // commit-only plan → dokunma.
  if (!wantsDeploy && !wantsPush) return plan;

  const pushAction = plan.actions.find((a) => a.type === "push") as
    | Extract<Action, { type: "push" }>
    | undefined;

  const notes: string[] = [];
  let needCommit = plan.actions.some((a) => a.type === "commit");
  let needPush = wantsPush;

  if (!needCommit && (await gitHasUncommitted())) {
    needCommit = true;
    notes.push("commit'lenmemiş değişiklik var → commit eklendi");
  }

  if (wantsDeploy && !needPush) {
    const branch = pushAction?.branch ?? (await currentBranch());
    if (needCommit || (await gitHasUnpushed(branch))) {
      needPush = true;
      notes.push("deploy öncesi push gerekli (Pi 'git pull' yapıyor) → push eklendi");
    }
  }

  if (needCommit && !needPush) {
    needPush = true;
    notes.push("commit sonrası push gerekli → push eklendi");
  }

  const ordered: Action[] = [];
  if (needCommit) ordered.push({ type: "commit" });
  if (needPush) ordered.push({ type: "push", branch: pushAction?.branch });
  if (wantsDeploy) ordered.push({ type: "deploy" });

  if (notes.length === 0) {
    return { actions: ordered, rationale: plan.rationale };
  }
  return {
    actions: ordered,
    rationale: `${plan.rationale} [güvenlik: ${notes.join("; ")}]`,
  };
}

function describeAction(a: Action): string {
  if (a.type === "commit") return "git add -A + git commit (AI mesajı)";
  if (a.type === "push")
    return `git push origin ${a.branch ?? "<current-branch>"}`;
  if (a.type === "deploy") return "SSH → Raspberry Pi deploy";
  return JSON.stringify(a);
}

// ─── Commit flow ───────────────────────────────────────────────────

const MAX_DIFF_BYTES = 100 * 1024;
function clipDiff(diff: string): string {
  if (diff.length <= MAX_DIFF_BYTES) return diff;
  return diff.slice(0, MAX_DIFF_BYTES) + "\n...[clipped]...";
}

function buildCommitPrompt(
  status: string,
  stagedDiff: string,
  unstagedDiff: string,
): string {
  return (
    `Sen yardımcı bir Türkçe konuşan kod inceleme asistanısın.\n\n` +
    `Aşağıdaki git değişikliklerini incele ve TAM OLARAK iki bölüm üret:\n\n` +
    `── Değişiklik Yorumu ──\n` +
    `Burada 2-4 cümlelik Türkçe özet yaz. Ne, neden değişti?\n\n` +
    `── Önerilen Commit Mesajı ──\n` +
    `Burada **Conventional Commits** formatında tek satırlık İngilizce mesaj yaz.\n` +
    `Örnekler: feat(api): add ..., fix(ui): handle ..., refactor: split ..., chore: bump deps\n\n` +
    `Başka HİÇBİR şey yazma. Sadece bu iki bölüm.\n\n` +
    `--- git status ---\n${status}\n\n` +
    `--- git diff --staged ---\n${clipDiff(stagedDiff)}\n\n` +
    `--- git diff (unstaged) ---\n${clipDiff(unstagedDiff)}\n`
  );
}

interface CommitParts {
  comment: string;
  message: string;
}

function parseCommitOutput(text: string): CommitParts {
  const commentMatch = text.match(
    /──\s*Değişiklik Yorumu\s*──\s*([\s\S]*?)(?=──\s*Önerilen Commit Mesajı\s*──|$)/i,
  );
  const messageMatch = text.match(
    /──\s*Önerilen Commit Mesajı\s*──\s*([\s\S]*)$/i,
  );
  let comment = (commentMatch?.[1] ?? "").trim();
  let message = (messageMatch?.[1] ?? "").trim();

  message = message.split("\n").map((l) => l.trim()).filter(Boolean)[0] ?? "";
  message = message.replace(/^[`'"*-]+|[`'"*]+$/g, "").trim();

  if (!comment) comment = "(Yorum üretilemedi.)";
  if (!message) message = "chore: update";
  return { comment, message };
}

async function runCommitFlow(): Promise<number> {
  console.log(c("cyan", "\n▶ Commit flow başlıyor..."));

  const status = await git(["status", "--porcelain"]);
  if (!status.trim()) {
    console.log(c("yellow", "  Değişiklik yok. Commit atılmayacak."));
    return 0;
  }

  console.log(c("dim", "  git status:"));
  console.log(
    status
      .split("\n")
      .map((l) => `    ${l}`)
      .join("\n"),
  );

  const stagedDiff = await git(["diff", "--staged", "--no-color"]).catch(
    () => "",
  );
  const unstagedDiff = await git(["diff", "--no-color"]).catch(() => "");

  console.log(c("dim", `  Provider: ${describeProvider()}`));
  console.log(c("dim", "  AI mesaj üretiliyor..."));

  let aiText: string;
  try {
    const r = await aiPrompt(buildCommitPrompt(status, stagedDiff, unstagedDiff));
    aiText = r.text;
  } catch (err) {
    console.error(c("red", `✗ AI hatası: ${(err as Error).message}`));
    if (err instanceof AiError && err.retryable) {
      console.error(c("dim", "  (retryable hata)"));
    }
    return 2;
  }

  const { comment, message } = parseCommitOutput(aiText);

  console.log(c("bold", "\n── Değişiklik Yorumu ──"));
  console.log(comment);
  console.log(c("bold", "\n── Önerilen Commit Mesajı ──"));
  console.log(c("green", message));

  const choice = await ask(
    `\n[E]vet kabul et / [D]üzenle / [İ]ptal (varsayılan: E): `,
    "e",
  );
  const norm = choice.toLowerCase().trim();

  let finalMessage = message;
  if (norm === "i" || norm === "iptal" || norm === "n" || norm === "no") {
    console.log(c("yellow", "  Commit iptal edildi."));
    return 0;
  }
  if (norm === "d" || norm === "düzenle" || norm === "duzenle" || norm === "edit") {
    const edited = await ask(
      `Yeni commit mesajı (boş bırakırsan AI'ınkini kullanır): `,
      "",
    );
    if (edited.trim()) finalMessage = edited.trim();
  }

  try {
    await execa("git", ["add", "-A"], { cwd: REPO_ROOT, stdio: "inherit" });
    await execa("git", ["commit", "-m", finalMessage], {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
    console.log(c("green", `✓ Commit oluşturuldu: ${finalMessage}`));
    return 0;
  } catch (err) {
    if (err instanceof ExecaError) {
      console.error(c("red", `✗ git commit başarısız: ${err.shortMessage}`));
      if (err.stderr) console.error(err.stderr);
    } else {
      console.error(c("red", `✗ Beklenmedik hata: ${(err as Error).message}`));
    }
    return 3;
  }
}

// ─── Push flow ─────────────────────────────────────────────────────

async function runPushFlow(branch?: string): Promise<number> {
  console.log(c("cyan", "\n▶ Push flow başlıyor..."));

  let target = branch;
  if (!target) {
    try {
      target = (await git(["rev-parse", "--abbrev-ref", "HEAD"])).trim();
    } catch {
      target = "main";
    }
  }
  console.log(c("dim", `  Branch: ${target}`));

  const confirm = await ask(
    `Push origin/${target} onaylanıyor mu? [E/h] (varsayılan E): `,
    "e",
  );
  if (!isYes(confirm)) {
    console.log(c("yellow", "  Push iptal edildi."));
    return 0;
  }

  try {
    await execa("git", ["push", "origin", target], {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
    console.log(c("green", `✓ Push tamam: origin/${target}`));
    return 0;
  } catch (err) {
    if (err instanceof ExecaError) {
      console.error(c("red", `✗ git push başarısız: ${err.shortMessage}`));
      if (err.stderr) console.error(err.stderr);
    } else {
      console.error(c("red", `✗ Beklenmedik hata: ${(err as Error).message}`));
    }
    return 4;
  }
}

// ─── Deploy flow ───────────────────────────────────────────────────

async function runDeployFlow(): Promise<number> {
  console.log(c("cyan", "\n▶ Deploy flow başlıyor..."));

  const { config, missing } = loadPiConfig(process.env);
  if (!config) {
    console.error(
      c("red", `✗ Pi config eksik. Eksik alanlar: ${missing.join(", ")}`),
    );
    console.error(c("dim", "  .env dosyasını kontrol et (.env.example referans)."));
    return 6;
  }

  console.log(c("dim", `  Hedef: ${config.user}@${config.host}:${config.port}`));
  console.log(c("dim", `  Repo: ~/${config.repoDir}`));
  console.log(c("dim", `  Komut: ${config.command}`));

  const confirm = await ask(
    `Pi'ye deploy onaylanıyor mu? [E/h] (varsayılan E): `,
    "e",
  );
  if (!isYes(confirm)) {
    console.log(c("yellow", "  Deploy iptal edildi."));
    return 0;
  }

  try {
    const { exitCode, signal } = await runOnPi(config);
    if (exitCode !== 0) {
      console.error(
        c(
          "red",
          `✗ Pi komut hata kodu döndü: exit=${exitCode}${signal ? ` signal=${signal}` : ""}`,
        ),
      );
      return 5;
    }
    console.log(c("green", `✓ Pi deploy tamam.`));
    return 0;
  } catch (err) {
    console.error(c("red", `✗ SSH/deploy hatası: ${(err as Error).message}`));
    return 5;
  }
}

// ─── Plan executor ─────────────────────────────────────────────────

async function executePlan(plan: Plan): Promise<number> {
  for (let i = 0; i < plan.actions.length; i++) {
    const action = plan.actions[i];
    console.log(
      c("magenta", `\n[Adım ${i + 1}/${plan.actions.length}] ${describeAction(action)}`),
    );

    let code = 0;
    if (action.type === "commit") code = await runCommitFlow();
    else if (action.type === "push") code = await runPushFlow(action.branch);
    else if (action.type === "deploy") code = await runDeployFlow();

    if (code !== 0) return code;
  }
  return 0;
}

// ─── main ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const yesFlag = rawArgs.some((a) => a === "--yes" || a === "-y");
  AUTO_YES = yesFlag;
  const cliInput = rawArgs.filter((a) => a !== "--yes" && a !== "-y").join(" ").trim();

  console.log(c("bold", "🤖 review-commit · konuşma-tabanlı git agent"));
  console.log(c("dim", `   Provider: ${describeProvider()}`));
  if (AUTO_YES) console.log(c("yellow", "   Mode: AUTO (--yes)"));

  const ready = ensureProviderReady();
  if (!ready.ok) {
    console.error(c("red", `\n✗ Provider hazır değil: ${ready.reason}`));
    process.exit(1);
  }

  let userInput = cliInput;
  if (!userInput) {
    userInput = await ask(
      `\n${c("bold", "Ne yapmamı istersin?")} ${c(
        "dim",
        '(örn: "en son değişiklikleri gönder", "commit", "deploy")',
      )}\n> `,
      "commit",
    );
  }

  const rawPlan = await interpretCommand(userInput);
  const plan = await normalizePlan(rawPlan);

  console.log(c("bold", "\n── Plan ──"));
  plan.actions.forEach((a, i) =>
    console.log(`  ${i + 1}. ${describeAction(a)}`),
  );
  console.log(c("dim", `  Gerekçe: ${plan.rationale}`));

  const ok = await ask(`\nPlanı uygulayayım mı? [E/h] (varsayılan E): `, "e");
  if (!isYes(ok)) {
    console.log(c("yellow", "İptal edildi."));
    process.exit(0);
  }

  const code = await executePlan(plan);
  if (code === 0) {
    console.log(c("green", "\n✅ Tüm adımlar tamamlandı."));
  } else {
    console.log(c("red", `\n✗ Bir adım başarısız (exit ${code}).`));
  }
  process.exit(code);
}

main().catch((err) => {
  console.error(c("red", `\n✗ Beklenmedik hata: ${(err as Error).message}`));
  if (err instanceof Error && err.stack) {
    console.error(c("dim", err.stack));
  }
  process.exit(1);
});
