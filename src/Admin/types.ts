export type AdminAttempt = {
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

export type RangeRecordingMeta = {
  idx: string;
  filename: string;
  path: string;
  mime: string;
  recordedAt: number;
  noteName?: string;
  targetFreq?: string;
  detectedFreq?: string;
  accuracy?: string;
  attemptNumber?: string;
  direction?: string;
};

export type SongRecordingMeta = {
  idx: string;
  filename: string;
  path: string;
  mime: string;
  recordedAt: number;
  duration?: string;
  shareToScoreboard?: string;
};

export type AdminSession = {
  id: number;
  user: { firstName: string; lastName: string; gender: 'male' | 'female' };
  result: {
    voiceTypeName: string | null;
    successRate: number;
    compositeScore: number;
    lowestNote: string;
    highestNote: string;
    octaveRangeWidth: number;
    avgRms?: number;
    avgPitchStability?: number;
    avgVoicedRatio?: number;
    testDate: number;
    choirSection?: string;
    published?: boolean;
  };
  attempts: AdminAttempt[];
  recordings?: {
    range?: RangeRecordingMeta[];
    song?: SongRecordingMeta[];
  };
  createdAt: number;
};

export type StageRecording = {
  id: number;
  path: string;
  mime: string;
  createdAt: number;
  songId?: string;
  songTitle?: string;
  composer?: string;
  durationSec?: string;
};
