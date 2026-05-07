/**
 * Remote execution: Raspberry Pi'ye SSH ile bağlanıp deploy komutunu çalıştır.
 *
 * `ssh2` kütüphanesi saf JS, native bağımlılığı yok. Şifre veya private key
 * destekler. Çıktı `process.stdout`'a anlık akar (docker spinner'lar dahil).
 */

import { Client, type ConnectConfig } from "ssh2";
import { readFileSync } from "node:fs";

export interface PiDeployConfig {
  host: string;
  user: string;
  password?: string;
  privateKeyPath?: string;
  port: number;
  repoDir: string;
  branch: string;
  command: string;
}

export interface PiConfigLoadResult {
  config?: PiDeployConfig;
  missing: string[];
}

export function loadPiConfig(env: NodeJS.ProcessEnv = process.env): PiConfigLoadResult {
  const missing: string[] = [];

  const host = env.PI_HOST?.trim();
  const user = env.PI_USER?.trim();
  const password = env.PI_PASSWORD;
  const privateKeyPath = env.PI_SSH_KEY?.trim();
  const repoDir = env.PI_REPO_DIR?.trim() ?? "agora-voice-chatbot-web";
  const branch = env.PI_BRANCH?.trim() ?? "main";
  const command =
    env.PI_DEPLOY_CMD?.trim() ??
    "git pull origin main && docker compose down && docker compose up -d --build";
  const port = Number(env.PI_PORT ?? 22);

  if (!host) missing.push("PI_HOST");
  if (!user) missing.push("PI_USER");
  if (!password && !privateKeyPath) missing.push("PI_PASSWORD veya PI_SSH_KEY");

  if (missing.length > 0) return { missing };

  return {
    missing: [],
    config: {
      host: host!,
      user: user!,
      password: password || undefined,
      privateKeyPath: privateKeyPath || undefined,
      port: Number.isFinite(port) && port > 0 ? port : 22,
      repoDir,
      branch,
      command,
    },
  };
}

export interface RunResult {
  exitCode: number;
  signal?: string;
}

/**
 * Pi'ye SSH ile bağlanır, repoDir'e cd yapar ve config.command'i çalıştırır.
 * Çıktıyı satır satır stdout'a yazar.
 */
export function runOnPi(config: PiDeployConfig): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    const connectOpts: ConnectConfig = {
      host: config.host,
      port: config.port,
      username: config.user,
      readyTimeout: 30_000,
      keepaliveInterval: 10_000,
    };

    if (config.privateKeyPath) {
      try {
        connectOpts.privateKey = readFileSync(config.privateKeyPath);
      } catch (err) {
        return reject(
          new Error(
            `SSH private key okunamadı (${config.privateKeyPath}): ${(err as Error).message}`,
          ),
        );
      }
    } else if (config.password) {
      connectOpts.password = config.password;
      connectOpts.tryKeyboard = true;
    }

    conn.on("keyboard-interactive", (_n, _i, _l, _p, finish) => {
      finish([config.password ?? ""]);
    });

    const remoteCommand = [
      "set -e",
      `cd ~/${config.repoDir}`,
      'echo "=> Working dir: $(pwd)"',
      'echo "=> Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"',
      `echo "=> Komut: ${config.command.replace(/"/g, '\\"')}"`,
      config.command,
      'echo "✅ Deploy tamamlandı."',
    ].join("; ");

    conn.on("ready", () => {
      conn.exec(remoteCommand, { pty: true }, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        stream.on("data", (chunk: Buffer) => {
          process.stdout.write(chunk);
        });
        stream.stderr.on("data", (chunk: Buffer) => {
          process.stderr.write(chunk);
        });
        stream.on("close", (code: number | null, signal?: string) => {
          conn.end();
          resolve({ exitCode: code ?? 0, signal });
        });
      });
    });

    conn.on("error", (err) => reject(err));
    conn.connect(connectOpts);
  });
}
