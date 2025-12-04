"use client";

import { useState, useEffect, useCallback } from 'react';

const NOTE_ON = 144;
const NOTE_OFF = 128;

interface UseMidiProps {
  onNoteOn: (note: number, velocity: number) => void;
  onNoteOff: (note: number) => void;
}

export function useMidi({ onNoteOn, onNoteOff }: UseMidiProps) {
  const [midiStatus, setMidiStatus] = useState<'connected' | 'disconnected' | 'unsupported'>('disconnected');
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  const handleMIDIMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
    const [command, note, velocity] = message.data;
    const commandBase = command & 0xF0;

    if (commandBase === NOTE_ON && velocity > 0) {
      onNoteOn(note, velocity);
    } else if (commandBase === NOTE_OFF || (commandBase === NOTE_ON && velocity === 0)) {
      onNoteOff(note);
    }
  }, [onNoteOn, onNoteOff]);
  
  const setupMIDI = useCallback(async () => {
    if (navigator.requestMIDIAccess) {
      try {
        const midiAccess = await navigator.requestMIDIAccess();

        const onStateChange = () => {
          const inputs = midiAccess.inputs.values();
          let deviceFound = false;
          for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = handleMIDIMessage;
            setConnectedDevice(input.value.name || 'Unknown Device');
            deviceFound = true;
          }
          if (deviceFound) {
            setMidiStatus('connected');
          } else {
            setMidiStatus('disconnected');
            setConnectedDevice(null);
          }
        };

        midiAccess.onstatechange = onStateChange;
        onStateChange(); // Initial check

      } catch (error) {
        console.error("Could not access your MIDI devices.", error);
        setMidiStatus('unsupported');
      }
    } else {
      console.warn("Web MIDI API is not supported in this browser.");
      setMidiStatus('unsupported');
    }
  }, [handleMIDIMessage]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestMIDIAccess' in navigator) {
      setupMIDI();
    } else {
        setMidiStatus('unsupported');
    }
  }, [setupMIDI]);

  return { midiStatus, connectedDevice };
}
