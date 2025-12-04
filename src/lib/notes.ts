
import type { KeyCount } from "@/app/page";

export type PianoKey = {
  midi: number;
  note: string;
  octave: number;
  type: 'white' | 'black';
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const KEY_RANGES: Record<KeyCount, { start: number, end: number }> = {
    88: { start: 21, end: 108 }, // A0 to C8
    61: { start: 36, end: 96 },   // C2 to C7
    37: { start: 48, end: 84 },   // C3 to C6
};

export const getPianoKeys = (keyCount: KeyCount): PianoKey[] => {
  const keys: PianoKey[] = [];
  const { start: startMidi, end: endMidi } = KEY_RANGES[keyCount];

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const noteIndex = midi % 12;
    const noteName = NOTE_NAMES[noteIndex];
    const isBlack = noteName.includes('#');
    
    // Octave calculation in MIDI standard: C4 is middle C (MIDI 60), octave 4 starts at C4
    const octave = Math.floor(midi / 12) - 1;

    keys.push({
      midi,
      note: `${noteName}${octave}`,
      octave,
      type: isBlack ? 'black' : 'white',
    });
  }

  return keys;
};
