import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mic, MicOff, ArrowRight } from 'lucide-react';
import { startLiveAnalyser, type LiveAnalyser } from '../lib/recorder';

type Status = 'idle' | 'requesting' | 'ready' | 'denied';

export default function MicCheck({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const analyserRef = useRef<LiveAnalyser | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      analyserRef.current?.cleanup();
    };
  }, []);

  const requestMic = async () => {
    setStatus('requesting');
    setError(null);
    try {
      const analyser = await startLiveAnalyser();
      analyserRef.current = analyser;
      setStatus('ready');
      const tick = () => {
        const rms = analyser.getRMS();
        setLevel(Math.min(1, rms * 8));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setStatus('denied');
      setError(err instanceof Error ? err.message : 'Mikrofon erişimi reddedildi.');
    }
  };

  const levelPct = Math.round(level * 100);

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-agora-muted hover:text-agora-dark transition-colors mb-6"
      >
        <ArrowLeft size={18} /> Geri
      </button>

      <h2 className="text-2xl sm:text-3xl font-bold text-agora-dark mb-2">Mikrofon kontrolü</h2>
      <p className="text-agora-muted mb-8">
        Tarayıcının mikrofon iznini ver, ardından "aaa" diyerek seviyeyi test et.
      </p>

      {status === 'idle' && (
        <button
          onClick={requestMic}
          className="w-full btn-agora-primary py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Mic size={20} /> Mikrofon İzni Ver
        </button>
      )}

      {status === 'requesting' && (
        <div className="text-center py-8 text-agora-muted">İzin bekleniyor...</div>
      )}

      {status === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex gap-3 items-start">
          <MicOff className="text-red-500 shrink-0 mt-0.5" size={22} />
          <div>
            <div className="font-semibold text-red-800 mb-1">Mikrofon erişilemedi</div>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={requestMic}
              className="mt-3 text-sm font-semibold text-red-800 hover:underline"
            >
              Tekrar dene
            </button>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-6">
            <div className="text-sm text-agora-muted mb-3 text-center">Mikrofon seviyesi</div>
            <div className="h-4 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--agora-olive)] via-[var(--agora-gold)] to-[var(--agora-terracotta)] transition-all duration-75"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <div className="text-xs text-center text-agora-muted mt-2">
              {levelPct < 5 ? 'Konuş veya "aaa" de' : levelPct < 30 ? 'İyi' : levelPct < 70 ? 'Mükemmel' : 'Biraz daha kıs'}
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full btn-agora-primary py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            Teste Geç <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
