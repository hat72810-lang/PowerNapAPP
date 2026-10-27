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
    this.breathInterval = null;
    this.breathGain = null;
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
    if (this.breathInterval) {
      clearInterval(this.breathInterval);
      this.breathInterval = null;
    }
    this.breathGain = null;
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

  createPinkNoiseBuffer(durationSeconds = 6) {
    const sampleRate = this.ctx.sampleRate || 44100;
    const frameCount = Math.floor(sampleRate * durationSeconds);
    const buffer = this.ctx.createBuffer(2, frameCount, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < frameCount; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.07;
      }
      // ループの継ぎ目でプチ音が出ないよう両端（150ms）をスムーズにクロスフェード
      const fadeSamples = Math.floor(sampleRate * 0.15);
      for (let i = 0; i < fadeSamples; i++) {
        const ratio = i / fadeSamples;
        const blended = data[i] * ratio + data[frameCount - 1 - (fadeSamples - 1 - i)] * (1 - ratio);
        data[i] = blended;
        data[frameCount - 1 - (fadeSamples - 1 - i)] = blended;
      }
    }
    return buffer;
  }

  generateBreathCurves(samples = 128) {
    const toneGainCurve = new Float32Array(samples);
    const toneFilterCurve = new Float32Array(samples);
    const noiseGainCurve = new Float32Array(samples);
    const noiseFilterCurve = new Float32Array(samples);

    const inhaleDuration = 2.5;
    const exhaleDuration = 6.0;
    const totalDuration = inhaleDuration + exhaleDuration; // 8.5秒

    for (let i = 0; i < samples; i++) {
      const t = (i / (samples - 1)) * totalDuration;
      let sCurve;
      if (t <= inhaleDuration) {
        // 吸うフェーズ（2.5秒）: S字カーブで 0 -> 1 へ滑らかに立ち上がり
        const p = t / inhaleDuration;
        sCurve = 0.5 * (1 - Math.cos(Math.PI * p));
      } else {
        // 吐くフェーズ（6.0秒）: S字カーブで 1 -> 0 へ6秒かけてじっくりフェードダウン
        const p = (t - inhaleDuration) / exhaleDuration;
        sCurve = 0.5 * (1 + Math.cos(Math.PI * p));
      }

      // 528Hz 音量: 吐き切ったとき 0.236 〜 吸い切ったとき 0.520（5%増量）
      toneGainCurve[i] = 0.236 + (0.520 - 0.236) * sCurve;
      // 528Hz フィルター: 500Hz 〜 720Hz
      toneFilterCurve[i] = 500 + (720 - 500) * sCurve;

      // 潮騒自然音 音量: 引いたとき 0.036 〜 寄せたとき 0.182（10%増量）
      noiseGainCurve[i] = 0.036 + (0.182 - 0.036) * sCurve;
      // 潮騒フィルター: 引いたとき 260Hz（静かな余韻） 〜 寄せたとき 620Hz（柔らかく温かい低波音）
      noiseFilterCurve[i] = 260 + (620 - 260) * sCurve;
    }
    return { toneGainCurve, toneFilterCurve, noiseGainCurve, noiseFilterCurve };
  }

  startBreathScheduler(toneGainNode, toneFilterNode, noiseGainNode, noiseFilterNode, startTime) {
    if (this.breathInterval) {
      clearInterval(this.breathInterval);
      this.breathInterval = null;
    }

    const cycleDuration = 8.5;
    const { toneGainCurve, toneFilterCurve, noiseGainCurve, noiseFilterCurve } = this.generateBreathCurves(128);
    let scheduledUntil = startTime;

    const scheduleAhead = () => {
      if (!this.isPlaying || (this.currentPhase !== 'rest' && this.currentPhase !== 'preview_rest') || !this.ctx || !toneGainNode) return;
      const currentTime = this.ctx.currentTime;
      // 常に最低30秒先（約4周期分）まで先回りスケジュールを維持
      while (scheduledUntil < currentTime + 30) {
        try {
          toneGainNode.gain.setValueCurveAtTime(toneGainCurve, scheduledUntil, cycleDuration);
          if (toneFilterNode) {
            toneFilterNode.frequency.setValueCurveAtTime(toneFilterCurve, scheduledUntil, cycleDuration);
          }
          if (noiseGainNode) {
            noiseGainNode.gain.setValueCurveAtTime(noiseGainCurve, scheduledUntil, cycleDuration);
          }
          if (noiseFilterNode) {
            noiseFilterNode.frequency.setValueCurveAtTime(noiseFilterCurve, scheduledUntil, cycleDuration);
          }
        } catch (e) {
          break;
        }
        scheduledUntil += cycleDuration;
      }
    };

    // 初回：起動直後に最初の約34秒（4周期）を即座にキューイング
    scheduleAhead();

    // 2秒ごとに先回りチェックして切れ目なく補充
    this.breathInterval = setInterval(scheduleAhead, 2000);
  }

  startRestSound(mode = 'speaker', lfoSpeed = 0.25) {
    this.init();
    this.stop();

    this.mode = mode;
    this.lfoSpeed = parseFloat(lfoSpeed) || 0.25;
    this.isPlaying = true;
    this.currentPhase = 'rest';

    const now = this.ctx.currentTime;
    
    // マスターゲイン（スピーカー 0.055 / イヤホン 0.066: 10%音量アップ）
    const targetMasterGain = mode === 'speaker' ? 0.055 : 0.066;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(targetMasterGain, now);
    this.masterGain.connect(this.ctx.destination);

    if (mode === 'speaker') {
      // 1. 潮騒の自然環境音（穏やかで心地よいさざ波音）
      const noiseBuffer = this.createPinkNoiseBuffer(6);
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // 潮騒用ダイナミックローパスフィルター（260Hz〜620Hzで耳に優しく開閉）
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(260, now);
      noiseFilter.Q.setValueAtTime(0.5, now);

      // 潮騒用ダイナミックゲイン（10%増量）
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.036, now);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      // 2. 528Hz ソルフェジオ（自然に調和する安らぎのトーン）
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);

      // サブ音響: 264Hz（1オクターブ下の暖かく安定した低音）
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(264, now);

      // トーン基礎ゲイン（5%増量）
      const toneGain = this.ctx.createGain();
      toneGain.gain.setValueAtTime(0.042, now);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.017, now);

      // トーン用ダイナミックローパスフィルター（呼吸に合わせて開閉）
      const toneFilter = this.ctx.createBiquadFilter();
      toneFilter.type = 'lowpass';
      toneFilter.frequency.setValueAtTime(500, now);

      // 呼吸リズム専用のGainNode（8.5秒周期: 吸う2.5秒 / 吐く6.0秒）
      const breathGain = this.ctx.createGain();
      breathGain.gain.setValueAtTime(0.236, now);
      this.breathGain = breathGain;

      osc.connect(toneGain);
      subOsc.connect(subGain);

      toneGain.connect(toneFilter);
      subGain.connect(toneFilter);
      toneFilter.connect(breathGain);
      breathGain.connect(this.masterGain);

      // 再生開始
      noiseSource.start(now);
      osc.start(now);
      subOsc.start(now);

      this.activeNodes.push(
        noiseSource, noiseFilter, noiseGain,
        osc, subOsc, toneGain, subGain, toneFilter, breathGain
      );

      // 潮騒（波の音）と528Hzのうねりを完全同期させた呼吸スケジューラー開始
      this.startBreathScheduler(breathGain, toneFilter, noiseGain, noiseFilter, now);

    } else {
      const oscLeft = this.ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, now);

      const pannerLeft = this.createPanner(-1.0);
      const gainLeft = this.ctx.createGain();
      gainLeft.gain.setValueAtTime(0.30, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(this.masterGain);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(204, now);

      const pannerRight = this.createPanner(1.0);
      const gainRight = this.ctx.createGain();
      gainRight.gain.setValueAtTime(0.30, now);

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
      const initialGain = this.mode === 'speaker' ? 0.055 : 0.066;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || initialGain, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSeconds);
    }
  }

  togglePreviewRestSound() {
    if (this.isPlaying && this.currentPhase === 'preview_rest') {
      this.stop();
      return false;
    } else {
      this.startRestSound('speaker', 0.25);
      this.currentPhase = 'preview_rest';
      return true;
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
      gain.gain.linearRampToValueAtTime(0.6, now + idx * 0.15 + 0.05);
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
    
    // アラーム音量をハッキリと目立たせる（イヤホン: 0.40->0.90、スピーカー: 0.85）
    const targetPeak = this.mode === 'earphone'
      ? Math.min(0.9, 0.40 + alarmIndex * 0.25)
      : 0.85;

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
    // 覚醒中の音量を 0.03 (3%) スタートに少し下げて耳に優しく（徐々に 0.14 へ）
    this.masterGain.gain.setValueAtTime(0.03, now);
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
      lfoGain.gain.setValueAtTime(0.15, now);

      const pulseGain = this.ctx.createGain();
      pulseGain.gain.setValueAtTime(0.3, now);
      this.awakeGain = pulseGain;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

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
      gainLeft.gain.setValueAtTime(0.3, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(pannerLeft);
      pannerLeft.connect(this.masterGain);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, now);
      this.awakeOsc2 = oscRight;

      const pannerRight = this.createPanner(1.0);
      const gainRight = this.ctx.createGain();
      gainRight.gain.setValueAtTime(0.3, now);

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

    // 音量を 0.03 (3%) から 0.14 (14%) へ優しくビルドアップ
    const targetVolume = 0.03 + clampedProgress * 0.11;
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
