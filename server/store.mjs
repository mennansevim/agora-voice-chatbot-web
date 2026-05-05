// Basit dosya tabanlı kayıt katmanı.
// Tüm test sonuçları data/results.json içinde tutulur.
// Concurrent write riski için tmp dosyaya yazıp rename ediyoruz (atomic).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'results.json');
const SEED_FILE = path.join(DATA_DIR, 'results.seed.json');
const RECORDINGS_DIR = path.join(DATA_DIR, 'recordings');
const STAGE_INDEX_FILE = path.join(DATA_DIR, 'stage-recordings.json');

const VALID_KINDS = new Set(['range', 'song', 'stage']);

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function ensureRecordingsDir(sessionId) {
  const dir = path.join(RECORDINGS_DIR, String(sessionId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
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
  deleteSessionRecordings(id);
  return true;
}

// ============================================================================
// Recording storage
// ============================================================================

function safeKind(kind) {
  return VALID_KINDS.has(kind) ? kind : null;
}

function extFromMime(mime) {
  if (!mime) return 'webm';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('mp4')) return 'm4a';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('wav')) return 'wav';
  return 'webm';
}

export function saveRecording(sessionId, kind, idx, buffer, mime) {
  const k = safeKind(kind);
  if (!k) throw new Error('invalid kind');
  const sid = parseInt(sessionId, 10);
  if (!Number.isFinite(sid) || sid <= 0) throw new Error('invalid sessionId');
  const dir = ensureRecordingsDir(sid);
  const ext = extFromMime(mime);
  const safeIdx = String(idx).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${k}-${safeIdx}.${ext}`;
  const full = path.join(dir, filename);
  fs.writeFileSync(full, buffer);
  return { filename, path: `recordings/${sid}/${filename}`, mime: mime || 'audio/webm' };
}

export function appendRecordingMeta(sessionId, kind, meta) {
  const all = loadAll();
  const idx = all.findIndex((r) => r.id === sessionId);
  if (idx === -1) return null;
  const rec = all[idx];
  if (!rec.recordings) rec.recordings = {};
  if (!rec.recordings[kind]) rec.recordings[kind] = [];
  rec.recordings[kind].push(meta);
  saveAll(all);
  return rec;
}

export function deleteSessionRecordings(sessionId) {
  const dir = path.join(RECORDINGS_DIR, String(sessionId));
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* noop */
  }
}

export function getRecordingPath(sessionId, filename) {
  const sid = parseInt(sessionId, 10);
  if (!Number.isFinite(sid) || sid <= 0) return null;
  if (!/^[a-zA-Z0-9_-]+\.(webm|m4a|ogg|wav)$/.test(filename)) return null;
  const full = path.join(RECORDINGS_DIR, String(sid), filename);
  if (!full.startsWith(RECORDINGS_DIR)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

// ============================================================================
// Standalone stage recordings (kullanıcı-bağımsız)
// ============================================================================

function loadStageIndex() {
  try {
    if (!fs.existsSync(STAGE_INDEX_FILE)) return [];
    const raw = fs.readFileSync(STAGE_INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStageIndex(arr) {
  ensureDir();
  const tmp = STAGE_INDEX_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(arr, null, 2), 'utf8');
  fs.renameSync(tmp, STAGE_INDEX_FILE);
}

export function listStageRecordings() {
  return loadStageIndex();
}

export function saveStageRecording(buffer, mime, meta) {
  const all = loadStageIndex();
  const id = all.reduce((m, r) => (r.id > m ? r.id : m), 0) + 1;
  const dir = path.join(RECORDINGS_DIR, 'stage');
  fs.mkdirSync(dir, { recursive: true });
  const ext = extFromMime(mime);
  const filename = `${id}.${ext}`;
  const full = path.join(dir, filename);
  fs.writeFileSync(full, buffer);
  const record = {
    id,
    path: `recordings/stage/${filename}`,
    mime: mime || 'audio/webm',
    createdAt: Date.now(),
    ...(meta || {}),
  };
  all.push(record);
  saveStageIndex(all);
  return record;
}

export function getStageRecordingPath(filename) {
  if (!/^[a-zA-Z0-9_-]+\.(webm|m4a|ogg|wav)$/.test(filename)) return null;
  const dir = path.join(RECORDINGS_DIR, 'stage');
  const full = path.join(dir, filename);
  if (!full.startsWith(dir)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}
