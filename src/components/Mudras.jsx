import React from 'react';

export const RestMudraSVG = () => (
  <svg viewBox="0 0 200 240" className="mudra-svg" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffa726" stopOpacity="0.45"/>
        <stop offset="100%" stopColor="#ffa726" stopOpacity="0"/>
      </radialGradient>
      <filter id="neonGlowGold" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* 背景のグロー */}
    <circle cx="100" cy="120" r="75" fill="url(#glowGold)" />
    
    {/* チン・ムドラーネオンライン */}
    <g stroke="#ffa726" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#neonGlowGold)">
      {/* 手首 */}
      <path d="M 82,220 C 84,185 70,165 65,145" />
      <path d="M 122,220 C 120,185 128,165 124,140" />
      
      {/* 親指（左側からの曲がりと輪） */}
      <path d="M 65,145 C 52,125 60,95 90,100 C 102,102 110,115 100,128 C 90,138 75,128 75,112 C 75,100 88,96 95,100" stroke="#ffb74d" />
      
      {/* 伸ばした3本指（中指・薬指・小指） */}
      {/* 中指 */}
      <path d="M 98,96 L 98,32 C 98,22 108,22 108,32 L 110,98" stroke="#ffa726" />
      {/* 薬指 */}
      <path d="M 110,98 L 118,40 C 118,30 127,30 127,40 L 123,105" stroke="#ffa726" />
      {/* 小指 */}
      <path d="M 123,105 L 135,58 C 135,50 144,52 143,60 L 130,125" stroke="#ffa726" />
      
      {/* 接点ノード (親指と人差し指の接触点) */}
      <circle cx="95" cy="100" r="4.5" fill="#ffffff" stroke="#ffa726" strokeWidth="2" />
    </g>
  </svg>
);

export const AwakeMudraSVG = () => (
  <svg viewBox="0 0 200 240" className="mudra-svg" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <radialGradient id="glowFire" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ff6e40" stopOpacity="0.55"/>
        <stop offset="100%" stopColor="#ff6e40" stopOpacity="0"/>
      </radialGradient>
      <filter id="neonGlowFire" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* 背景のグロー */}
    <circle cx="100" cy="120" r="75" fill="url(#glowFire)" />
    
    {/* スーリヤ・ムドラーネオンライン */}
    <g stroke="#ff6e40" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#neonGlowFire)">
      {/* 手首 */}
      <path d="M 80,220 C 82,185 70,165 65,145" />
      <path d="M 124,220 C 122,185 130,165 125,140" />
      
      {/* 人差し指（まっすぐ伸びる） */}
      <path d="M 72,138 L 72,42 C 72,32 82,32 82,42 L 85,120" stroke="#ff8a65" />
      
      {/* 中指（まっすぐ一番高く伸びる） */}
      <path d="M 85,120 L 94,30 C 94,20 104,20 104,30 L 108,120" stroke="#ff8a65" />
      
      {/* 薬指（手のひら側に曲げられる） */}
      <path d="M 108,120 C 114,108 102,88 90,92 C 82,95 80,108 88,115 L 100,122" stroke="#ff3d00" strokeWidth="5" />
      
      {/* 親指（折った薬指を上から押さえる） */}
      <path d="M 65,145 C 55,128 65,104 84,104 C 95,104 98,114 90,118" stroke="#ffea00" strokeWidth="5" />
      
      {/* 小指（右側に伸びる） */}
      <path d="M 115,125 L 132,60 C 132,50 141,52 140,62 L 126,135" stroke="#ff8a65" />
      
      {/* 親指と薬指の重なり強調リング */}
      <circle cx="90" cy="110" r="10" stroke="#ffea00" strokeWidth="3" fill="none" />
      <circle cx="90" cy="110" r="3.5" fill="#ffffff" />
    </g>
  </svg>
);

