import React from "react";

export const RestMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center" }}>
    <svg viewBox="0 0 200 200" width="130" height="130" className="mudra-hand-svg">
      <defs>
        <filter id="glow-chin-react" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="grad-chin-react" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#7c4dff" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0,229,255,0.25)" strokeWidth="1.5" strokeDasharray="6 4" />
      {/* Wrist / Palm Base */}
      <path d="M 65 175 C 65 145 72 125 80 110" fill="none" stroke="url(#grad-chin-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-chin-react)" />
      <path d="M 135 175 C 135 145 125 125 115 110" fill="none" stroke="url(#grad-chin-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-chin-react)" />
      {/* Thumb Circle */}
      <path d="M 80 110 C 65 95 62 75 76 68 C 88 62 98 72 98 84" fill="none" stroke="url(#grad-chin-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-chin-react)" />
      {/* Index Finger Circle */}
      <path d="M 100 110 C 112 100 118 86 108 72 C 98 62 88 74 98 84" fill="none" stroke="url(#grad-chin-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-chin-react)" />
      {/* Touch Point Highlight */}
      <circle cx="98" cy="84" r="5" fill="#00e5ff" filter="url(#glow-chin-react)" />
      <circle cx="98" cy="84" r="2" fill="#ffffff" />
      {/* Extended Middle Finger */}
      <path d="M 108 100 C 122 85 138 60 142 35" fill="none" stroke="url(#grad-chin-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-chin-react)" />
      {/* Extended Ring Finger */}
      <path d="M 112 105 C 130 92 148 72 154 50" fill="none" stroke="url(#grad-chin-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-chin-react)" />
      {/* Extended Pinky Finger */}
      <path d="M 116 112 C 136 102 156 86 164 68" fill="none" stroke="url(#grad-chin-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-chin-react)" />
    </svg>
  </div>
);

export const AwakeMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center" }}>
    <svg viewBox="0 0 200 200" width="130" height="130" className="mudra-hand-svg">
      <defs>
        <filter id="glow-surya-react" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="grad-surya-react" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9100" />
          <stop offset="100%" stopColor="#ff3d00" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,145,0,0.3)" strokeWidth="1.5" strokeDasharray="6 4" />
      <circle cx="100" cy="100" r="14" fill="rgba(255,145,0,0.15)" />
      {/* Wrist / Palm Base */}
      <path d="M 65 175 C 65 145 72 125 80 110" fill="none" stroke="url(#grad-surya-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 135 175 C 135 145 125 125 115 110" fill="none" stroke="url(#grad-surya-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-surya-react)" />
      {/* Bent Ring Finger under thumb */}
      <path d="M 108 106 C 100 95 86 85 92 74 C 98 64 106 76 96 90" fill="none" stroke="url(#grad-surya-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-surya-react)" />
      {/* Thumb pressing ring finger */}
      <path d="M 72 115 C 62 95 68 76 84 76 C 94 76 98 82 95 88" fill="none" stroke="#ff9100" strokeWidth="4.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      {/* Touch Point Highlight */}
      <circle cx="94" cy="82" r="4.5" fill="#ffea00" filter="url(#glow-surya-react)" />
      {/* Extended Index Finger */}
      <path d="M 85 102 C 82 75 80 50 82 28" fill="none" stroke="url(#grad-surya-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-surya-react)" />
      {/* Extended Middle Finger */}
      <path d="M 96 100 C 97 70 98 42 100 20" fill="none" stroke="url(#grad-surya-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-surya-react)" />
      {/* Extended Pinky Finger */}
      <path d="M 118 108 C 130 90 145 70 156 50" fill="none" stroke="url(#grad-surya-react)" strokeWidth="4" strokeLinecap="round" filter="url(#glow-surya-react)" />
    </svg>
  </div>
);
