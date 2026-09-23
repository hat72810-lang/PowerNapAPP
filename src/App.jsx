import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from './utils/audioEngine';
import { RestMudraSVG, AwakeMudraSVG } from './components/Mudras';
import { Volume2, Headphones, Play, RefreshCw, CheckCircle, Coffee, Zap, ArrowRight } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(1);
  const [audioMode, setAudioMode] = useState('speaker'); // 'speaker' | 'earphone'
  const [durationSeconds, setDurationSeconds] = useState(15 * 60);

  // Timer States
  const [remainingRest, setRemainingRest] = useState(15 * 60);
  const [remainingAwake, setRemainingAwake] = useState(3 * 60);
  const [isRestFinished, setIsRestFinished] = useState(false);

  const wakeLockRef = useRef(null);
  const timerRef = useRef(null);
  const awakeTimerRef = useRef(null);

  // Screen Wake Lock
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    if (step === 4 || step === 5) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [step]);

  // Format Helper (MM:SS)
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Power Nap (Step 3 -> 4)
  const handleStartNap = () => {
    setRemainingRest(durationSeconds);
    setIsRestFinished(false);
    audioEngine.startRestSound(audioMode);
    setStep(4);
  };

  // Rest Timer Effect
  useEffect(() => {
    if (step === 4 && !isRestFinished) {
      timerRef.current = setInterval(() => {
        setRemainingRest((prev) => {
          const fadeThreshold = Math.min(15, Math.floor(durationSeconds / 2));
          if (prev === fadeThreshold) {
            audioEngine.fadeRestSound(fadeThreshold);
          }

          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRestFinished(true);
            audioEngine.startAlarmLoop(); // ボタンを押すまで繰り返し目覚まし音
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, durationSeconds, isRestFinished]);

  // Stop Rest Alarm & Move to Awake (Step 4 -> 5)
  const handleConfirmRestFinished = () => {
    audioEngine.stop();
    setIsRestFinished(false);
    handleStartAwake();
  };

  // Start Awakening Phase (Step 5 -> 6)
  const handleStartAwake = () => {
    const totalAwakeSecs = 3 * 60;
    setRemainingAwake(totalAwakeSecs);
    audioEngine.startAwakeSound(audioMode);
    setStep(6);
  };

  // Awake Timer Effect
  useEffect(() => {
    if (step === 6) {
      const totalAwakeSecs = 3 * 60;
      awakeTimerRef.current = setInterval(() => {
        setRemainingAwake((prev) => {
          const next = prev - 1;
          const progress = (totalAwakeSecs - next) / totalAwakeSecs;
          audioEngine.updateAwakeIntensity(progress);

          if (next <= 0) {
            clearInterval(awakeTimerRef.current);
            handleFinish();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (awakeTimerRef.current) clearInterval(awakeTimerRef.current);
    }
    return () => {
      if (awakeTimerRef.current) clearInterval(awakeTimerRef.current);
    };
  }, [step]);

  // Finish Nap and Start Continuous Alarm Loop (Step 6 -> 7)
  const handleFinish = () => {
    audioEngine.stop();
    audioEngine.startAlarmLoop();
    setStep(7);
  };

  // Reset App and Stop Alarm
  const handleReset = () => {
    audioEngine.stop();
    setStep(1);
  };

  const circumference = 565.48;
  const progressOffset = circumference * (1 - remainingRest / durationSeconds);

  return (
    <div id="app-container" style={{ position: 'relative', width: '100%', maxWidth: '480px', height: '100dvh', display: 'flex', flexDirection: 'column', padding: '24px 20px' }}>
      
      {/* App Header */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
          <Zap style={{ color: '#00e5ff' }} />
          <span>POWER NAP</span>
        </div>
        <div className="step-indicator">STEP {step} / 7</div>
      </header>

      {/* Main Container */}
      <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* STEP 1: Coffee Prep */}
        {step === 1 && (
          <div className="step-view active">
            <div className="glass-card">
              <h2 className="step-title">コーヒータイム</h2>
              <p className="step-subtitle">仮眠直前のカフェイン摂取で、目覚めが驚くほどスッキリします。</p>

              <div className="hero-graphic-box">
                <div className="coffee-illustration">
                  <div className="coffee-glow"></div>
                  <Coffee className="coffee-icon-svg" style={{ color: '#ffa726', width: '80px', height: '80px' }} />
                </div>
              </div>

              <div className="info-badge-list">
                <div className="info-item">
                  <div className="info-icon-dot">1</div>
                  <div className="info-text-group">
                    <h4>15〜20分のタイムラグ効果</h4>
                    <p>カフェインが脳に到達して覚醒作用を発揮するまで約15〜20分かかります。</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon-dot">2</div>
                  <div className="info-text-group">
                    <h4>アデノシンのブロック</h4>
                    <p>仮眠中に蓄積疲労物質（アデノシン）が分解され、目覚めた瞬間にカフェインが効果的に働きます。</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="btn-primary" style={{ marginTop: '20px' }}>
              <span>コーヒーを飲んだので次へ</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Duration & Mode Select */}
        {step === 2 && (
          <div className="step-view active">
            <div className="glass-card">
              <h2 className="step-title">時間と再生モードの選択</h2>
              <p className="step-subtitle">パワーナップの時間と再生スタイルを選択してください。</p>

              <div style={{ marginTop: '10px' }}>
                <div className="section-label">再生モードの選択（必須）</div>
                <div className="mode-toggle-group">
                  <button
                    className={`mode-btn ${audioMode === 'speaker' ? 'active' : ''}`}
                    onClick={() => setAudioMode('speaker')}
                  >
                    <Volume2 />
                    <span>スピーカー</span>
                  </button>
                  <button
                    className={`mode-btn ${audioMode === 'earphone' ? 'active' : ''}`}
                    onClick={() => setAudioMode('earphone')}
                  >
                    <Headphones />
                    <span>イヤホン</span>
                  </button>
                </div>

                <div className="section-label" style={{ marginTop: '20px' }}>パワーナップ時間の選択</div>
                <div className="duration-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <button
                    className={`duration-btn ${durationSeconds === 15 * 60 ? 'active' : ''}`}
                    onClick={() => setDurationSeconds(15 * 60)}
                  >
                    <span className="duration-val">15</span>
                    <span className="duration-unit">MIN</span>
                  </button>
                  <button
                    className={`duration-btn ${durationSeconds === 20 * 60 ? 'active' : ''}`}
                    onClick={() => setDurationSeconds(20 * 60)}
                  >
                    <span className="duration-val">20</span>
                    <span className="duration-unit">MIN</span>
                  </button>
                  <button
                    className={`duration-btn ${durationSeconds === 10 ? 'active' : ''}`}
                    onClick={() => setDurationSeconds(10)}
                    style={{ borderColor: 'rgba(255, 234, 0, 0.4)' }}
                  >
                    <span className="duration-val" style={{ color: '#ffea00' }}>10s</span>
                    <span className="duration-unit" style={{ color: '#ffea00' }}>DEMO</span>
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(3)} className="btn-primary" style={{ marginTop: '20px' }}>
              <span>瞑想とリラックスへ進む</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 3: Meditation & Mudra (チン・ムドラー) */}
        {step === 3 && (
          <div className="step-view active">
            <div className="glass-card mudra-display-card">
              <h2 className="step-title" style={{ alignSelf: 'flex-start', textAlign: 'left' }}>瞑想とリラックス</h2>
              <p className="step-subtitle" style={{ alignSelf: 'flex-start', textAlign: 'left', marginBottom: '8px' }}>
                チン・ムドラーを結び、深呼吸を始めましょう。リラックスした姿勢で心を落ち着かせます。
              </p>

              <div className="mudra-svg-container" style={{ width: '170px', height: '170px', margin: '4px auto' }}>
                <RestMudraSVG />
              </div>

              <div className="info-badge-list" style={{ width: '100%', marginTop: '8px' }}>
                <div className="info-item">
                  <div className="info-icon-dot">1</div>
                  <div className="info-text-group">
                    <h4>親指と人差し指を優しく接触させる</h4>
                    <p>気の流れを整え、集中力を高めます。</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon-dot">2</div>
                  <div className="info-text-group">
                    <h4>手のひらを上に向けて膝の上に置く</h4>
                    <p>開かれた姿勢でリラックスを深めます。</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleStartNap} className="btn-primary" style={{ marginTop: '20px' }}>
              <span>ムドラーを結んだので次へ</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 4: Power Nap Timer */}
        {step === 4 && (
          <div className="step-view active">
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h2 className="step-title">{isRestFinished ? '仮眠終了！アラーム再生中⏰' : 'パワーナップ中'}</h2>
              <p className="step-subtitle">
                {isRestFinished ? 'ボタンをタップしてアラームを止め、覚醒の準備へ進みましょう。' : '目を閉じて深くリラックスしましょう。'}
              </p>

              <div className="timer-ring-wrapper">
                <svg className="timer-svg" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isRestFinished ? '#ff5252' : '#00e5ff'}/>
                      <stop offset="100%" stopColor={isRestFinished ? '#ff1744' : '#7c4dff'}/>
                    </linearGradient>
                  </defs>
                  <circle className="timer-bg-circle" cx="100" cy="100" r="90" />
                  <circle
                    className="timer-progress-circle"
                    cx="100"
                    cy="100"
                    r="90"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: progressOffset,
                      stroke: isRestFinished ? '#ff1744' : 'url(#timerGradient)'
                    }}
                  />
                </svg>
                <div className="timer-center-content">
                  <div className="timer-digits" style={{ color: isRestFinished ? '#ff1744' : '#ffffff' }}>{formatTime(remainingRest)}</div>
                  <div className="audio-status-badge" style={{ background: isRestFinished ? 'rgba(255,23,68,0.2)' : 'rgba(255,255,255,0.1)', color: isRestFinished ? '#ff1744' : '#00e5ff' }}>
                    <span>{isRestFinished ? '目覚ましアラーム鳴動中 ⏰' : (audioMode === 'speaker' ? '528Hz 揺らぎ音波' : '200/204Hz バイノーラル')}</span>
                  </div>
                </div>
              </div>
            </div>

            {isRestFinished ? (
              <button onClick={handleConfirmRestFinished} className="btn-primary" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)', boxShadow: '0 8px 24px rgba(255,23,68,0.4)' }}>
                <span>アラームを止めて覚醒準備へ</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button onClick={() => { audioEngine.stop(); setStep(2); }} className="btn-secondary" style={{ marginTop: '20px' }}>
                タイマーを中断する
              </button>
            )}
          </div>
        )}

        {/* STEP 5 (新): スーリヤ・ムドラー準備画面 */}
        {step === 5 && (
          <div className="step-view active">
            <div className="glass-card mudra-display-card">
              <span className="awake-badge">AWAKENING PREP</span>
              <h2 className="step-title" style={{ alignSelf: 'flex-start', textAlign: 'left', marginTop: '4px' }}>覚醒の準備（スーリヤ・ムドラー）</h2>
              <p className="step-subtitle" style={{ alignSelf: 'flex-start', textAlign: 'left', marginBottom: '8px' }}>
                スーリヤ・ムドラーを結んで姿勢を整えましょう。ボタンを押すと3分間の覚醒タイムが始まります。
              </p>

              <div className="mudra-svg-container" style={{ width: '160px', height: '160px', margin: '4px auto' }}>
                <AwakeMudraSVG />
              </div>

              <div className="info-badge-list" style={{ width: '100%', marginTop: '8px' }}>
                <div className="info-item">
                  <div className="info-icon-dot" style={{ background: 'rgba(255, 110, 64, 0.2)', color: '#ff6e40' }}>1</div>
                  <div className="info-text-group">
                    <h4>薬指を折って親指で上から押さえる</h4>
                    <p>体温と代謝を上昇させ、交感神経をONにします。</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon-dot" style={{ background: 'rgba(255, 110, 64, 0.2)', color: '#ff6e40' }}>2</div>
                  <div className="info-text-group">
                    <h4>人差し指・中指・小指をまっすぐ伸ばす</h4>
                    <p>エネルギーを全身に循環させ、頭脳を鮮明にします。</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleStartAwake} className="btn-primary btn-awake" style={{ marginTop: '20px' }}>
              <span>ムドラーを結んだので覚醒タイム（3分）を開始 ➔</span>
            </button>
          </div>
        )}

        {/* STEP 6 (新): 覚醒タイム 3分タイマー */}
        {step === 6 && (
          <div className="step-view active">
            <div className="glass-card mudra-display-card">
              <span className="awake-badge">AWAKENING PHASE (3 MIN)</span>
              <h2 className="step-title">覚醒タイム</h2>
              <div className="timer-digits" style={{ fontSize: '2.2rem', color: '#ff6e40' }}>{formatTime(remainingAwake)}</div>

              <div className="awake-progress-bar-container" style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', margin: '12px 0' }}>
                <div
                  className="awake-progress-fill"
                  style={{
                    width: `${((3 * 60 - remainingAwake) / (3 * 60)) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ffab40 0%, #ff3d00 100%)'
                  }}
                ></div>
              </div>

              <div className="mudra-svg-container" style={{ width: '140px', height: '140px', margin: '4px auto' }}>
                <AwakeMudraSVG />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px', color: '#ffab40' }}>スーリヤ・ムドラー保持中</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 8px 0' }}>40Hzの音波で交感神経を優しくアクティベートしています。</p>
            </div>

            <button onClick={handleFinish} className="btn-primary btn-awake" style={{ marginTop: '20px' }}>
              <span>スッキリ覚醒（完了へ）</span>
            </button>
          </div>
        )}

        {/* STEP 7 (新): Complete Screen */}
        {step === 7 && (
          <div className="step-view active">
            <div className="glass-card complete-box">
              <div className="complete-icon-circle">
                <CheckCircle style={{ width: '44px', height: '44px' }} />
              </div>
              <h2 className="step-title" style={{ fontSize: '1.8rem' }}>お疲れ様でした！</h2>
              <p className="step-subtitle" style={{ marginTop: '10px', fontSize: '1.05rem' }}>
                覚醒完了アラーム再生中⏰<br />ボタンを押してアラームを停止してください。
              </p>
            </div>

            <button onClick={handleReset} className="btn-primary" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)', boxShadow: '0 8px 24px rgba(255,23,68,0.4)' }}>
              <RefreshCw />
              <span>アラームを止めて最初に戻る</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
