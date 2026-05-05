// Hem Vite dev plugin hem production server tarafından kullanılan
// ortak HTTP handler. /api/* yollarını işler, ele alındıysa true döner.

import fs from 'node:fs';
import path from 'node:path';
import {
  loadAll,
  addResult,
  updateResult,
  getResult,
  clearAll,
  deleteResult,
  saveRecording,
  appendRecordingMeta,
  getRecordingPath,
  saveStageRecording,
  listStageRecordings,
  getStageRecordingPath,
} from './store.mjs';

const ROOT = path.resolve(process.cwd());
const CONTACTS_FILE = path.join(ROOT, 'data', 'contacts.txt');
const RESET_PASSWORD = process.env.AGORA_RESET_PASSWORD || '945000';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => { body += c.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function readBinaryBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (c) => {
      total += c.length;
      if (total > maxBytes) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function checkPassword(provided) {
  return provided === RESET_PASSWORD;
}

function streamFile(res, filePath, mime) {
  res.statusCode = 200;
  res.setHeader('Content-Type', mime || 'audio/webm');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(filePath).pipe(res);
}

export async function handleApi(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/')) return false;

  try {
    // GET /api/results
    if (pathname === '/api/results' && req.method === 'GET') {
      json(res, 200, loadAll());
      return true;
    }

    // POST /api/results
    if (pathname === '/api/results' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const record = addResult(body);
      json(res, 200, record);
      return true;
    }

    // GET /api/results/:id
    const singleMatch = pathname.match(/^\/api\/results\/(\d+)$/);
    if (singleMatch && req.method === 'GET') {
      const id = parseInt(singleMatch[1], 10);
      const found = getResult(id);
      if (!found) { json(res, 404, { error: 'not found' }); return true; }
      json(res, 200, found);
      return true;
    }

    // PATCH /api/results/:id  — result / user alanları için deep-merge
    if (singleMatch && req.method === 'PATCH') {
      const id = parseInt(singleMatch[1], 10);
      const body = JSON.parse((await readBody(req)) || '{}');
      const current = getResult(id);
      if (!current) { json(res, 404, { error: 'not found' }); return true; }
      const patch = {};
      if (body.result) patch.result = { ...current.result, ...body.result };
      if (body.user) patch.user = { ...current.user, ...body.user };
      for (const [k, v] of Object.entries(body)) {
        if (k !== 'result' && k !== 'user') patch[k] = v;
      }
      const updated = updateResult(id, patch);
      json(res, 200, updated);
      return true;
    }

    // DELETE /api/results/:id  { password }
    if (singleMatch && req.method === 'DELETE') {
      const id = parseInt(singleMatch[1], 10);
      const body = JSON.parse((await readBody(req)) || '{}');
      if (!checkPassword(body.password)) { json(res, 403, { error: 'wrong password' }); return true; }
      const ok = deleteResult(id);
      if (!ok) { json(res, 404, { error: 'not found' }); return true; }
      json(res, 200, { ok: true });
      return true;
    }

    // POST /api/results/:id/recordings  — raw audio body, query string metadata
    const recUploadMatch = pathname.match(/^\/api\/results\/(\d+)\/recordings$/);
    if (recUploadMatch && req.method === 'POST') {
      const id = parseInt(recUploadMatch[1], 10);
      const session = getResult(id);
      if (!session) { json(res, 404, { error: 'session not found' }); return true; }
      const kind = url.searchParams.get('kind') || 'range';
      if (!['range', 'song'].includes(kind)) { json(res, 400, { error: 'invalid kind' }); return true; }
      const idx = url.searchParams.get('idx') || String(Date.now());
      const mime = req.headers['content-type'] || 'audio/webm';
      const buf = await readBinaryBody(req);
      if (buf.length === 0) { json(res, 400, { error: 'empty body' }); return true; }
      const saved = saveRecording(id, kind, idx, buf, mime);
      const meta = {
        idx,
        path: saved.path,
        filename: saved.filename,
        mime: saved.mime,
        recordedAt: Date.now(),
      };
      // metadata query'den geliyor: noteName, targetFreq, detectedFreq, accuracy, duration vb.
      for (const key of ['noteName', 'targetFreq', 'detectedFreq', 'accuracy', 'attemptNumber', 'direction', 'duration', 'shareToScoreboard']) {
        const v = url.searchParams.get(key);
        if (v !== null) meta[key] = v;
      }
      appendRecordingMeta(id, kind, meta);
      json(res, 200, { ok: true, meta });
      return true;
    }

    // POST /api/clear-results  { password }
    if (pathname === '/api/clear-results' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      if (!checkPassword(body.password)) { json(res, 403, { error: 'wrong password' }); return true; }
      clearAll();
      json(res, 200, { ok: true });
      return true;
    }

    // POST /api/save-contact
    if (pathname === '/api/save-contact' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const ts = new Date().toLocaleString('tr-TR');
      const block =
        `[${ts}]\n` +
        `Ad Soyad : ${body.firstName ?? '-'} ${body.lastName ?? ''}\n` +
        `Cinsiyet : ${body.gender ?? '-'}\n` +
        `E-posta  : ${body.email ?? '-'}\n` +
        `Telefon  : ${body.phone ?? '-'}\n` +
        `Ses Tipi : ${body.voiceType ?? '-'}\n` +
        `Aralık   : ${body.range ?? '-'} (${body.octaveWidth ?? '-'} oktav)\n` +
        `Skor     : ${body.score ?? '-'}  ·  Doğruluk %${body.successRate ?? '-'}\n` +
        `Parti    : ${body.section ?? '-'}\n` +
        `${'-'.repeat(70)}\n`;
      fs.mkdirSync(path.dirname(CONTACTS_FILE), { recursive: true });
      fs.appendFileSync(CONTACTS_FILE, block, 'utf8');
      json(res, 200, { ok: true });
      return true;
    }

    // ===== Admin =====

    // POST /api/admin/login  { password }
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      if (!checkPassword(body.password)) { json(res, 403, { error: 'wrong password' }); return true; }
      json(res, 200, { ok: true });
      return true;
    }

    // GET /api/admin/sessions?p=...
    if (pathname === '/api/admin/sessions' && req.method === 'GET') {
      const p = url.searchParams.get('p');
      if (!checkPassword(p)) { json(res, 403, { error: 'wrong password' }); return true; }
      json(res, 200, loadAll());
      return true;
    }

    // GET /api/admin/stage-recordings?p=...
    if (pathname === '/api/admin/stage-recordings' && req.method === 'GET') {
      const p = url.searchParams.get('p');
      if (!checkPassword(p)) { json(res, 403, { error: 'wrong password' }); return true; }
      json(res, 200, listStageRecordings());
      return true;
    }

    // POST /api/stage-recordings  raw audio, query: songId, songTitle, durationSec
    if (pathname === '/api/stage-recordings' && req.method === 'POST') {
      const mime = req.headers['content-type'] || 'audio/webm';
      const buf = await readBinaryBody(req);
      if (buf.length === 0) { json(res, 400, { error: 'empty body' }); return true; }
      const meta = {};
      for (const key of ['songId', 'songTitle', 'composer', 'durationSec', 'firstName', 'lastName']) {
        const v = url.searchParams.get(key);
        if (v !== null) meta[key] = v;
      }
      const record = saveStageRecording(buf, mime, meta);
      json(res, 200, record);
      return true;
    }

    // GET /api/admin/recordings/:sessionId/:filename?p=...
    const recDownloadMatch = pathname.match(/^\/api\/admin\/recordings\/(\d+)\/([a-zA-Z0-9_.-]+)$/);
    if (recDownloadMatch && req.method === 'GET') {
      const p = url.searchParams.get('p');
      if (!checkPassword(p)) { json(res, 403, { error: 'wrong password' }); return true; }
      const sid = recDownloadMatch[1];
      const filename = recDownloadMatch[2];
      const filePath = getRecordingPath(sid, filename);
      if (!filePath) { json(res, 404, { error: 'not found' }); return true; }
      const mime = filename.endsWith('.m4a') ? 'audio/mp4' :
                   filename.endsWith('.ogg') ? 'audio/ogg' :
                   filename.endsWith('.wav') ? 'audio/wav' : 'audio/webm';
      streamFile(res, filePath, mime);
      return true;
    }

    // GET /api/admin/recordings/stage/:filename?p=...
    const stageDownloadMatch = pathname.match(/^\/api\/admin\/recordings\/stage\/([a-zA-Z0-9_.-]+)$/);
    if (stageDownloadMatch && req.method === 'GET') {
      const p = url.searchParams.get('p');
      if (!checkPassword(p)) { json(res, 403, { error: 'wrong password' }); return true; }
      const filename = stageDownloadMatch[1];
      const filePath = getStageRecordingPath(filename);
      if (!filePath) { json(res, 404, { error: 'not found' }); return true; }
      const mime = filename.endsWith('.m4a') ? 'audio/mp4' :
                   filename.endsWith('.ogg') ? 'audio/ogg' :
                   filename.endsWith('.wav') ? 'audio/wav' : 'audio/webm';
      streamFile(res, filePath, mime);
      return true;
    }

    json(res, 404, { error: 'route not found' });
    return true;
  } catch (err) {
    json(res, 500, { error: err.message });
    return true;
  }
}
