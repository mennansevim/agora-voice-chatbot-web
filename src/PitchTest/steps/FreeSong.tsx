import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Music2, ArrowRight, Check, X } from 'lucide-react';
import { startContinuousRecording, type ContinuousRecording, abortActiveRecording } from '../lib/recorder';
import { uploadRecording } from '../lib/db';

const MAX_DURATION_SEC = 120;

type Phase = 'ask' | 'recording' | 'share' | 'done';

export default function FreeSong({
  sessionId,
  onSkip,
  onFinish,
}: {
  sessionId: number;
  onSkip: () => void;
  onFinish: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('ask');
  const [elapsed, setElapsed] = useState(0);
  const [uploading, setUploading] = useState(false);
  const recRef = useRef<ContinuousRecording | null>(null);
  const blobRef = useRef<{ blob: Blob; durationSec: number } | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      abortActiveRecording();
    };
  }, []);

  async function handleStart() {
    try {
      const rec = await startContinuousRecording(MAX_DURATION_SEC);
      recRef.current = rec;
      setElapsed(0);
      const startedAt = Date.now();
      tickRef.current = window.setInterval(() => {
        const sec = (Date.now() - startedAt) / 1000;
        setElapsed(sec);
        if (sec >= MAX_DURATION_SEC) handleStop();
      }, 200);
      setPhase('recording');
    } catch (e) {
      console.error(e);
      onSkip();
    }
  }

  async function handleStop() {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    const rec = recRef.current;
    if (!rec) return;
    recRef.current = null;
    const result = await rec.stop();
    blobRef.current = { blob: result.blob, durationSec: result.durationSec };
    setPhase('share');
  }

  async function handleShareDecision(share: boolean) {
    const data = blobRef.current;
    if (!data) { onFinish(); return; }
    setUploading(true);
    try {
      await uploadRecording(sessionId, 'song', data.blob, {
        idx: Date.now(),
        duration: data.durationSec.toFixed(1),
        shareToScoreboard: share,
      });
    } finally {
      setUploading(false);
      setPhase('done');
      onFinish();
    }
  }

  if (phase === 'ask') {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-amber-500 shadow-glow mb-3">
            <Music2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-agora-dark mb-2">İçinizden Bir Şarkı?</h1>
          <p className="text-sm text-agora-muted max-w-xl mx-auto leading-relaxed">
            Test bitti — şimdi içinizden gelen bir şarkıyı seslendirir misiniz? En fazla 2 dakika.
            Bu kayıt, ses tanıma modelimizi geliştirmek için kullanılır.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStart}
            className="flex-1 btn-agora-primary py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Mic size={18} /> Evet, Söyleyeyim
          </button>
          <button
            onClick={onSkip}
            className="sm:flex-initial sm:px-8 py-3 rounded-xl font-semibold border-2 border-stone-300 text-agora-dark hover:bg-stone-100 transition-colors"
          >
            Hayır, Geç
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'recording') {
    const remaining = Math.max(0, MAX_DURATION_SEC - elapsed);
    const pct = (elapsed / MAX_DURATION_SEC) * 100;
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center">
        <div className="relative mx-auto mb-6" style={{ width: 180, height: 180 }}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 animate-pulse shadow-2xl" />
          <div className="absolute inset-3 rounded-full bg-white/90 flex flex-col items-center justify-center">
            <Mic size={32} className="text-rose-500 mb-1" />
            <div className="text-2xl font-mono font-bold text-agora-dark">{formatTime(elapsed)}</div>
            <div className="text-[10px] text-agora-muted">/ {formatTime(MAX_DURATION_SEC)}</div>
          </div>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-4 max-w-md mx-auto">
          <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-agora-muted mb-6">
          Kayıt yapılıyor… {remaining < 10 ? <strong className="text-rose-600">{Math.ceil(remaining)} sn kaldı</strong> : 'rahat olun'}
        </p>
        <button
          onClick={handleStop}
          className="px-6 py-3 rounded-xl font-semibold bg-stone-800 text-white hover:bg-stone-900 inline-flex items-center gap-2"
        >
          <Square size={18} fill="currentColor" /> Bitir ve Yükle
        </button>
      </div>
    );
  }

  if (phase === 'share') {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-100 text-emerald-700 mb-4">
          <Check size={28} />
        </div>
        <h2 className="text-2xl font-bold text-agora-dark mb-2">Kayıt alındı!</h2>
        <p className="text-sm text-agora-muted max-w-md mx-auto mb-6">
          Bu kaydı skor tablosunda diğer kullanıcılarla paylaşmak ister misiniz?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => handleShareDecision(true)}
            disabled={uploading}
            className="btn-agora-primary py-3 px-6 rounded-xl font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Check size={18} /> Evet, Paylaş
          </button>
          <button
            onClick={() => handleShareDecision(false)}
            disabled={uploading}
            className="py-3 px-6 rounded-xl font-semibold border-2 border-stone-300 text-agora-dark hover:bg-stone-100 inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <X size={18} /> Hayır, Sadece Sakla
          </button>
        </div>
        {uploading && <p className="text-xs text-agora-muted mt-3">Yükleniyor…</p>}
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto text-center py-12">
      <ArrowRight size={32} className="mx-auto text-agora-muted mb-2" />
      <p className="text-agora-muted">Yönlendiriliyor…</p>
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}
