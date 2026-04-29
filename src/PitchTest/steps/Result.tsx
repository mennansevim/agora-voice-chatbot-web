import { useEffect, useState } from 'react';
import { Award, RefreshCw, Trophy, ChevronRight, CheckCircle2, XCircle, Mail, Phone, Send, Eye, EyeOff } from 'lucide-react';
import { getSession, setPublished, type TestResultRow, type ChoirSection, updateChoirSection } from '../lib/db';
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

type AnalysisSection = { title: string; body: string };

function buildAnalysis(r: TestResultRow): AnalysisSection[] {
  const sections: AnalysisSection[] = [];
  const oct = r.octaveRangeWidth;

  // 1. SES ARALIĞI
  const rangeStr = r.lowestNote && r.highestNote
    ? `${noteToTurkish(r.lowestNote)} – ${noteToTurkish(r.highestNote)}`
    : '';
  let rangeText = '';
  if (oct >= 3) {
    rangeText = `${rangeStr} arası tam ${oct.toFixed(2)} oktav — bu profesyonel düzey, opera ve oratoryo solistlerinin sahip olduğu genişlik. ${r.successfulNotesCount} farklı notayı temiz şekilde tutturuyorsun.`;
  } else if (oct >= 2.3) {
    rangeText = `${rangeStr} aralığı ${oct.toFixed(2)} oktav — solist düzeyine yakın. Koro repertuvarının neredeyse tamamını rahatça taşırsın; bazı solo parçalar da menzilinde.`;
  } else if (oct >= 1.8) {
    rangeText = `${rangeStr} arası ${oct.toFixed(2)} oktav — gelişmiş amatör koroda solist sınıfı. Standart koro eserlerinin %95'ini sıkıntısız söylersin.`;
  } else if (oct >= 1.3) {
    rangeText = `${rangeStr} arası ${oct.toFixed(2)} oktav — sağlam bir koro üyesi aralığı. Ana melodi çizgilerini tutturursun, ekstrem uçlardaki bazı pasajlar zorlayabilir.`;
  } else if (oct >= 0.8) {
    rangeText = `${rangeStr} arası ${oct.toFixed(2)} oktav — şu an dar; pratikle iki yöne de açılabilir. Erken aşamada normal.`;
  } else {
    rangeText = `${oct.toFixed(2)} oktav — ortam veya kayıt koşulları dar bir aralık vermiş olabilir. Sessiz ortamda + kulaklıkla tekrar dene.`;
  }
  sections.push({ title: '🎵 Ses Aralığı', body: rangeText });

  // 2. SES TİPİ & RENK (timbre — voice type'tan + olası gruplardan çıkarım)
  if (r.voiceTypeName) {
    const timbreNotes = describeTimbre(r.voiceTypeName);
    const flexibility = r.possibleVoiceGroups
      ? ` İkincil eşleşmelerin (${r.possibleVoiceGroups}) sesinin **esnek** ve farklı partiler arası geçişlere uygun olduğunu gösteriyor.`
      : '';
    sections.push({
      title: '🎼 Ses Tipi & Renk',
      body: `**${r.voiceTypeName}** sınıfında, %${r.voiceTypeMatchPercent.toFixed(0)} eşleşme. ${timbreNotes}${flexibility}`,
    });
  }

  // 3. TONAL KONTROL & VİBRATO
  if (typeof r.avgPitchStability === 'number' && r.avgPitchStability > 0) {
    const c = r.avgPitchStability;
    let body = '';
    if (c < 8) {
      body = `Ortalama tonal sapma sadece **${c.toFixed(1)} cent** — neredeyse matematiksel kesinlikte. Notayı tutturduğunda merkezde tutuyorsun. Bu, koro içinde uyum kurmayı kolaylaştıran bir özellik; aynı zamanda solist seçilmeyi hak eden bir sıkı kulak göstergesi.`;
    } else if (c < 18) {
      body = `**${c.toFixed(1)} cent** ortalama dalgalanma — sağlıklı, doğal bir mikro-titreşim aralığı. Sesinde yapay olmayan bir vibrato karakteri var; bu ifade gücüne ve şarkıya duygusal renk katar. Klasik şarkıcılığa uygun.`;
    } else if (c < 35) {
      body = `Cents cinsinden ${c.toFixed(1)} sapma — vibrato genişliği biraz fazla. Sustain egzersizleriyle daraltılırsa daha kontrollü bir ton elde edilir. Şu an ifadeci ama bazen merkezden uzaklaşıyor.`;
    } else {
      body = `${c.toFixed(1)} cent dalgalanma yüksek. Tonu sabit tutmakta zorlanıyor olabilirsin. Düzenli "uzun ses" çalışması (mesela 5-10 saniye sabit nota) belirgin fark yaratır.`;
    }
    sections.push({ title: '🌊 Tonal Kontrol & Vibrato', body });
  }

  // 4. ŞİDDET & PROJEKSİYON
  if (typeof r.avgRms === 'number' && r.avgRms > 0) {
    const v = r.avgRms;
    let body = '';
    if (v < 0.04) {
      body = `Mikrofona oldukça düşük ses geldiği görülüyor (RMS ≈ ${v.toFixed(3)}). Uzaklık veya çekingen bir çıkış olabilir. Sesini test sırasında daha güvenle ortaya koyman daha doğru sonuç verir.`;
    } else if (v < 0.10) {
      body = `Konuşma seviyesinde, doğal bir çıkış (RMS ≈ ${v.toFixed(3)}). Koro içinde dengeli bir sayfa oluşturur; geniş salonda mikrofonsuz öne çıkması için biraz destek gerekir.`;
    } else if (v < 0.20) {
      body = `Sağlıklı projeksiyon (RMS ≈ ${v.toFixed(3)}). Sesin salonun orta sıralarına rahatça taşır. Koro önünde güvenle yer alabilirsin.`;
    } else {
      body = `Kuvvetli, açık bir ses çıkışı (RMS ≈ ${v.toFixed(3)}). Mikrofonsuz büyük salonda da çekirdek taşıyıcı olabilirsin. Solo veya küçük grup düzenlemelerinde öne çıkabilen bir karakter.`;
    }
    sections.push({ title: '🔊 Şiddet & Projeksiyon', body });
  }

  // 5. NEFES DESTEĞİ
  if (typeof r.avgVoicedRatio === 'number' && r.avgVoicedRatio > 0) {
    const v = r.avgVoicedRatio;
    let body = '';
    if (v >= 0.85) {
      body = `Notayı baştan sona kararlı taşıyorsun (sesli oran %${(v * 100).toFixed(0)}). Diafram desteğin sağlam — uzun frazlarda ve pianissimo geçişlerde nefesin yeterli.`;
    } else if (v >= 0.65) {
      body = `Sesli oran %${(v * 100).toFixed(0)} — iyi seviye. Çoğu fraz boyunca sürdürebiliyorsun, çok uzun cümlelerde küçük destek molaları gerekebilir.`;
    } else if (v >= 0.45) {
      body = `Sesli oran %${(v * 100).toFixed(0)} — notayı orta-yola kadar taşıyıp bırakıyor olabilirsin. Nefes egzersizleri (4-7-8 tekniği, "s" tutma) sürdürmeyi belirgin uzatır.`;
    } else {
      body = `Sesli oran %${(v * 100).toFixed(0)} oldukça düşük. Notayı kısa kestiğin söylenebilir; ya da mikrofonun sesi sürekli almıyor. Nefes desteği üzerine çalışmak temel bir kazanım olur.`;
    }
    sections.push({ title: '💨 Nefes Desteği & Sürdürme', body });
  }

  // 6. ÖZET & ÖNERİ
  const summary = buildSummary(r);
  if (summary) sections.push({ title: '🎯 Genel Yorum', body: summary });

  return sections;
}

function describeTimbre(voiceType: string): string {
  switch (voiceType) {
    case 'Bas':
      return 'Karakteristik olarak **karanlık, gövdeli, derin** bir tını taşır. Pes notalarda zengin alt-harmonikler; gövde rezonansı belirgin. Geleneksel klasik koroda kemik partisi.';
    case 'Bariton':
      return '**Sıcak ve yuvarlak** bir ton karakteri. Operada en sık ihtiyaç duyulan erkek sesi; tenor parlaklığını tabanın gücüyle birleştirir. Türk Sanat Müziği erkek sololarına da uyumlu.';
    case 'Tenor':
      return '**Parlak, mendili andıran**, lirik tını. Yüksek register’da projeksiyon kabiliyeti güçlü; opera tenoru, halk türkülerinde çığırma sesi. Pop/rock erkek vokalde de standart.';
    case 'Kontralto':
      return '**Koyu altın**, ten gövdeli kadın sesi. Nadir ve değerli — Bach kantatlarında alt solo sıklıkla bu ses içindir. Caz ve blues estetiğine de uygun.';
    case 'Mezzo-soprano':
      return '**Olgun, dolgun** bir kadın tını. Carmen, Octavian, Türk Sanat Müziği kadın sololarının çoğu. Mezzo, koroda alto köprüsünü sopranoya bağlar.';
    case 'Soprano':
      return '**Berrak, tiz, genelde parlak** karakter. Opera baş kadın rolleri (Tosca, Mimi, Violetta), Bach koroları üst sesi. Kraliçe arya sesidir.';
    default:
      return 'Karakteristik bir tını dağılımı tespit edildi.';
  }
}

function buildSummary(r: TestResultRow): string {
  const parts: string[] = [];
  // Range bias
  if (r.octaveRangeWidth >= 2.3) parts.push('geniş aralık');
  else if (r.octaveRangeWidth >= 1.5) parts.push('sağlam aralık');
  // Stability
  if (typeof r.avgPitchStability === 'number') {
    if (r.avgPitchStability < 8) parts.push('mükemmel tonal kontrol');
    else if (r.avgPitchStability < 18) parts.push('sağlıklı vibrato');
  }
  // Volume
  if (typeof r.avgRms === 'number') {
    if (r.avgRms >= 0.20) parts.push('kuvvetli projeksiyon');
    else if (r.avgRms >= 0.10) parts.push('dengeli ses çıkışı');
  }
  // Breath
  if (typeof r.avgVoicedRatio === 'number' && r.avgVoicedRatio >= 0.85) {
    parts.push('güçlü nefes desteği');
  }

  if (parts.length === 0) return '';
  const strengthsText = parts.join(', ');
  return `Senin için öne çıkan üç güçlü yön: **${strengthsText}**. Bu kombinasyon ${r.choirSection ? r.choirSection + ' ' : ''}partisinde aktif rol almak için yeterli; pratik üzerine düzenli koro çalışması seni hızla daha üst seviyeye taşır.`;
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
    getSession(testResultId).then((s) => {
      if (!s) return;
      setResult(s.result);
      setUser(s.user);
      if (s.result.choirSection) {
        setSection(s.result.choirSection);
        setPhase('analysis');
      }
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

          {/* Publish to scoreboard prompt */}
          <PublishCard
            result={result}
            onChange={(p) => setResult({ ...result, published: p })}
          />

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

          {/* Detaylı analiz */}
          <div className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/60 rounded-2xl p-5 mb-5">
            <div className="text-sm font-semibold text-agora-dark mb-4">🔍 Detaylı Ses Analizi</div>
            <div className="space-y-4">
              {buildAnalysis(result).map((sec, i) => (
                <div key={i} className="border-l-2 border-amber-300 pl-3">
                  <div className="text-sm font-bold text-agora-dark mb-1">{sec.title}</div>
                  <p
                    className="text-sm text-agora-dark/90 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sec.body.replace(/\*\*(.+?)\*\*/g, '<strong class="text-agora-dark">$1</strong>'),
                    }}
                  />
                </div>
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

function PublishCard({ result, onChange }: { result: TestResultRow; onChange: (published: boolean) => void }) {
  const [pending, setPending] = useState(false);
  const decide = async (yes: boolean) => {
    if (!result.id) return;
    setPending(true);
    try {
      await setPublished(result.id, yes);
      onChange(yes);
    } finally {
      setPending(false);
    }
  };

  // Karar verilmiş — küçük durum çubuğu
  if (result.published === true) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 mb-5 rounded-xl bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <Eye size={16} /> Skor tablosunda yayınlanıyor
        </div>
        <button
          onClick={() => decide(false)}
          disabled={pending}
          className="text-xs font-semibold text-emerald-800 hover:underline disabled:opacity-50"
        >
          Gizle
        </button>
      </div>
    );
  }
  if (result.published === false) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 mb-5 rounded-xl bg-stone-100 border border-stone-300">
        <div className="flex items-center gap-2 text-sm font-medium text-agora-dark">
          <EyeOff size={16} /> Skor tablosunda gizli
        </div>
        <button
          onClick={() => decide(true)}
          disabled={pending}
          className="text-xs font-semibold text-agora-dark hover:underline disabled:opacity-50"
        >
          Yayınla
        </button>
      </div>
    );
  }

  // Henüz karar verilmemiş — soru kartı
  return (
    <div className="bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-300 rounded-2xl p-5 mb-5">
      <div className="flex items-start gap-3 mb-4">
        <Trophy className="text-amber-700 shrink-0 mt-0.5" size={22} />
        <div>
          <div className="font-semibold text-agora-dark">Skor tablosunda yayınlansın mı?</div>
          <div className="text-sm text-agora-muted mt-0.5">
            "Evet" dersen koro kadrosunda görünürsün. "Hayır" dersen kayıt sadece bizde kalır, listede görünmezsin.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => decide(true)}
          disabled={pending}
          className="py-2.5 px-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:opacity-95 disabled:opacity-50 transition-opacity"
        >
          Evet, yayınla
        </button>
        <button
          onClick={() => decide(false)}
          disabled={pending}
          className="py-2.5 px-4 rounded-xl font-semibold border-2 border-stone-300 text-agora-dark hover:bg-stone-100 disabled:opacity-50 transition-colors"
        >
          Hayır, gizli kalsın
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
