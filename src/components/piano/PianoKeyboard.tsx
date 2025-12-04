"use client";

import React, { memo } from 'react';
import { PIANO_KEYS, type PianoKey } from '@/lib/notes';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  pressedKeys: Set<number>;
  onNoteOn: (note: number, velocity?: number) => void;
  onNoteOff: (note: number) => void;
}

const Key = memo(({
  pianoKey,
  isPressed,
  onNoteOn,
  onNoteOff,
  isBlack,
  blackKeyIndex,
  whiteKeyIndex,
}: {
  pianoKey: PianoKey;
  isPressed: boolean;
  onNoteOn: (note: number, velocity?: number) => void;
  onNoteOff: (note: number) => void;
  isBlack: boolean;
  blackKeyIndex: number;
  whiteKeyIndex: number;
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onNoteOn(pianoKey.midi, 100);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    onNoteOff(pianoKey.midi);
  };
  
  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    if(isPressed) {
      onNoteOff(pianoKey.midi);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    onNoteOn(pianoKey.midi, 100);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onNoteOff(pianoKey.midi);
  };

  const keyClasses = cn(
    'absolute rounded-b-md border-b-4 transition-all duration-75',
    isBlack
      ? 'w-[55%] h-[60%] bg-gray-800 border-gray-900 z-10 hover:bg-gray-700'
      : 'w-full h-full bg-white border-gray-200',
    isPressed && (isBlack ? '!bg-accent' : '!bg-orange-200 border-accent'),
    !isBlack && 'border-l border-r'
  );
  
  const blackKeyLeftOffset = () => {
    // A#0, C#1, D#1, F#1, G#1...
    const note = pianoKey.note.substring(0, 2);
    switch (note) {
        case 'A#': return '58.33%'; // Gap between A and B
        case 'C#': return '12.5%'; // C and D
        case 'D#': return '29.16%'; // D and E
        case 'F#': return '54.16%'; // F and G
        case 'G#': return '70.83%'; // G and A
        default: return '0';
    }
  }

  const styles = isBlack
    ? {
        left: `calc(${(100 / 52) * whiteKeyIndex}% + (100% / 52) * ${parseFloat(blackKeyLeftOffset()) / 100} - (100% / 52 * 0.55 / 2))`,
        width: `calc(100% / 52 * 0.55)`,
      }
    : {
        left: `${(100 / 52) * whiteKeyIndex}%`,
        width: `calc(100% / 52)`,
      };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={keyClasses}
      style={styles}
      aria-label={`Play note ${pianoKey.note}`}
    >
    </button>
  );
});

Key.displayName = 'Key';


export default function PianoKeyboard({ pressedKeys, onNoteOn, onNoteOff }: PianoKeyboardProps) {
    const whiteKeys = PIANO_KEYS.filter(key => key.type === 'white');
    const blackKeys = PIANO_KEYS.filter(key => key.type === 'black');

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg shadow-2xl p-2">
      <div className="relative w-full h-full">
         {PIANO_KEYS.map((key) => {
            const isBlack = key.type === 'black';
            let whiteKeyIndex = -1;
            if (isBlack) {
                // Find the preceding white key's index
                for(let i=key.midi - 21; i >= 0; i--) {
                    if (PIANO_KEYS[i].type === 'white') {
                        whiteKeyIndex = whiteKeys.findIndex(wk => wk.midi === PIANO_KEYS[i].midi);
                        break;
                    }
                }
            } else {
                whiteKeyIndex = whiteKeys.findIndex(wk => wk.midi === key.midi);
            }

            return (
                <Key
                    key={key.midi}
                    pianoKey={key}
                    isPressed={pressedKeys.has(key.midi)}
                    onNoteOn={onNoteOn}
                    onNoteOff={onNoteOff}
                    isBlack={isBlack}
                    blackKeyIndex={isBlack ? blackKeys.findIndex(bk => bk.midi === key.midi) : -1}
                    whiteKeyIndex={whiteKeyIndex}
                />
            );
         })}
      </div>
    </div>
  );
}
