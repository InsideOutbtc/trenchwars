'use client';

import { useEffect, useState } from 'react';

interface WojakSVGProps {
  mood: 'comfy' | 'chad' | 'crying' | 'rekt' | 'moon';
  pnl: number;
  size?: number;
}

export default function WojakSVG({ mood, pnl, size = 80 }: WojakSVGProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getEyeScale = () => {
    switch (mood) {
      case 'chad': return 0.8;
      case 'rekt': return 0.4;
      case 'crying': return 1.2;
      default: return 1.0;
    }
  };

  const getEyeY = () => {
    const base = 38;
    if (mood === 'crying') return base + Math.sin(animationPhase * 0.3) * 1;
    return base;
  };

  const getMouthPath = () => {
    switch (mood) {
      case 'chad': return 'M42 52 Q50 48 58 52';
      case 'crying': return 'M42 58 Q50 65 58 58';
      case 'rekt': return 'M42 60 Q50 68 58 60';
      case 'moon': return 'M40 50 Q50 45 60 50';
      default: return 'M42 55 Q50 58 58 55';
    }
  };

  const getEyebrowPath = () => {
    switch (mood) {
      case 'chad': return { left: 'M38 35 L46 33', right: 'M54 33 L62 35' };
      case 'crying': return { left: 'M38 36 L46 34', right: 'M54 34 L62 36' };
      case 'rekt': return { left: 'M38 37 L46 35', right: 'M54 35 L62 37' };
      case 'moon': return { left: 'M38 34 L46 32', right: 'M54 32 L62 34' };
      default: return { left: 'M38 36 L46 34', right: 'M54 34 L62 36' };
    }
  };

  const showTears = mood === 'crying' || (mood === 'rekt' && pnl < -50);
  const eyebrows = getEyebrowPath();

  return (
    <svg 
      className="wojak-svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      data-mood={mood}
    >
      {/* Background glow effect */}
      <defs>
        <radialGradient id="wojakGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: mood === 'moon' ? '#00D4AA' : mood === 'rekt' ? '#FF6B6B' : '#FFD93D', stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
        </radialGradient>
        
        <filter id="tears" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
        </filter>
      </defs>

      {/* Glow background */}
      <circle cx="50" cy="50" r="45" fill="url(#wojakGlow)" />
      
      {/* Wojak Head */}
      <ellipse 
        cx="50" 
        cy="45" 
        rx="28" 
        ry="32" 
        fill="#fdbcb4" 
        stroke="#2a2a2a" 
        strokeWidth="1.5"
      />
      
      {/* Hair */}
      <path 
        d="M25 25 Q35 15 50 18 Q65 15 75 25 Q70 20 65 22 Q60 18 55 20 Q50 16 45 20 Q40 18 35 22 Q30 20 25 25" 
        fill="#8B4513" 
        stroke="#654321" 
        strokeWidth="0.5"
      />
      
      {/* Eyebrows */}
      <path 
        d={eyebrows.left} 
        stroke="#654321" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d={eyebrows.right} 
        stroke="#654321" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Eyes */}
      <g className="wojak-eyes">
        <ellipse 
          cx="42" 
          cy={getEyeY()} 
          rx={2.5 * getEyeScale()} 
          ry={3 * getEyeScale()} 
          fill="#FFFFFF"
        />
        <ellipse 
          cx="58" 
          cy={getEyeY()} 
          rx={2.5 * getEyeScale()} 
          ry={3 * getEyeScale()} 
          fill="#FFFFFF"
        />
        
        {/* Pupils */}
        <circle 
          cx="42" 
          cy={getEyeY() + 0.5} 
          r={1.5 * getEyeScale()} 
          fill="#333"
        />
        <circle 
          cx="58" 
          cy={getEyeY() + 0.5} 
          r={1.5 * getEyeScale()} 
          fill="#333"
        />
        
        {/* Eye highlights */}
        {mood !== 'rekt' && (
          <>
            <circle cx="42.5" cy={getEyeY() - 0.5} r="0.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="58.5" cy={getEyeY() - 0.5} r="0.5" fill="#FFFFFF" opacity="0.8" />
          </>
        )}
      </g>
      
      {/* Nose */}
      <ellipse cx="50" cy="48" rx="1" ry="2" fill="#f5a792" />
      
      {/* Mouth */}
      <path 
        d={getMouthPath()} 
        stroke="#333" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Chin line */}
      <path 
        d="M30 65 Q50 75 70 65" 
        stroke="#e8a089" 
        strokeWidth="1" 
        fill="none" 
        opacity="0.6"
      />
      
      {/* Tears (animated) */}
      {showTears && (
        <g className="wojak-tears" filter="url(#tears)">
          <ellipse 
            cx="38" 
            cy={getEyeY() + 8} 
            rx="1" 
            ry={6 + Math.sin(animationPhase * 0.2) * 2} 
            fill="#87ceeb" 
            opacity="0.8"
          >
            <animate 
              attributeName="ry" 
              values="6;10;6" 
              dur="2s" 
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse 
            cx="62" 
            cy={getEyeY() + 8} 
            rx="1" 
            ry={6 + Math.sin(animationPhase * 0.2 + Math.PI) * 2} 
            fill="#87ceeb" 
            opacity="0.8"
          >
            <animate 
              attributeName="ry" 
              values="6;10;6" 
              dur="2s" 
              repeatCount="indefinite" 
              begin="0.5s"
            />
          </ellipse>
          
          {/* Tear drops */}
          {Array.from({ length: 3 }).map((_, i) => (
            <circle
              key={i}
              cx={38 + i * 12}
              cy={getEyeY() + 15 + i * 2}
              r="0.8"
              fill="#87ceeb"
              opacity="0.6"
            >
              <animate
                attributeName="cy"
                values={`${getEyeY() + 15 + i * 2};${getEyeY() + 25 + i * 2};${getEyeY() + 15 + i * 2}`}
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              />
            </circle>
          ))}
        </g>
      )}
      
      {/* Mood-specific effects */}
      {mood === 'moon' && (
        <g className="moon-effects">
          {/* Sparkles */}
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={i}>
              <path
                d={`M${25 + i * 15} ${20 + i * 5} L${27 + i * 15} ${22 + i * 5} L${25 + i * 15} ${24 + i * 5} L${23 + i * 15} ${22 + i * 5} Z`}
                fill="#FFD93D"
                opacity="0.8"
              >
                <animate
                  attributeName="opacity"
                  values="0.8;0.3;0.8"
                  dur="1.5s"
                  repeatCount="indefinite"
                  begin={`${i * 0.3}s`}
                />
              </path>
            </g>
          ))}
        </g>
      )}
      
      {mood === 'chad' && (
        <g className="chad-effects">
          {/* Sunglasses reflection */}
          <ellipse cx="42" cy={getEyeY()} rx="4" ry="3" fill="none" stroke="#FFD93D" strokeWidth="0.5" opacity="0.6" />
          <ellipse cx="58" cy={getEyeY()} rx="4" ry="3" fill="none" stroke="#FFD93D" strokeWidth="0.5" opacity="0.6" />
        </g>
      )}
      
      {mood === 'rekt' && (
        <g className="rekt-effects">
          {/* X eyes */}
          <path d="M40 36 L44 40 M44 36 L40 40" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
          <path d="M56 36 L60 40 M60 36 L56 40" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// Wojak Panel Component
interface WojakPanelProps {
  pnl: number;
  className?: string;
}

export function WojakPanel({ pnl, className = '' }: WojakPanelProps) {
  const [mood, setMood] = useState<'comfy' | 'chad' | 'crying' | 'rekt' | 'moon'>('comfy');
  const [vibe, setVibe] = useState('COMFY');
  const [cope, setCope] = useState(25);
  const [streak, setStreak] = useState(3);

  useEffect(() => {
    if (pnl >= 100) {
      setMood('moon');
      setVibe('LEGENDARY');
      setCope(0);
    } else if (pnl >= 50) {
      setMood('chad');
      setVibe('BASED');
      setCope(5);
    } else if (pnl >= 0) {
      setMood('comfy');
      setVibe('COMFY');
      setCope(25);
    } else if (pnl >= -50) {
      setMood('crying');
      setVibe('COPING');
      setCope(60);
    } else {
      setMood('rekt');
      setVibe('NGMI');
      setCope(100);
    }
  }, [pnl]);

  const pnlPercentage = pnl >= 0 ? `+${(pnl / 100 * 15).toFixed(1)}%` : `${(pnl / 100 * 15).toFixed(1)}%`;

  return (
    <div className={`wojak-panel ${className}`}>
      <div className="panel-header">
        <span className="panel-title text-sm">Portfolio Status</span>
        <button className="panel-toggle">−</button>
      </div>
      
      <div className="wojak-display">
        <WojakSVG mood={mood} pnl={pnl} size={80} />
      </div>

      <div className="status-data">
        <div className="pnl-section">
          <div className={`pnl-value text-xl mono ${pnl >= 0 ? 'positive' : 'negative'}`}>
            {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
          </div>
          <div className={`pnl-percentage text-sm ${pnl >= 0 ? 'positive' : 'negative'}`}>
            {pnlPercentage}
          </div>
          <div className="pnl-period text-xs">24h P&L</div>
        </div>
        
        <div className="status-indicators">
          <div className="status-row">
            <span className="status-label text-xs">Vibe:</span>
            <span className="status-value text-sm">{vibe}</span>
          </div>
          <div className="status-row">
            <span className="status-label text-xs">Cope:</span>
            <div className="cope-meter">
              <div className="cope-bar">
                <div className="cope-fill" style={{ width: `${cope}%` }}></div>
              </div>
              <span className="cope-percentage text-xs">{cope}%</span>
            </div>
          </div>
          <div className="status-row">
            <span className="status-label text-xs">Streak:</span>
            <span className="status-value text-sm">{streak}W</span>
          </div>
        </div>
      </div>
    </div>
  );
}