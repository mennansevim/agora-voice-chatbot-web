import { useEffect, useMemo, useState } from 'react';
import { Lock, LogOut, RefreshCw, Search, Trash2, Music2, Mic } from 'lucide-react';
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
import type { AdminSession, RangeRecordingMeta, StageRecording } from './types';

export default function AdminPanel() {
  const [password, setPassword] = useState<string | null>(getStoredPassword());
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [stageRecs, setStageRecs] = useState<StageRecording[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
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

  if (!password) {
    return <Login onSuccess={(p) => setPassword(p)} />;
  }

  const filtered = useMemo(() => {
    if (!sessions) return [];
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) =>
      `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(q),
    );
  }, [sessions, search]);

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
      };
    });
    groups.sort((a, b) => b.latest - a.latest);
    return groups;
  }, [filtered]);

  const selected = sessions?.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="font-bold text-agora-dark">Agora Voice — Yönetim</div>
              <div className="text-xs text-agora-muted">{sessions?.length ?? 0} oturum · {stageRecs.length} sahne kaydı</div>
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
      </header>

      {error && <div className="max-w-7xl mx-auto px-6 mt-3 text-sm text-red-600">{error}</div>}

      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        <aside className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          <div className="p-3 border-b border-stone-200">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kullanıcı ara…"
                className="w-full pl-8 pr-2 py-1.5 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {grouped.map((g) => {
              const gs = genderStyle(g.gender);
              // Tek oturumlu kişi: doğrudan tam satır göster.
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
              // Birden fazla oturum: isim başlığı + altında her test ayrı satır.
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
                            <span>skor {Math.round(s.result.compositeScore)}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {grouped.length === 0 && <div className="p-6 text-center text-sm text-stone-400">Kayıt yok</div>}
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
            <StageOverview recordings={stageRecs} password={password} />
          )}
        </main>
      </div>
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
    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
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
                        <audio src={recordingUrl(session.id, rec.filename, password)} controls className="h-7 w-48" preload="none" />
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
                <audio src={recordingUrl(session.id, s.filename, password)} controls className="flex-1" preload="none" />
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
    <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      <h2 className="text-lg font-bold text-agora-dark mb-1">Sahne Kayıtları</h2>
      <p className="text-xs text-agora-muted mb-4">Stem üstüne söylenen anonim kayıtlar (kullanıcıya bağlı değil)</p>
      {recordings.length === 0 ? (
        <div className="text-center py-12 text-sm text-stone-400">Henüz sahne kaydı yok. Bir kullanıcı seçin veya Sahneye Çık ekranından kayıt yapılmasını bekleyin.</div>
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
                <audio src={stageRecordingUrl(filename, password)} controls className="flex-1" preload="none" />
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
        Soldan bir kullanıcı seçerek ses analizini ve nota denemelerini görüntüleyebilirsiniz.
      </div>
    </div>
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
          <span>skor {Math.round(s.result.compositeScore)}</span>
        </span>
      </div>
    </button>
  );
}
