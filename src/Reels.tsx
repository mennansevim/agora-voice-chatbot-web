import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

// Sitede oynatılacak Instagram reels'leri (kısa kod, en yeni başta).
// Yalnızca "original audio" (kendi ses kaydı) olanlar site içinde oynar;
// lisanslı müzik kullanan reels'ler Instagram tarafından gömülü oynatmaya
// kapatıldığı için izleyiciyi Instagram'a yönlendirir — buraya eklemeyin.
const REELS = ['DdMTcjKIEQb', 'DcsqPuKKeVk', 'DcqOnKro8z9', 'DcqF4T9IfVU', 'DclTbL4IUjX', 'DcN1jvvIVg4'];

const PROFILE_URL = 'https://instagram.com/agoravoice';

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const embedMarkup = (code: string) =>
  `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/${code}/" data-instgrm-version="14">` +
  `<div class="av-reel__ph"><a href="https://www.instagram.com/reel/${code}/" target="_blank" rel="noopener noreferrer">Videoyu Instagram'da izle</a></div>` +
  `</blockquote>`;

// Instagram'ın resmî embed betiğini yalnızca bölüm görünüme yaklaşınca bir kez yükler.
function loadInstagramEmbeds() {
  if (window.instgrm) {
    window.instgrm.Embeds.process();
    return;
  }
  if (document.getElementById('instagram-embed-js')) return;
  const script = document.createElement('script');
  script.id = 'instagram-embed-js';
  script.async = true;
  script.src = 'https://www.instagram.com/embed.js';
  script.onload = () => window.instgrm?.Embeds.process();
  document.body.appendChild(script);
}

export default function Reels() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      loadInstagramEmbeds();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadInstagramEmbeds();
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const updateEdges = () => {
    const t = trackRef.current;
    if (!t) return;
    setEdges({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 });
  };

  const scrollByCard = (dir: 1 | -1) => {
    const t = trackRef.current;
    const card = t?.querySelector<HTMLElement>('.av-reel');
    if (!t || !card) return;
    t.scrollBy({ left: dir * (card.offsetWidth + 18), behavior: 'smooth' });
  };

  return (
    <div className="av-reels" ref={rootRef}>
      <div className="av-reels__track" ref={trackRef} onScroll={updateEdges}>
        {REELS.map((code) => (
          <div key={code} className="av-reel" dangerouslySetInnerHTML={{ __html: embedMarkup(code) }} />
        ))}
      </div>
      <div className="av-reels__nav">
        <a className="av-ig-cta" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
          <span><Instagram size={20} aria-hidden /></span>
          <span>
            @agoravoice
            <small>Tüm videolar için Instagram'da takip et</small>
          </span>
        </a>
        <div className="av-reels__arrows">
          <button type="button" className="av-round" onClick={() => scrollByCard(-1)} disabled={edges.start} aria-label="Önceki videolar">
            <ChevronLeft size={22} />
          </button>
          <button type="button" className="av-round" onClick={() => scrollByCard(1)} disabled={edges.end} aria-label="Sonraki videolar">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
