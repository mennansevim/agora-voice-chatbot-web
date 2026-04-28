import { useEffect, useState } from 'react';
import { ArrowLeft, Music2, Trash2 } from 'lucide-react';
import { topScoreboard, clearAllData, type ChoirSection } from '../lib/db';
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

// SATB stage order (front row first for visual layout top→bottom = back→front)
const STAGE_ORDER: (ChoirSection | 'unknown')[] = ['bass', 'tenor', 'alto', 'soprano', 'unknown'];

type ChoralPiece = { title: string; composer: string; era: string; needs: ChoirSection[] };
const CHORAL_PIECES: ChoralPiece[] = [
  { title: 'Hallelujah Korosu', composer: 'G.F. Handel',    era: 'Barok',     needs: ['soprano', 'alto', 'tenor', 'bass'] },
  { title: 'O Fortuna',         composer: 'C. Orff',         era: 'Modern',    needs: ['soprano', 'alto', 'tenor', 'bass'] },
  { title: 'Gloria',            composer: 'A. Vivaldi',      era: 'Barok',     needs: ['soprano', 'alto', 'tenor', 'bass'] },
  { title: 'Ave Verum Corpus',  composer: 'W.A. Mozart',     era: 'Klasik',    needs: ['soprano', 'alto', 'tenor', 'bass'] },
  { title: 'Lacrimosa',         composer: 'W.A. Mozart',     era: 'Klasik',    needs: ['soprano', 'alto', 'tenor', 'bass'] },
  { title: 'Pie Jesu',          composer: 'A. Lloyd Webber', era: 'Çağdaş',   needs: ['soprano', 'alto'] },
  { title: 'Danny Boy',         composer: 'Geleneksel',      era: 'Halk',      needs: ['tenor', 'bass'] },
  { title: 'Scarborough Fair',  composer: 'Geleneksel',      era: 'Halk',      needs: ['soprano', 'alto'] },
  { title: 'Boğaziçi',          composer: 'Türk Halk Müziği', era: 'Halk',    needs: ['tenor', 'bass'] },
  { title: 'Üsküdar',           composer: 'Türk Halk Müziği', era: 'Halk',    needs: ['soprano', 'alto', 'tenor', 'bass'] },
  { title: 'Çanakkale İçinde',  composer: 'Türk Halk Müziği', era: 'Halk',    needs: ['soprano', 'alto', 'tenor', 'bass'] },
  { title: 'Hisarlıkta Savrulur', composer: 'Türk Halk Müziği', era: 'Halk', needs: ['tenor', 'bass'] },
];

function recommendPieces(sections: Set<ChoirSection>): ChoralPiece[] {
  return CHORAL_PIECES.filter((p) => p.needs.every((n) => sections.has(n)));
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName?.[0] ?? '?').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

export default function Scoreboard({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    topScoreboard(100).then((all) => setRows(all.filter((r) => passesChoirThreshold(r.result))));
  }, []);

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
  const pieces = recommendPieces(sectionsPresent);

  const totalMembers = rows.length;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-agora-muted hover:text-agora-dark transition-colors"
        >
          <ArrowLeft size={18} /> Geri
        </button>
        <button
          type="button"
          onClick={async () => {
            const pwd = prompt('Sıfırlama şifresi:');
            if (pwd === null) return;
            if (pwd !== '945000') {
              alert('Şifre hatalı.');
              return;
            }
            if (!confirm('Tüm skor tablosu kayıtları silinecek. Emin misin?')) return;
            await clearAllData();
            setRows([]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
          title="Tüm kayıtları sil (şifre korumalı)"
        >
          <Trash2 size={14} /> Sıfırla
        </button>
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

            <div className="text-center text-white/30 text-xs uppercase tracking-widest mb-6 mt-1">— Sahne —</div>

            {STAGE_ORDER.map((sec) => {
              const members = grouped.get(sec as ChoirSection | 'unknown') ?? [];
              if (members.length === 0) return null;
              const cfg = sec === 'unknown' ? UNKNOWN_CFG : SECTION_CFG[sec as ChoirSection];
              return (
                <div key={sec} className="mb-5">
                  <div className={`text-center text-xs font-bold uppercase tracking-widest mb-3 ${cfg.text}`}>
                    {sec === 'unknown' ? 'Belirsiz' : cfg.label}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {members.map(({ result, user }) => (
                      <div key={result.id} className="flex flex-col items-center gap-1 w-16">
                        <div
                          className={`w-11 h-11 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-bold text-sm ring-2 ${cfg.ring} shadow-lg`}
                        >
                          {getInitials(user?.firstName, user?.lastName)}
                        </div>
                        <div className="text-white/90 text-[9px] font-medium text-center leading-tight truncate w-full text-center">
                          {user?.firstName ?? '?'}
                        </div>
                        <div className="text-white/50 text-[8px]">{result.compositeScore.toFixed(0)}♪</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Section legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 border-t border-white/10 pt-4">
              {(['soprano','alto','tenor','bass'] as ChoirSection[]).filter(s => sectionsPresent.has(s)).map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${SECTION_CFG[s].gradient}`} />
                  <span className="text-white/60 text-xs">{SECTION_CFG[s].label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(['soprano','alto','tenor','bass'] as ChoirSection[]).map(s => {
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

          {/* Skor sıralaması */}
          <div className="bg-white/70 backdrop-blur border border-stone-200 rounded-2xl overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-stone-200">
              <div className="text-sm font-semibold text-agora-dark">Skor Sıralaması</div>
            </div>
            <div className="divide-y divide-stone-100">
              {rows.slice(0,10).map((row, i) => {
                const sec = row.result.choirSection;
                const cfg = sec ? SECTION_CFG[sec] : UNKNOWN_CFG;
                return (
                  <div key={row.result.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-stone-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-agora-dark'}`}>
                      {i + 1}
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
                        {row.result.lowestNote && row.result.highestNote ? `${noteToTurkish(row.result.lowestNote)} – ${noteToTurkish(row.result.highestNote)}` : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-agora-dark">{row.result.compositeScore.toFixed(0)}</div>
                      <div className="text-xs text-agora-muted">{row.result.octaveRangeWidth.toFixed(1)} okt</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Choral piece recommendations */}
          {pieces.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Music2 size={18} className="text-indigo-600" />
                <div className="text-sm font-semibold text-agora-dark">Koronun Söyleyebileceği Eserler</div>
              </div>
              <div className="space-y-2">
                {pieces.map((p) => (
                  <div key={p.title} className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2.5 border border-indigo-100">
                    <div>
                      <div className="text-sm font-medium text-agora-dark">{p.title}</div>
                      <div className="text-xs text-agora-muted">{p.composer} · {p.era}</div>
                    </div>
                    <div className="flex gap-1">
                      {p.needs.map(n => (
                        <div key={n} className={`w-4 h-4 rounded-full bg-gradient-to-br ${SECTION_CFG[n].gradient}`} title={SECTION_CFG[n].label} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
