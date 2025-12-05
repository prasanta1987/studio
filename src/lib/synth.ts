
import * as Tone from 'tone';

let synth: Tone.PolySynth<any> | Tone.PluckSynth | null = null;
let volume: Tone.Volume | null = null;
let playbackPart: Tone.Part | null = null;

const instruments = {
    default: Tone.Synth,
    am: Tone.AMSynth,
    fm: Tone.FMSynth,
    membrane: Tone.MembraneSynth,
    pluck: Tone.PluckSynth,
    grandPiano: Tone.Synth,
};

const instrumentConfigs = {
    grandPiano: {
        oscillator: {
            type: "fatsawtooth",
            count: 3,
            spread: 30
        },
        envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.5,
            release: 1.5,
        }
    }
}

export function initSynth() {
    if (!synth) {
        synth = new Tone.PolySynth(Tone.Synth);
        volume = new Tone.Volume(-6).toDestination();
        synth.connect(volume);
    }
}

export function playNote(note: number, velocity: number) {
    if (!synth) initSynth();
    const freq = Tone.Frequency(note, 'midi');
    const vel = velocity / 127;
    if (synth instanceof Tone.PluckSynth) {
      synth.triggerAttack(freq, Tone.now());
    } else if (synth instanceof Tone.PolySynth) {
      synth?.triggerAttack(freq, Tone.now(), vel);
    }
}

export function releaseNote(note: number) {
    if (!synth) return;
    const freq = Tone.Frequency(note, 'midi');
    if (synth instanceof Tone.PolySynth) {
        synth?.triggerRelease(freq, Tone.now());
    }
}

export function setInstrument(instrumentName: string) {
    if (!volume) {
        volume = new Tone.Volume(-6).toDestination();
    }
    
    if (synth) {
        synth.dispose();
    }

    const instrumentConstructor = instruments[instrumentName as keyof typeof instruments] || Tone.Synth;
    
    if (instrumentName === 'pluck') {
        synth = new Tone.PluckSynth().connect(volume);
    } else if (instrumentName === 'membrane') {
        // MembraneSynth is monophonic, so it should be wrapped in PolySynth for polyphony
        synth = new Tone.PolySynth(Tone.MembraneSynth).connect(volume);
    } else {
        const config = instrumentName === 'grandPiano' 
            ? instrumentConfigs.grandPiano 
            : {};
        synth = new Tone.PolySynth(instrumentConstructor, config).connect(volume);
    }
}


export function setSustainDuration(duration: number) {
    if (synth && 'set' in synth && typeof (synth as any).set === 'function') {
        (synth as any).set({ "envelope": { "release": duration } });
    }
}

export function setVolume(value: number) {
    if (!volume) return;
    const minDb = -40;
    const maxDb = 0;
    const db = minDb + (value / 100) * (maxDb - minDb);
    volume.volume.value = db;
}

export function playRecording(events: {note: number; time: number; duration: number, velocity: number}[], onEnd: () => void) {
    if (playbackPart) {
        playbackPart.dispose();
    }
    if (!synth) return;

    playbackPart = new Tone.Part((time, value) => {
        if (synth instanceof Tone.PluckSynth) {
             synth?.triggerAttack(Tone.Frequency(value.note, 'midi'), time);
        } else if (synth instanceof Tone.PolySynth) {
            synth?.triggerAttackRelease(Tone.Frequency(value.note, 'midi'), value.duration, time, value.velocity);
        }
    }, events.map(e => ({...e, note: e.note}))).start(0);

    playbackPart.loop = false;
    Tone.Transport.start();

    const totalDuration = events.reduce((max, e) => Math.max(max, e.time + e.duration), 0);
    Tone.Transport.scheduleOnce(() => {
        stopPlaying();
        onEnd();
    }, totalDuration + 0.5); // Add a small buffer
}

export function stopPlaying() {
    if (playbackPart) {
        playbackPart.stop(0);
        playbackPart.dispose();
        playbackPart = null;
    }
    if (synth instanceof Tone.PolySynth) {
        synth?.releaseAll();
    }
    
    Tone.Transport.stop();
    Tone.Transport.cancel();
}

export const getInstruments = () => Object.keys(instruments).map(key => ({ value: key, label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim() }));
