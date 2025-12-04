export type PianoKey = {
  midi: number;
  note: string;
  octave: number;
  type: 'white' | 'black';
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const generatePianoKeys = (): PianoKey[] => {
  const keys: PianoKey[] = [];
  const startMidi = 21; // A0
  const endMidi = 108;  // C8

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

export const PIANO_KEYS: PianoKey[] = generatePianoKeys();
