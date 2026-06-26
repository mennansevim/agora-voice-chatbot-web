// Üretim için minik Node sunucu.
// Vite ile build edilen dist/ klasörünü servis eder, /api/* route'larını yönetir.
// Çalıştırma: node server.mjs   (önce npm run build)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleApi } from './server/api.mjs';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.wav':  'audio/wav',
  '.mp3':  'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

function safeJoin(base, target) {
  const targetPath = path.posix.normalize('/' + target).replace(/^\/+/, '');
  const resolved = path.resolve(base, targetPath);
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url?.startsWith('/api/')) {
      const handled = await handleApi(req, res);
      if (handled) return;
    }

    let urlPath = (req.url || '/').split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';

    let filePath = safeJoin(DIST_DIR, urlPath);
    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // SPA fallback
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');

    // Cache stratejisi:
    // - HTML (SPA giriş noktası / fallback): ASLA cache'leme. Her istekte taze index.html
    //   dönsün ki yeni build'de değişen hash'li asset isimleri doğru yüklensin. Aksi halde
    //   tarayıcı eski index.html'i tutar; içindeki eski /assets/index-XXXX.js yeni container'da
    //   olmadığı için 404 olur → sayfa boş gelir ("ilk açılışta açılmıyor"), yenileyince taze
    //   HTML çekilince düzelir.
    // - /assets/ altındaki hash'li dosyalar: içerik değişince dosya adı da değişir → sonsuza
    //   kadar güvenle cache'lenebilir (immutable).
    // - Diğer statikler (görsel/ses): kısa süreli cache.
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (urlPath.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (ext === '.wav' || ext === '.webp' || ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.statusCode = 500;
    res.end(String(err));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`✓ Agora Voice server running at http://${HOST}:${PORT}`);
  console.log(`  Static: ${DIST_DIR}`);
  console.log(`  Data:   ${path.resolve(process.cwd(), 'data')}`);
});
