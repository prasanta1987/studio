
import type { KeyCount } from "@/app/page";

export type PianoKey = {
  midi: number;
  note: string;
  octave: number;
  type: 'white' | 'black';
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const KEY_RANGES: Record<KeyCount, { start: number; count: number }> = {
  88: { start: 24, count: 88 }, // C1 to C9
  61: { start: 36, count: 61 }, // C2 to C7
  37: { start: 48, count: 37 }, // C3 to C6
};

export const getPianoKeys = (keyCount: KeyCount): PianoKey[] => {
  const keys: PianoKey[] = [];
  const { start: startMidi, count } = KEY_RANGES[keyCount];

  for (let i = 0; i < count; i++) {
    const midi = startMidi + i;
    if (keyCount === 88 && midi > 108) continue;

    const noteIndex = midi % 12;
    const noteName = NOTE_NAMES[noteIndex];
    const octave = Math.floor(midi / 12) - 1;

    keys.push({
      midi,
      note: `${noteName}${octave}`,
      octave,
      type: noteName.includes('#') ? 'black' : 'white',
    });
  }

  return keys;
};
