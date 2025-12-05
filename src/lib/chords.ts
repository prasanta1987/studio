
import { NOTE_NAMES } from './notes';

const CHORD_INTERVALS: { [name: string]: number[] } = {
  'major': [0, 4, 7], // Major
  'minor': [0, 3, 7], // Minor
  'dim': [0, 3, 6], // Diminished
  'aug': [0, 4, 8], // Augmented
  '7': [0, 4, 7, 10], // Dominant 7th
  'maj7': [0, 4, 7, 11], // Major 7th
  'm7': [0, 3, 7, 10], // Minor 7th
  'm7b5': [0, 3, 6, 10], // Half-diminished 7th
  'dim7': [0, 3, 6, 9], // Diminished 7th
  'sus2': [0, 2, 7], // Sus2
  'sus4': [0, 5, 7], // Sus4
};

export function detectChord(midiNotes: number[]): string | null {
  if (midiNotes.length < 3) {
    return null;
  }

  const sortedPitches = [...new Set(midiNotes.map(n => n % 12))].sort((a, b) => a - b);
  
  for (let i = 0; i < sortedPitches.length; i++) {
    const rootNote = sortedPitches[i];
    const rootNoteName = NOTE_NAMES[rootNote];
    
    // Create intervals relative to the current potential root
    const intervals = sortedPitches.map(pitch => (pitch - rootNote + 12) % 12);
    const intervalSet = new Set(intervals);

    for (const chordSuffix in CHORD_INTERVALS) {
      const chordIntervals = CHORD_INTERVALS[chordSuffix];

      if (intervalSet.size === chordIntervals.length) {
        const isMatch = chordIntervals.every(interval => intervalSet.has(interval));
        if (isMatch) {
          return `${rootNoteName}${chordSuffix}`;
        }
      }
    }
  }

  return null; // No matching chord found
}
