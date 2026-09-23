/**
 * PowerNap Main Application Logic (Updated Flow 1 -> 2 -> 3 -> 4 -> 5 -> 6)
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State Variables
  let currentStep = 1;
  let audioMode = 'speaker'; // 'speaker' | 'earphone'
  let restDurationSeconds = 15 * 60; // default 15 min
  
  let timerInterval = null;
  let remainingSeconds = 0;
  let totalRestSeconds = 0;
  
  let awakeInterval = null;
  let awakeRemainingSeconds = 0;
  let totalAwakeSeconds = 3 * 60; // 3 minutes = 180s

  let wakeLock = null;

  // DOM Elements
  const stepIndicatorEl = document.getElementById('step-indicator');
  const stepViews = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    5: document.getElementById('step-5'),
    6: document.getElementById('step-6')
  };

  // Step 1 Controls
  const btnCoffeeConfirm = document.getElementById('btn-coffee-confirm');

  // Step 2 Controls
  const btnModeSpeaker = document.getElementById('btn-mode-speaker');
  const btnModeEarphone = document.getElementById('btn-mode-earphone');
  const durationBtns = document.querySelectorAll('.duration-btn');
  const btnGotoMudra = document.getElementById('btn-goto-mudra');

  // Step 3 Controls (瞑想とリラックス・ムドラー確認)
  const mudraContainerRest = document.getElementById('mudra-container-rest');
  const btnStartNap = document.getElementById('btn-start-nap');

  // Step 4 Controls (パワーナップタイマー)
  const timerDigitsEl = document.getElementById('timer-digits');
  const timerProgressCircle = document.getElementById('timer-progress-circle');
  const audioModeBadgeText = document.getElementById('audio-mode-badge-text');
  const btnCancelNap = document.getElementById('btn-cancel-nap');

  // Step 5 Controls (覚醒フェーズ)
  const mudraContainerAwake = document.getElementById('mudra-container-awake');
  const mudraNameAwake = document.getElementById('mudra-name-awake');
  const mudraDescAwake = document.getElementById('mudra-desc-awake');
  const awakeTimerDigits = document.getElementById('awake-timer-digits');
  const awakeProgressFill = document.getElementById('awake-progress-fill');
  const btnSkipAwake = document.getElementById('btn-skip-awake');

  // Step 6 Controls (完了)
  const btnResetApp = document.getElementById('btn-reset-app');

  // --- Initialize Mudra Content (HTMLにインライン埋め込みがある場合はそのまま保持) ---
  if (window.mudrasData) {
    if (mudraContainerRest && !mudraContainerRest.children.length) {
      mudraContainerRest.innerHTML = window.mudrasData.rest.svg;
    }
    if (mudraContainerAwake && !mudraContainerAwake.children.length) {
      mudraContainerAwake.innerHTML = window.mudrasData.awake.svg;
    }
    if (mudraNameAwake) mudraNameAwake.textContent = window.mudrasData.awake.name;
  }

  // --- Screen Wake Lock Helper ---
  async function requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  }

  function releaseWakeLock() {
    if (wakeLock !== null) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  }

  // --- Navigation & View Switching ---
  function goToStep(stepNumber) {
    currentStep = stepNumber;
    stepIndicatorEl.textContent = `STEP ${stepNumber} / 6`;

    Object.keys(stepViews).forEach(key => {
      if (parseInt(key) === stepNumber) {
        stepViews[key].classList.add('active');
      } else {
        stepViews[key].classList.remove('active');
      }
    });

    if (stepNumber === 4 || stepNumber === 5) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }

  // --- Format Time Helper (MM:SS) ---
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Step 1 Listener ---
  btnCoffeeConfirm.addEventListener('click', () => {
    goToStep(2);
  });

  // --- Step 2 Listeners (Mode & Duration Select) ---
  btnModeSpeaker.addEventListener('click', () => {
    audioMode = 'speaker';
    btnModeSpeaker.classList.add('active');
    btnModeEarphone.classList.remove('active');
  });

  btnModeEarphone.addEventListener('click', () => {
    audioMode = 'earphone';
    btnModeEarphone.classList.add('active');
    btnModeSpeaker.classList.remove('active');
  });

  durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      durationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const secAttr = btn.getAttribute('data-seconds');
      const minAttr = btn.getAttribute('data-minutes');
      if (secAttr) {
        restDurationSeconds = parseInt(secAttr, 10);
      } else if (minAttr) {
        restDurationSeconds = parseInt(minAttr, 10) * 60;
      }
    });
  });

  btnGotoMudra.addEventListener('click', () => {
    goToStep(3);
  });

  // --- Step 3 Listener: Start Power Nap ---
  btnStartNap.addEventListener('click', () => {
    startPowerNapTimer();
  });

  // --- Step 4: Power Nap Timer Logic ---
  function startPowerNapTimer() {
    totalRestSeconds = restDurationSeconds;
    remainingSeconds = totalRestSeconds;
    
    // UI Updates
    timerDigitsEl.textContent = formatTime(remainingSeconds);
    audioModeBadgeText.textContent = audioMode === 'speaker' ? '528Hz + 4Hz 揺らぎ再生中' : '200/204Hz バイノーラル再生中';
    
    // Circle Stroke Init (Radius 90 => Circumference = 565.48)
    const circumference = 565.48;
    timerProgressCircle.style.strokeDasharray = `${circumference}`;
    timerProgressCircle.style.strokeDashoffset = `0`;

    // Audio Start
    if (window.powerNapAudio) {
      window.powerNapAudio.startRestSound(audioMode);
    }

    goToStep(4);

    // Countdown Interval
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      
      timerDigitsEl.textContent = formatTime(remainingSeconds);
      
      // Update Circle Progress
      const progressFraction = (totalRestSeconds - remainingSeconds) / totalRestSeconds;
      const offset = circumference * progressFraction;
      timerProgressCircle.style.strokeDashoffset = `${offset}`;

      // 残り時間に応じたフェードアウト処理
      const fadeTimeThreshold = Math.min(15, Math.floor(totalRestSeconds / 2));
      if (remainingSeconds === fadeTimeThreshold && window.powerNapAudio) {
        window.powerNapAudio.fadeRestSound(fadeTimeThreshold);
      }

      // タイマー終了
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        onNapTimerComplete();
      }
    }, 1000);
  }

  btnCancelNap.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    if (window.powerNapAudio) window.powerNapAudio.stop();
    goToStep(2);
  });

  // --- Step 4: Power Nap Timer Complete -> Alarm Loop ---
  function onNapTimerComplete() {
    if (window.powerNapAudio) {
      window.powerNapAudio.startAlarmLoop();
    }
    
    // UIを「仮眠終了・アラーム再生中」へ更新
    const timerDigitsEl = document.getElementById('timer-digits');
    const audioModeBadgeText = document.getElementById('audio-mode-badge-text');
    const btnCancelNap = document.getElementById('btn-cancel-nap');
    
    if (timerDigitsEl) timerDigitsEl.style.color = '#ff1744';
    if (audioModeBadgeText) {
      audioModeBadgeText.textContent = '目覚ましアラーム鳴動中 ⏰';
      audioModeBadgeText.style.color = '#ff1744';
      audioModeBadgeText.style.background = 'rgba(255, 23, 68, 0.2)';
    }
    
  // STEP 4タイマー完了時: アラーム停止ボタンのタップでSTEP 5(準備)へ
  if (btnCancelNap) {
    btnCancelNap.textContent = 'アラームを止めて覚醒準備へ ➔';
    btnCancelNap.className = 'btn-primary';
    btnCancelNap.style.background = 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)';
    btnCancelNap.style.boxShadow = '0 8px 24px rgba(255,23,68,0.4)';
    
    const newBtn = btnCancelNap.cloneNode(true);
    btnCancelNap.parentNode.replaceChild(newBtn, btnCancelNap);
    newBtn.addEventListener('click', () => {
      if (window.powerNapAudio) window.powerNapAudio.stop();
      goToStep(5); // スーリヤ・ムドラー準備画面へ
    });
  }
  }

  function startAwakeningPhase() {
    totalAwakeSeconds = 3 * 60; // 3分間
    awakeRemainingSeconds = totalAwakeSeconds;

    awakeTimerDigits.textContent = formatTime(awakeRemainingSeconds);
    awakeProgressFill.style.width = '0%';

    // 覚醒音スタート
    if (window.powerNapAudio) {
      window.powerNapAudio.startAwakeSound(audioMode);
    }

    goToStep(5);

    if (awakeInterval) clearInterval(awakeInterval);
    awakeInterval = setInterval(() => {
      awakeRemainingSeconds--;

      awakeTimerDigits.textContent = formatTime(awakeRemainingSeconds);

      // 進捗率 (0.0 -> 1.0)
      const progress = (totalAwakeSeconds - awakeRemainingSeconds) / totalAwakeSeconds;
      awakeProgressFill.style.width = `${progress * 100}%`;

      // 覚醒サウンドの音量・パルス周波数を進捗に合わせて更新
      if (window.powerNapAudio) {
        window.powerNapAudio.updateAwakeIntensity(progress);
      }

      // 3分間の覚醒フェーズ終了
      if (awakeRemainingSeconds <= 0) {
        clearInterval(awakeInterval);
        finishPowerNap();
      }
    }, 1000);
  }

  btnSkipAwake.addEventListener('click', () => {
    if (awakeInterval) clearInterval(awakeInterval);
    finishPowerNap();
  });

  // --- Step 6: Completion Screen Logic ---
  function finishPowerNap() {
    if (window.powerNapAudio) {
      window.powerNapAudio.stop();
      window.powerNapAudio.startAlarmLoop(); // ボタンを押すまで繰り返し目覚まし音
    }
    goToStep(6);
  }

  btnResetApp.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    if (awakeInterval) clearInterval(awakeInterval);
    if (window.powerNapAudio) window.powerNapAudio.stop();
    
    goToStep(1);
  });
});
