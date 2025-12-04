
import { KeyCount } from "@/app/page";

export type Scale = 'major' | 'minor';

export const scaleTypes: Scale[] = ['major', 'minor'];

const scaleIntervals: Record<Scale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

const KEY_RANGES: Record<KeyCount, { start: number; end: number }> = {
  88: { start: 24, end: 108 },
  61: { start: 36, end: 96 },
  37: { start: 48, end: 84 },
};

export const getScaleNotes = (rootNoteMidi: number, scaleType: Scale, keyCount: KeyCount): number[] => {
  const intervals = scaleIntervals[scaleType];
  const { start, end } = KEY_RANGES[keyCount];
  const notes: number[] = [];

  // Start from the lowest possible octave for the root note
  let currentRoot = rootNoteMidi % 12;
  while (currentRoot < start) {
    currentRoot += 12;
  }

  for (let octaveRoot = currentRoot; octaveRoot <= end; octaveRoot += 12) {
    for (const interval of intervals) {
      const note = octaveRoot + interval;
      if (note >= start && note <= end) {
        notes.push(note);
      }
    }
  }

  return notes;
};
