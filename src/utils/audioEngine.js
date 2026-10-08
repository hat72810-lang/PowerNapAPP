/**
 * React / ES Module PowerNap Audio Engine
 */
export class PowerNapAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.mode = 'speaker';
    this.isPlaying = false;
    this.currentPhase = null;
    this.awakeLfo = null;
    this.awakeGain = null;
    this.awakeOsc1 = null;
    this.awakeOsc2 = null;
    this.alarmInterval = null;
    this.html5Audio = null;
    this.speakerAudio = null;
    this.earphoneAudio = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
    }
    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      this.ctx.resume();
    }
    // HTML5 Silent Element Unlock for iOS Safari
    try {
      if (!this.unlockElement) {
        const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        audio.setAttribute("playsinline", "true");
        audio.setAttribute("webkit-playsinline", "true");
        this.unlockElement = audio;
      }
      this.unlockElement.play().catch(() => {});
    } catch (e) {}

    // iOS Safari Hardware Unlock Buffer
    try {
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);
    } catch (e) {}
  }

  stop() {
    this.stopAlarmLoop();
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.awakeLfo = null;
    this.awakeGain = null;
    this.awakeOsc1 = null;
    this.awakeOsc2 = null;
    this.isPlaying = false;
    this.currentPhase = null;
  }

  createPanner(panValue) {
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = panValue;
      return panner;
    } else {
      const panner = this.ctx.createPanner();
      panner.panningModel = 'equalpower';
      panner.setPosition(panValue, 0, 1 - Math.abs(panValue));
      return panner;
    }
  }

  startRestSound(mode = 'speaker', lfoSpeed = 0.25) {
    this.init();
    this.stop();

    this.mode = mode;
    this.lfoSpeed = parseFloat(lfoSpeed) || 0.25;
    this.isPlaying = true;
    this.currentPhase = 'rest';

    const now = this.ctx.currentTime;
    // マスターゲイン（仮眠中は静かで心安らぐ音量: スピーカー 0.08 / イヤホン 0.10）
    const targetMasterGain = mode === 'speaker' ? 0.08 : 0.10;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(targetMasterGain, now);
    this.masterGain.connect(this.ctx.destination);

    if (mode === 'speaker') {
      // メイン音響: 528Hz（ソルフェジオ）を柔らかく
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);

      // 主音のゲイン（音量を優しくマイルドに 0.25）
      const carrierGain = this.ctx.createGain();
      carrierGain.gain.setValueAtTime(0.25, now);

      // LFO 揺らぎ: 鐘のような不快な音量変化にならないよう超微弱（0.03）な空気感のみに調整
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(this.lfoSpeed, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.03, now);

      lfo.connect(lfoGain);
      lfoGain.connect(carrierGain.gain);

      // サブ音響: 264Hz（1オクターブ下の暖かく安定した低音）
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(264, now);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.12, now);

      // 高音の硬さをカットするローパスフィルター
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);

      osc.connect(carrierGain);
      subOsc.connect(subGain);

      carrierGain.connect(filter);
      subGain.connect(filter);
      filter.connect(this.masterGain);

      osc.start(now);
      lfo.start(now);
      subOsc.start(now);

      this.activeNodes.push(osc, lfo, lfoGain, carrierGain, subOsc, subGain, filter);
    } else {
      const oscLeft = this.ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, now);

      const pannerLeft = this.createPanner(-1.0);
      const gainLeft = this.ctx.createGain();
      gainLeft.gain.setValueAtTime(0.35, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(this.masterGain);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(204, now);

      const pannerRight = this.createPanner(1.0);
      const gainRight = this.ctx.createGain();
      gainRight.gain.setValueAtTime(0.35, now);

      oscRight.connect(gainRight);
      gainRight.connect(pannerRight);
      pannerRight.connect(this.masterGain);

      oscLeft.start(now);
      oscRight.start(now);

      this.activeNodes.push(oscLeft, pannerLeft, gainLeft, oscRight, pannerRight, gainRight);
    }
  }

  fadeRestSound(durationSeconds = 15) {
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const initialGain = this.mode === 'speaker' ? 0.08 : 0.10;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || initialGain, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSeconds);
    }
  }

  unlockiOSAudio() {
    this.init();
  }

  playTransitionChime() {
    this.init();
    const now = this.ctx.currentTime;
    const freqs = [528, 660, 792, 1056];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.001, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.5, now + idx * 0.15 + 0.05);
      gain.gain.linearRampToValueAtTime(0.0001, now + idx * 0.15 + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 2.6);
    });
  }

  playAwakeningSinglePulse(alarmIndex = 0) {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    
    const targetPeak = this.mode === 'earphone'
      ? Math.min(0.8, 0.25 + alarmIndex * 0.25)
      : 0.6;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(targetPeak, now + idx * 0.08 + 0.03);
      gain.gain.linearRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  startAlarmLoop() {
    this.stop();
    this.init();
    this.isPlaying = true;
    this.currentPhase = 'alarm';

    let alarmCount = 0;
    this.playAwakeningSinglePulse(alarmCount);

    this.alarmInterval = setInterval(() => {
      if (this.isPlaying && this.currentPhase === 'alarm') {
        alarmCount++;
        this.playAwakeningSinglePulse(alarmCount);
      } else {
        this.stopAlarmLoop();
      }
    }, 1200);
  }

  startAlarmLimited(times = 3, onComplete) {
    this.stop();
    this.init();
    this.isPlaying = true;
    this.currentPhase = 'alarm';

    let count = 0;

    this.playAwakeningSinglePulse(count);
    count++;

    if (count >= times) {
      if (onComplete) setTimeout(() => { if (this.currentPhase === 'alarm') { this.stop(); onComplete(); } }, 1200);
      return;
    }

    this.alarmInterval = setInterval(() => {
      if (this.isPlaying && this.currentPhase === 'alarm') {
        this.playAwakeningSinglePulse(count);
        count++;

        if (count >= times) {
          this.stopAlarmLoop();
          if (onComplete) {
            setTimeout(() => {
              if (this.currentPhase === 'alarm') {
                this.stop();
                onComplete();
              }
            }, 1200);
          }
        }
      } else {
        this.stopAlarmLoop();
      }
    }, 1200);
  }

  stopAlarmLoop() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  startAwakeSound(mode = 'speaker') {
    this.init();
    this.stop();

    this.mode = mode;
    this.isPlaying = true;
    this.currentPhase = 'awake';

    const now = this.ctx.currentTime;

    this.masterGain = this.ctx.createGain();
    // 覚醒中の音量を 0.06 (6%) スタートでハッキリと（徐々に 0.22 へビルドアップ）
    this.masterGain.gain.setValueAtTime(0.06, now);
    this.masterGain.connect(this.ctx.destination);

    if (mode === 'speaker') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);
      this.awakeOsc1 = osc;

      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(40, now);
      this.awakeLfo = lfo;

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.2, now);

      const pulseGain = this.ctx.createGain();
      pulseGain.gain.setValueAtTime(0.4, now);
      this.awakeGain = pulseGain;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);

      lfo.connect(lfoGain);
      lfoGain.connect(pulseGain.gain);

      osc.connect(pulseGain);
      pulseGain.connect(filter);
      filter.connect(this.masterGain);

      osc.start(now);
      lfo.start(now);

      this.activeNodes.push(osc, lfo, lfoGain, pulseGain, filter);
    } else {
      const oscLeft = this.ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, now);
      this.awakeOsc1 = oscLeft;

      const pannerLeft = this.createPanner(-1.0);
      const gainLeft = this.ctx.createGain();
      gainLeft.gain.setValueAtTime(0.4, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(this.masterGain);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, now);
      this.awakeOsc2 = oscRight;

      const pannerRight = this.createPanner(1.0);
      const gainRight = this.ctx.createGain();
      gainRight.gain.setValueAtTime(0.4, now);

      oscRight.connect(gainRight);
      gainRight.connect(pannerRight);
      pannerRight.connect(this.masterGain);

      oscLeft.start(now);
      oscRight.start(now);

      this.activeNodes.push(oscLeft, pannerLeft, gainLeft, oscRight, pannerRight, gainRight);
    }
  }

  updateAwakeIntensity(progress) {
    if (!this.isPlaying || this.currentPhase !== 'awake' || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // 音量を 0.06 (6%) から 0.22 (22%) へ徐々にビルドアップ
    const targetVolume = 0.06 + clampedProgress * 0.16;
    this.masterGain.gain.setValueAtTime(targetVolume, now);

    if (this.mode === 'speaker' && this.awakeLfo && this.awakeOsc1) {
      const pulseFreq = 40 + clampedProgress * 5;
      const baseFreq = 432 + clampedProgress * 20;
      this.awakeLfo.frequency.setValueAtTime(pulseFreq, now);
      this.awakeOsc1.frequency.setValueAtTime(baseFreq, now);
    } else if (this.mode === 'earphone' && this.awakeOsc1 && this.awakeOsc2) {
      const leftFreq = 200 + clampedProgress * 20;
      const rightFreq = 240 + clampedProgress * 20;
      this.awakeOsc1.frequency.setValueAtTime(leftFreq, now);
      this.awakeOsc2.frequency.setValueAtTime(rightFreq, now);
    }
  }
}

export const audioEngine = new PowerNapAudioEngine();

