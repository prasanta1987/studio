
"use client";

import React, { memo } from 'react';
import { getPianoKeys, type PianoKey } from '@/lib/notes';
import { cn } from '@/lib/utils';
import type { KeyCount } from '@/app/page';

interface PianoKeyboardProps {
  keyCount: KeyCount;
  pressedKeys: Set<number>;
  highlightedKeys: number[];
  onNoteOn: (note: number, velocity?: number) => void;
  onNoteOff: (note: number) => void;
}

const Key = memo(({
  pianoKey,
  isPressed,
  isHighlighted,
  onNoteOn,
  onNoteOff,
  isBlack,
  whiteKeyIndex,
  whiteKeyCount
}: {
  pianoKey: PianoKey;
  isPressed: boolean;
  isHighlighted: boolean;
  onNoteOn: (note: number, velocity?: number) => void;
  onNoteOff: (note: number) => void;
  isBlack: boolean;
  whiteKeyIndex: number;
  whiteKeyCount: number;
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
    isHighlighted && !isPressed && (isBlack ? 'bg-sky-700' : 'bg-sky-200'),
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

  const whiteKeyWidth = 100 / whiteKeyCount;

  const styles = isBlack
    ? {
        left: `calc(${whiteKeyWidth * whiteKeyIndex}% + ${whiteKeyWidth}% * ${parseFloat(blackKeyLeftOffset()) / 100} - (${whiteKeyWidth}% * 0.55 / 2))`,
        width: `${whiteKeyWidth * 0.55}%`,
      }
    : {
        left: `${whiteKeyWidth * whiteKeyIndex}%`,
        width: `${whiteKeyWidth}%`,
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


export default function PianoKeyboard({ keyCount, pressedKeys, highlightedKeys, onNoteOn, onNoteOff }: PianoKeyboardProps) {
    const pianoKeys = getPianoKeys(keyCount);
    const whiteKeys = pianoKeys.filter(key => key.type === 'white');

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg shadow-2xl p-2">
      <div className="relative w-full h-full">
         {pianoKeys.map((key) => {
            const isBlack = key.type === 'black';
            let whiteKeyIndex = -1;

            if (isBlack) {
                // Find the preceding white key's index
                for(let i = pianoKeys.findIndex(pk => pk.midi === key.midi) - 1; i >= 0; i--) {
                    if (pianoKeys[i].type === 'white') {
                        whiteKeyIndex = whiteKeys.findIndex(wk => wk.midi === pianoKeys[i].midi);
                        break;
                    }
                }
            } else {
                whiteKeyIndex = whiteKeys.findIndex(wk => wk.midi === key.midi);
            }
            
            if (whiteKeyIndex === -1 && isBlack) {
                const nextWhiteKey = pianoKeys.find((pk, i) => i > pianoKeys.findIndex(k => k.midi === key.midi) && pk.type === 'white');
                if (nextWhiteKey) {
                    whiteKeyIndex = whiteKeys.findIndex(wk => wk.midi === nextWhiteKey.midi) - 1;
                }
            }


            return (
                <Key
                    key={key.midi}
                    pianoKey={key}
                    isPressed={pressedKeys.has(key.midi)}
                    isHighlighted={highlightedKeys.includes(key.midi)}
                    onNoteOn={onNoteOn}
                    onNoteOff={onNoteOff}
                    isBlack={isBlack}
                    whiteKeyIndex={whiteKeyIndex}
                    whiteKeyCount={whiteKeys.length}
                />
            );
         })}
      </div>
    </div>
  );
}
