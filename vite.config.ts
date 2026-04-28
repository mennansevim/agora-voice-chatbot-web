import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const CONTACTS_FILE = path.resolve(__dirname, 'data/contacts.txt');

function contactsSaverPlugin(): Plugin {
  return {
    name: 'agora-contacts-saver',
    configureServer(server) {
      server.middlewares.use('/api/save-contact', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const ts = new Date().toLocaleString('tr-TR');
            const block =
              `[${ts}]\n` +
              `Ad Soyad : ${data.firstName ?? '-'} ${data.lastName ?? ''}\n` +
              `Cinsiyet : ${data.gender ?? '-'}\n` +
              `E-posta  : ${data.email ?? '-'}\n` +
              `Telefon  : ${data.phone ?? '-'}\n` +
              `Ses Tipi : ${data.voiceType ?? '-'}\n` +
              `Aralık   : ${data.range ?? '-'} (${data.octaveWidth ?? '-'} oktav)\n` +
              `Skor     : ${data.score ?? '-'}  ·  Doğruluk %${data.successRate ?? '-'}\n` +
              `Parti    : ${data.section ?? '-'}\n` +
              `${'-'.repeat(70)}\n`;
            fs.mkdirSync(path.dirname(CONTACTS_FILE), { recursive: true });
            fs.appendFileSync(CONTACTS_FILE, block, 'utf8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: (err as Error).message }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), contactsSaverPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
