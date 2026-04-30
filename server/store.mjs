// Basit dosya tabanlı kayıt katmanı.
// Tüm test sonuçları data/results.json içinde tutulur.
// Concurrent write riski için tmp dosyaya yazıp rename ediyoruz (atomic).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'results.json');
const SEED_FILE = path.join(DATA_DIR, 'results.seed.json');

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// İlk açılışta data/results.json yoksa seed'den kopyala. Mevcutsa dokunma.
// Bu sayede deploy'da production verisi git tarafından ezilmez (results.json
// gitignore'da), ama yeni bir ortamda otomatik seed verisi gelir.
function ensureBootstrapped() {
  if (fs.existsSync(DATA_FILE)) return;
  ensureDir();
  if (fs.existsSync(SEED_FILE)) {
    fs.copyFileSync(SEED_FILE, DATA_FILE);
  } else {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

export function loadAll() {
  try {
    ensureBootstrapped();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(arr) {
  ensureDir();
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

function nextId(arr) {
  return arr.reduce((m, r) => (r.id > m ? r.id : m), 0) + 1;
}

export function addResult(payload) {
  const all = loadAll();
  const id = nextId(all);
  const record = { id, ...payload, createdAt: Date.now() };
  all.push(record);
  saveAll(all);
  return record;
}

export function updateResult(id, patch) {
  const all = loadAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  saveAll(all);
  return all[idx];
}

export function getResult(id) {
  return loadAll().find((r) => r.id === id) ?? null;
}

export function clearAll() {
  saveAll([]);
}

export function deleteResult(id) {
  const all = loadAll();
  const next = all.filter((r) => r.id !== id);
  if (next.length === all.length) return false;
  saveAll(next);
  return true;
}
