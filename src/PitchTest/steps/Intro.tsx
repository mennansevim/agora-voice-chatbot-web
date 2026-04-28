import { Headphones, Mic, Music, Trophy, Volume2 } from 'lucide-react';
import { unlockAudio } from '../lib/audioPlayer';

export default function Intro({ onStart, onScoreboard }: { onStart: () => void; onScoreboard: () => void }) {
  const handleStart = async () => {
    await unlockAudio();
    onStart();
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--agora-terracotta)] to-[var(--agora-bronze)] shadow-glow mb-3">
          <Music size={28} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-agora-dark mb-2">
          Ses Aralığı Testi
        </h1>
        <p className="text-sm text-agora-muted max-w-xl mx-auto leading-relaxed">
          Sesini birkaç dakikada keşfet. Piyanodan çalınan notaları taklit et; en pes ve en tiz notalarını bulup ses tipini ve şarkı önerini görelim.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <Step icon={<Volume2 size={16} />} title="1. Dinle" desc="Piyano notası çalar" />
        <Step icon={<Mic size={16} />} title="2. Söyle" desc="Aynı notayı 2 sn sen söylersin" />
        <Step icon={<Trophy size={16} />} title="3. Sonuç" desc="Ses aralığın ve tipin" />
      </div>

      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 mb-5 flex gap-2.5 items-start">
        <Headphones className="text-[var(--agora-bronze)] shrink-0 mt-0.5" size={18} />
        <div>
          <div className="font-semibold text-agora-dark text-sm leading-tight">Kulaklık önerilir</div>
          <p className="text-xs text-agora-muted leading-relaxed mt-0.5">
            Hoparlörden çıkan notayı mikrofonun duymaması için kulaklık tak. Sessiz bir ortam doğruluğu artırır.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleStart}
          className="flex-1 btn-agora-primary py-3 px-6 rounded-xl font-semibold"
        >
          Teste Başla
        </button>
        <button
          onClick={onScoreboard}
          className="flex-1 sm:flex-initial sm:px-8 py-3 rounded-xl font-semibold border-2 border-stone-300 text-agora-dark hover:bg-stone-100 transition-colors"
        >
          Skor Tablosu
        </button>
      </div>
    </div>
  );
}

function Step({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-xl p-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-stone-100 flex items-center justify-center text-[var(--agora-bronze)] mb-2">
        {icon}
      </div>
      <div className="font-semibold text-agora-dark text-sm mb-0.5">{title}</div>
      <div className="text-xs text-agora-muted leading-snug">{desc}</div>
    </div>
  );
}
