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

export async function recordSamples(durationSec: number): Promise<{ samples: Float32Array; sampleRate: number }> {
  const ctx = getAudioContext();
  const ms = await requestMicrophone();

  const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
    .find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || '';
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
  const audioBuf = await ctx.decodeAudioData(arrayBuf);
  const samples = audioBuf.getChannelData(0).slice();
  return { samples, sampleRate: audioBuf.sampleRate };
}
