
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { useMidi } from '@/hooks/useMidi';
import { initSynth, playNote, releaseNote, setInstrument, setVolume, playRhythm, stopRhythm, getInstruments, getRhythms, playRecording, stopPlaying, setSustainDuration } from '@/lib/synth';
import PianoKeyboard from '@/components/piano/PianoKeyboard';
import MainControls from '@/components/controls/MainControls';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { getPianoKeys } from '@/lib/notes';
import { Usb } from 'lucide-react';

type RecordingEvent = {
  note: number;
  time: number;
  duration: number;
  velocity: number;
};

export type KeyCount = 37 | 61 | 88;

export default function Home() {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [instrument, setCurrentInstrument] = useState<string>('default');
  const [rhythm, setCurrentRhythm] = useState<string>('none');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [keyCount, setKeyCount] = useState<KeyCount>(88);
  const recording = useRef<RecordingEvent[]>([]);
  const notesOn = useRef<Map<number, { time: number, velocity: number }>>(new Map());
  const { toast } = useToast();

  const PIANO_KEYS = getPianoKeys(keyCount);

  const onNoteOn = useCallback((note: number, velocity: number) => {
    if (!isInitialized) return;
    playNote(note, velocity);
    setPressedKeys(prev => new Set(prev.add(note)));

    if (isRecording) {
      notesOn.current.set(note, { time: Tone.Transport.now(), velocity: velocity / 127 });
    }
  }, [isRecording, isInitialized]);

  const onNoteOff = useCallback((note: number) => {
    if (!isInitialized) return;
    releaseNote(note);
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });

    if (isRecording && notesOn.current.has(note)) {
      const noteOn = notesOn.current.get(note)!;
      const duration = Tone.Transport.now() - noteOn.time;
      recording.current.push({ note, time: noteOn.time, duration, velocity: noteOn.velocity });
      notesOn.current.delete(note);
    }
  }, [isRecording, isInitialized]);

  const { midiStatus, connectedDevice } = useMidi({ onNoteOn, onNoteOff });
  
  useEffect(() => {
    const initialize = async () => {
      await Tone.start();
      initSynth();
      setIsInitialized(true);
    };

    if (typeof window !== 'undefined') {
      document.body.addEventListener('click', () => initialize(), { once: true });
      document.body.addEventListener('keydown', () => initialize(), { once: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.body.removeEventListener('click', () => initialize());
        document.body.removeEventListener('keydown', () => initialize());
      }
    };
  }, []);

  const handleInstrumentChange = (value: string) => {
    setCurrentInstrument(value);
    setInstrument(value);
  };

  const handleRhythmChange = (value: string) => {
    setCurrentRhythm(value);
    if (value === 'none') {
      stopRhythm();
    } else {
      playRhythm(value);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleSustainChange = (value: number[]) => {
    setSustainDuration(value[0]);
  };

  const handleKeyCountChange = (value: string) => {
    setKeyCount(parseInt(value, 10) as KeyCount);
  };
  
  const handleRecord = () => {
    if (isPlaying) {
      toast({
        title: "Cannot record during playback",
        description: "Please stop playback before starting a new recording.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      // Don't stop transport if a rhythm is playing
      if (rhythm === 'none') {
        Tone.Transport.stop();
      }
      toast({
        title: "Recording Stopped",
        description: `Your performance of ${recording.current.length} notes was saved.`,
      });
    } else {
      setIsRecording(true);
      recording.current = [];
      notesOn.current.clear();
      Tone.Transport.start();
      toast({
        title: "Recording Started",
        description: "Your performance is now being recorded.",
      });
    }
  };

  const handlePlay = () => {
    if (isRecording) {
      toast({
        title: "Cannot play during recording",
        description: "Please stop recording before playing back.",
        variant: "destructive",
      });
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      stopPlaying();
    } else {
      if (recording.current.length === 0) {
        toast({
          title: "Nothing to play",
          description: "Record a performance first.",
        });
        return;
      }
      setIsPlaying(true);
      playRecording(recording.current, () => {
        setIsPlaying(false)
        if (rhythm === 'none') {
          Tone.Transport.stop();
        }
      });
    }
  };

  const handleDownload = () => {
    if (recording.current.length === 0) {
      toast({
        title: "Nothing to download",
        description: "Record a performance first.",
      });
      return;
    }

    const midi = new Midi();
    const track = midi.addTrack();

    recording.current.forEach(event => {
      track.addNote({
        midi: event.note,
        time: event.time,
        duration: event.duration,
        velocity: event.velocity,
      });
    });

    const midiData = midi.toArray();
    const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'virtuoso-keys-recording.mid';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
        title: "Download Started",
        description: "Your recording is being downloaded as a MIDI file.",
    });
  };

  const getNoteName = (midi: number) => {
    const key = PIANO_KEYS.find(k => k.midi === midi);
    return key ? key.note : '';
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="p-4 border-b border-border shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Usb className={`size-4 ${midiStatus === 'connected' ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span>{connectedDevice ? `Connected: ${connectedDevice}` : 'No MIDI device connected'}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative">
        {!isInitialized && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <h2 className="text-2xl font-bold mb-2">Welcome to VirtuosoKeys</h2>
              <p className="text-muted-foreground">Click or press any key to start the audio engine.</p>
          </div>
        )}
        <div className={`w-full max-w-7xl transition-opacity duration-500 ${isInitialized ? 'opacity-100' : 'opacity-50 blur-sm'}`}>
          <MainControls
            instrument={instrument}
            onInstrumentChange={handleInstrumentChange}
            instruments={getInstruments()}
            rhythm={rhythm}
            onRhythmChange={handleRhythmChange}
            rhythms={getRhythms()}
            onVolumeChange={handleVolumeChange}
            onSustainChange={handleSustainChange}
            isRecording={isRecording}
            isPlaying={isPlaying}
            onRecord={handleRecord}
            onPlay={handlePlay}
            onDownload={handleDownload}
            disabled={!isInitialized}
            keyCount={keyCount}
            onKeyCountChange={handleKeyCountChange}
          />
          <div className="mt-6 w-full relative" style={{aspectRatio: '5 / 1'}}>
            <PianoKeyboard
              keyCount={keyCount}
              pressedKeys={pressedKeys}
              onNoteOn={onNoteOn}
              onNoteOff={onNoteOff}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
