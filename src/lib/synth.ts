
import * as Tone from 'tone';

let synth: Tone.PolySynth<any> | Tone.PluckSynth | Tone.Sampler | null = null;
let volume: Tone.Volume | null = null;
let playbackPart: Tone.Part | null = null;

const instruments = {
    default: Tone.Synth,
    am: Tone.AMSynth,
    fm: Tone.FMSynth,
    membrane: Tone.MembraneSynth,
    pluck: Tone.PluckSynth,
    grandPiano: Tone.Sampler,
};

let pianoSampler: Tone.Sampler | null = null;

async function getPianoSampler() {
    if (!pianoSampler) {
        if (!volume) {
            volume = new Tone.Volume(-6).toDestination();
        }
        pianoSampler = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C1: "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                A1: "A1.mp3",
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
                C3: "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                A3: "A3.mp3",
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                A5: "A5.mp3",
                C6: "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                A6: "A6.mp3",
                C7: "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                A7: "A7.mp3",
                C8: "C8.mp3"
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
        }).connect(volume);
        await Tone.loaded();
    }
    return pianoSampler;
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
    
    if (synth instanceof Tone.Sampler || synth instanceof Tone.PluckSynth) {
      synth.triggerAttack(freq, Tone.now(), vel);
    } else if (synth instanceof Tone.PolySynth) {
      synth.triggerAttack(freq, Tone.now(), vel);
    }
}

export function releaseNote(note: number) {
    if (!synth) return;
    const freq = Tone.Frequency(note, 'midi');
    if (synth instanceof Tone.PolySynth || synth instanceof Tone.Sampler) {
        synth.triggerRelease(freq, Tone.now());
    }
}

export async function setInstrument(instrumentName: string) {
    if (!volume) {
        volume = new Tone.Volume(-6).toDestination();
    }
    
    if (synth) {
        synth.dispose();
    }

    if (instrumentName === 'grandPiano') {
        synth = await getPianoSampler();
        return;
    }

    const instrumentConstructor = instruments[instrumentName as keyof typeof instruments] || Tone.Synth;
    
    if (instrumentName === 'pluck') {
        synth = new Tone.PluckSynth().connect(volume);
    } else if (instrumentName === 'membrane') {
        synth = new Tone.PolySynth(Tone.MembraneSynth).connect(volume);
    } else {
        synth = new Tone.PolySynth(instrumentConstructor).connect(volume);
    }
}


export function setSustainDuration(duration: number) {
    if (synth && 'set' in synth && typeof (synth as any).set === 'function') {
        if (synth instanceof Tone.Sampler) {
            synth.release = duration;
        } else {
            (synth as any).set({ "envelope": { "release": duration } });
        }
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
        if (synth instanceof Tone.PluckSynth || synth instanceof Tone.Sampler) {
             synth?.triggerAttackRelease(Tone.Frequency(value.note, 'midi'), value.duration, time, value.velocity);
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
    if (synth instanceof Tone.PolySynth || synth instanceof Tone.Sampler) {
        synth?.releaseAll();
    }
    
    Tone.Transport.stop();
    Tone.Transport.cancel();
}

export const getInstruments = () => Object.keys(instruments).map(key => ({ value: key, label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim() }));
