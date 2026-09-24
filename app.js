/**
 * PowerNap Main Application Logic (Updated 7-Step Flow: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7)
 */

document.addEventListener("DOMContentLoaded", () => {
  // App State Variables
  let currentStep = 1;
  let audioMode = "speaker"; // "speaker" | "earphone"
  let restDurationSeconds = 15 * 60; // default 15 min
  
  let timerInterval = null;
  let remainingSeconds = 0;
  let totalRestSeconds = 0;
  
  let awakeInterval = null;
  let awakeRemainingSeconds = 0;
  let totalAwakeSeconds = 3 * 60; // 3 minutes = 180s

  let wakeLock = null;

  // DOM Elements
  const stepIndicatorEl = document.getElementById("step-indicator");
  const stepViews = {
    1: document.getElementById("step-1"),
    2: document.getElementById("step-2"),
    3: document.getElementById("step-3"),
    4: document.getElementById("step-4"),
    5: document.getElementById("step-5"),
    6: document.getElementById("step-6"),
    7: document.getElementById("step-7")
  };

  // Step 1 Controls
  const btnCoffeeConfirm = document.getElementById("btn-coffee-confirm");

  // Step 2 Controls
  const btnModeSpeaker = document.getElementById("btn-mode-speaker");
  const btnModeEarphone = document.getElementById("btn-mode-earphone");
  const durationBtns = document.querySelectorAll(".duration-btn");
  const btnGotoMudra = document.getElementById("btn-goto-mudra");

  // Step 3 Controls (瞑想とリラックス)
  const btnStartNap = document.getElementById("btn-start-nap");

  // Step 4 Controls (パワーナップタイマー)
  const timerDigitsEl = document.getElementById("timer-digits");
  const timerProgressCircle = document.getElementById("timer-progress-circle");
  const audioModeBadgeText = document.getElementById("audio-mode-badge-text");
  const btnCancelNap = document.getElementById("btn-cancel-nap");

  // Step 5 Controls (覚醒準備)
  const btnStartAwake = document.getElementById("btn-start-awake");

  // Step 6 Controls (覚醒タイマー進行)
  const awakeTimerDigits = document.getElementById("awake-timer-digits");
  const awakeProgressFill = document.getElementById("awake-progress-fill");
  const btnSkipAwake = document.getElementById("btn-skip-awake");

  // Step 7 Controls (完了)
  const btnResetApp = document.getElementById("btn-reset-app");

  // --- Screen Wake Lock Helper ---
  async function requestWakeLock() {
    if ("wakeLock" in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.warn("Wake Lock request failed:", err);
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
    stepIndicatorEl.textContent = `STEP ${stepNumber} / 7`;

    Object.keys(stepViews).forEach(key => {
      if (stepViews[key]) {
        if (parseInt(key) === stepNumber) {
          stepViews[key].classList.add("active");
        } else {
          stepViews[key].classList.remove("active");
        }
      }
    });

    if (stepNumber === 4 || stepNumber === 6) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }

  // --- Format Time Helper (MM:SS) ---
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // --- Step 1 Listener ---
  if (btnCoffeeConfirm) {
    btnCoffeeConfirm.addEventListener("click", () => {
      goToStep(2);
    });
  }

  // --- Step 2 Listeners ---
  if (btnModeSpeaker) {
    btnModeSpeaker.addEventListener("click", () => {
      audioMode = "speaker";
      btnModeSpeaker.classList.add("active");
      if (btnModeEarphone) btnModeEarphone.classList.remove("active");
    });
  }

  if (btnModeEarphone) {
    btnModeEarphone.addEventListener("click", () => {
      audioMode = "earphone";
      btnModeEarphone.classList.add("active");
      if (btnModeSpeaker) btnModeSpeaker.classList.remove("active");
    });
  }

  durationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      durationBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const secAttr = btn.getAttribute("data-seconds");
      const minAttr = btn.getAttribute("data-minutes");
      if (secAttr) {
        restDurationSeconds = parseInt(secAttr, 10);
      } else if (minAttr) {
        restDurationSeconds = parseInt(minAttr, 10) * 60;
      }
    });
  });

  if (btnGotoMudra) {
    btnGotoMudra.addEventListener("click", () => {
      goToStep(3);
    });
  }

  // --- Step 3 Listener: Start Power Nap ---
  if (btnStartNap) {
    btnStartNap.addEventListener("click", () => {
      startPowerNapTimer();
    });
  }

  // --- Step 4: Power Nap Timer Logic ---
  function startPowerNapTimer() {
    totalRestSeconds = restDurationSeconds;
    remainingSeconds = totalRestSeconds;
    
    // UI Updates
    if (timerDigitsEl) timerDigitsEl.textContent = formatTime(remainingSeconds);
    if (audioModeBadgeText) {
      audioModeBadgeText.textContent = audioMode === "speaker" ? "528Hz + 4Hz 揺らぎ再生中" : "200/204Hz バイノーラル再生中";
    }
    
    // Circle Stroke Init (Radius 70 => Circumference = 439.82)
    const circumference = 439.82;
    if (timerProgressCircle) {
      timerProgressCircle.style.strokeDasharray = `${circumference}`;
      timerProgressCircle.style.strokeDashoffset = `0`;
    }

    // Audio Start
    if (window.powerNapAudio) {
      window.powerNapAudio.startRestSound(audioMode);
    }

    goToStep(4);

    // Countdown Interval
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      
      if (timerDigitsEl) timerDigitsEl.textContent = formatTime(remainingSeconds);
      
      // Update Circle Progress
      if (timerProgressCircle) {
        const progressFraction = (totalRestSeconds - remainingSeconds) / totalRestSeconds;
        const offset = circumference * progressFraction;
        timerProgressCircle.style.strokeDashoffset = `${offset}`;
      }

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

  if (btnCancelNap) {
    btnCancelNap.addEventListener("click", () => {
      if (timerInterval) clearInterval(timerInterval);
      if (window.powerNapAudio) window.powerNapAudio.stop();
      goToStep(2);
    });
  }

  // --- Step 4 Complete -> Alarm Loop -> Button to Step 5 ---
  function onNapTimerComplete() {
    if (window.powerNapAudio) {
      window.powerNapAudio.startAlarmLoop();
    }
    
    if (timerDigitsEl) timerDigitsEl.style.color = "#ff1744";
    if (audioModeBadgeText) {
      audioModeBadgeText.textContent = "目覚ましアラーム鳴動中 ⏰";
      audioModeBadgeText.style.color = "#ff1744";
      audioModeBadgeText.style.background = "rgba(255, 23, 68, 0.2)";
    }
    
    if (btnCancelNap) {
      btnCancelNap.textContent = "アラームを止めて覚醒準備へ ➔";
      btnCancelNap.className = "btn-primary";
      btnCancelNap.style.background = "linear-gradient(135deg, #ff5252 0%, #ff1744 100%)";
      
      const newBtn = btnCancelNap.cloneNode(true);
      btnCancelNap.parentNode.replaceChild(newBtn, btnCancelNap);
      newBtn.addEventListener("click", () => {
        if (window.powerNapAudio) window.powerNapAudio.stop();
        goToStep(5); // 覚醒準備画面(STEP 5)へ
      });
    }
  }

  // --- Step 5: Start 3-minute Awakening Timer ---
  if (btnStartAwake) {
    btnStartAwake.addEventListener("click", () => {
      startAwakeningPhase();
    });
  }

  // --- Step 6: Awakening Timer Phase ---
  function startAwakeningPhase() {
    totalAwakeSeconds = 3 * 60; // 3分間
    awakeRemainingSeconds = totalAwakeSeconds;

    if (awakeTimerDigits) awakeTimerDigits.textContent = formatTime(awakeRemainingSeconds);
    if (awakeProgressFill) awakeProgressFill.style.width = "0%";

    // 覚醒音スタート
    if (window.powerNapAudio) {
      window.powerNapAudio.startAwakeSound(audioMode);
    }

    goToStep(6);

    if (awakeInterval) clearInterval(awakeInterval);
    awakeInterval = setInterval(() => {
      awakeRemainingSeconds--;

      if (awakeTimerDigits) awakeTimerDigits.textContent = formatTime(awakeRemainingSeconds);

      const progress = (totalAwakeSeconds - awakeRemainingSeconds) / totalAwakeSeconds;
      if (awakeProgressFill) awakeProgressFill.style.width = `${progress * 100}%`;

      if (window.powerNapAudio) {
        window.powerNapAudio.updateAwakeIntensity(progress);
      }

      if (awakeRemainingSeconds <= 0) {
        clearInterval(awakeInterval);
        finishPowerNap();
      }
    }, 1000);
  }

  if (btnSkipAwake) {
    btnSkipAwake.addEventListener("click", () => {
      if (awakeInterval) clearInterval(awakeInterval);
      finishPowerNap();
    });
  }

  // --- Step 7: Completion Screen Logic ---
  function finishPowerNap() {
    if (window.powerNapAudio) {
      window.powerNapAudio.stop();
      window.powerNapAudio.startAlarmLoop();
    }
    goToStep(7);
  }

  if (btnResetApp) {
    btnResetApp.addEventListener("click", () => {
      if (timerInterval) clearInterval(timerInterval);
      if (awakeInterval) clearInterval(awakeInterval);
      if (window.powerNapAudio) window.powerNapAudio.stop();
      
      goToStep(1);
    });
  }
});
