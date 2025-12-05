
import { NOTE_NAMES } from './notes';

const CHORD_INTERVALS: { [name: string]: number[] } = {
  '': [0, 4, 7], // Major
  'm': [0, 3, 7], // Minor
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

  // Sort notes and get the root note
  const sortedNotes = [...midiNotes].sort((a, b) => a - b);
  
  // Create unique set of intervals from the root
  const getIntervals = (root: number) => {
    return new Set(sortedNotes.map(note => (note - root) % 12));
  };
  
  // Check all inversions
  for (let i = 0; i < sortedNotes.length; i++) {
    const rootNote = sortedNotes[i];
    const rootNoteName = NOTE_NAMES[rootNote % 12];
    const intervals = getIntervals(rootNote);
    
    for (const chordSuffix in CHORD_INTERVALS) {
      const chordIntervals = new Set(CHORD_INTERVALS[chordSuffix]);

      if (intervals.size === chordIntervals.size) {
        let allMatch = true;
        for (const interval of Array.from(intervals)) {
          if (!chordIntervals.has(interval)) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) {
          return `${rootNoteName}${chordSuffix}`;
        }
      }
    }
  }

  return null; // No matching chord found
}

    