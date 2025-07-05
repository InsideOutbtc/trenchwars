'use client';

import { getWojakConfiguration, generateAuthenticWojakSVG, type WojakMood } from '@/utils/wojakImageGenerator';

export default function WojakTest() {
  const moods: WojakMood[] = ['chad', 'comfy', 'neutral', 'coping', 'crying', 'god', 'diamond', 'whale'];

  return (
    <div style={{ 
      padding: '20px', 
      background: 'rgba(0,0,0,0.8)', 
      borderRadius: '12px',
      margin: '20px',
      color: 'white'
    }}>
      <h2>🧪 Wojak Test - New Authentic Images</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '16px',
        marginTop: '16px'
      }}>
        {moods.map((mood) => {
          const config = getWojakConfiguration(mood);
          return (
            <div key={mood} style={{ 
              textAlign: 'center',
              padding: '12px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}>
              <img 
                src={config.imageSrc} 
                alt={config.altText}
                style={{ 
                  width: '80px', 
                  height: '80px',
                  marginBottom: '8px',
                  border: '2px solid #4A9EFF',
                  borderRadius: '8px'
                }}
              />
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {mood.toUpperCase()}
              </div>
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '4px' }}>
                {config.message}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#ccc' }}>
        If you see authentic wojak faces (balding head, large nose) instead of pink circles, 
        the new system is working! If you still see generic shapes, there might be a cache issue.
      </div>
      
      <button 
        onClick={() => {
          console.log('Testing wojak generation...');
          moods.forEach(mood => {
            const config = getWojakConfiguration(mood);
            console.log(`${mood}:`, config.imageSrc.substring(0, 50) + '...');
          });
        }}
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          background: '#4A9EFF',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        🔍 Log Wojak Data to Console
      </button>
    </div>
  );
}