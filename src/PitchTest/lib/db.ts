import Dexie, { Table } from 'dexie';

export type UserRow = {
  id?: number;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  createdAt: number;
};

export type ChoirSection = 'soprano' | 'alto' | 'tenor' | 'bass';

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
  testDate: number;
};

export type AttemptRow = {
  id?: number;
  testResultId: number;
  userId: number;
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

class PitchDB extends Dexie {
  users!: Table<UserRow, number>;
  testResults!: Table<TestResultRow, number>;
  attempts!: Table<AttemptRow, number>;

  constructor() {
    super('AgoraVoicePitchDB');
    this.version(1).stores({
      users: '++id, &[firstName+lastName+gender], createdAt',
      testResults: '++id, userId, testDate, compositeScore',
      attempts: '++id, testResultId, userId, recordedAt',
    });
    this.version(2).stores({
      users: '++id, &[firstName+lastName+gender], createdAt',
      testResults: '++id, userId, testDate, compositeScore, choirSection',
      attempts: '++id, testResultId, userId, recordedAt',
    });
  }
}

export const db = new PitchDB();

export async function upsertUser(firstName: string, lastName: string, gender: 'male' | 'female'): Promise<number> {
  const existing = await db.users.where({ firstName, lastName, gender }).first();
  if (existing?.id) return existing.id;
  return await db.users.add({ firstName, lastName, gender, createdAt: Date.now() });
}

export async function topScoreboard(limit = 50) {
  const all = await db.testResults.orderBy('compositeScore').reverse().toArray();
  const bestByUser = new Map<number, TestResultRow>();
  for (const r of all) {
    if (r.compositeScore <= 0 || !r.lowestNote || !r.highestNote) continue;
    if (!bestByUser.has(r.userId)) bestByUser.set(r.userId, r);
  }
  const rows = [...bestByUser.values()].slice(0, limit);
  const userIds = rows.map((r) => r.userId);
  const users = await db.users.bulkGet(userIds);
  const userMap = new Map(users.filter(Boolean).map((u) => [u!.id!, u!]));
  return rows.map((r) => ({ result: r, user: userMap.get(r.userId) }));
}

export async function updateChoirSection(testResultId: number, section: ChoirSection) {
  await db.testResults.update(testResultId, { choirSection: section });
}
