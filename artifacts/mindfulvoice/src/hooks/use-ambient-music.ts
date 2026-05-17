import { useRef, useState, useCallback } from "react";

// ─── São Paulo lofi bossa nova music generator ──────────────────────────────
// Chord progression: Am7 → Fmaj7 → Cmaj7 → G7 (classic MPB/bossa nova)
const CHORDS: [number, number, number, number][] = [
  [220.00, 261.63, 329.63, 392.00], // Am7: A3 C4 E4 G4
  [174.61, 220.00, 261.63, 329.63], // Fmaj7: F3 A3 C4 E4
  [261.63, 329.63, 392.00, 493.88], // Cmaj7: C4 E4 G4 B4
  [196.00, 246.94, 293.66, 392.00], // G7: G3 B3 D4 G4
];

const BASS_NOTES: [number, number][] = [
  [55.00, 61.74],   // Am: A1 B1
  [43.65, 49.00],   // Fm: F1 G1
  [65.41, 73.42],   // Cm: C2 D2
  [49.00, 55.00],   // Gm: G1 A1
];

const MELODY: number[] = [
  329.63, 293.66, 261.63, 293.66,
  329.63, 392.00, 440.00, 392.00,
];

const BPM = 80;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

function buildReverb(ctx: AudioContext): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = rate * 2.5;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

function playChordPad(
  ctx: AudioContext,
  dest: AudioNode,
  freqs: number[],
  time: number,
  duration: number,
  gain = 0.06
) {
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f * 0.5; // one octave down for warmth
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(gain - i * 0.008, time + 0.08);
    env.gain.setValueAtTime(gain - i * 0.008, time + duration - 0.2);
    env.gain.linearRampToValueAtTime(0, time + duration);
    osc.connect(env);
    env.connect(dest);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  });
}

function playBass(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  time: number
) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(0.35, time + 0.015);
  env.gain.exponentialRampToValueAtTime(0.001, time + 0.55);
  osc.connect(env);
  env.connect(dest);
  osc.start(time);
  osc.stop(time + 0.65);
}

function playHihat(ctx: AudioContext, dest: AudioNode, time: number, vol = 0.05) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 9000;
  const env = ctx.createGain();
  env.gain.setValueAtTime(vol, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  src.connect(hpf);
  hpf.connect(env);
  env.connect(dest);
  src.start(time);
}

function playKick(ctx: AudioContext, dest: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.45);
  env.gain.setValueAtTime(0.55, time);
  env.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
  osc.connect(env);
  env.connect(dest);
  osc.start(time);
  osc.stop(time + 0.5);
}

function playMelodyNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  time: number
) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(0.07, time + 0.04);
  env.gain.exponentialRampToValueAtTime(0.001, time + BEAT * 0.9);
  osc.connect(env);
  env.connect(dest);
  osc.start(time);
  osc.stop(time + BEAT);
}

export function useAmbientMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const barRef = useRef(0);
  const melodyBarRef = useRef(0);

  const start = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    // Fade in
    master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1.5);

    // Reverb send
    const reverb = buildReverb(ctx);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.18;
    reverb.connect(reverbGain);
    reverbGain.connect(master);

    // LP filter for warmth
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 3200;
    lpf.connect(master);

    let stopped = false;
    barRef.current = 0;
    melodyBarRef.current = 0;

    function scheduleBar(t: number) {
      if (stopped) return;
      const ci = barRef.current % 4;
      const chord = CHORDS[ci];
      const bass = BASS_NOTES[ci];

      // Bossa nova / MPB rhythm:
      // Beat 1: kick + bass + chord
      // Beat 1.5: hihat
      // Beat 2: hihat (light)
      // Beat 2.33: bass walk
      // Beat 2.5: chord accent
      // Beat 3: kick + bass
      // Beat 3.5: hihat
      // Beat 4: hihat (light)
      // Beat 4.33: bass walk
      // Beat 4.5: chord accent

      playKick(ctx, lpf, t);
      playBass(ctx, lpf, bass[0], t);
      playChordPad(ctx, reverb, chord, t, BAR, 0.055);

      playHihat(ctx, lpf, t + BEAT * 0.5, 0.05);
      playHihat(ctx, lpf, t + BEAT * 1, 0.035);
      playBass(ctx, lpf, bass[1], t + BEAT * 1.33);
      playChordPad(ctx, reverb, chord, t + BEAT * 1.5, BEAT, 0.04);

      playKick(ctx, lpf, t + BEAT * 2);
      playBass(ctx, lpf, bass[0], t + BEAT * 2);
      playHihat(ctx, lpf, t + BEAT * 2.5, 0.05);
      playHihat(ctx, lpf, t + BEAT * 3, 0.035);
      playBass(ctx, lpf, bass[1], t + BEAT * 3.33);
      playChordPad(ctx, reverb, chord, t + BEAT * 3.5, BEAT, 0.04);

      // Melody every 2 bars
      if (barRef.current % 2 === 0) {
        const mi = melodyBarRef.current % MELODY.length;
        const melFreq = MELODY[(mi + ci) % MELODY.length];
        playMelodyNote(ctx, reverb, melFreq, t + BEAT * 1);
        playMelodyNote(ctx, reverb, MELODY[(mi + ci + 1) % MELODY.length], t + BEAT * 3);
        melodyBarRef.current++;
      }

      barRef.current++;

      const nextBarIn = (BAR - 0.15) * 1000;
      const timeoutId = setTimeout(() => {
        if (!stopped) scheduleBar(t + BAR);
      }, nextBarIn);

      stopRef.current = () => {
        stopped = true;
        clearTimeout(timeoutId);
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
        setTimeout(() => ctx.close(), 1200);
      };
    }

    scheduleBar(ctx.currentTime + 0.05);
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    ctxRef.current = null;
    masterRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  return { isPlaying, toggle };
}
