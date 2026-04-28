let ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();

export function getAudioContext(): AudioContext {
  if (!ctx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctx();
  }
  return ctx;
}

export async function unlockAudio(): Promise<void> {
  const c = getAudioContext();
  if (c.state === 'suspended') await c.resume();
}

async function loadBuffer(noteName: string): Promise<AudioBuffer> {
  const cached = buffers.get(noteName);
  if (cached) return cached;
  const c = getAudioContext();
  const res = await fetch(`/sounds/piano/${noteName}.wav`);
  const arrayBuf = await res.arrayBuffer();
  const audioBuf = await c.decodeAudioData(arrayBuf);
  buffers.set(noteName, audioBuf);
  return audioBuf;
}

export async function preloadNotes(noteNames: string[]): Promise<void> {
  await Promise.all(noteNames.map((n) => loadBuffer(n).catch(() => null)));
}

let activeSource: AudioBufferSourceNode | null = null;

export function stopAllPlayback(): void {
  if (activeSource) {
    try { activeSource.stop(); } catch { /* noop */ }
    try { activeSource.disconnect(); } catch { /* noop */ }
    activeSource = null;
  }
}

export async function playNote(noteName: string): Promise<void> {
  stopAllPlayback();
  const c = getAudioContext();
  const buffer = await loadBuffer(noteName);
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.connect(c.destination);
  activeSource = src;
  src.start();

  return new Promise((resolve) => {
    src.onended = () => {
      if (activeSource === src) activeSource = null;
      resolve();
    };
  });
}
