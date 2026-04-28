export type VoiceType = {
  id: number;
  name: string;
  gender: 'male' | 'female';
  minFreq: number;
  maxFreq: number;
  description: string;
};

export const VOICE_TYPES: VoiceType[] = [
  { id: 1, name: 'Bas', gender: 'male', minFreq: 82.41, maxFreq: 329.63, description: 'En kalın erkek ses tipi' },
  { id: 2, name: 'Bariton', gender: 'male', minFreq: 98.0, maxFreq: 392.0, description: 'Orta kalınlıkta erkek sesi' },
  { id: 3, name: 'Tenor', gender: 'male', minFreq: 130.81, maxFreq: 523.25, description: 'En ince erkek ses tipi' },
  { id: 4, name: 'Kontralto', gender: 'female', minFreq: 164.81, maxFreq: 659.26, description: 'En kalın kadın ses tipi' },
  { id: 5, name: 'Mezzo-soprano', gender: 'female', minFreq: 196.0, maxFreq: 783.99, description: 'Orta kalınlıkta kadın sesi' },
  { id: 6, name: 'Soprano', gender: 'female', minFreq: 261.63, maxFreq: 1046.5, description: 'En ince kadın ses tipi' },
];

export type VoiceMatchEntry = { type: VoiceType; percent: number };

export type VoiceTypeMatch = {
  best: VoiceType;
  matchPercent: number;
  possibleGroups: VoiceMatchEntry[];
  allMatches: VoiceMatchEntry[];
};

export function getAllVoiceMatches(
  userMinFreq: number,
  userMaxFreq: number,
  gender: 'male' | 'female'
): VoiceMatchEntry[] {
  const userRange = userMaxFreq - userMinFreq;
  if (userRange <= 0) return [];
  return VOICE_TYPES
    .filter((v) => v.gender === gender)
    .map((type) => {
      const overlap = Math.max(0, Math.min(type.maxFreq, userMaxFreq) - Math.max(type.minFreq, userMinFreq));
      const percent = (overlap / userRange) * 100;
      return { type, percent };
    })
    .sort((a, b) => b.percent - a.percent);
}

export function classifyVoiceType(
  userMinFreq: number,
  userMaxFreq: number,
  gender: 'male' | 'female'
): VoiceTypeMatch | null {
  const allMatches = getAllVoiceMatches(userMinFreq, userMaxFreq, gender);
  const best = allMatches[0];
  if (!best || best.percent <= 0) return null;
  return {
    best: best.type,
    matchPercent: best.percent,
    possibleGroups: allMatches.filter((s) => s.percent > 20),
    allMatches,
  };
}
