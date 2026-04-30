import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Check, X as XIcon, Music2 } from 'lucide-react';
import { topScoreboard, clearAllData, deleteResult, setPublished, type ChoirSection, type AttemptRow } from '../lib/db';
import { noteToTurkish } from '../lib/notes';
import { passesChoirThreshold, CHOIR_THRESHOLD } from '../lib/threshold';

type Row = Awaited<ReturnType<typeof topScoreboard>>[number];

const SECTION_CFG: Record<ChoirSection, { label: string; gradient: string; text: string; ring: string }> = {
  soprano: { label: 'Soprano', gradient: 'from-rose-500 to-pink-400',   text: 'text-rose-700',  ring: 'ring-rose-400' },
  alto:    { label: 'Alto',    gradient: 'from-amber-500 to-yellow-400', text: 'text-amber-700', ring: 'ring-amber-400' },
  tenor:   { label: 'Tenor',   gradient: 'from-blue-500 to-sky-400',    text: 'text-blue-700',  ring: 'ring-blue-400' },
  bass:    { label: 'Bas',     gradient: 'from-stone-600 to-slate-500',  text: 'text-stone-700', ring: 'ring-stone-400' },
};

const UNKNOWN_CFG = { label: '?', gradient: 'from-stone-400 to-stone-300', text: 'text-stone-600', ring: 'ring-stone-300' };

// 2x2 sahne yerleşimi:
//  Arka:  TENOR  (sol) |  BAS (sağ)
//  Ön:    SOPRANO(sol) |  ALTO (sağ)
const STAGE_LAYOUT: { section: ChoirSection; row: 'back' | 'front'; col: 'left' | 'right' }[] = [
  { section: 'tenor',   row: 'back',  col: 'left' },
  { section: 'bass',    row: 'back',  col: 'right' },
  { section: 'soprano', row: 'front', col: 'left' },
  { section: 'alto',    row: 'front', col: 'right' },
];

function avgRmsOf(rows: Row[]): number | null {
  const vals = rows.map((r) => r.result.avgRms ?? 0).filter((v) => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

// RMS değerini 0-1 yoğunluk skoruna çevir, renk seçimi için
function rmsLevel(rms: number | null): 'unknown' | 'low' | 'mid' | 'high' {
  if (rms == null) return 'unknown';
  if (rms < 0.05) return 'low';
  if (rms < 0.12) return 'mid';
  return 'high';
}

const POWER_BADGE: Record<ReturnType<typeof rmsLevel>, { label: string; cls: string }> = {
  unknown: { label: '— güç bilgisi yok',     cls: 'bg-stone-500/20 text-stone-300 border-stone-500/40' },
  low:     { label: 'Hafif çıkış',           cls: 'bg-sky-500/20 text-sky-200 border-sky-400/40' },
  mid:     { label: 'Dengeli çıkış',         cls: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/50' },
  high:    { label: 'Kuvvetli çıkış',        cls: 'bg-rose-500/25 text-rose-100 border-rose-400/60' },
};

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName?.[0] ?? '?').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

function ChoirBalance({ grouped, totalMembers }: { grouped: Map<ChoirSection | 'unknown', Row[]>; totalMembers: number }) {
  const sections: ChoirSection[] = ['soprano', 'alto', 'tenor', 'bass'];
  const counts = sections.map((s) => grouped.get(s)?.length ?? 0);
  const max = Math.max(1, ...counts);
  const minCount = Math.min(...counts);
  const ideal = totalMembers / 4;

  // Eksik partileri belirle
  const missing = sections.filter((_, i) => counts[i] === 0);
  // Gözle görünür baskınlık var mı? (ortalamanın 1.6x üstü)
  const dominant = sections.filter((_, i) => counts[i] >= ideal * 1.6 && counts[i] >= 2);
  // Görünür eksik (ortalamanın yarısı altı, ama 0 değil)
  const weak = sections.filter((_, i) => counts[i] > 0 && counts[i] < ideal * 0.5);

  let verdict: { tone: 'good' | 'warn' | 'bad'; text: string };
  if (missing.length >= 2) {
    verdict = { tone: 'bad', text: `Sahnede ${missing.map((s) => SECTION_CFG[s].label).join(' ve ')} parti${missing.length > 1 ? 'leri' : 'si'} eksik. SATB harmonisi için en azından her parti birer üye gerekir.` };
  } else if (missing.length === 1) {
    verdict = { tone: 'warn', text: `${SECTION_CFG[missing[0]].label} partisi henüz hiç katılmamış. Tek bir kayıt bile koroyu dört sesli hale getirir.` };
  } else if (dominant.length > 0 && weak.length > 0) {
    verdict = { tone: 'warn', text: `${dominant.map((s) => SECTION_CFG[s].label).join(', ')} partisi ağır basıyor; ${weak.map((s) => SECTION_CFG[s].label).join(', ')} desteğe ihtiyaç duyuyor. Tutarlı bir ses dengesi için ek kayıt iyi olur.` };
  } else if (dominant.length > 0) {
    verdict = { tone: 'warn', text: `${dominant.map((s) => SECTION_CFG[s].label).join(', ')} partisi ortalamanın belirgin şekilde üzerinde — diğer partilerden ek katılım dengeyi düzeltir.` };
  } else if (totalMembers >= 4 && minCount >= Math.floor(ideal * 0.7)) {
    verdict = { tone: 'good', text: `Tüm partilerde dengeli dağılım var. SATB harmonisi için temel kadro sağlam.` };
  } else if (totalMembers < 4) {
    verdict = { tone: 'warn', text: `Henüz ${totalMembers} üye var. Dört sesli koro için her partide birer kişi yeterli; yenileri davet et.` };
  } else {
    verdict = { tone: 'good', text: `Dağılım kabul edilebilir aralıkta. Yeni katılımlarla ideale yaklaşılabilir.` };
  }

  const verdictCls = verdict.tone === 'good'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
    : verdict.tone === 'warn'
    ? 'bg-amber-50 border-amber-200 text-amber-900'
    : 'bg-rose-50 border-rose-200 text-rose-900';

  return (
    <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl p-4 mb-6">
      <div className="text-sm font-semibold text-agora-dark mb-3">⚖️ Koro Dengesi</div>

      {/* Stacked bar — partilerin oranı */}
      <div className="h-3 rounded-full overflow-hidden flex bg-stone-100 mb-3">
        {sections.map((s, i) => {
          const pct = totalMembers ? (counts[i] / totalMembers) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={s}
              className={`h-full bg-gradient-to-r ${SECTION_CFG[s].gradient}`}
              style={{ width: `${pct}%` }}
              title={`${SECTION_CFG[s].label}: ${counts[i]} kişi (${pct.toFixed(0)}%)`}
            />
          );
        })}
      </div>

      {/* Partition oranları */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {sections.map((s, i) => {
          const pct = totalMembers ? (counts[i] / totalMembers) * 100 : 0;
          const fill = (counts[i] / max) * 100;
          return (
            <div key={s} className="text-center">
              <div className="h-12 flex items-end justify-center mb-1">
                <div
                  className={`w-3 rounded-t bg-gradient-to-t ${SECTION_CFG[s].gradient}`}
                  style={{ height: `${Math.max(6, fill)}%` }}
                />
              </div>
              <div className={`text-xs font-bold ${SECTION_CFG[s].text}`}>{counts[i]}</div>
              <div className="text-[9px] text-agora-muted">{SECTION_CFG[s].label}</div>
              <div className="text-[9px] text-agora-muted">%{pct.toFixed(0)}</div>
            </div>
          );
        })}
      </div>

      {/* Yorum */}
      <div className={`text-xs leading-relaxed border rounded-lg p-2.5 ${verdictCls}`}>
        {verdict.text}
      </div>
    </div>
  );
}

function ScoreRow({ row, rank, onSelect }: { row: Row; rank: number; onSelect: (r: Row) => void }) {
  const sec = row.result.choirSection;
  const cfg = sec ? SECTION_CFG[sec] : UNKNOWN_CFG;
  const rankColor =
    rank === 1 ? 'bg-amber-400 text-white' :
    rank === 2 ? 'bg-stone-400 text-white' :
    rank === 3 ? 'bg-amber-700 text-white' :
    'bg-stone-200 text-agora-dark';

  return (
    <button
      type="button"
      onClick={() => onSelect(row)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankColor}`}>
        {rank}
      </div>
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-xs font-bold`}>
        {getInitials(row.user?.firstName, row.user?.lastName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-agora-dark truncate">
          {row.user ? `${row.user.firstName} ${row.user.lastName}` : '—'}
          {sec && <span className={`ml-2 text-xs ${cfg.text}`}>({cfg.label})</span>}
        </div>
        <div className="text-xs text-agora-muted">
          {row.result.lowestNote && row.result.highestNote
            ? `${noteToTurkish(row.result.lowestNote)} – ${noteToTurkish(row.result.highestNote)}`
            : '—'}
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-bold text-agora-dark">{row.result.compositeScore.toFixed(0)}</div>
        <div className="text-xs text-agora-muted">{row.result.octaveRangeWidth.toFixed(1)} okt</div>
      </div>
    </button>
  );
}

function ScoreDetails({ row }: { row: Row }) {
  const r = row.result;
  const attempts = row.attempts ?? [];

  // Best attempt per note
  const bestByNote = new Map<string, AttemptRow>();
  for (const a of attempts) {
    const prev = bestByNote.get(a.noteName);
    if (!prev || a.accuracyPercent > prev.accuracyPercent) bestByNote.set(a.noteName, a);
  }
  const successful = [...bestByNote.values()].filter((a) => a.isSuccessful).sort((a, b) => a.targetFrequency - b.targetFrequency);
  const failed = [...bestByNote.values()].filter((a) => !a.isSuccessful).sort((a, b) => a.targetFrequency - b.targetFrequency);

  return (
    <div className="bg-stone-50 px-4 py-4 border-t border-stone-200 space-y-4 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Toplam" value={r.totalNotesCount.toString()} />
        <Stat label="Başarılı" value={r.successfulNotesCount.toString()} />
        <Stat label="Doğruluk" value={`%${r.successRate.toFixed(0)}`} />
        <Stat label="Ses Tipi" value={r.voiceTypeName ?? '—'} />
      </div>

      {/* Possible groups */}
      {r.possibleVoiceGroups && (
        <div className="text-xs">
          <div className="text-agora-muted mb-1">Olası ses grupları:</div>
          <div className="text-agora-dark">{r.possibleVoiceGroups}</div>
        </div>
      )}

      {/* Successful notes */}
      {successful.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-2">
            <Check size={14} /> Başarılı Notalar ({successful.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {successful.map((a) => (
              <NoteBadge key={a.noteName} attempt={a} success />
            ))}
          </div>
        </div>
      )}

      {/* Failed notes */}
      {failed.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 mb-2">
            <XIcon size={14} /> Tutturamadığı Notalar ({failed.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {failed.map((a) => (
              <NoteBadge key={a.noteName} attempt={a} />
            ))}
          </div>
        </div>
      )}

      {attempts.length === 0 && (
        <div className="text-xs text-agora-muted italic">Detay verisi yok</div>
      )}
    </div>
  );
}

function NoteBadge({ attempt, success }: { attempt: AttemptRow; success?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center px-2 py-1 rounded-md border text-xs ${
        success
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-stone-100 border-stone-200 text-stone-500'
      }`}
    >
      <span className="font-semibold leading-tight">{noteToTurkish(attempt.noteName)}</span>
      <span className="text-[10px] opacity-80 leading-tight">%{Math.round(attempt.accuracyPercent)}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 px-2 py-2">
      <div className="text-base font-bold text-agora-dark truncate">{value}</div>
      <div className="text-[10px] text-agora-muted">{label}</div>
    </div>
  );
}

function MemberDrawer({ row, onClose, onDelete }: { row: Row | null; onClose: () => void; onDelete: (id: number) => void }) {
  if (!row) return null;
  const r = row.result;
  const u = row.user;
  const sec = r.choirSection;
  const cfg = sec ? SECTION_CFG[sec] : UNKNOWN_CFG;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end animate-fade-in">
      {/* Görünmez tıklama alanı — sağdaki drawer dışına tıklayınca kapatır */}
      <div className="flex-1 h-full" onClick={onClose} />
      <aside
        className="relative w-full sm:max-w-md bg-white shadow-2xl overflow-y-auto h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-stone-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-bold text-base shrink-0`}>
              {getInitials(u?.firstName, u?.lastName)}
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-agora-dark truncate">
                {u ? `${u.firstName} ${u.lastName}` : '—'}
              </div>
              <div className={`text-xs font-medium ${cfg.text}`}>
                {sec ? cfg.label : 'Belirsiz parti'} {u && `· ${u.gender === 'female' ? 'Kadın' : 'Erkek'}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={async () => {
                const pwd = prompt('Bu üyeyi skor tablosundan çıkarmak için şifre:');
                if (pwd === null) return;
                if (!confirm(`${u ? `${u.firstName} ${u.lastName}` : 'Bu kayıt'} skor tablosundan kalıcı olarak silinecek. Emin misin?`)) return;
                try {
                  await deleteResult(r.id!, pwd);
                  onDelete(r.id!);
                } catch {
                  alert('Şifre hatalı veya sunucu hatası.');
                }
              }}
              className="p-2 rounded-full hover:bg-red-50 text-red-600"
              aria-label="Skor tablosundan çıkar"
              title="Skor tablosundan çıkar (şifre korumalı)"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-agora-muted"
              aria-label="Kapat"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Genel istatistikler */}
          <section>
            <div className="text-xs font-semibold text-agora-muted uppercase tracking-wider mb-2">Özet</div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Skor" value={r.compositeScore.toFixed(0)} />
              <Stat label="Oktav" value={r.octaveRangeWidth.toFixed(2)} />
              <Stat label="Doğruluk" value={`%${r.successRate.toFixed(0)}`} />
            </div>
          </section>

          {/* Aralık + tip */}
          <section>
            <div className="text-xs font-semibold text-agora-muted uppercase tracking-wider mb-2">Ses Profili</div>
            <div className="space-y-1.5 text-sm">
              <Field label="Aralık" value={r.lowestNote && r.highestNote ? `${noteToTurkish(r.lowestNote)} – ${noteToTurkish(r.highestNote)}` : '—'} />
              <Field label="Frekans Genişliği" value={`${r.rangeWidthHz.toFixed(0)} Hz`} />
              <Field label="Ses Tipi" value={r.voiceTypeName ? `${r.voiceTypeName} (%${r.voiceTypeMatchPercent.toFixed(0)})` : '—'} />
              {r.possibleVoiceGroups && (
                <Field label="Olası gruplar" value={r.possibleVoiceGroups} />
              )}
            </div>
          </section>

          {/* Ses kalitesi metrikleri */}
          {(r.avgRms || r.avgPitchStability || r.avgVoicedRatio) && (
            <section>
              <div className="text-xs font-semibold text-agora-muted uppercase tracking-wider mb-2">Ses Kalitesi</div>
              <div className="space-y-1.5 text-sm">
                {typeof r.avgRms === 'number' && r.avgRms > 0 && (
                  <Field label="Ses Gücü (RMS)" value={r.avgRms.toFixed(3)} />
                )}
                {typeof r.avgPitchStability === 'number' && r.avgPitchStability > 0 && (
                  <Field label="Tonal Sapma" value={`${r.avgPitchStability.toFixed(1)} cent`} />
                )}
                {typeof r.avgVoicedRatio === 'number' && r.avgVoicedRatio > 0 && (
                  <Field label="Sesli Oran" value={`%${(r.avgVoicedRatio * 100).toFixed(0)}`} />
                )}
              </div>
            </section>
          )}

          {/* Notalar */}
          <ScoreDetails row={row} />

          {/* Yayın durumu + tarih */}
          <section className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-agora-muted">Yayın</span>
              <span className={r.published ? 'text-emerald-700 font-semibold' : 'text-stone-500'}>
                {r.published ? 'Açık' : 'Kapalı'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-agora-muted">Test Tarihi</span>
              <span className="text-agora-dark">{new Date(r.testDate).toLocaleString('tr-TR')}</span>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-agora-muted shrink-0">{label}</span>
      <span className="text-agora-dark font-medium text-right break-words">{value}</span>
    </div>
  );
}

export default function Scoreboard({ onBack, onStage }: { onBack: () => void; onStage?: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [sectionFilter, setSectionFilter] = useState<ChoirSection | 'all'>('all');

  useEffect(() => {
    topScoreboard(100).then((all) => setRows(all.filter((r) => passesChoirThreshold(r.result))));
  }, []);

  // ESC ile kapat
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  if (rows === null) return <div className="text-center text-agora-muted py-12">Yükleniyor...</div>;

  // Group by section
  const grouped = new Map<ChoirSection | 'unknown', Row[]>();
  for (const r of rows) {
    const sec = (r.result.choirSection as ChoirSection | undefined) ?? 'unknown';
    if (!grouped.has(sec)) grouped.set(sec, []);
    grouped.get(sec)!.push(r);
  }

  const sectionsPresent = new Set<ChoirSection>(
    rows.map((r) => r.result.choirSection).filter(Boolean) as ChoirSection[]
  );

  const totalMembers = rows.length;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-agora-muted hover:text-agora-dark transition-colors"
        >
          <ArrowLeft size={18} /> Geri
        </button>
        <div className="flex items-center gap-2">
        {onStage && (() => {
          const allSections: ChoirSection[] = ['soprano', 'alto', 'tenor', 'bass'];
          const missing = allSections.filter((s) => !sectionsPresent.has(s));
          const ready = missing.length === 0;
          const missingLabels = missing.map((s) => SECTION_CFG[s].label).join(', ');
          return (
            <div className="flex flex-col items-end gap-0.5">
              <button
                type="button"
                onClick={ready ? onStage : undefined}
                disabled={!ready}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                  ready
                    ? 'text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 cursor-pointer'
                    : 'text-stone-400 bg-stone-100 border border-stone-200 cursor-not-allowed'
                }`}
                title={ready ? 'Koroyu sahneye çıkar (deneysel)' : `Eksik parti: ${missingLabels}`}
              >
                <Music2 size={14} /> Sahneye Çık
                <span className={`text-[9px] uppercase tracking-wider px-1 py-0.5 rounded ${ready ? 'bg-white/25' : 'bg-stone-200 text-stone-500'}`}>beta</span>
              </button>
              {!ready && (
                <span className="text-[10px] text-stone-500">
                  Eksik parti: <span className="font-medium text-stone-600">{missingLabels}</span>
                </span>
              )}
            </div>
          );
        })()}
        <button
          type="button"
          onClick={async () => {
            const pwd = prompt('Sıfırlama şifresi:');
            if (pwd === null) return;
            if (!confirm('Tüm skor tablosu kayıtları silinecek. Emin misin?')) return;
            try {
              await clearAllData(pwd);
              setRows([]);
            } catch {
              alert('Şifre hatalı veya sunucu hatası.');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
          title="Tüm kayıtları sil (şifre korumalı)"
        >
          <Trash2 size={14} /> Sıfırla
        </button>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-agora-dark mb-1">Koro Kadrosu</h2>
        <p className="text-agora-muted">{totalMembers} üye · Sahne düzeni</p>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl px-4 py-2.5 mb-5 text-xs text-agora-dark text-center">
        <span className="font-semibold">Katılım Barajı:</span>{' '}
        En az %{CHOIR_THRESHOLD.minSuccessRate} doğruluk · {CHOIR_THRESHOLD.minOctaveWidth.toFixed(1)} oktav · {CHOIR_THRESHOLD.minSuccessfulNotes} başarılı nota
      </div>

      {totalMembers === 0 ? (
        <div className="text-center bg-white/70 border border-stone-200 rounded-2xl p-10">
          <p className="text-agora-dark font-medium mb-1">Barajı geçen üye yok</p>
          <p className="text-sm text-agora-muted">Testi tamamlayıp barajı geçen ilk kişi sen ol!</p>
        </div>
      ) : (
        <>
          {/* Stage */}
          <div
            className="relative rounded-3xl overflow-hidden mb-6 p-6 pt-8"
            style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0d1b2a 100%)' }}
          >
            {/* Stage lights */}
            <div className="absolute top-0 left-0 right-0 flex justify-around pointer-events-none">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-amber-300/80" style={{ boxShadow: '0 0 12px 6px rgba(251,191,36,0.3)' }} />
              ))}
            </div>

            <div className="text-center text-white/30 text-xs uppercase tracking-widest mb-1">— Sahne —</div>
            <div className="text-center text-white/20 text-[9px] uppercase tracking-widest mb-5">arka</div>

            {/* 2×2 sahne yerleşimi */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {(['back','front'] as const).flatMap((row) =>
                STAGE_LAYOUT.filter((s) => s.row === row).sort((a, b) => (a.col === 'left' ? -1 : 1)).map(({ section, col, row: r }) => {
                  const members = grouped.get(section) ?? [];
                  const cfg = SECTION_CFG[section];
                  const power = avgRmsOf(members);
                  const lvl = rmsLevel(power);
                  const badge = POWER_BADGE[lvl];
                  return (
                    <div
                      key={`${r}-${col}`}
                      className="rounded-2xl border border-white/10 p-3"
                      style={{
                        background: r === 'back' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                        opacity: r === 'back' ? 0.92 : 1,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</div>
                        <div className="text-white/40 text-[10px]">{members.length} kişi</div>
                      </div>
                      <div className={`text-[9px] inline-block px-2 py-0.5 rounded-full border mb-2.5 ${badge.cls}`}>
                        {badge.label}
                      </div>
                      {members.length === 0 ? (
                        <div className="text-white/30 text-[10px] italic py-3 text-center">— üye yok —</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {members.map((row) => (
                            <button
                              key={row.result.id}
                              type="button"
                              onClick={() => setSelected(row)}
                              className="flex flex-col items-center gap-0.5 w-12 group focus:outline-none"
                              title={`${row.user?.firstName ?? ''} ${row.user?.lastName ?? ''} — detay`}
                            >
                              <div
                                className={`w-9 h-9 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-bold text-[11px] ring-2 ${cfg.ring} shadow group-hover:ring-4 group-hover:scale-110 transition-all duration-150`}
                              >
                                {getInitials(row.user?.firstName, row.user?.lastName)}
                              </div>
                              <div className="text-white/90 text-[8px] font-medium text-center leading-tight truncate w-full group-hover:text-white">
                                {row.user?.firstName ?? '?'}
                              </div>
                              <div className="text-white/50 text-[7px]">{row.result.compositeScore.toFixed(0)}♪</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-center text-white/20 text-[9px] uppercase tracking-widest mt-1">ön · seyirci</div>

            {/* Açıklama: sahne düzeni */}
            <div className="flex flex-wrap justify-center gap-3 mt-5 border-t border-white/10 pt-4">
              {(['soprano','alto','tenor','bass'] as ChoirSection[]).filter((s) => sectionsPresent.has(s)).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${SECTION_CFG[s].gradient}`} />
                  <span className="text-white/60 text-xs">{SECTION_CFG[s].label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {(['soprano','alto','tenor','bass'] as ChoirSection[]).map((s) => {
              const count = grouped.get(s)?.length ?? 0;
              const cfg = SECTION_CFG[s];
              return (
                <div key={s} className={`${cfg.gradient.includes('rose') ? 'bg-rose-50' : cfg.gradient.includes('amber') ? 'bg-amber-50' : cfg.gradient.includes('blue') ? 'bg-blue-50' : 'bg-stone-100'} border rounded-xl p-3 text-center`}>
                  <div className={`text-2xl font-bold ${cfg.text}`}>{count}</div>
                  <div className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</div>
                </div>
              );
            })}
          </div>

          {/* Koro dengesi analizi */}
          <ChoirBalance grouped={grouped} totalMembers={totalMembers} />

          {/* Skor sıralaması */}
          {(() => {
            const filtered = sectionFilter === 'all'
              ? rows
              : rows.filter((r) => r.result.choirSection === sectionFilter);
            const tabs: { key: ChoirSection | 'all'; label: string }[] = [
              { key: 'all', label: `Tümü (${rows.length})` },
              ...(['soprano', 'alto', 'tenor', 'bass'] as ChoirSection[]).map((s) => ({
                key: s,
                label: `${SECTION_CFG[s].label} (${grouped.get(s)?.length ?? 0})`,
              })),
            ];
            return (
              <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm font-semibold text-agora-dark">Skor Sıralaması</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tabs.map((t) => {
                      const active = sectionFilter === t.key;
                      const cfg = t.key !== 'all' ? SECTION_CFG[t.key] : null;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setSectionFilter(t.key)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            active
                              ? cfg
                                ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent`
                                : 'bg-agora-dark text-white border-transparent'
                              : 'bg-white text-agora-muted border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="divide-y divide-stone-100">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-agora-muted italic">
                      Bu partide kayıt yok.
                    </div>
                  ) : (
                    filtered.slice(0, 10).map((row, i) => (
                      <ScoreRow key={row.result.id} row={row} rank={i + 1} onSelect={setSelected} />
                    ))
                  )}
                </div>
              </div>
            );
          })()}

        </>
      )}

      {/* Detay drawer — admin paneli benzeri */}
      <MemberDrawer
        row={selected}
        onClose={() => setSelected(null)}
        onDelete={(id) => {
          setRows((prev) => (prev ? prev.filter((r) => r.result.id !== id) : prev));
          setSelected(null);
        }}
      />
    </div>
  );
}
