import { NOTE_FREQUENCIES, findNoteIndex } from './notes';

export type Direction = 'down' | 'up';

export type AttemptLog = {
  noteName: string;
  targetFreq: number;
  detectedFreq: number | null;
  matchedFreq: number | null;
  octaveOffset: number;
  successRate: number;
  isSuccessful: boolean;
  attemptNumber: number;
  direction: Direction;
  rms?: number;
  pitchStabilityCents?: number;
  voicedRatio?: number;
};

export const MAX_ATTEMPTS = 2;

export type RangeMachineState = {
  startNote: string;
  startIndex: number;
  direction: Direction;
  currentIndex: number;
  attemptInCurrent: number;
  reachedNotes: Set<string>;
  log: AttemptLog[];
  done: boolean;
};

export function initState(startNote: string): RangeMachineState {
  const idx = findNoteIndex(startNote);
  return {
    startNote,
    startIndex: idx,
    direction: 'up',
    currentIndex: idx,
    attemptInCurrent: 1,
    reachedNotes: new Set(),
    log: [],
    done: false,
  };
}

export function currentNote(state: RangeMachineState) {
  return NOTE_FREQUENCIES[state.currentIndex];
}

export function recordAttempt(state: RangeMachineState, attempt: Omit<AttemptLog, 'noteName' | 'targetFreq' | 'attemptNumber' | 'direction'>): RangeMachineState {
  const note = currentNote(state);
  const log: AttemptLog = {
    ...attempt,
    noteName: note.name,
    targetFreq: note.freq,
    attemptNumber: state.attemptInCurrent,
    direction: state.direction,
  };
  const newLog = [...state.log, log];

  if (attempt.isSuccessful) {
    const reached = new Set(state.reachedNotes);
    reached.add(note.name);
    return advance({ ...state, log: newLog, reachedNotes: reached });
  }

  if (state.attemptInCurrent < MAX_ATTEMPTS) {
    return { ...state, log: newLog, attemptInCurrent: state.attemptInCurrent + 1 };
  }

  return switchOrFinish({ ...state, log: newLog });
}

function advance(state: RangeMachineState): RangeMachineState {
  const step = state.direction === 'down' ? -1 : 1;
  const next = state.currentIndex + step;
  if (next < 0 || next >= NOTE_FREQUENCIES.length) {
    return switchOrFinish(state);
  }
  return { ...state, currentIndex: next, attemptInCurrent: 1 };
}

function switchOrFinish(state: RangeMachineState): RangeMachineState {
  if (state.direction === 'up') {
    return {
      ...state,
      direction: 'down',
      currentIndex: Math.max(state.startIndex - 1, 0),
      attemptInCurrent: 1,
    };
  }
  return { ...state, done: true };
}

export function skipDirection(state: RangeMachineState): RangeMachineState {
  return switchOrFinish(state);
}

export function getRangeBounds(state: RangeMachineState) {
  if (state.reachedNotes.size === 0) return null;
  const indices = [...state.reachedNotes].map((n) => findNoteIndex(n)).filter((i) => i >= 0);
  if (indices.length === 0) return null;
  const minIdx = Math.min(...indices);
  const maxIdx = Math.max(...indices);
  const lowest = NOTE_FREQUENCIES[minIdx];
  const highest = NOTE_FREQUENCIES[maxIdx];
  // Oktav = frekans oranının log2'si. Cinsiyetten/aralıktan bağımsız doğru ölçü.
  // Örn: Do3 (130.81) → Do4 (261.63) = log2(2.0) = 1.0 oktav.
  const octaveWidth = lowest.freq > 0 ? Math.log2(highest.freq / lowest.freq) : 0;
  return { lowest, highest, octaveWidth };
}
