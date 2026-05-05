import { getAudioContext } from './audioPlayer';

let stream: MediaStream | null = null;

export async function requestMicrophone(): Promise<MediaStream> {
  if (stream) return stream;
  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
    },
  });
  return stream;
}

export function releaseMicrophone(): void {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}

export type LiveAnalyser = {
  getRMS: () => number;
  cleanup: () => void;
};

export async function startLiveAnalyser(): Promise<LiveAnalyser> {
  const ctx = getAudioContext();
  const ms = await requestMicrophone();
  const src = ctx.createMediaStreamSource(ms);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  src.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  return {
    getRMS: () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      return Math.sqrt(sum / buf.length);
    },
    cleanup: () => {
      try { src.disconnect(); } catch { /* noop */ }
    },
  };
}

let activeRecorder: MediaRecorder | null = null;

export function abortActiveRecording(): void {
  if (activeRecorder && activeRecorder.state !== 'inactive') {
    try { activeRecorder.stop(); } catch { /* noop */ }
  }
}

function pickMime(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

export async function recordSamples(durationSec: number): Promise<{ samples: Float32Array; sampleRate: number }> {
  const r = await recordSamplesWithBlob(durationSec);
  return { samples: r.samples, sampleRate: r.sampleRate };
}

export async function recordSamplesWithBlob(durationSec: number): Promise<{ samples: Float32Array; sampleRate: number; blob: Blob; mime: string }> {
  const ctx = getAudioContext();
  const ms = await requestMicrophone();

  const mime = pickMime();
  const recorder = new MediaRecorder(ms, mime ? { mimeType: mime } : undefined);
  activeRecorder = recorder;
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
  recorder.start();
  const timeoutId = setTimeout(() => {
    if (recorder.state !== 'inactive') {
      try { recorder.stop(); } catch { /* noop */ }
    }
  }, durationSec * 1000);
  await stopped;
  clearTimeout(timeoutId);
  if (activeRecorder === recorder) activeRecorder = null;

  const blob = new Blob(chunks, { type: mime || 'audio/webm' });
  const arrayBuf = await blob.arrayBuffer();
  // decodeAudioData blob'u tüketiyor; analiz için kopya kullan
  const decodeBuf = arrayBuf.slice(0);
  const audioBuf = await ctx.decodeAudioData(decodeBuf);
  const samples = audioBuf.getChannelData(0).slice();
  return { samples, sampleRate: audioBuf.sampleRate, blob, mime: mime || 'audio/webm' };
}

// Continuous (max-duration) recording — kullanıcı erken durdurabilir.
export type ContinuousRecording = {
  stop: () => Promise<{ blob: Blob; mime: string; durationSec: number }>;
};

export async function startContinuousRecording(maxDurationSec: number): Promise<ContinuousRecording> {
  const ms = await requestMicrophone();
  const mime = pickMime();
  const recorder = new MediaRecorder(ms, mime ? { mimeType: mime } : undefined);
  activeRecorder = recorder;
  const chunks: Blob[] = [];
  const startedAt = Date.now();
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
  recorder.start(1000);

  const hardStop = setTimeout(() => {
    if (recorder.state !== 'inactive') {
      try { recorder.stop(); } catch { /* noop */ }
    }
  }, maxDurationSec * 1000);

  return {
    stop: async () => {
      if (recorder.state !== 'inactive') {
        try { recorder.stop(); } catch { /* noop */ }
      }
      await stopped;
      clearTimeout(hardStop);
      if (activeRecorder === recorder) activeRecorder = null;
      const durationSec = (Date.now() - startedAt) / 1000;
      const blob = new Blob(chunks, { type: mime || 'audio/webm' });
      return { blob, mime: mime || 'audio/webm', durationSec };
    },
  };
}
