// Procedural Web Audio for the 3D drills. Everything is synthesised, so no
// audio files are shipped. One instance per scene; call dispose() on unmount.

type LoopName = 'hum' | 'alarm' | 'fire' | 'wind' | 'engine'

interface LoopNodes {
  gain: GainNode
  stop: () => void
}

interface ToneOpts {
  type?: OscillatorType
  freq: number
  freqEnd?: number
  dur: number
  gain?: number
  delay?: number
  attack?: number
}

interface NoiseOpts {
  dur: number
  gain?: number
  delay?: number
  filter?: BiquadFilterType
  freq?: number
  freqEnd?: number
  q?: number
  attack?: number
}

export class SimAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private loops = new Map<LoopName, LoopNodes>()
  enabled = true

  /** Creates the context lazily; browsers only allow this after a user gesture. */
  unlock() {
    this.ensure()
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return null
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.enabled ? 0.8 : 0
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
    return this.ctx
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(on ? 0.8 : 0, this.ctx.currentTime, 0.05)
  }

  setPaused(paused: boolean) {
    if (!this.ctx) return
    if (paused) this.ctx.suspend().catch(() => {})
    else this.ctx.resume().catch(() => {})
  }

  private noiseBuffer(ctx: AudioContext) {
    if (!this.noise) {
      const len = ctx.sampleRate * 2
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = this.noise.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    }
    return this.noise
  }

  private tone({ type = 'sine', freq, freqEnd, dur, gain = 0.2, delay = 0, attack = 0.005 }: ToneOpts) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  private burst({ dur, gain = 0.3, delay = 0, filter = 'lowpass', freq = 1200, freqEnd, q = 0.7, attack = 0.005 }: NoiseOpts) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = ctx.currentTime + delay
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer(ctx)
    const f = ctx.createBiquadFilter()
    f.type = filter
    f.Q.value = q
    f.frequency.setValueAtTime(freq, t)
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(f).connect(g).connect(this.master)
    src.start(t, Math.random())
    src.stop(t + dur + 0.02)
  }

  // ── One-shots ──────────────────────────────────────────────────────────────

  horn(long = false) {
    const dur = long ? 0.9 : 0.45
    this.tone({ type: 'sawtooth', freq: 392, dur, gain: 0.12, attack: 0.02 })
    this.tone({ type: 'sawtooth', freq: 494, dur, gain: 0.1, attack: 0.02 })
  }

  hornBlasts(n = 3) {
    for (let i = 0; i < n; i++) {
      this.tone({ type: 'sawtooth', freq: 392, dur: 0.18, gain: 0.13, delay: i * 0.24 })
      this.tone({ type: 'sawtooth', freq: 494, dur: 0.18, gain: 0.11, delay: i * 0.24 })
    }
  }

  brakeSqueal() {
    this.burst({ dur: 0.8, gain: 0.12, filter: 'bandpass', freq: 3200, freqEnd: 2200, q: 8 })
    this.tone({ type: 'triangle', freq: 1900, freqEnd: 1500, dur: 0.7, gain: 0.04 })
  }

  impact(heavy = true) {
    this.tone({ type: 'sine', freq: heavy ? 110 : 160, freqEnd: 35, dur: heavy ? 0.9 : 0.4, gain: heavy ? 0.6 : 0.35 })
    this.burst({ dur: heavy ? 0.6 : 0.3, gain: heavy ? 0.5 : 0.3, freq: 2400, freqEnd: 200 })
  }

  whooshSlow() {
    this.burst({ dur: 1.1, gain: 0.18, filter: 'bandpass', freq: 900, freqEnd: 180, q: 1.2, attack: 0.2 })
    this.tone({ type: 'sine', freq: 300, freqEnd: 70, dur: 1.0, gain: 0.12 })
  }

  heartbeat(times = 3) {
    for (let i = 0; i < times; i++) {
      this.tone({ type: 'sine', freq: 62, freqEnd: 40, dur: 0.16, gain: 0.4, delay: i * 0.85 })
      this.tone({ type: 'sine', freq: 58, freqEnd: 38, dur: 0.14, gain: 0.28, delay: i * 0.85 + 0.22 })
    }
  }

  click() {
    this.tone({ type: 'square', freq: 2400, dur: 0.03, gain: 0.05 })
  }

  carabiner() {
    this.tone({ type: 'triangle', freq: 3100, dur: 0.06, gain: 0.12 })
    this.tone({ type: 'triangle', freq: 4200, dur: 0.05, gain: 0.1, delay: 0.07 })
    this.burst({ dur: 0.05, gain: 0.08, filter: 'highpass', freq: 5000, delay: 0.07 })
  }

  creak() {
    this.tone({ type: 'sawtooth', freq: 140, freqEnd: 90, dur: 0.5, gain: 0.08, attack: 0.08 })
    this.burst({ dur: 0.4, gain: 0.06, filter: 'bandpass', freq: 600, q: 6, attack: 0.05 })
  }

  ropeSnap() {
    this.burst({ dur: 0.25, gain: 0.35, filter: 'lowpass', freq: 1800, freqEnd: 300 })
    this.tone({ type: 'sine', freq: 90, freqEnd: 50, dur: 0.35, gain: 0.35 })
  }

  doorSlam() {
    this.tone({ type: 'sine', freq: 90, freqEnd: 40, dur: 0.45, gain: 0.45 })
    this.burst({ dur: 0.2, gain: 0.25, freq: 1500, freqEnd: 200 })
    this.tone({ type: 'square', freq: 1800, dur: 0.04, gain: 0.04, delay: 0.12 })
  }

  hiss(dur = 1.4) {
    this.burst({ dur, gain: 0.2, filter: 'highpass', freq: 2500, attack: 0.05 })
  }

  flareUp() {
    this.burst({ dur: 1.4, gain: 0.55, filter: 'lowpass', freq: 600, freqEnd: 120, attack: 0.03 })
    this.tone({ type: 'sine', freq: 80, freqEnd: 30, dur: 1.2, gain: 0.45 })
  }

  cough() {
    for (const d of [0, 0.32]) {
      this.burst({ dur: 0.22, gain: 0.22, filter: 'bandpass', freq: 520, q: 1.4, delay: d, attack: 0.01 })
      this.tone({ type: 'sawtooth', freq: 150, freqEnd: 90, dur: 0.18, gain: 0.05, delay: d })
    }
  }

  pull() {
    this.tone({ type: 'square', freq: 700, dur: 0.05, gain: 0.05 })
    this.burst({ dur: 0.12, gain: 0.12, freq: 900 })
  }

  success() {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone({ type: 'triangle', freq: f, dur: 0.45, gain: 0.08, delay: i * 0.07 })
    )
  }

  error() {
    this.tone({ type: 'sawtooth', freq: 180, freqEnd: 120, dur: 0.45, gain: 0.1 })
    this.tone({ type: 'sawtooth', freq: 186, freqEnd: 124, dur: 0.45, gain: 0.08 })
  }

  notify() {
    this.tone({ type: 'sine', freq: 880, dur: 0.12, gain: 0.07 })
    this.tone({ type: 'sine', freq: 1320, dur: 0.18, gain: 0.06, delay: 0.1 })
  }

  // ── Loops ──────────────────────────────────────────────────────────────────

  startLoop(name: LoopName, volume = 1) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const existing = this.loops.get(name)
    if (existing) {
      existing.gain.gain.setTargetAtTime(volume * this.loopBase(name), ctx.currentTime, 0.3)
      return
    }
    const out = ctx.createGain()
    out.gain.value = 0
    out.gain.setTargetAtTime(volume * this.loopBase(name), ctx.currentTime, 0.4)
    out.connect(this.master)
    const stops: (() => void)[] = []

    const noiseSrc = (filter: BiquadFilterType, freq: number, q = 0.7) => {
      const src = ctx.createBufferSource()
      src.buffer = this.noiseBuffer(ctx)
      src.loop = true
      const f = ctx.createBiquadFilter()
      f.type = filter
      f.frequency.value = freq
      f.Q.value = q
      src.connect(f).connect(out)
      src.start()
      stops.push(() => src.stop())
      return f
    }

    if (name === 'hum') {
      // Warehouse/factory room tone: low mains hum + air handling
      const osc = ctx.createOscillator()
      osc.frequency.value = 50
      const g = ctx.createGain()
      g.gain.value = 0.35
      osc.connect(g).connect(out)
      osc.start()
      stops.push(() => osc.stop())
      noiseSrc('lowpass', 380)
    } else if (name === 'alarm') {
      // Temporal-3 style evacuation tone (two-tone sweep)
      const osc = ctx.createOscillator()
      osc.type = 'square'
      const lfo = ctx.createOscillator()
      lfo.type = 'square'
      lfo.frequency.value = 1.6
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 180
      osc.frequency.value = 820
      lfo.connect(lfoGain).connect(osc.frequency)
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 2200
      osc.connect(f).connect(out)
      osc.start()
      lfo.start()
      stops.push(() => osc.stop(), () => lfo.stop())
    } else if (name === 'fire') {
      // Roar + crackle
      noiseSrc('lowpass', 420)
      const crackle = noiseSrc('bandpass', 2600, 3)
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 7
      const lg = ctx.createGain()
      lg.gain.value = 900
      lfo.connect(lg).connect(crackle.frequency)
      lfo.start()
      stops.push(() => lfo.stop())
    } else if (name === 'wind') {
      const f = noiseSrc('bandpass', 500, 0.6)
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.15
      const lg = ctx.createGain()
      lg.gain.value = 260
      lfo.connect(lg).connect(f.frequency)
      lfo.start()
      stops.push(() => lfo.stop())
    } else if (name === 'engine') {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 46
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 260
      osc.connect(f).connect(out)
      osc.start()
      stops.push(() => osc.stop())
    }

    this.loops.set(name, { gain: out, stop: () => stops.forEach((s) => { try { s() } catch {} }) })
  }

  setLoopVolume(name: LoopName, volume: number) {
    const loop = this.loops.get(name)
    if (loop && this.ctx) loop.gain.gain.setTargetAtTime(volume * this.loopBase(name), this.ctx.currentTime, 0.15)
  }

  stopLoop(name: LoopName) {
    const loop = this.loops.get(name)
    if (!loop || !this.ctx) return
    loop.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2)
    const stop = loop.stop
    this.loops.delete(name)
    setTimeout(stop, 900)
  }

  stopAllLoops() {
    for (const name of [...this.loops.keys()]) this.stopLoop(name)
  }

  private loopBase(name: LoopName) {
    switch (name) {
      case 'hum': return 0.05
      case 'alarm': return 0.035
      case 'fire': return 0.16
      case 'wind': return 0.12
      case 'engine': return 0.06
    }
  }

  dispose() {
    for (const loop of this.loops.values()) loop.stop()
    this.loops.clear()
    this.ctx?.close().catch(() => {})
    this.ctx = null
    this.master = null
  }
}
