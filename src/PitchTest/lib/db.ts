// Sunucu tabanlı paylaşımlı kayıt katmanı.
// Tüm test sonuçları sunucudaki data/results.json dosyasında tutulur.
// Eski Dexie/IndexedDB çözümünü tamamen değiştirir.

import { compositeScore } from './classify';

export type ChoirSection = 'soprano' | 'alto' | 'tenor' | 'bass';

export type UserRow = {
  id?: number;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  createdAt: number;
};

export type TestResultRow = {
  id?: number;
  userId: number;
  voiceTypeName: string | null;
  voiceTypeMatchPercent: number;
  possibleVoiceGroups: string;
  minFrequency: number;
  maxFrequency: number;
  rangeWidthHz: number;
  octaveRangeWidth: number;
  totalNotesCount: number;
  successfulNotesCount: number;
  successRate: number;
  lowestNote: string;
  highestNote: string;
  compositeScore: number;
  choirSection?: ChoirSection;
  published?: boolean;
  // Genişletilmiş ses analizi (başarılı denemelerin ortalaması)
  avgRms?: number;             // 0-1: ses gücü
  avgPitchStability?: number;  // cents std dev (düşük = daha sabit)
  avgVoicedRatio?: number;     // 0-1: ne kadar süreyle sesli
  testDate: number;
};

export type AttemptRow = {
  testResultId?: number;
  userId?: number;
  noteName: string;
  targetFrequency: number;
  detectedFrequency: number | null;
  octaveNumber: number;
  accuracyPercent: number;
  attemptNumber: number;
  isSuccessful: boolean;
  direction: 'down' | 'up';
  recordedAt: number;
};

// Sunucudaki kayıt yapısı (server/store.mjs ile uyumlu)
type SessionRecord = {
  id: number;
  user: { firstName: string; lastName: string; gender: 'male' | 'female' };
  result: Omit<TestResultRow, 'id' | 'userId'>;
  attempts: AttemptRow[];
  createdAt: number;
};

// =============================================================================
// API client
// =============================================================================

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

async function fetchAll(): Promise<SessionRecord[]> {
  try {
    return await api<SessionRecord[]>('/api/results');
  } catch {
    return [];
  }
}

// =============================================================================
// Public surface — eski Dexie API'siyle uyumlu kalacak şekilde
// =============================================================================

export async function saveTestSession(payload: {
  user: { firstName: string; lastName: string; gender: 'male' | 'female' };
  result: Omit<TestResultRow, 'id' | 'userId'>;
  attempts: AttemptRow[];
}): Promise<{ sessionId: number }> {
  const record = await api<SessionRecord>('/api/results', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { sessionId: record.id };
}

export async function getSession(id: number): Promise<{ result: TestResultRow; user: UserRow } | null> {
  try {
    const s = await api<SessionRecord>(`/api/results/${id}`);
    return sessionToView(s);
  } catch {
    return null;
  }
}

export async function updateChoirSection(sessionId: number, section: ChoirSection): Promise<void> {
  // PATCH only the result.choirSection field
  await api<SessionRecord>(`/api/results/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ result: { choirSection: section } }),
  });
}

export async function setPublished(sessionId: number, published: boolean): Promise<void> {
  await api<SessionRecord>(`/api/results/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ result: { published } }),
  });
}

// Eski kayıtların totalNotesCount/successRate alanları yanlış (her zaman successful'a eşit
// veya 0/100 flag) yazılmıştı. Doğru değerleri attempts'tan yeniden türetip skoru da
// güncel formülle yeniden hesaplıyoruz — böylece tüm kayıtlar aynı ölçekte sıralanır.
function recomputeFromAttempts(s: SessionRecord): SessionRecord {
  const attempts = s.attempts ?? [];
  if (attempts.length === 0) return s;
  const bestByNote = new Map<string, AttemptRow>();
  for (const a of attempts) {
    const prev = bestByNote.get(a.noteName);
    if (!prev || a.accuracyPercent > prev.accuracyPercent) bestByNote.set(a.noteName, a);
  }
  const total = bestByNote.size;
  const successful = [...bestByNote.values()].filter((a) => a.isSuccessful).length;
  const successRate = total > 0 ? (successful / total) * 100 : 0;
  const score = compositeScore(s.result.octaveRangeWidth, successful, total);
  return {
    ...s,
    result: {
      ...s.result,
      totalNotesCount: total,
      successfulNotesCount: successful,
      successRate,
      compositeScore: score,
    },
  };
}

export async function topScoreboard(limit = 50): Promise<{ result: TestResultRow; user: UserRow | undefined; attempts: AttemptRow[] }[]> {
  const raw = await fetchAll();
  const all = raw.map(recomputeFromAttempts);
  const valid = all.filter(
    (s) =>
      s.result.compositeScore > 0 &&
      s.result.lowestNote &&
      s.result.highestNote &&
      s.result.published === true,
  );
  // Best-by-user (case-insensitive name + gender)
  const bestByUser = new Map<string, SessionRecord>();
  for (const s of [...valid].sort((a, b) => b.result.compositeScore - a.result.compositeScore)) {
    const key = `${s.user.firstName.trim().toLowerCase()}|${s.user.lastName.trim().toLowerCase()}|${s.user.gender}`;
    if (!bestByUser.has(key)) bestByUser.set(key, s);
  }
  return [...bestByUser.values()].slice(0, limit).map((s) => {
    const view = sessionToView(s);
    return { result: view.result, user: view.user, attempts: s.attempts ?? [] };
  });
}

export async function deleteResult(sessionId: number, password: string): Promise<void> {
  await api(`/api/results/${sessionId}`, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

export async function clearAllData(password: string): Promise<void> {
  await api('/api/clear-results', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

// =============================================================================
// Helpers
// =============================================================================

function sessionToView(s: SessionRecord): { result: TestResultRow; user: UserRow } {
  return {
    result: { ...s.result, id: s.id, userId: s.id },
    user: { id: s.id, ...s.user, createdAt: s.createdAt },
  };
}
