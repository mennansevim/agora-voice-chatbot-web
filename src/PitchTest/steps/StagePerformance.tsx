// Sahneye Çık (BETA) — gerçek vokal stem'leriyle çok sesli icra sayfası.
// 4 ayrı vokal kaydı (S/A/T/B) Web Audio ile senkron çalınır;
// her partinin gain'i = (slider) × (üye sayısı × ortalama RMS gücü).
// Üyeler canlı taşınabilir veya sahne dışına alınabilir.
//
// Mevcut yapıyı bozmamak için bağımsız bir route (step='stage') olarak eklenir.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, X as XIcon, ArrowRightLeft, Loader2 } from 'lucide-react';
import { topScoreboard, type ChoirSection } from '../lib/db';
import { passesChoirThreshold } from '../lib/threshold';

type Row = Awaited<ReturnType<typeof topScoreboard>>[number];

const SECTIONS: ChoirSection[] = ['soprano', 'alto', 'tenor', 'bass'];

const SECTION_CFG: Record<ChoirSection, { label: string; gradient: string; text: string; ring: string; bg: string }> = {
  soprano: { label: 'Soprano', gradient: 'from-rose-500 to-pink-400',    text: 'text-rose-700',  ring: 'ring-rose-400',  bg: 'bg-rose-50'   },
  alto:    { label: 'Alto',    gradient: 'from-amber-500 to-yellow-400', text: 'text-amber-700', ring: 'ring-amber-400', bg: 'bg-amber-50'  },
  tenor:   { label: 'Tenor',   gradient: 'from-blue-500 to-sky-400',     text: 'text-blue-700',  ring: 'ring-blue-400',  bg: 'bg-blue-50'   },
  bass:    { label: 'Bas',     gradient: 'from-stone-600 to-slate-500',  text: 'text-stone-700', ring: 'ring-stone-400', bg: 'bg-stone-100' },
};

const STAGE_LAYOUT: { section: ChoirSection; row: 'back' | 'front'; col: 'left' | 'right' }[] = [
  { section: 'tenor',   row: 'back',  col: 'left'  },
  { section: 'bass',    row: 'back',  col: 'right' },
  { section: 'soprano', row: 'front', col: 'left'  },
  { section: 'alto',    row: 'front', col: 'right' },
];

// =============================================================================
// Eserler — her parti için ayrı stem URL'i
// =============================================================================

type Piece = {
  id: string;
  title: string;
  composer: string;
  stems: Record<ChoirSection, string>;
};

const LACRIMOSA: Piece = {
  id: 'lacrimosa',
  title: 'Lacrimosa',
  composer: 'W. A. Mozart · Requiem',
  stems: {
    soprano: '/sounds/stage/lacrimosa/soprano.mp3',
    alto:    '/sounds/stage/lacrimosa/alto.mp3',
    tenor:   '/sounds/stage/lacrimosa/tenor.mp3',
    bass:    '/sounds/stage/lacrimosa/bass.mp3',
  },
};

const SIGNORE_DELLE_CIME: Piece = {
  id: 'signore-delle-cime',
  title: 'Signore Delle Cime',
  composer: 'Giuseppe de Marzi',
  stems: {
    soprano: '/sounds/stage/signore-delle-cime/soprano.mp3',
    alto:    '/sounds/stage/signore-delle-cime/alto.mp3',
    tenor:   '/sounds/stage/signore-delle-cime/tenor.mp3',
    bass:    '/sounds/stage/signore-delle-cime/bass.mp3',
  },
};

const PIECES: Piece[] = [LACRIMOSA, SIGNORE_DELLE_CIME];

// =============================================================================
// Üye verisinden parti gücü
// =============================================================================

function strengthMultiplier(memberCount: number, avgRms: number): number {
  // 0 üye → 0; 1+ üye için sqrt-ölçek (kalabalık partinin mix'i ezmemesi için).
  if (memberCount <= 0) return 0;
  const rms = avgRms > 0 ? avgRms : 0.05;
  const rmsBoost = 0.5 + Math.min(rms / 0.15, 1) * 0.6; // [0.5, 1.1]
  const countBoost = Math.sqrt(memberCount);
  // 4 stem üst üste binince kolayca clip eder; çarpanı 1.4'le sınırla
  return Math.min(rmsBoost * countBoost, 1.4);
}

function avgRmsOf(members: Row[]): number {
  const vals = members.map((m) => m.result.avgRms ?? 0).filter((v) => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

// =============================================================================
// Audio engine — 4 stem'i fetch + decode + senkron çal
// =============================================================================

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  sectionGain: Record<ChoirSection, GainNode>;   // slider'a bağlı
  sectionLevel: Record<ChoirSection, GainNode>;  // güç çarpanına bağlı
  buffers: Record<ChoirSection, AudioBuffer>;
  duration: number;
  // çalma sırasında değişenler
  sources: Record<ChoirSection, AudioBufferSourceNode> | null;
  startedAt: number;
};

async function loadEngine(piece: Piece, onProgress?: (loaded: number, total: number) => void): Promise<Engine> {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.55;
  // Limiter-vari: düşük threshold + yüksek ratio + kısa attack → tepe kontrolü
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -10;
  compressor.knee.value = 6;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.15;
  // Son çıkışta yumuşak bir kazanç düşüşü daha
  const safety = ctx.createGain();
  safety.gain.value = 0.85;
  master.connect(compressor).connect(safety).connect(ctx.destination);

  const sectionGain = {} as Record<ChoirSection, GainNode>;
  const sectionLevel = {} as Record<ChoirSection, GainNode>;
  for (const s of SECTIONS) {
    const g = ctx.createGain();
    const l = ctx.createGain();
    g.gain.value = 0.7;
    l.gain.value = 1.0;
    g.connect(l).connect(master);
    sectionGain[s] = g;
    sectionLevel[s] = l;
  }

  // 4 dosyayı paralel fetch + decode
  let loaded = 0;
  const buffers = {} as Record<ChoirSection, AudioBuffer>;
  await Promise.all(
    SECTIONS.map(async (s) => {
      const res = await fetch(piece.stems[s]);
      if (!res.ok) throw new Error(`${s}: ${res.status}`);
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      buffers[s] = buf;
      loaded++;
      onProgress?.(loaded, SECTIONS.length);
    }),
  );

  const duration = Math.max(...SECTIONS.map((s) => buffers[s].duration));

  return { ctx, master, sectionGain, sectionLevel, buffers, duration, sources: null, startedAt: 0 };
}

function startEngine(engine: Engine, loop: boolean) {
  const { ctx, sectionGain, buffers } = engine;
  const sources = {} as Record<ChoirSection, AudioBufferSourceNode>;
  const startTime = ctx.currentTime + 0.08; // küçük öne tampon, senkron başlamaları için
  for (const s of SECTIONS) {
    const src = ctx.createBufferSource();
    src.buffer = buffers[s];
    src.loop = loop;
    src.connect(sectionGain[s]);
    src.start(startTime);
    sources[s] = src;
  }
  engine.sources = sources;
  engine.startedAt = startTime;
}

function stopEngine(engine: Engine) {
  const { sources, ctx, master } = engine;
  if (!sources) return;
  // master'ı kısa fade ile kıs, sonra source'ları durdur (pop önler)
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + 0.08);
  setTimeout(() => {
    for (const s of SECTIONS) {
      try { sources[s].stop(); } catch { /* zaten bitti */ }
      sources[s].disconnect();
    }
    master.gain.value = 0.55;
  }, 100);
  engine.sources = null;
}

// =============================================================================
// Bileşen
// =============================================================================

type LiveAssignment = Map<number, ChoirSection | 'out'>;

export default function StagePerformance({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [piece, setPiece] = useState<Piece>(LACRIMOSA);
  const [loop, setLoop] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 4 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sliders, setSliders] = useState<Record<ChoirSection, number>>({ soprano: 0.7, alto: 0.7, tenor: 0.7, bass: 0.7 });
  const [muted, setMuted] = useState<Record<ChoirSection, boolean>>({ soprano: false, alto: false, tenor: false, bass: false });
  const [assignments, setAssignments] = useState<LiveAssignment>(new Map());
  const [progressTick, setProgressTick] = useState(0); // playhead için

  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    topScoreboard(100).then((all) => setRows(all.filter((r) => passesChoirThreshold(r.result))));
  }, []);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        stopEngine(engineRef.current);
        engineRef.current.ctx.close().catch(() => {});
        engineRef.current = null;
      }
    };
  }, []);

  // Playhead RAF
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      setProgressTick((n) => n + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const effectiveSection = (row: Row): ChoirSection | 'out' => {
    const ov = assignments.get(row.result.id!);
    if (ov !== undefined) return ov;
    return row.result.choirSection ?? 'out';
  };

  const grouped = useMemo(() => {
    const m: Record<ChoirSection, Row[]> = { soprano: [], alto: [], tenor: [], bass: [] };
    if (!rows) return m;
    for (const r of rows) {
      const s = effectiveSection(r);
      if (s === 'out') continue;
      m[s].push(r);
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, assignments]);

  const strengths = useMemo(() => {
    const out: Record<ChoirSection, number> = { soprano: 0, alto: 0, tenor: 0, bass: 0 };
    for (const s of SECTIONS) out[s] = strengthMultiplier(grouped[s].length, avgRmsOf(grouped[s]));
    return out;
  }, [grouped]);

  // Strength canlı uygula
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const now = eng.ctx.currentTime;
    for (const s of SECTIONS) {
      eng.sectionLevel[s].gain.linearRampToValueAtTime(strengths[s], now + 0.2);
    }
  }, [strengths]);

  // Slider + mute canlı uygula
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const now = eng.ctx.currentTime;
    for (const s of SECTIONS) {
      const target = muted[s] ? 0 : sliders[s];
      eng.sectionGain[s].gain.linearRampToValueAtTime(target, now + 0.08);
    }
  }, [sliders, muted]);

  const verdict = useMemo(() => {
    const present = SECTIONS.filter((s) => grouped[s].length > 0);
    if (present.length === 0) return { tone: 'bad' as const, text: 'Sahnede kimse yok. Üyeleri partilere atayarak başla.' };
    if (present.length < 4) {
      const missing = SECTIONS.filter((s) => !present.includes(s)).map((s) => SECTION_CFG[s].label).join(', ');
      return { tone: 'warn' as const, text: `Eksik parti: ${missing}. Tam SATB için her partiden en az 1 kişi gerekir.` };
    }
    const total = SECTIONS.reduce((a, s) => a + strengths[s], 0);
    const avg = total / 4;
    const dominant = SECTIONS.filter((s) => strengths[s] > avg * 1.4);
    const weak = SECTIONS.filter((s) => strengths[s] < avg * 0.6);
    if (dominant.length && weak.length) {
      return {
        tone: 'warn' as const,
        text: `${dominant.map((s) => SECTION_CFG[s].label).join(', ')} baskın; ${weak.map((s) => SECTION_CFG[s].label).join(', ')} zayıf kalıyor. Slider'la dengele ya da kişi taşı.`,
      };
    }
    if (dominant.length) {
      return { tone: 'warn' as const, text: `${dominant.map((s) => SECTION_CFG[s].label).join(', ')} ortalamanın belirgin üstünde.` };
    }
    if (weak.length) {
      return { tone: 'warn' as const, text: `${weak.map((s) => SECTION_CFG[s].label).join(', ')} biraz zayıf — sayıyı artırmayı dene.` };
    }
    return { tone: 'good' as const, text: 'Partiler dengeli. SATB harmonisi sağlam duruyor.' };
  }, [grouped, strengths]);

  // Audio yükle
  async function ensureLoaded(): Promise<Engine | null> {
    if (engineRef.current) return engineRef.current;
    setLoading(true);
    setLoadError(null);
    setLoadProgress({ loaded: 0, total: 4 });
    try {
      const eng = await loadEngine(piece, (loaded, total) => setLoadProgress({ loaded, total }));
      // Başlangıç değerleri
      const now = eng.ctx.currentTime;
      for (const s of SECTIONS) {
        eng.sectionGain[s].gain.setValueAtTime(muted[s] ? 0 : sliders[s], now);
        eng.sectionLevel[s].gain.setValueAtTime(strengths[s], now);
      }
      engineRef.current = eng;
      setLoading(false);
      return eng;
    } catch (e) {
      setLoading(false);
      setLoadError(e instanceof Error ? e.message : 'Stem yüklenemedi');
      return null;
    }
  }

  async function togglePlay() {
    if (playing) {
      if (engineRef.current) stopEngine(engineRef.current);
      setPlaying(false);
      return;
    }
    const eng = await ensureLoaded();
    if (!eng) return;
    if (eng.ctx.state === 'suspended') await eng.ctx.resume();
    startEngine(eng, loop);
    setPlaying(true);

    // Loop kapalıysa eser bitince durdur
    if (!loop) {
      const ms = (eng.duration + 0.2) * 1000;
      setTimeout(() => {
        if (engineRef.current === eng && eng.sources) {
          stopEngine(eng);
          setPlaying(false);
        }
      }, ms);
    }
  }

  // Eser değişince engine'i temizle (yeni stem'ler bir sonraki Çal'da yüklenir)
  async function selectPiece(p: Piece) {
    if (p.id === piece.id) return;
    if (engineRef.current) {
      stopEngine(engineRef.current);
      try { await engineRef.current.ctx.close(); } catch { /* */ }
      engineRef.current = null;
    }
    setPlaying(false);
    setLoadError(null);
    setPiece(p);
  }

  function moveMember(id: number, target: ChoirSection | 'out') {
    setAssignments((prev) => {
      const next = new Map(prev);
      next.set(id, target);
      return next;
    });
  }

  function resetAssignments() {
    setAssignments(new Map());
    setSliders({ soprano: 0.7, alto: 0.7, tenor: 0.7, bass: 0.7 });
    setMuted({ soprano: false, alto: false, tenor: false, bass: false });
  }

  // Playhead bilgisi
  const playhead = (() => {
    const eng = engineRef.current;
    if (!eng || !playing || !eng.sources) return { current: 0, total: eng?.duration ?? 0 };
    const elapsed = eng.ctx.currentTime - eng.startedAt;
    const total = eng.duration;
    const current = loop && total > 0 ? elapsed % total : Math.min(elapsed, total);
    return { current: Math.max(0, current), total };
  })();
  // progressTick'i kullan (linter)
  void progressTick;

  if (rows === null) return <div className="text-center text-agora-muted py-12">Yükleniyor...</div>;

  if (rows.length === 0) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-agora-muted hover:text-agora-dark mb-6">
          <ArrowLeft size={18} /> Geri
        </button>
        <div className="text-center bg-white/70 border border-stone-200 rounded-2xl p-10">
          <p className="text-agora-dark font-medium mb-1">Sahneye çıkacak üye yok</p>
          <p className="text-sm text-agora-muted">Önce skor tablosunda barajı geçen üyeler olmalı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-agora-muted hover:text-agora-dark">
          <ArrowLeft size={18} /> Geri
        </button>
        <button
          onClick={resetAssignments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
          title="Atamaları ve slider'ları sıfırla"
        >
          <RotateCcw size={14} /> Sıfırla
        </button>
      </div>

      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 mb-1">
          <h2 className="text-3xl font-bold text-agora-dark">Sahnede</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
            Beta
          </span>
        </div>
        <p className="text-sm text-agora-muted">{piece.title}</p>
        <p className="text-xs text-agora-muted/70">{piece.composer}</p>
      </div>

      {/* Sahne — 2x2 yerleşim */}
      <div
        className="relative rounded-3xl overflow-hidden mb-5 p-6 pt-8"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0d1b2a 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 flex justify-around pointer-events-none">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-amber-300/80" style={{ boxShadow: '0 0 12px 6px rgba(251,191,36,0.3)' }} />
          ))}
        </div>

        <div className="text-center text-white/30 text-xs uppercase tracking-widest mb-1">— Sahne —</div>
        <div className="text-center text-white/20 text-[9px] uppercase tracking-widest mb-5">arka</div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {(['back','front'] as const).flatMap((rowPos) =>
            STAGE_LAYOUT.filter((s) => s.row === rowPos).sort((a, b) => (a.col === 'left' ? -1 : 1)).map(({ section }) => {
              const cfg = SECTION_CFG[section];
              const members = grouped[section];
              const strength = strengths[section];
              const swapTarget: ChoirSection =
                section === 'soprano' ? 'alto'    :
                section === 'alto'    ? 'soprano' :
                section === 'tenor'   ? 'bass'    :
                /* bass */              'tenor';
              return (
                <div
                  key={section}
                  className="rounded-2xl border border-white/10 p-3"
                  style={{ background: rowPos === 'back' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</div>
                    <div className="text-white/40 text-[10px]">
                      {members.length} kişi · güç {strength.toFixed(2)}×
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setMuted((p) => ({ ...p, [section]: !p[section] }))}
                      title={muted[section] ? 'Sesi aç' : 'Sustur'}
                      className={`shrink-0 p-1 rounded transition-colors ${
                        muted[section]
                          ? 'text-rose-300 bg-rose-500/20'
                          : 'text-white/50 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {muted[section] ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={sliders[section]}
                      onChange={(e) => setSliders((p) => ({ ...p, [section]: parseFloat(e.target.value) }))}
                      disabled={muted[section]}
                      className="flex-1 accent-amber-300 disabled:opacity-40"
                    />
                    <span className={`text-[10px] w-10 text-right ${muted[section] ? 'text-rose-300/70' : 'text-white/60'}`}>
                      {muted[section] ? 'MUTE' : `%${Math.round(sliders[section] * 100)}`}
                    </span>
                  </div>

                  {members.length === 0 ? (
                    <div className="text-white/30 text-[10px] italic py-3 text-center">— üye yok —</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {members.map((row) => {
                        const initials = `${row.user?.firstName?.[0] ?? '?'}${row.user?.lastName?.[0] ?? ''}`.toUpperCase();
                        return (
                          <div key={row.result.id} className="relative group">
                            <button
                              type="button"
                              onClick={() => moveMember(row.result.id!, swapTarget)}
                              title={`${row.user?.firstName} ${row.user?.lastName} — ${SECTION_CFG[swapTarget].label} partisine geçir`}
                              className={`w-9 h-9 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-bold text-[11px] ring-2 ${cfg.ring} shadow group-hover:ring-4 transition-all`}
                            >
                              {initials}
                            </button>
                            <button
                              type="button"
                              onClick={() => moveMember(row.result.id!, 'out')}
                              title="Sahneden çıkar"
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stone-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon size={10} />
                            </button>
                            <div className="text-white/70 text-[8px] text-center mt-0.5 truncate w-9">
                              {row.user?.firstName ?? '?'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1 text-white/30 text-[9px] mt-2">
                    <ArrowRightLeft size={10} />
                    <span>kişiye tıkla → {SECTION_CFG[swapTarget].label}'ya geç</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="text-center text-white/20 text-[9px] uppercase tracking-widest mt-1">ön · seyirci</div>
      </div>

      <OutPool rows={rows} effective={effectiveSection} onAssign={moveMember} />

      <div
        className={`border rounded-xl px-4 py-3 mb-5 text-sm ${
          verdict.tone === 'good' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
          verdict.tone === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-900' :
          'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        ⚖️ {verdict.text}
      </div>

      {/* Transport */}
      <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-4">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <button
            onClick={togglePlay}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition-colors disabled:opacity-60 ${
              playing ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : playing ? <Pause size={18} /> : <Play size={18} />}
            {loading ? 'Yükleniyor…' : playing ? 'Durdur' : 'Çal'}
          </button>
          <label className="flex items-center gap-1.5 text-xs text-agora-muted cursor-pointer">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="accent-emerald-600" />
            Tekrarla
          </label>
          {loading && (
            <span className="text-xs text-agora-muted">{loadProgress.loaded}/{loadProgress.total} stem</span>
          )}
          {loadError && (
            <span className="text-xs text-red-600">⚠ {loadError} — dosyaları <code className="bg-stone-100 px-1 rounded">public/sounds/stage/lacrimosa/</code> içine koy</span>
          )}
        </div>

        {/* Playhead */}
        {engineRef.current && (
          <div>
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-[width] duration-75"
                style={{ width: playhead.total ? `${(playhead.current / playhead.total) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-agora-muted font-mono">
              <span>{formatTime(playhead.current)}</span>
              <span>{formatTime(playhead.total)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Eser seçimi */}
      <div className="mt-6">
        <div className="text-xs font-semibold text-agora-muted uppercase tracking-wider mb-2 text-center">Eser Seç</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PIECES.map((p) => {
            const active = p.id === piece.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPiece(p)}
                className={`text-left rounded-xl border px-4 py-3 transition-all ${
                  active
                    ? 'bg-gradient-to-br from-amber-50 to-rose-50 border-amber-300 ring-2 ring-amber-200 shadow-sm'
                    : 'bg-white/70 border-stone-200 hover:border-stone-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className={`text-sm font-bold ${active ? 'text-agora-dark' : 'text-agora-dark'}`}>{p.title}</div>
                  {active && <span className="text-[9px] uppercase tracking-wider text-amber-700 font-bold">Çalan</span>}
                </div>
                <div className="text-xs text-agora-muted">{p.composer}</div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-agora-muted/80 text-center mt-4 italic">
        Beta — gerçek vokal stem'leri. Stem'ler eşit kayıt seviyesindeyse parti gücü doğru orantılı çalışır.
      </p>
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

function OutPool({
  rows,
  effective,
  onAssign,
}: {
  rows: Row[];
  effective: (r: Row) => ChoirSection | 'out';
  onAssign: (id: number, target: ChoirSection | 'out') => void;
}) {
  const out = rows.filter((r) => effective(r) === 'out');
  if (out.length === 0) return null;
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-5">
      <div className="text-xs font-semibold text-agora-muted mb-2">Sahne dışı ({out.length})</div>
      <div className="flex flex-wrap gap-2">
        {out.map((row) => {
          const initials = `${row.user?.firstName?.[0] ?? '?'}${row.user?.lastName?.[0] ?? ''}`.toUpperCase();
          const orig = row.result.choirSection;
          return (
            <div key={row.result.id} className="flex items-center gap-1 bg-white border border-stone-200 rounded-full pl-1 pr-1.5 py-0.5">
              <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center text-stone-700 text-[10px] font-bold">{initials}</div>
              <span className="text-xs text-agora-dark">{row.user?.firstName}</span>
              <div className="flex items-center gap-0.5 ml-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onAssign(row.result.id!, s)}
                    title={`${SECTION_CFG[s].label}'ya ekle`}
                    className={`text-[9px] px-1.5 py-0.5 rounded ${SECTION_CFG[s].text} ${SECTION_CFG[s].bg} hover:brightness-95`}
                  >
                    {SECTION_CFG[s].label[0]}
                  </button>
                ))}
                {orig && (
                  <button
                    type="button"
                    onClick={() => onAssign(row.result.id!, orig)}
                    title="Orijinal partiye geri ver"
                    className="text-[9px] px-1.5 py-0.5 rounded text-stone-500 hover:bg-stone-100"
                  >
                    ↺
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// PIECES dışa kullanılmıyor ama ileride seçici eklemek için tutuluyor
void PIECES;
