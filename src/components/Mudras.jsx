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
      <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" strokeDasharray="6 4" />
      <path d="M 68 185 C 65 145 55 125 50 100 C 45 75 60 62 76 68 C 88 74 95 90 98 100 C 105 80 120 40 128 22 C 133 22 136 30 134 45 C 131 65 126 90 125 105 C 132 85 145 50 152 35 C 157 36 160 44 156 58 C 150 78 142 100 138 115 C 146 100 160 70 168 58 C 172 60 174 68 170 80 C 160 110 142 150 130 185 Z" fill="rgba(0, 229, 255, 0.06)" />
      <path d="M 68 185 C 68 150 58 130 52 108" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-chin-react)" />
      <path d="M 130 185 C 130 155 125 135 120 118" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-chin-react)" />
      <path d="M 52 108 C 45 82 58 64 76 68 C 88 72 96 86 98 100" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-chin-react)" />
      <path d="M 88 112 C 85 92 84 76 92 68 C 98 62 105 68 98 100" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-chin-react)" />
      <circle cx="95" cy="74" r="5.5" fill="#00e5ff" filter="url(#glow-chin-react)" />
      <circle cx="95" cy="74" r="2.5" fill="#ffffff" />
      <path d="M 108 105 C 114 75 124 45 128 22 C 133 22 136 30 134 45 C 130 70 124 95 122 110" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-chin-react)" />
      <path d="M 122 110 C 132 85 145 50 152 35 C 157 36 160 44 156 58 C 149 80 140 102 135 116" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-chin-react)" />
      <path d="M 135 116 C 146 98 160 70 168 58 C 172 60 174 68 170 80 C 158 112 142 148 130 185" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-chin-react)" />
      <path d="M 75 130 Q 95 135 115 125" fill="none" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="2" strokeLinecap="round" />
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
      <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,145,0,0.25)" strokeWidth="1.5" strokeDasharray="6 4" />
      <circle cx="100" cy="100" r="16" fill="rgba(255,145,0,0.12)" />
      <path d="M 68 185 C 65 145 55 125 50 105 C 45 80 62 65 80 72 C 86 75 92 84 96 95 C 102 70 108 40 114 20 C 119 20 122 28 120 42 C 117 62 114 85 113 100 C 122 75 132 45 138 30 C 143 31 146 39 143 52 C 138 72 130 95 125 110 C 135 90 152 65 160 52 C 164 54 166 62 162 74 C 150 106 138 148 130 185 Z" fill="rgba(255, 145, 0, 0.06)" />
      <path d="M 68 185 C 68 150 58 130 52 108" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 130 185 C 130 155 125 135 120 118" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 75 110 C 80 80 92 50 96 26 C 101 26 104 34 102 48 C 98 70 94 95 92 110" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 94 108 C 102 75 108 40 114 20 C 119 20 122 28 120 42 C 116 70 112 95 110 112" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 110 112 C 104 94 92 88 95 102 C 98 112 112 122 118 118" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 52 108 C 45 82 58 68 76 72 C 84 74 94 88 96 98" fill="none" stroke="#ff9100" strokeWidth="4" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <circle cx="95" cy="94" r="5" fill="#ffea00" filter="url(#glow-surya-react)" />
      <path d="M 122 118 C 135 90 152 65 160 52 C 164 54 166 62 162 74 C 150 108 138 148 130 185" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 75 132 Q 95 138 115 128" fill="none" stroke="rgba(255, 145, 0, 0.4)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);
