import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Award, MapPin } from 'lucide-react';
import { STOPS } from './journeyData';

function ColumnMark() {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="5" aria-hidden="true">
      <path d="M14 26h92M22 26l38-16 38 16M22 104h76M16 114h88" strokeLinecap="round" />
      <path d="M32 36v60M52 36v60M68 36v60M88 36v60" strokeLinecap="round" />
    </svg>
  );
}

export default function Journey() {
  const listRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  // Kaydırdıkça zaman çizgisini doldur ve geçilen durakları işaretle.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const list = listRef.current;
      if (!list) return;
      const mark = window.innerHeight * 0.55;
      const rect = list.getBoundingClientRect();
      setProgress(Math.max(0, Math.min(1, (mark - rect.top) / rect.height)));
      const items = Array.from(list.querySelectorAll<HTMLElement>('.av-jr'));
      setActive(items.filter((el) => el.getBoundingClientRect().top + 40 < mark).length);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={listRef} className="av-journey" style={{ '--p': progress } as CSSProperties}>
      <div className="av-journey__rail" aria-hidden="true">
        <div className="av-journey__fill" />
        <div className="av-journey__head" />
      </div>
      <ol className="av-journey__list">
      {STOPS.map((stop, i) => (
        <li key={stop.title} className={`av-jr${i < active ? ' is-active' : ''}`}>
          <span className="av-jr__dot" aria-hidden="true" />
          <article className="av-jr__card">
            <div className="av-jr__media">
              {stop.image ? (
                <img src={stop.image} alt={`Agora Voice — ${stop.title}`} loading="lazy" decoding="async" style={{ objectPosition: stop.focus }} />
              ) : (
                <div className="av-jr__ph" aria-hidden="true">
                  <ColumnMark />
                  <strong>{stop.place}</strong>
                  <span>{stop.date}</span>
                </div>
              )}
            </div>
            <div className="av-jr__body">
              <div className="av-jr__meta">
                <span className="av-chip">{stop.date}</span>
                <span className="av-chip av-chip--muted">
                  <MapPin size={14} aria-hidden />
                  {stop.place}
                </span>
              </div>
              <h3>{stop.title}</h3>
              {stop.text.map((para) => (
                <p key={para}>{para}</p>
              ))}
              {stop.credits && (
                <dl className="av-jr__credits">
                  {stop.credits.map((c) => (
                    <div key={c.role}>
                      <dt>{c.role}</dt>
                      <dd>{c.name}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {stop.program && (
                <div className="av-jr__program">
                  <span>Seslendirdiğimiz eserler</span>
                  <ol>
                    {stop.program.map((work) => (
                      <li key={work}>{work}</li>
                    ))}
                  </ol>
                </div>
              )}
              {stop.awards && (
                <div className="av-jr__awards">
                  {stop.awards.map((a) => (
                    <span key={a} className="av-chip av-chip--gold">
                      <Award size={15} aria-hidden />
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        </li>
      ))}
      </ol>
    </div>
  );
}
