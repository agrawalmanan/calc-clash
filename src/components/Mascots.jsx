import React from 'react';

// 🔮 Main Mascot: Clashy the Calculus Wizard
export function CalcWizardMascot({ className = "w-40 h-40" }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={`drop-shadow-xl ${className}`}>
      <g filter="url(#grain-filter)">
        {/* Soft Body Blob */}
        <path d="M40 100C40 60 70 40 100 40C140 40 160 60 160 100C160 145 130 165 100 165C60 165 40 145 40 100Z" fill="#6B46C1" />
        {/* Cute Belly */}
        <ellipse cx="100" cy="115" rx="42" ry="35" fill="#A78BFA" />
        {/* Cheerful Eyes */}
        <circle cx="82" cy="90" r="7" fill="#1E1B4B" />
        <circle cx="118" cy="90" r="7" fill="#1E1B4B" />
        <circle cx="84" cy="88" r="2.5" fill="white" />
        <circle cx="120" cy="88" r="2.5" fill="white" />
        {/* Rosy Cheeks */}
        <ellipse cx="72" cy="102" rx="6" ry="4" fill="#F472B6" opacity="0.8" />
        <ellipse cx="128" cy="102" rx="6" ry="4" fill="#F472B6" opacity="0.8" />
        {/* Big Smile */}
        <path d="M90 100 Q100 112 110 100" stroke="#1E1B4B" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Wizard Hat */}
        <path d="M60 55 L100 10 L140 55 Q100 62 60 55Z" fill="#F59E0B" />
        <path d="M50 55 Q100 66 150 55 Q100 48 50 55Z" fill="#FBBF24" />
        {/* Star on Hat */}
        <polygon points="100,25 103,32 110,32 104,36 107,43 100,38 93,43 96,36 90,32 97,32" fill="#FFF" />
        {/* Floating Calculus Magic Wand */}
        <path d="M150 120 L175 145" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" />
        <text x="165" y="125" fontSize="22" fontWeight="bold" fill="#F59E0B">∫</text>
      </g>
    </svg>
  );
}

// 🌸 Limmy the Limit Mascot
export function LimmyMascot({ className = "w-28 h-28" }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={`drop-shadow-lg ${className}`}>
      <g filter="url(#grain-filter)">
        {/* Pink Blob Body */}
        <path d="M30 80C30 40 60 30 80 30C100 30 130 40 130 80C130 120 110 135 80 135C50 135 30 120 30 80Z" fill="#EC4899" />
        {/* Happy Eyes */}
        <path d="M60 70 Q68 60 76 70" stroke="#831843" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M84 70 Q92 60 100 70" stroke="#831843" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Mouth */}
        <ellipse cx="80" cy="85" rx="8" ry="10" fill="#831843" />
        {/* Rosy Cheeks */}
        <circle cx="52" cy="78" r="5" fill="#F472B6" />
        <circle cx="108" cy="78" r="5" fill="#F472B6" />
        {/* Floating 'x -> ∞' Tag */}
        <rect x="45" y="10" width="70" height="24" rx="12" fill="#FBCFE8" />
        <text x="56" y="26" fontSize="11" fontWidth="bold" fontWeight="bold" fill="#9D174D">lim x→∞</text>
      </g>
    </svg>
  );
}

// 🚀 Derivy the Slope Rocket Mascot
export function DerivyMascot({ className = "w-28 h-28" }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={`drop-shadow-lg ${className}`}>
      <g filter="url(#grain-filter)">
        {/* Blue Capsule Body */}
        <rect x="45" y="30" width="70" height="100" rx="35" fill="#3B82F6" />
        {/* Yellow Rocket Fins */}
        <path d="M30 110 L45 90 L45 125 Z" fill="#F59E0B" />
        <path d="M130 110 L115 90 L115 125 Z" fill="#F59E0B" />
        {/* Goggles / Window */}
        <circle cx="80" cy="70" r="22" fill="#93C5FD" stroke="#1E3A8A" strokeWidth="4" />
        <circle cx="75" cy="68" r="5" fill="#1E3A8A" />
        <circle cx="88" cy="68" r="5" fill="#1E3A8A" />
        <circle cx="77" cy="66" r="2" fill="white" />
        <circle cx="90" cy="66" r="2" fill="white" />
        {/* Cheeky Smile */}
        <path d="M72 100 Q80 108 88 100" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Derivative Symbol */}
        <text x="70" y="25" fontSize="16" fontWeight="bold" fill="#1E40AF">dy/dx</text>
      </g>
    </svg>
  );
}

// 🟡 Integralo the Curve Mascot
export function IntegraloMascot({ className = "w-28 h-28" }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={`drop-shadow-lg ${className}`}>
      <g filter="url(#grain-filter)">
        {/* Warm Yellow Body shaped like Integral */}
        <path d="M50 130 C30 130 30 100 50 80 L110 80 C130 80 130 50 110 30 C90 30 70 50 50 80" stroke="#F59E0B" strokeWidth="32" strokeLinecap="round" />
        <path d="M50 130 C30 130 30 100 50 80 L110 80 C130 80 130 50 110 30 C90 30 70 50 50 80" stroke="#FBBF24" strokeWidth="22" strokeLinecap="round" />
        {/* Cute Face in Center */}
        <circle cx="72" cy="75" r="4" fill="#78350F" />
        <circle cx="88" cy="75" r="4" fill="#78350F" />
        <path d="M76 83 Q80 88 84 83" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}