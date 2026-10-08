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
    this.preloadAudio();
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
    this.stopHtml5Fallback();
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
    
    // マスターゲイン（iPhone・モバイル環境でしっかりと聴こえる快適音量: スピーカー 0.25 / イヤホン 0.30）
    const targetMasterGain = mode === 'speaker' ? 0.25 : 0.30;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(targetMasterGain, now);
    this.masterGain.connect(this.ctx.destination);

    // iOS Safari マナーモード貫通用 HTML5 メディアオーディオ再生
    this.playHtml5Fallback(mode, this.lfoSpeed);

    if (mode === 'speaker') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);

      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(this.lfoSpeed, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.2, now);

      const carrierGain = this.ctx.createGain();
      carrierGain.gain.setValueAtTime(0.5, now);

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
      gainLeft.gain.setValueAtTime(0.5, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(this.masterGain);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(204, now);

      const pannerRight = this.createPanner(1.0);
      const gainRight = this.ctx.createGain();
      gainRight.gain.setValueAtTime(0.5, now);

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
      const initialGain = this.mode === 'speaker' ? 0.25 : 0.30;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || initialGain, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSeconds);
    }
    if (this.html5Audio) {
      try {
        const startVol = this.html5Audio.volume;
        const stepVol = startVol / (durationSeconds * 10);
        const interval = setInterval(() => {
          if (this.html5Audio && this.html5Audio.volume > stepVol) {
            this.html5Audio.volume = Math.max(0, this.html5Audio.volume - stepVol);
          } else {
            clearInterval(interval);
            this.stopHtml5Fallback();
          }
        }, 100);
      } catch (e) {}
    }
  }

  createAudioWavBlob(mode = 'speaker', lfoSpeed = 0.25, durationSec = 10) {
    try {
      const sampleRate = 22050;
      const numSamples = sampleRate * durationSec;
      const isStereo = mode === 'earphone';
      const numChannels = isStereo ? 2 : 1;
      const bytesPerSample = 2;
      const blockAlign = numChannels * bytesPerSample;
      const dataSize = numSamples * blockAlign;

      const buffer = new Uint8Array(44 + dataSize);
      const view = new DataView(buffer.buffer);

      const writeStr = (off, s) => {
        for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
      };

      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, 16, true);
      writeStr(36, 'data');
      view.setUint32(40, dataSize, true);

      let offset = 44;
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        if (!isStereo) {
          const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * lfoSpeed * t);
          const s528 = Math.sin(2 * Math.PI * 528 * t) * (0.35 + 0.35 * lfo);
          const s264 = Math.sin(2 * Math.PI * 264 * t) * 0.1;
          const val = Math.max(-1, Math.min(1, s528 + s264));
          const sampleInt = Math.floor(val < 0 ? val * 32768 : val * 32767);
          view.setInt16(offset, sampleInt, true);
          offset += 2;
        } else {
          const sL = Math.sin(2 * Math.PI * 200 * t) * 0.45;
          const sR = Math.sin(2 * Math.PI * 204 * t) * 0.45;
          const valL = Math.max(-1, Math.min(1, sL));
          const valR = Math.max(-1, Math.min(1, sR));
          const sampleIntL = Math.floor(valL < 0 ? valL * 32768 : valL * 32767);
          const sampleIntR = Math.floor(valR < 0 ? valR * 32768 : valR * 32767);
          view.setInt16(offset, sampleIntL, true);
          view.setInt16(offset + 2, sampleIntR, true);
          offset += 4;
        }
      }
      return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    } catch (e) {
      return null;
    }
  }

  preloadAudio() {
    if (!this.speakerAudio) {
      try {
        const url = this.createAudioWavBlob('speaker', 0.25, 3);
        if (url) {
          const a = new Audio(url);
          a.loop = true;
          a.volume = 0.8;
          a.setAttribute('playsinline', 'true');
          a.setAttribute('webkit-playsinline', 'true');
          this.speakerAudio = a;
        }
      } catch (e) {}
    }
    if (!this.earphoneAudio) {
      try {
        const url = this.createAudioWavBlob('earphone', 0.25, 3);
        if (url) {
          const a = new Audio(url);
          a.loop = true;
          a.volume = 0.8;
          a.setAttribute('playsinline', 'true');
          a.setAttribute('webkit-playsinline', 'true');
          this.earphoneAudio = a;
        }
      } catch (e) {}
    }
  }

  unlockiOSAudio() {
    this.init();
    this.preloadAudio();
    if (this.speakerAudio) {
      this.speakerAudio.play().then(() => {
        if (!this.isPlaying) this.speakerAudio.pause();
      }).catch(() => {});
    }
    if (this.earphoneAudio) {
      this.earphoneAudio.play().then(() => {
        if (!this.isPlaying) this.earphoneAudio.pause();
      }).catch(() => {});
    }
  }

  playHtml5Fallback(mode, lfoSpeed) {
    this.stopHtml5Fallback();
    this.preloadAudio();
    const targetAudio = mode === 'speaker' ? this.speakerAudio : this.earphoneAudio;
    if (targetAudio) {
      this.html5Audio = targetAudio;
      try {
        this.html5Audio.volume = mode === 'speaker' ? 0.75 : 0.85;
        this.html5Audio.currentTime = 0;
        this.html5Audio.play().catch(() => {});
      } catch (e) {}
    }
  }

  stopHtml5Fallback() {
    if (this.speakerAudio) {
      try { this.speakerAudio.pause(); } catch (e) {}
    }
    if (this.earphoneAudio) {
      try { this.earphoneAudio.pause(); } catch (e) {}
    }
    this.html5Audio = null;
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
      gain.gain.linearRampToValueAtTime(0.8, now + idx * 0.15 + 0.05);
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
    
    // イヤホンモード時: 1回目 0.35, 2回目 0.65, 3回目以降 1.0 (耳に優しいフェードイン)
    // スピーカーモード時: 常に 1.0 (現状維持・完全変更なし)
    const targetPeak = this.mode === 'earphone'
      ? Math.min(1.0, 0.35 + alarmIndex * 0.30)
      : 1.0;

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

    // 1回目鳴動
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
