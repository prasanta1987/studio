import * as Tone from 'tone';

let synth: Tone.PolySynth<any> | null = null;
let volume: Tone.Volume | null = null;
let rhythmSeq: Tone.Sequence | null = null;
let playbackPart: Tone.Part | null = null;

const instruments = {
    default: Tone.Synth,
    am: Tone.AMSynth,
    fm: Tone.FMSynth,
    membrane: Tone.MembraneSynth,
    pluck: Tone.PluckSynth,
};

const rhythms = {
    none: null,
    fourOnFloor: (kick: Tone.MembraneSynth, hihat: Tone.MetalSynth) => {
        return new Tone.Sequence((time, note) => {
            if (note === 'C2') kick.triggerAttackRelease(note, '8n', time);
            if (note === 'G2') hihat.triggerAttackRelease('16n', time, 0.5);
        }, ['C2', 'G2', 'G2', 'G2', 'C2', 'G2', 'G2', 'G2'], '4n');
    },
    techno: (kick: Tone.MembraneSynth, hihat: Tone.MetalSynth) => {
        return new Tone.Sequence((time, note) => {
            if (note === 'C2') kick.triggerAttackRelease('C1', '8n', time);
            if (note === 'G2') hihat.triggerAttackRelease('32n', time, 0.8);
        }, ['C2', null, 'G2', null, 'C2', null, 'G2', null], '8n');
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
    synth?.triggerAttack(freq, Tone.now(), vel);
}

export function releaseNote(note: number) {
    if (!synth) return;
    const freq = Tone.Frequency(note, 'midi');
    synth?.triggerRelease(freq, Tone.now());
}

export function setInstrument(instrumentName: string) {
    if (!synth || !(instrumentName in instruments)) return;
    
    // Dispose old synth voices
    synth.dispose();

    // Create a new synth with the selected instrument type
    const instrumentConstructor = instruments[instrumentName as keyof typeof instruments];
    if (instrumentConstructor) {
        synth = new Tone.PolySynth(instrumentConstructor);
        if(volume) {
            synth.connect(volume);
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


export function playRhythm(rhythmName: string) {
    if (rhythmSeq) {
        rhythmSeq.stop();
        rhythmSeq.dispose();
    }
    const rhythmPattern = rhythms[rhythmName as keyof typeof rhythms];

    if (rhythmPattern) {
        const kick = new Tone.MembraneSynth().toDestination();
        const hihat = new Tone.MetalSynth({ volume: -12 }).toDestination();
        rhythmSeq = rhythmPattern(kick, hihat);
        rhythmSeq.start(0);
        Tone.Transport.start();
    } else {
        // If "none" or another pattern stops the transport, ensure it doesn't stop recordings
        if (Tone.Transport.state === 'started' && playbackPart === null) {
            // only stop if not playing a recording
        }
    }
}

export function stopRhythm() {
    if (rhythmSeq) {
        rhythmSeq.stop(0);
        rhythmSeq.dispose();
        rhythmSeq = null;
    }
    // Only stop transport if nothing else is using it (like recording/playback)
    if (Tone.Transport.schedule.length === 0) {
        Tone.Transport.stop();
    }
}

export function playRecording(events: {note: number; time: number; duration: number}[], onEnd: () => void) {
    if (playbackPart) {
        playbackPart.dispose();
    }
    if (!synth) return;

    playbackPart = new Tone.Part((time, value) => {
        synth?.triggerAttackRelease(Tone.Frequency(value.note, 'midi'), value.duration, time);
    }, events.map(e => ({...e, note: e.note}))).start(0);

    playbackPart.loop = false;
    Tone.Transport.start();

    // Schedule stop
    const totalDuration = events.reduce((max, e) => Math.max(max, e.time + e.duration), 0);
    Tone.Transport.scheduleOnce(() => {
        stopPlaying();
        onEnd();
    }, totalDuration);
}

export function stopPlaying() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    if (playbackPart) {
        playbackPart.stop(0);
        playbackPart.dispose();
        playbackPart = null;
    }
    // Release any stuck notes
    synth?.releaseAll();
}

export const getInstruments = () => Object.keys(instruments).map(key => ({ value: key, label: key.charAt(0).toUpperCase() + key.slice(1) }));
export const getRhythms = () => Object.keys(rhythms).map(key => ({ value: key, label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim() }));
export const getNoteTime = (note: number) => Tone.Transport.now();
export const getNoteDuration = (startTime: number) => Tone.Transport.now() - startTime;
