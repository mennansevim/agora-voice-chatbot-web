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
    direction: 'down',
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
  if (state.direction === 'down') {
    return {
      ...state,
      direction: 'up',
      currentIndex: Math.min(state.startIndex + 1, NOTE_FREQUENCIES.length - 1),
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
  return {
    lowest: NOTE_FREQUENCIES[minIdx],
    highest: NOTE_FREQUENCIES[maxIdx],
    octaveWidth: (maxIdx - minIdx) / 12,
  };
}
