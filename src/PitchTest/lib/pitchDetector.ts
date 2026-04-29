import { PitchDetector } from 'pitchy';

export type PitchResult = {
  detectedFreq: number | null;
  clarity: number;
  rms: number;                 // 0-1 — sesin gücü (RMS amplitüd)
  pitchStabilityCents: number; // cents std dev — vibrato/kararlılık ölçüsü
  voicedRatio: number;         // 0-1 — pencerelerin yüzde kaçında ses tespit edildi (nefes desteği)
};

const MIN_CLARITY = 0.85;
// Default bantlar (geriye uyumlu): orta aralıkta tipik insan sesi
const DEFAULT_MIN = 70;
const DEFAULT_MAX = 1200;

// Düşük frekansların güvenilir tespiti için pencere boyutu otomatik seçilir.
// Pitchy/YIN için en az 2-3 periyot gerekir; 41 Hz için ~93ms = 4096 sample @ 44.1kHz.
function pickWindowSize(targetFreq: number | undefined, sampleRate: number): number {
  if (!targetFreq) return 2048;
  // 4 periyot referansı ile minimum window
  const samplesPerPeriod = sampleRate / targetFreq;
  const minSamples = samplesPerPeriod * 4;
  if (minSamples > 8192) return 16384;
  if (minSamples > 4096) return 8192;
  if (minSamples > 2048) return 4096;
  return 2048;
}

export function analyzeBuffer(
  samples: Float32Array,
  sampleRate: number,
  targetFreq?: number,
): PitchResult {
  const windowSize = pickWindowSize(targetFreq, sampleRate);
  const hop = Math.floor(windowSize / 2);

  // Bant aralığı: target verilmişse ±2 oktav, yoksa default
  const minFreq = targetFreq ? Math.max(20, targetFreq / 4) : DEFAULT_MIN;
  const maxFreq = targetFreq ? Math.min(5000, targetFreq * 4) : DEFAULT_MAX;

  if (windowSize > samples.length) {
    // Yeterli sample yoksa default fallback ile dene
    return analyzeBuffer(samples, sampleRate);
  }

  const detector = PitchDetector.forFloat32Array(windowSize);
  detector.minVolumeDecibels = -50;

  const freqs: number[] = [];
  for (let start = 0; start + windowSize <= samples.length; start += hop) {
    const slice = samples.subarray(start, start + windowSize);
    const [pitch, clarity] = detector.findPitch(slice, sampleRate);
    if (clarity >= MIN_CLARITY && pitch >= minFreq && pitch <= maxFreq) {
      freqs.push(pitch);
    }
  }

  // RMS — sesin enerji düzeyi (mikrofon mesafesine bağlı, görelidir)
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) sumSq += samples[i] * samples[i];
  const rms = Math.sqrt(sumSq / Math.max(1, samples.length));

  const totalWindows = Math.max(1, Math.floor((samples.length - windowSize) / hop) + 1);
  const voicedRatio = freqs.length / totalWindows;

  if (freqs.length < 3) {
    return { detectedFreq: null, clarity: 0, rms, pitchStabilityCents: 0, voicedRatio };
  }

  freqs.sort((a, b) => a - b);
  const median = freqs[Math.floor(freqs.length / 2)];

  // Pitch kararlılığı: tüm pencere frekanslarının medianı etrafındaki cent cinsinden std sapma
  let centsVar = 0;
  if (median > 0 && freqs.length > 1) {
    const cents = freqs.map((f) => 1200 * Math.log2(f / median));
    const mean = cents.reduce((a, b) => a + b, 0) / cents.length;
    const variance = cents.reduce((a, b) => a + (b - mean) * (b - mean), 0) / cents.length;
    centsVar = Math.sqrt(variance);
  }

  return {
    detectedFreq: median,
    clarity: freqs.length / totalWindows,
    rms,
    pitchStabilityCents: centsVar,
    voicedRatio,
  };
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
