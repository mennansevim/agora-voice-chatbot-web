import { useEffect, useState } from 'react';
import { Award, RefreshCw, Trophy, ChevronRight, CheckCircle2, XCircle, Mail, Phone, Send } from 'lucide-react';
import { db, type TestResultRow, type ChoirSection, updateChoirSection } from '../lib/db';
import { noteToTurkish } from '../lib/notes';
import { getAllVoiceMatches } from '../lib/voiceTypes';
import type { UserRow } from '../lib/db';
import { evaluateThreshold } from '../lib/threshold';

type Phase = 'section-pick' | 'analysis';

const SECTION_CONFIG: Record<ChoirSection, { label: string; color: string; bg: string; border: string }> = {
  soprano: { label: 'Soprano', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300' },
  alto:    { label: 'Alto',    color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  tenor:   { label: 'Tenor',   color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-300' },
  bass:    { label: 'Bas',     color: 'text-stone-700', bg: 'bg-stone-100', border: 'border-stone-400' },
};

function buildCommentary(r: TestResultRow): string[] {
  const lines: string[] = [];
  const oct = r.octaveRangeWidth;
  const sr = r.successRate;
  const totalAttempted = r.totalNotesCount;

  if (oct >= 2.5)
    lines.push(`🏆 ${r.lowestNote && r.highestNote ? `${noteToTurkish(r.lowestNote)} – ${noteToTurkish(r.highestNote)}` : ''} aralığıyla tam ${oct.toFixed(1)} oktav! Bu profesyonel sanatçı düzeyinde bir aralık; senin sesinle pek çok koro eserinin tamamını yalnız başına taşıyabilirsin.`);
  else if (oct >= 2)
    lines.push(`✨ ${oct.toFixed(1)} oktav ses aralığı etkileyici! Koro repertuvarındaki eserlerin büyük çoğunluğunu rahatça söyleyebilirsin. Birçok solo parçaya da uyumsun.`);
  else if (oct >= 1.5)
    lines.push(`👍 ${oct.toFixed(1)} oktavlık sağlam bir aralık. Standart koro eserlerini eksiksiz seslendirmek için yeterli. Ağırlıklı olarak orta aralık eserlerde en iyi performansı verirsin.`);
  else if (oct >= 1)
    lines.push(`🎵 ${oct.toFixed(1)} oktav tespit edildi. Pratik yaparak bu aralığı birkaç nota daha genişletebilirsin; şu anki aralıkla da pek çok eserde yer bulabilirsin.`);
  else
    lines.push(`🌱 Dar bir aralık tespit edildi. Daha sessiz bir ortamda ya da kulaklıkla tekrar dene — ya da düzenli ses egzersizleri ile aralığını zaman içinde geliştirebilirsin.`);

  if (totalAttempted > 0) {
    if (sr >= 85)
      lines.push(`🎯 Notaları tutturma oranın %${sr.toFixed(0)} — bu mükemmel bir kulak yeteneği gösteriyor. Ses kontrolün çok güçlü.`);
    else if (sr >= 70)
      lines.push(`👂 %${sr.toFixed(0)} başarı oranıyla notaları iyi takip ediyorsun. Düzenli egzersizle bu oran kolayca %85+ çıkar.`);
    else if (sr >= 50)
      lines.push(`📈 %${sr.toFixed(0)} başarı oranı gelişime açık. Piyano notalara bakarak şarkı söyleme pratikleri sana çok faydalı olur.`);
    else
      lines.push(`💡 Kulak eğitimi bu noktada önemli bir anahtar. Tonlama ve ses yüksekliği çalışmaları doğruluğunu hızla artırır.`);
  }

  return lines;
}

export default function Result({
  testResultId,
  onScoreboard,
  onRestart,
}: {
  testResultId: number;
  onScoreboard: () => void;
  onRestart: () => void;
}) {
  const [result, setResult] = useState<TestResultRow | null>(null);
  const [user, setUser] = useState<UserRow | null>(null);
  const [phase, setPhase] = useState<Phase>('section-pick');
  const [section, setSection] = useState<ChoirSection | null>(null);

  useEffect(() => {
    db.testResults.get(testResultId).then((r) => {
      if (!r) return;
      setResult(r);
      if (r.choirSection) {
        setSection(r.choirSection);
        setPhase('analysis');
      }
      db.users.get(r.userId).then((u) => setUser(u ?? null));
    });
  }, [testResultId]);

  if (!result) return <div className="text-center text-agora-muted py-12">Yükleniyor...</div>;

  const noResult = !result.lowestNote || !result.highestNote;
  const gender = user?.gender ?? 'male';
  const allMatches = noResult ? [] : getAllVoiceMatches(result.minFrequency, result.maxFrequency, gender);

  const sectionOptions: ChoirSection[] = gender === 'female' ? ['soprano', 'alto'] : ['tenor', 'bass'];

  const handleSectionPick = async (s: ChoirSection) => {
    setSection(s);
    await updateChoirSection(testResultId, s);
    setPhase('analysis');
  };

  if (phase === 'section-pick') {
    return (
      <div className="animate-fade-in max-w-xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--agora-gold)] to-[var(--agora-bronze)] shadow-glow mb-4">
          <Award size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-agora-dark mb-2">Test Tamamlandı!</h2>
        <p className="text-agora-muted mb-8">Bir koroda hangi ses grubunda yer alıyorsun?</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {sectionOptions.map((s) => {
            const cfg = SECTION_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => handleSectionPick(s)}
                className={`p-6 rounded-2xl border-2 ${cfg.bg} ${cfg.border} hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2`}
              >
                <div className={`text-4xl font-black ${cfg.color}`}>{cfg.label[0]}</div>
                <div className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPhase('analysis')}
          className="text-sm text-agora-muted hover:text-agora-dark flex items-center gap-1 mx-auto transition-colors"
        >
          Atla <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--agora-gold)] to-[var(--agora-bronze)] shadow-glow mb-4">
          <Award size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-agora-dark mb-1">Ses Analizi</h2>
        {section && (
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${SECTION_CONFIG[section].bg} ${SECTION_CONFIG[section].color} border ${SECTION_CONFIG[section].border}`}>
            {SECTION_CONFIG[section].label} Partisi
          </span>
        )}
      </div>

      {noResult ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
          <p className="text-agora-dark font-medium mb-2">Yeterli nota tespit edilemedi</p>
          <p className="text-sm text-agora-muted">Daha sessiz bir ortamda ve kulaklıkla tekrar dener misin?</p>
        </div>
      ) : (
        <>
          {/* Range + Type cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-5">
              <div className="text-xs text-agora-muted uppercase tracking-wider mb-2">Ses Aralığın</div>
              <div className="text-2xl font-bold text-agora-dark">
                {noteToTurkish(result.lowestNote)} – {noteToTurkish(result.highestNote)}
              </div>
              <div className="text-sm text-agora-muted mt-1">
                {result.octaveRangeWidth.toFixed(1)} oktav · {result.rangeWidthHz.toFixed(0)} Hz
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-5">
              <div className="text-xs text-agora-muted uppercase tracking-wider mb-2">Ses Tipin</div>
              <div className="text-2xl font-bold text-agora-dark">{result.voiceTypeName ?? '—'}</div>
              {result.voiceTypeName && (
                <div className="text-sm text-agora-muted mt-1">%{result.voiceTypeMatchPercent.toFixed(0)} eşleşme</div>
              )}
            </div>
          </div>

          {/* Choir admission status */}
          <ChoirAdmissionBadge result={result} user={user} />

          {/* Stats */}
          <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-5 mb-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-agora-dark">{result.totalNotesCount}</div>
                <div className="text-xs text-agora-muted">Toplam Nota</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-agora-dark">{result.successfulNotesCount}</div>
                <div className="text-xs text-agora-muted">Başarılı</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-agora-dark">{result.compositeScore.toFixed(0)}</div>
                <div className="text-xs text-agora-muted">Skor</div>
              </div>
            </div>
          </div>

          {/* Choir partition bars */}
          {allMatches.length > 0 && (
            <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-5 mb-5">
              <div className="text-sm font-semibold text-agora-dark mb-4">🎼 Koro Partisyon Analizi</div>
              <div className="space-y-3">
                {allMatches.map(({ type, percent }) => (
                  <PartitionBar key={type.id} label={type.name} percent={percent} />
                ))}
              </div>
            </div>
          )}

          {/* Commentary */}
          <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/60 rounded-2xl p-5 mb-5">
            <div className="text-sm font-semibold text-agora-dark mb-3">🔍 Ses Analizi</div>
            <div className="space-y-3">
              {buildCommentary(result).map((line, i) => (
                <p key={i} className="text-sm text-agora-dark leading-relaxed">{line}</p>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onScoreboard}
          className="flex-1 btn-agora-primary py-3 px-5 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Trophy size={18} /> Koro Kadrosu
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-5 rounded-xl font-semibold border-2 border-stone-300 text-agora-dark hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> Yeniden Test Et
        </button>
      </div>
    </div>
  );
}

function ChoirAdmissionBadge({ result, user }: { result: TestResultRow; user: UserRow | null }) {
  const ev = evaluateThreshold(result);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ev.passes) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-stone-50 border-2 border-amber-300 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <XCircle className="text-amber-700 shrink-0 mt-0.5" size={24} />
        <div className="flex-1">
          <div className="font-bold text-amber-800">Koroya katılım için biraz daha pratik gerekli</div>
          <div className="text-sm text-amber-800/80 mt-1 space-y-0.5">
            {ev.reasons.map((r, i) => (
              <div key={i}>• {r}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidPhone = (v: string) => v.trim().replace(/\D/g, '').length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Geçerli bir e-posta adresi gir.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Geçerli bir telefon numarası gir (en az 10 hane).');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        gender: user?.gender,
        email: email.trim(),
        phone: phone.trim(),
        voiceType: result.voiceTypeName,
        range: result.lowestNote && result.highestNote ? `${result.lowestNote} – ${result.highestNote}` : null,
        octaveWidth: result.octaveRangeWidth.toFixed(1),
        score: result.compositeScore.toFixed(0),
        successRate: result.successRate.toFixed(0),
        section: result.choirSection,
      };
      const res = await fetch('/api/save-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Kayıt başarısız');
      setSaved(true);
    } catch {
      setError('Kayıt sırasında bir sorun oluştu. Tekrar dener misin?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-stone-50 border-2 border-emerald-300 rounded-2xl p-5 mb-5">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={28} />
        <div>
          <div className="font-bold text-lg text-emerald-800">Tebrikler! 🎉</div>
          <div className="text-sm text-emerald-900/90 mt-1 leading-relaxed">
            Ses aralığın ve hakimiyetin koromuza kabul görecek seviyede.
            Sizinle iletişime geçebilmemiz için e-posta ve telefon bilgilerinizi bırakabilirsiniz.
          </div>
        </div>
      </div>

      {saved ? (
        <div className="flex items-start gap-2 bg-white/70 rounded-xl p-3 border border-emerald-200">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
          <div>
            <div className="text-sm font-semibold text-emerald-800">İletişim bilgilerin kaydedildi</div>
            <div className="text-xs text-emerald-800/70 mt-0.5">
              Yakında seninle iletişime geçeceğiz. Skor tablosunda da yer aldın!
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
              placeholder="E-posta adresin"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-white/80 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
              required
            />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); if (error) setError(null); }}
              placeholder="Telefon numaran (örn. 0532 123 45 67)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-white/80 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-colors disabled:opacity-60"
          >
            <Send size={16} /> {submitting ? 'Kaydediliyor...' : 'Bilgilerimi Gönder'}
          </button>
        </form>
      )}
    </div>
  );
}

function PartitionBar({ label, percent }: { label: string; percent: number }) {
  const pct = Math.min(100, Math.max(0, percent));
  const colorMap: Record<string, string> = {
    'Bas': 'from-stone-600 to-stone-400',
    'Bariton': 'from-slate-600 to-slate-400',
    'Tenor': 'from-blue-600 to-blue-400',
    'Kontralto': 'from-amber-700 to-amber-500',
    'Mezzo-soprano': 'from-orange-600 to-amber-400',
    'Soprano': 'from-rose-600 to-rose-400',
  };
  const gradient = colorMap[label] ?? 'from-stone-600 to-stone-400';
  const quality = pct >= 80 ? 'Çok Uygun' : pct >= 60 ? 'Uygun' : pct >= 40 ? 'Kısmen Uygun' : 'Az Uygun';

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-agora-dark">{label}</span>
        <span className="text-xs text-agora-muted">{quality} · %{pct.toFixed(0)}</span>
      </div>
      <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
