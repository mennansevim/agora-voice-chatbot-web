import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, LogOut, RefreshCw, Search, Trash2, Music2, Mic, Users, ListMusic, ArrowDownWideNarrow, ExternalLink } from 'lucide-react';
import {
  adminLogin,
  clearStoredPassword,
  deleteSession,
  fetchSessions,
  fetchStageRecordings,
  getStoredPassword,
  recordingUrl,
  stageRecordingUrl,
} from './api';
import type { AdminSession, RangeRecordingMeta, SongRecordingMeta, StageRecording } from './types';

type View = 'users' | 'songs' | 'stage';
type GenderFilter = 'all' | 'male' | 'female';
type SortBy = 'success' | 'score' | 'octave' | 'recent' | 'name';

const SORT_LABELS: Record<SortBy, string> = {
  success: 'Nota başarısı (yüksek→düşük)',
  score: 'Skor (yüksek→düşük)',
  octave: 'Ses aralığı (geniş→dar)',
  recent: 'En yeni',
  name: 'İsim (A→Z)',
};

export default function AdminPanel() {
  const [password, setPassword] = useState<string | null>(getStoredPassword());
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [stageRecs, setStageRecs] = useState<StageRecording[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('users');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('success');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(pwd: string) {
    setLoading(true);
    setError(null);
    try {
      const [s, sr] = await Promise.all([fetchSessions(pwd), fetchStageRecordings(pwd)]);
      setSessions(s.sort((a, b) => b.createdAt - a.createdAt));
      setStageRecs(sr.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'yükleme hatası');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) void load(password);
  }, [password]);

  // Aynı anda tek ses çalsın — biri başlayınca diğer tüm audio'ları durdur.
  // 'play' olayı bubble etmediği için capture fazında dinliyoruz.
  useEffect(() => {
    const onPlay = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLAudioElement)) return;
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== target) el.pause();
      });
    };
    document.addEventListener('play', onPlay, true);
    return () => document.removeEventListener('play', onPlay, true);
  }, []);

  // NOT: Tüm hook'lar erken dönüşten (Login) ÖNCE çağrılmalı — aksi halde ilk
  // girişte hook sayısı değişir ve React panik atarak boş sayfa gösterir.
  const filtered = useMemo(() => {
    if (!sessions) return [];
    const q = search.trim().toLowerCase();
    return sessions.filter((s) => {
      if (genderFilter !== 'all' && s.user.gender !== genderFilter) return false;
      if (q && !`${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sessions, search, genderFilter]);

  // Aynı isimli oturumları tek grup altında topla (rahat erişim için).
  const grouped = useMemo(() => {
    const map = new Map<string, AdminSession[]>();
    for (const s of filtered) {
      const key = `${s.user.firstName} ${s.user.lastName}`.trim().toLowerCase();
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    const groups = Array.from(map.values()).map((items) => {
      const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);
      return {
        key: `${sorted[0].user.firstName} ${sorted[0].user.lastName}`.trim().toLowerCase(),
        name: `${sorted[0].user.firstName} ${sorted[0].user.lastName}`,
        gender: sorted[0].user.gender,
        items: sorted,
        songCount: sorted.reduce((n, it) => n + (it.recordings?.song?.length ?? 0), 0),
        latest: sorted[0].createdAt,
        // Kişinin en iyi değerleri — sıralama bunlara göre yapılır.
        bestScore: Math.max(...sorted.map((it) => it.result.compositeScore)),
        bestSuccess: Math.max(...sorted.map((it) => it.result.successRate)),
        bestOctave: Math.max(...sorted.map((it) => it.result.octaveRangeWidth)),
      };
    });
    groups.sort((a, b) => {
      switch (sortBy) {
        case 'success': return b.bestSuccess - a.bestSuccess;
        case 'score': return b.bestScore - a.bestScore;
        case 'octave': return b.bestOctave - a.bestOctave;
        case 'name': return a.name.localeCompare(b.name, 'tr');
        case 'recent':
        default: return b.latest - a.latest;
      }
    });
    return groups;
  }, [filtered, sortBy]);

  // Tüm serbest şarkı kayıtlarını tek listede topla (kullanıcı bağımsız görünüm).
  const allSongs = useMemo(() => {
    const rows: { session: AdminSession; song: SongRecordingMeta }[] = [];
    for (const s of filtered) {
      for (const song of s.recordings?.song ?? []) rows.push({ session: s, song });
    }
    rows.sort((a, b) => (b.song.recordedAt ?? b.session.createdAt) - (a.song.recordedAt ?? a.session.createdAt));
    return rows;
  }, [filtered]);

  const totals = useMemo(() => {
    const src = sessions ?? [];
    const male = src.filter((s) => s.user.gender === 'male').length;
    const female = src.filter((s) => s.user.gender === 'female').length;
    const songs = src.reduce((n, s) => n + (s.recordings?.song?.length ?? 0), 0);
    return { total: src.length, male, female, songs };
  }, [sessions]);

  const selected = sessions?.find((s) => s.id === selectedId) ?? null;

  if (!password) {
    return <Login onSuccess={(p) => setPassword(p)} />;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="font-bold text-agora-dark">Agora Voice — Yönetim</div>
              <div className="text-xs text-agora-muted">
                {totals.total} oturum · <span className="text-blue-600">{totals.male} erkek</span> · <span className="text-rose-600">{totals.female} kadın</span> · {totals.songs} serbest kayıt · {stageRecs.length} sahne
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => password && load(password)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Yenile
            </button>
            <button
              onClick={() => { clearStoredPassword(); setPassword(null); setSessions(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              <LogOut size={14} /> Çıkış
            </button>
          </div>
        </div>

        {/* Görünüm sekmeleri */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 border-t border-stone-100">
          <ViewTab active={view === 'users'} onClick={() => setView('users')} icon={<Users size={14} />} label="Kullanıcılar" count={totals.total} />
          <ViewTab active={view === 'songs'} onClick={() => setView('songs')} icon={<ListMusic size={14} />} label="Serbest Kayıtlar" count={totals.songs} />
          <ViewTab active={view === 'stage'} onClick={() => setView('stage')} icon={<Music2 size={14} />} label="Sahne Kayıtları" count={stageRecs.length} />
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-3">
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Yükleme hatası: {error} · <button onClick={() => password && load(password)} className="underline font-medium">tekrar dene</button>
          </div>
        </div>
      )}

      {/* Filtre çubuğu — kullanıcı ve serbest kayıt görünümlerinde */}
      {view !== 'stage' && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-white rounded-xl border border-stone-200 p-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İsimle ara…"
                className="w-full pl-8 pr-2 py-1.5 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <Segmented
              label="Cinsiyet"
              value={genderFilter}
              onChange={(v) => setGenderFilter(v as GenderFilter)}
              options={[
                { value: 'all', label: `Tümü` },
                { value: 'male', label: `Erkek (${totals.male})`, cls: 'text-blue-700' },
                { value: 'female', label: `Kadın (${totals.female})`, cls: 'text-rose-700' },
              ]}
            />

            {view === 'users' && (
              <label className="flex items-center gap-1.5 text-xs text-stone-500">
                <ArrowDownWideNarrow size={14} />
                <span className="hidden sm:inline">Sırala</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="py-1.5 pl-2 pr-6 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-amber-400 text-stone-700"
                >
                  {(Object.keys(SORT_LABELS) as SortBy[]).map((k) => (
                    <option key={k} value={k}>{SORT_LABELS[k]}</option>
                  ))}
                </select>
              </label>
            )}

            {(search || genderFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setGenderFilter('all'); }}
                className="text-xs text-stone-500 hover:text-stone-800 underline"
              >
                Filtreyi temizle
              </button>
            )}
          </div>
        </div>
      )}

      {/* Görünümler */}
      {view === 'users' && (
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          <aside className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 170px)' }}>
            <div className="px-3 py-2 border-b border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
              <span>{grouped.length} kişi</span>
              <span className="text-stone-400">{SORT_LABELS[sortBy]}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {grouped.map((g) => {
                const gs = genderStyle(g.gender);
                if (g.items.length === 1) {
                  const s = g.items[0];
                  return (
                    <SessionRow
                      key={g.key}
                      session={s}
                      active={s.id === selectedId}
                      onClick={() => setSelectedId(s.id)}
                    />
                  );
                }
                return (
                  <div key={g.key} className={`border-b border-stone-200 border-l-4 ${gs.border}`}>
                    <div className={`flex items-center justify-between gap-2 px-3 py-2 ${gs.bg}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${gs.dot}`} />
                        <span className={`text-sm font-semibold truncate ${gs.text}`}>{g.name}</span>
                        <span className="text-[10px] text-stone-500 shrink-0">{g.items.length} test</span>
                      </div>
                      {g.songCount > 0 && <SongBadge count={g.songCount} />}
                    </div>
                    {g.items.map((s) => {
                      const active = s.id === selectedId;
                      const songCount = s.recordings?.song?.length ?? 0;
                      const recCount = (s.recordings?.range?.length ?? 0) + songCount;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedId(s.id)}
                          className={`w-full text-left pl-7 pr-3 py-2 border-t border-stone-100 hover:bg-stone-50 transition-colors ${active ? 'bg-amber-100' : ''}`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span className="flex items-center gap-1.5">
                              <span className="text-stone-400">#{s.id}</span>
                              <span>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              {songCount > 0 && <SongBadge count={songCount} />}
                              {recCount > 0 && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">🎤 {recCount}</span>}
                              <span className="tabular-nums">%{Math.round(s.result.successRate)} · {Math.round(s.result.compositeScore)}p</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {grouped.length === 0 && (
                <div className="p-6 text-center text-sm text-stone-400">
                  {sessions === null ? 'Yükleniyor…' : (search || genderFilter !== 'all') ? 'Filtreye uyan kayıt yok' : 'Kayıt yok'}
                </div>
              )}
            </div>
          </aside>

          <main className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {selected ? (
              <SessionDetail session={selected} password={password} onDelete={async () => {
                if (!confirm(`${selected.user.firstName} ${selected.user.lastName} silinsin mi?`)) return;
                await deleteSession(selected.id, password);
                setSelectedId(null);
                if (password) void load(password);
              }} />
            ) : (
              <div className="p-10 text-center text-sm text-stone-400">
                Soldan bir kullanıcı seçerek ses analizini ve nota denemelerini görüntüleyin.
              </div>
            )}
          </main>
        </div>
      )}

      {view === 'songs' && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <SongsOverview
            rows={allSongs}
            password={password}
            empty={sessions === null ? 'Yükleniyor…' : 'Serbest şarkı kaydı bulunamadı.'}
            onOpenUser={(id) => { setSelectedId(id); setView('users'); }}
          />
        </div>
      )}

      {view === 'stage' && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <StageOverview recordings={stageRecs} password={password} />
          </div>
        </div>
      )}
    </div>
  );
}

function ViewTab({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-amber-500 text-agora-dark' : 'border-transparent text-stone-500 hover:text-stone-800'
      }`}
    >
      {icon} {label}
      <span className={`px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'}`}>{count}</span>
    </button>
  );
}

function Segmented({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; cls?: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-stone-500 hidden sm:inline">{label}</span>
      <div className="flex rounded-lg border border-stone-200 overflow-hidden">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
              value === o.value ? 'bg-amber-100 text-amber-900' : `bg-white hover:bg-stone-50 ${o.cls ?? 'text-stone-600'}`
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SongsOverview({ rows, password, empty, onOpenUser }: {
  rows: { session: AdminSession; song: SongRecordingMeta }[];
  password: string;
  empty: string;
  onOpenUser: (id: number) => void;
}) {
  const sharedCount = rows.filter((r) => r.song.shareToScoreboard === 'true').length;
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="p-5 border-b border-stone-200">
        <h2 className="text-lg font-bold text-agora-dark flex items-center gap-2"><ListMusic size={18} /> Serbest Şarkı Kayıtları</h2>
        <p className="text-xs text-agora-muted mt-0.5">{rows.length} kayıt · {sharedCount} tanesi skor tablosunda paylaşıldı · en yeniden eskiye</p>
      </div>
      {rows.length === 0 ? (
        <div className="p-10 text-center text-sm text-stone-400">{empty}</div>
      ) : (
        <div className="divide-y divide-stone-100">
          {rows.map(({ session: s, song }, i) => {
            const gs = genderStyle(s.user.gender);
            return (
              <div key={`${s.id}-${song.filename ?? i}`} className={`flex items-center gap-3 px-5 py-3 border-l-4 ${gs.border} hover:bg-stone-50`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${gs.dot}`} />
                <div className="w-44 shrink-0 min-w-0">
                  <div className={`text-sm font-medium truncate ${gs.text}`}>{s.user.firstName} {s.user.lastName}</div>
                  <div className="text-[11px] text-stone-500">
                    {new Date(song.recordedAt ?? s.createdAt).toLocaleDateString('tr-TR')}
                    {song.duration ? ` · ${parseFloat(song.duration).toFixed(0)}s` : ''}
                    {song.shareToScoreboard === 'true' && <span className="text-emerald-700"> · paylaşıldı</span>}
                  </div>
                </div>
                <AudioPlayer src={recordingUrl(s.id, song.filename, password)} className="flex-1 min-w-0" />
                <button
                  onClick={() => onOpenUser(s.id)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-700 shrink-0"
                  title="Kullanıcı detayını aç"
                >
                  <ExternalLink size={13} /> <span className="hidden sm:inline">Detay</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: (p: string) => void }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const ok = await adminLogin(pwd);
      if (ok) onSuccess(pwd);
      else setErr('Şifre hatalı');
    } catch {
      setErr('Bağlantı hatası');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 mb-3">
            <Lock size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-agora-dark">Yönetim Paneli</h1>
          <p className="text-xs text-agora-muted mt-1">Erişim için şifre gerekli</p>
        </div>
        <input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Şifre"
          className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-400 mb-2"
        />
        {err && <div className="text-xs text-red-600 mb-2">{err}</div>}
        <button
          type="submit"
          disabled={busy || !pwd}
          className="w-full btn-agora-primary py-2.5 rounded-lg font-semibold disabled:opacity-60"
        >
          {busy ? 'Kontrol ediliyor…' : 'Giriş'}
        </button>
      </form>
    </div>
  );
}

function SessionDetail({ session, password, onDelete }: { session: AdminSession; password: string; onDelete: () => void }) {
  // Attempt'leri recording meta'larıyla eşleştir (noteName + attemptNumber).
  const recsByKey = new Map<string, RangeRecordingMeta>();
  for (const r of session.recordings?.range ?? []) {
    const key = `${r.noteName}|${r.attemptNumber}`;
    recsByKey.set(key, r);
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 170px)' }}>
      {/* Header */}
      <div className="p-5 border-b border-stone-200 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-stone-500 mb-0.5">Oturum #{session.id} · {new Date(session.createdAt).toLocaleString('tr-TR')}</div>
          <h2 className="text-2xl font-bold text-agora-dark">{session.user.firstName} {session.user.lastName}</h2>
          <div className="text-sm text-agora-muted mt-1">
            {session.user.gender === 'female' ? 'Kadın' : 'Erkek'} · {session.result.voiceTypeName ?? '—'} · {session.result.lowestNote}–{session.result.highestNote} ({session.result.octaveRangeWidth.toFixed(1)} oktav)
          </div>
        </div>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50"
        >
          <Trash2 size={14} /> Sil
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-stone-200">
        <Stat label="Skor" value={Math.round(session.result.compositeScore)} />
        <Stat label="Doğruluk" value={`%${Math.round(session.result.successRate)}`} />
        <Stat label="Avg RMS" value={(session.result.avgRms ?? 0).toFixed(3)} />
        <Stat label="Pitch Stab." value={(session.result.avgPitchStability ?? 0).toFixed(1)} />
      </div>

      {/* Range attempts */}
      <section className="p-5 border-b border-stone-200">
        <h3 className="text-sm font-bold text-agora-dark mb-3 flex items-center gap-2">
          <Music2 size={16} /> Nota Denemeleri ({session.attempts.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-stone-500">
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 px-2">Nota</th>
                <th className="text-right py-2 px-2">Hedef Hz</th>
                <th className="text-right py-2 px-2">Tespit Hz</th>
                <th className="text-right py-2 px-2">Doğruluk</th>
                <th className="text-center py-2 px-2">Yön</th>
                <th className="text-center py-2 px-2">Başarı</th>
                <th className="text-left py-2 px-2">Ses Kaydı</th>
              </tr>
            </thead>
            <tbody>
              {session.attempts.map((a, i) => {
                const key = `${a.noteName}|${a.attemptNumber}`;
                const rec = recsByKey.get(key);
                return (
                  <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-1.5 px-2 font-mono font-semibold">{a.noteName}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{a.targetFrequency.toFixed(1)}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{a.detectedFrequency?.toFixed(1) ?? '—'}</td>
                    <td className={`py-1.5 px-2 text-right font-mono ${a.accuracyPercent >= 80 ? 'text-emerald-600' : a.accuracyPercent >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      %{a.accuracyPercent.toFixed(0)}
                    </td>
                    <td className="py-1.5 px-2 text-center text-stone-500">{a.direction === 'up' ? '↑' : '↓'}</td>
                    <td className="py-1.5 px-2 text-center">{a.isSuccessful ? '✓' : '·'}</td>
                    <td className="py-1.5 px-2">
                      {rec ? (
                        <AudioPlayer src={recordingUrl(session.id, rec.filename, password)} className="h-7 w-48" />
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Free song recordings */}
      <section className="p-5">
        <h3 className="text-sm font-bold text-agora-dark mb-3 flex items-center gap-2">
          <Mic size={16} /> Serbest Şarkı Kayıtları ({session.recordings?.song?.length ?? 0})
        </h3>
        {session.recordings?.song?.length ? (
          <div className="space-y-2">
            {session.recordings.song.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div className="text-xs text-stone-500 w-20 shrink-0">
                  {s.duration ? `${parseFloat(s.duration).toFixed(0)}s` : '—'}
                  {s.shareToScoreboard === 'true' && <div className="text-[10px] text-emerald-700">paylaşıldı</div>}
                </div>
                <AudioPlayer src={recordingUrl(session.id, s.filename, password)} className="flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-stone-400">Serbest şarkı kaydı yok</div>
        )}
      </section>
    </div>
  );
}

function StageOverview({ recordings, password }: { recordings: StageRecording[]; password: string }) {
  return (
    <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 170px)' }}>
      <h2 className="text-lg font-bold text-agora-dark mb-1">Sahne Kayıtları</h2>
      <p className="text-xs text-agora-muted mb-4">Stem üstüne söylenen anonim kayıtlar (kullanıcıya bağlı değil)</p>
      {recordings.length === 0 ? (
        <div className="text-center py-12 text-sm text-stone-400">Henüz sahne kaydı yok. Sahneye Çık ekranından kayıt yapılmasını bekleyin.</div>
      ) : (
        <div className="space-y-2">
          {recordings.map((r) => {
            const filename = r.path.split('/').pop() ?? '';
            return (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div className="text-xs text-stone-600 w-44 shrink-0">
                  <div className="font-semibold text-agora-dark truncate">{r.songTitle ?? r.songId ?? 'Bilinmeyen eser'}</div>
                  <div className="text-[10px] text-stone-500">
                    {new Date(r.createdAt).toLocaleString('tr-TR')}
                    {r.durationSec ? ` · ${parseFloat(r.durationSec).toFixed(0)}s` : ''}
                  </div>
                </div>
                <AudioPlayer src={stageRecordingUrl(filename, password)} className="flex-1" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Native audio sarmalayıcı. MediaRecorder webm dosyalarında süre başlıkta
// olmadığı için duration=Infinity gelir ve "0:00 / 0:00" görünür. Metadata
// yüklendiğinde sona sarıp gerçek süreyi hesaplatıp başa dönüyoruz.
function AudioPlayer({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  function handleLoadedMetadata() {
    const el = ref.current;
    if (!el) return;
    if (el.duration === Infinity || Number.isNaN(el.duration)) {
      const onTime = () => {
        el.removeEventListener('timeupdate', onTime);
        el.currentTime = 0;
      };
      el.addEventListener('timeupdate', onTime);
      el.currentTime = 1e101;
    }
  }
  return (
    <audio
      ref={ref}
      src={src}
      controls
      preload="metadata"
      onLoadedMetadata={handleLoadedMetadata}
      className={className}
    />
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-stone-50 rounded-lg border border-stone-200 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
      <div className="text-lg font-bold text-agora-dark font-mono">{value}</div>
    </div>
  );
}

// Cinsiyete göre renk paleti — erkek mavi, kadın pembe/rose.
function genderStyle(gender: 'male' | 'female') {
  return gender === 'female'
    ? { border: 'border-l-rose-400', text: 'text-rose-700', bg: 'bg-rose-50', activeBg: 'bg-rose-100', dot: 'bg-rose-400' }
    : { border: 'border-l-blue-400', text: 'text-blue-700', bg: 'bg-blue-50', activeBg: 'bg-blue-100', dot: 'bg-blue-400' };
}

// Serbest şarkı kaydı olduğunu listede gösteren rozet.
function SongBadge({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-semibold shrink-0">
      🎵 {count}
    </span>
  );
}

function SessionRow({ session: s, active, onClick }: { session: AdminSession; active: boolean; onClick: () => void }) {
  const gs = genderStyle(s.user.gender);
  const songCount = s.recordings?.song?.length ?? 0;
  const recCount = (s.recordings?.range?.length ?? 0) + songCount;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-b border-stone-100 border-l-4 ${gs.border} hover:bg-stone-50 transition-colors ${active ? gs.activeBg : gs.bg}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${gs.dot}`} />
          <span className={`text-sm font-medium truncate ${gs.text}`}>
            {s.user.firstName} {s.user.lastName}
          </span>
        </div>
        <span className="text-[10px] text-stone-500 shrink-0">#{s.id}</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
        <span>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</span>
        <span className="flex items-center gap-1">
          {songCount > 0 && <SongBadge count={songCount} />}
          {recCount > 0 && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">🎤 {recCount}</span>}
          <span className="tabular-nums">%{Math.round(s.result.successRate)} · {Math.round(s.result.compositeScore)}p</span>
        </span>
      </div>
    </button>
  );
}
