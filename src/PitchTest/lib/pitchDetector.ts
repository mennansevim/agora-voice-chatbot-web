import { PitchDetector } from 'pitchy';

export type PitchResult = {
  detectedFreq: number | null;
  clarity: number;
};

const MIN_CLARITY = 0.85;
const HUMAN_VOICE_MIN = 70;
const HUMAN_VOICE_MAX = 1200;

export function analyzeBuffer(samples: Float32Array, sampleRate: number): PitchResult {
  const windowSize = 2048;
  const hop = 1024;
  const detector = PitchDetector.forFloat32Array(windowSize);
  detector.minVolumeDecibels = -50;

  const freqs: number[] = [];
  for (let start = 0; start + windowSize <= samples.length; start += hop) {
    const slice = samples.subarray(start, start + windowSize);
    const [pitch, clarity] = detector.findPitch(slice, sampleRate);
    if (clarity >= MIN_CLARITY && pitch >= HUMAN_VOICE_MIN && pitch <= HUMAN_VOICE_MAX) {
      freqs.push(pitch);
    }
  }

  if (freqs.length < 3) return { detectedFreq: null, clarity: 0 };

  freqs.sort((a, b) => a - b);
  const median = freqs[Math.floor(freqs.length / 2)];
  return { detectedFreq: median, clarity: freqs.length / Math.max(1, Math.floor((samples.length - windowSize) / hop) + 1) };
}

export type MatchResult = {
  isMatch: boolean;
  detectedFreq: number | null;
  matchedFreq: number | null;
  octaveOffset: number;
  successRate: number;
};

export function matchToTarget(detectedFreq: number | null, targetFreq: number): MatchResult {
  if (detectedFreq == null || detectedFreq <= 0) {
    return { isMatch: false, detectedFreq, matchedFreq: null, octaveOffset: 0, successRate: 0 };
  }
  const candidates = [
    { freq: detectedFreq, oct: 0, penalty: 1.0 },
    { freq: detectedFreq * 2, oct: 1, penalty: 0.85 },
    { freq: detectedFreq / 2, oct: -1, penalty: 0.85 },
    { freq: detectedFreq * 4, oct: 2, penalty: 0.7 },
    { freq: detectedFreq / 4, oct: -2, penalty: 0.7 },
  ];

  const cents = (a: number, b: number) => Math.abs(1200 * Math.log2(a / b));
  let best = { score: 0, freq: detectedFreq, oct: 0 };
  for (const c of candidates) {
    const diff = cents(c.freq, targetFreq);
    const tolerance = 100;
    if (diff <= tolerance) {
      const rawScore = (1 - diff / tolerance) * 100;
      const score = rawScore * c.penalty;
      if (score > best.score) {
        best = { score, freq: c.freq, oct: c.oct };
      }
    }
  }

  return {
    isMatch: best.score >= 60,
    detectedFreq,
    matchedFreq: best.score > 0 ? best.freq : null,
    octaveOffset: best.oct,
    successRate: best.score,
  };
}
