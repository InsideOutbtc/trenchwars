'use client';

import { useState, useEffect } from 'react';

export default function WojakHUD() {
  const [pnl, setPnl] = useState(42.69);
  const [mood, setMood] = useState('COMFY');
  const [cope, setCope] = useState('LOW');
  const [avatar, setAvatar] = useState('😊');

  useEffect(() => {
    const pnlInterval = setInterval(() => {
      const change = (Math.random() - 0.5) * 10;
      setPnl(prev => Math.max(-999, Math.min(999, prev + change)));
    }, 2000);

    return () => clearInterval(pnlInterval);
  }, []);

  useEffect(() => {
    if (pnl >= 100) {
      setAvatar('😎');
      setMood('CHAD');
      setCope('NONE');
    } else if (pnl >= 10) {
      setAvatar('🤑');
      setMood('BASED');
      setCope('NONE');
    } else if (pnl > 0) {
      setAvatar('😊');
      setMood('COMFY');
      setCope('LOW');
    } else if (pnl > -50) {
      setAvatar('😐');
      setMood('COPING');
      setCope('MEDIUM');
    } else if (pnl > -100) {
      setAvatar('😰');
      setMood('SWEATING');
      setCope('HIGH');
    } else {
      setAvatar('😭');
      setMood('REKT');
      setCope('MAXIMUM');
    }
  }, [pnl]);

  return (
    <div className="wojak-hud">
      <div className="wojak-avatar">{avatar}</div>
      <div className="wojak-status">ANON STATUS</div>
      <div className={`wojak-pnl ${pnl >= 0 ? 'positive' : 'negative'}`}>
        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
      </div>
      <div className="wojak-mood">{mood}</div>
      <div className="wojak-cope">COPE: {cope}</div>
    </div>
  );
}