/**
 * VIVE LA VIE!! - ビブラヴィ
 * Official Link Portal Interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const statusPill = document.getElementById("status-pill");
  const statusText = document.getElementById("status-text");
  const btnShare = document.getElementById("btn-share");
  const btnCopyAddress = document.getElementById("btn-copy-address");
  const btnOpenMenu = document.getElementById("btn-open-menu");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnModalReserve = document.getElementById("btn-modal-reserve");
  const menuModal = document.getElementById("menu-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const btnToggleInfo = document.getElementById("btn-toggle-info");
  const infoCard = document.querySelector(".info-card");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  let toastTimer = null;

  // --- 1. Real-time Open/Closed Status Logic ---
  function updateBusinessStatus() {
    const now = new Date();
    const hour = now.getHours();
    // 営業時間：午後9時（21:00）〜 午前2時（翌2:00）
    // 21時, 22時, 23時, 0時, 1時 が営業中
    const isOpen = (hour >= 21 || hour < 2);

    if (isOpen) {
      statusPill.className = "status-pill open";
      statusText.textContent = "TONIGHT OPEN 21:00 - 翌2:00 (L.O. 1:30)";
    } else {
      statusPill.className = "status-pill closed";
      statusText.textContent = "CLOSED • 本日 21:00 OPEN";
    }
  }
  updateBusinessStatus();

  // --- 2. Toast Notification Helper ---
  function showToast(message, icon = "✨") {
    if (!toast) return;
    const toastIcon = toast.querySelector(".toast-icon");
    if (toastIcon) toastIcon.textContent = icon;
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add("show");
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch (e) { /* ignore */ }
    }

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // --- 3. Copy Address to Clipboard ---
  const BAR_ADDRESS = "東京都港区南青山5-X-X 青山ラグジュアリープレイス B1F";

  if (btnCopyAddress) {
    btnCopyAddress.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(BAR_ADDRESS);
        } else {
          // Fallback
          const tempInput = document.createElement("textarea");
          tempInput.value = BAR_ADDRESS;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
        }
        showToast("住所をコピーしました", "📍");
      } catch (err) {
        showToast("住所のコピーに失敗しました", "⚠️");
      }
    });
  }

  // --- 4. Share Page (Web Share API / Copy Link) ---
  if (btnShare) {
    btnShare.addEventListener("click", async () => {
      const shareData = {
        title: "VIVE LA VIE!! - ビブラヴィ",
        text: "VIVE LA VIE!! - ビブラヴィ。大人の隠れ家バー。クラフトカクテルと上質なくつろぎを。",
        url: window.location.href
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== "AbortError") {
            copyPageUrlFallback();
          }
        }
      } else {
        copyPageUrlFallback();
      }
    });
  }

  async function copyPageUrlFallback() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      showToast("リンクURLをコピーしました", "🔗");
    } catch (err) {
      showToast("URLのコピーに失敗しました", "⚠️");
    }
  }

  // --- 5. Digital Menu Modal Logic ---
  function openMenuModal() {
    if (menuModal) {
      menuModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeMenuModal() {
    if (menuModal) {
      menuModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (btnOpenMenu) {
    btnOpenMenu.addEventListener("click", openMenuModal);
  }
  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", closeMenuModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeMenuModal);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuModal && menuModal.classList.contains("active")) {
      closeMenuModal();
    }
  });

  if (btnModalReserve) {
    btnModalReserve.addEventListener("click", () => {
      closeMenuModal();
      const reserveLink = document.getElementById("link-reserve");
      if (reserveLink) {
        reserveLink.scrollIntoView({ behavior: "smooth", block: "center" });
        reserveLink.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
        reserveLink.style.transform = "scale(1.03)";
        setTimeout(() => {
          reserveLink.style.transform = "";
          window.open(reserveLink.href, "_blank", "noopener");
        }, 350);
      }
    });
  }

  // --- 6. Collapsible Shop Info Accordion ---
  if (btnToggleInfo && infoCard) {
    btnToggleInfo.addEventListener("click", () => {
      infoCard.classList.toggle("expanded");
    });
  }
});
