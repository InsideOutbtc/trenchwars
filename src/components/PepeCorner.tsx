'use client';

import { useState, useEffect } from 'react';

export default function PepeCorner() {
  const [status, setStatus] = useState('COMFY');
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const statusItems = ['COMFY', 'BASED', 'PUMPING', 'DIAMOND'];
    let index = 0;
    const statusInterval = setInterval(() => {
      setStatus(statusItems[index % statusItems.length]);
      index++;
    }, 4000);
    return () => clearInterval(statusInterval);
  }, []);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
  };

  return (
    <div 
      className={`pepe-corner ${clicked ? 'chaos-pulse' : ''}`}
      onClick={handleClick}
    >
      <div className="pepe-icon">🐸</div>
      <div className="pepe-status">{status}</div>
    </div>
  );
}