export type Note = { name: string; freq: number };

export const NOTE_FREQUENCIES: Note[] = [
  { name: 'C2', freq: 65.41 },
  { name: 'D2', freq: 73.42 },
  { name: 'E2', freq: 82.41 },
  { name: 'F2', freq: 87.31 },
  { name: 'G2', freq: 98.0 },
  { name: 'A2', freq: 110.0 },
  { name: 'B2', freq: 123.47 },
  { name: 'C3', freq: 130.81 },
  { name: 'D3', freq: 146.83 },
  { name: 'E3', freq: 164.81 },
  { name: 'F3', freq: 174.61 },
  { name: 'G3', freq: 196.0 },
  { name: 'A3', freq: 220.0 },
  { name: 'B3', freq: 246.94 },
  { name: 'C4', freq: 261.63 },
  { name: 'D4', freq: 293.66 },
  { name: 'E4', freq: 329.63 },
  { name: 'F4', freq: 349.23 },
  { name: 'G4', freq: 392.0 },
  { name: 'A4', freq: 440.0 },
  { name: 'B4', freq: 493.88 },
  { name: 'C5', freq: 523.25 },
  { name: 'D5', freq: 587.33 },
  { name: 'E5', freq: 659.25 },
  { name: 'F5', freq: 698.46 },
  { name: 'G5', freq: 783.99 },
  { name: 'A5', freq: 880.0 },
  { name: 'B5', freq: 987.77 },
  { name: 'C6', freq: 1046.5 },
];

const TR_NAMES: Record<string, string> = {
  C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si',
};

export function noteToTurkish(name: string): string {
  const letter = name[0];
  const octave = name.slice(1);
  return `${TR_NAMES[letter] ?? letter}${octave}`;
}

export function findNoteIndex(name: string): number {
  return NOTE_FREQUENCIES.findIndex((n) => n.name === name);
}

export function getStartNoteForGender(gender: 'male' | 'female'): string {
  return gender === 'male' ? 'C3' : 'C4';
}
