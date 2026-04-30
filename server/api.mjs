// Hem Vite dev plugin hem production server tarafından kullanılan
// ortak HTTP handler. /api/* yollarını işler, ele alındıysa true döner.

import fs from 'node:fs';
import path from 'node:path';
import { loadAll, addResult, updateResult, getResult, clearAll, deleteResult } from './store.mjs';

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

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
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
      if (body.password !== RESET_PASSWORD) { json(res, 403, { error: 'wrong password' }); return true; }
      const ok = deleteResult(id);
      if (!ok) { json(res, 404, { error: 'not found' }); return true; }
      json(res, 200, { ok: true });
      return true;
    }

    // POST /api/clear-results  { password }
    if (pathname === '/api/clear-results' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      if (body.password !== RESET_PASSWORD) { json(res, 403, { error: 'wrong password' }); return true; }
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

    json(res, 404, { error: 'route not found' });
    return true;
  } catch (err) {
    json(res, 500, { error: err.message });
    return true;
  }
}
