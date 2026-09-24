/**
 * PowerNap Web Audio Engine
 * 昼寝・覚醒のためのWeb Audio APIベースの音響合成エンジン
 */

class PowerNapAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.mode = 'speaker'; // 'speaker' | 'earphone'
    this.isPlaying = false;
    this.currentPhase = null; // 'rest' | 'awake' | 'alarm'
    this.awakeLfo = null;
    this.awakeGain = null;
    this.awakeOsc1 = null;
    this.awakeOsc2 = null;
    this.alarmInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
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

  startRestSound(mode = 'speaker') {
    this.init();
    this.stop();

    this.mode = mode;
    this.isPlaying = true;
    this.currentPhase = 'rest';

    const now = this.ctx.currentTime;
    
    // マスターゲイン（非常に静かで微小な音量 0.02 = 2% に設定）
    const targetMasterGain = mode === 'speaker' ? 0.02 : 0.04;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(targetMasterGain, now + 2);
    this.masterGain.connect(this.ctx.destination);

    if (mode === 'speaker') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);

      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(4, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.1, now);

      const carrierGain = this.ctx.createGain();
      carrierGain.gain.setValueAtTime(0.15, now);

      lfo.connect(lfoGain);
      lfoGain.connect(carrierGain.gain);

      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(264, now);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.03, now);

      osc.connect(carrierGain);
      subOsc.connect(subGain);

      carrierGain.connect(this.masterGain);
      subGain.connect(this.masterGain);

      osc.start(now);
      lfo.start(now);
      subOsc.start(now);

      this.activeNodes.push(osc, lfo, lfoGain, carrierGain, subOsc, subGain);

    } else {
      const oscLeft = this.ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, now);

      const pannerLeft = this.createPanner(-1.0);
      const gainLeft = this.ctx.createGain();
      gainLeft.gain.setValueAtTime(0.2, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(this.masterGain);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(204, now);

      const pannerRight = this.createPanner(1.0);
      const gainRight = this.ctx.createGain();
      gainRight.gain.setValueAtTime(0.2, now);

      oscRight.connect(gainRight);
      gainRight.connect(pannerRight);
      pannerRight.connect(this.masterGain);

      oscLeft.start(now);
      oscRight.start(now);

      this.activeNodes.push(oscLeft, pannerLeft, gainLeft, oscRight, pannerRight, gainRight);
    }
  }

  fadeRestSound(durationSeconds = 15) {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const initialGain = this.mode === 'speaker' ? 0.02 : 0.04;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || initialGain, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSeconds);
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
      gain.gain.exponentialRampToValueAtTime(0.8, now + idx * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 2.6);
    });
  }

  playAwakeningSinglePulse() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(1.0, now + idx * 0.08 + 0.03); // フル音量 1.0 (100%)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);

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

    this.playAwakeningSinglePulse();
    this.alarmInterval = setInterval(() => {
      if (this.isPlaying && this.currentPhase === 'alarm') {
        this.playAwakeningSinglePulse();
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
    // 覚醒中の音量を 0.03 (3%) スタートに大幅ダウン（優しくマイルドな音量）
    this.masterGain.gain.setValueAtTime(0.01, now);
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
      lfoGain.gain.setValueAtTime(0.06, now);

      const pulseGain = this.ctx.createGain();
      pulseGain.gain.setValueAtTime(0.08, now);
      this.awakeGain = pulseGain;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

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
      gainLeft.gain.setValueAtTime(0.06, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(this.masterGain);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, now);
      this.awakeOsc2 = oscRight;

      const pannerRight = this.createPanner(1.0);
      const gainRight = this.ctx.createGain();
      gainRight.gain.setValueAtTime(0.06, now);

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

    // 音量を 0.03 (3%) から 0.15 (15%) へ緩やかに調整
    const targetVolume = 0.01 + clampedProgress * 0.04;
    this.masterGain.gain.setValueAtTime(targetVolume, now);

    if (this.mode === 'speaker' && this.awakeLfo && this.awakeOsc1) {
      const pulseFreq = 40 + clampedProgress * 5;
      const baseFreq = 432 + clampedProgress * 20;
      this.awakeLfo.frequency.setValueAtTime(pulseFreq, now);
      this.awakeOsc1.frequency.setValueAtTime(baseFreq, now);
    } 
    else if (this.mode === 'earphone' && this.awakeOsc1 && this.awakeOsc2) {
      const leftFreq = 200 + clampedProgress * 20;
      const rightFreq = 240 + clampedProgress * 20;
      this.awakeOsc1.frequency.setValueAtTime(leftFreq, now);
      this.awakeOsc2.frequency.setValueAtTime(rightFreq, now);
    }
  }
}

// シングルトンインスタンスをグローバル提供
window.powerNapAudio = new PowerNapAudioEngine();
