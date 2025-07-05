// Authentic Wojak Image Generator - Real wojak characteristics
// NO GENERIC FACES - These are proper wojaks that crypto users will recognize

export type WojakMood = 'chad' | 'comfy' | 'neutral' | 'coping' | 'crying' | 'god' | 'diamond' | 'whale';

interface WojakConfig {
  imageSrc: string;
  altText: string;
  mood: WojakMood;
  message: string;
  celebration?: string;
}

// Generate authentic wojak SVGs with proper characteristics
export function generateAuthenticWojakSVG(mood: WojakMood): string {
  const baseWojak = {
    width: 120,
    height: 120,
    skinColor: '#fdbcb4', // Classic wojak skin tone
    hairColor: '#8B4513',
    strokeColor: '#d4a574',
    eyeColor: '#000000'
  };

  let extraElements = '';
  let eyeExpression = '';
  let mouthExpression = '';
  let accessories = '';
  let specialEffects = '';

  switch (mood) {
    case 'chad':
      // Chad wojak with confidence and sunglasses
      eyeExpression = `
        <rect x="35" y="45" width="12" height="8" fill="#000000" rx="2" opacity="0.8"/>
        <rect x="73" y="45" width="12" height="8" fill="#000000" rx="2" opacity="0.8"/>
        <circle cx="41" cy="49" r="1" fill="#ffffff" opacity="0.3"/>
        <circle cx="79" cy="49" r="1" fill="#ffffff" opacity="0.3"/>
      `;
      mouthExpression = `<path d="M45 70 Q60 65 75 70" stroke="#000" stroke-width="2" fill="none"/>`;
      accessories = `
        <path d="M30 40 Q60 35 90 40" stroke="#FFD700" stroke-width="3" fill="none"/>
        <circle cx="35" cy="42" r="2" fill="#FFD700"/>
        <circle cx="85" cy="42" r="2" fill="#FFD700"/>
      `;
      specialEffects = `
        <circle cx="25" cy="25" r="3" fill="#FFD700" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="95" cy="30" r="2" fill="#FFD700" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      `;
      break;

    case 'comfy':
      // Classic comfy "feels good man" wojak
      eyeExpression = `
        <circle cx="45" cy="50" r="3" fill="#000000"/>
        <circle cx="75" cy="50" r="3" fill="#000000"/>
        <ellipse cx="45" cy="48" rx="4" ry="2" fill="none" stroke="#000" stroke-width="0.5"/>
        <ellipse cx="75" cy="48" rx="4" ry="2" fill="none" stroke="#000" stroke-width="0.5"/>
      `;
      mouthExpression = `<path d="M50 70 Q60 65 70 70" stroke="#000" stroke-width="2" fill="none"/>`;
      extraElements = `
        <path d="M40 40 Q50 35 60 40" stroke="#87CEEB" stroke-width="1" opacity="0.6"/>
      `;
      break;

    case 'neutral':
      // Original sad wojak - the classic
      eyeExpression = `
        <circle cx="45" cy="52" r="3" fill="#000000"/>
        <circle cx="75" cy="52" r="3" fill="#000000"/>
        <path d="M42 55 Q45 58 48 55" stroke="#000" stroke-width="0.5" fill="none"/>
        <path d="M72 55 Q75 58 78 55" stroke="#000" stroke-width="0.5" fill="none"/>
      `;
      mouthExpression = `<path d="M52 75 Q60 80 68 75" stroke="#000" stroke-width="2" fill="none"/>`;
      break;

    case 'coping':
      // Sweating, stressed wojak
      eyeExpression = `
        <ellipse cx="45" cy="52" rx="4" ry="3" fill="#000000"/>
        <ellipse cx="75" cy="52" rx="4" ry="3" fill="#000000"/>
        <path d="M41 49 Q45 46 49 49" stroke="#000" stroke-width="1" fill="none"/>
        <path d="M71 49 Q75 46 79 49" stroke="#000" stroke-width="1" fill="none"/>
      `;
      mouthExpression = `<path d="M48 78 Q60 85 72 78" stroke="#000" stroke-width="2" fill="none"/>`;
      // Sweat drops
      extraElements = `
        <ellipse cx="35" cy="40" rx="2" ry="4" fill="#87CEEB" opacity="0.8">
          <animate attributeName="cy" values="40;50;40" dur="2s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="85" cy="38" rx="1.5" ry="3" fill="#87CEEB" opacity="0.6">
          <animate attributeName="cy" values="38;48;38" dur="1.8s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="28" cy="45" rx="1" ry="2" fill="#87CEEB" opacity="0.7">
          <animate attributeName="cy" values="45;55;45" dur="2.2s" repeatCount="indefinite"/>
        </ellipse>
      `;
      break;

    case 'crying':
      // Crying wojak with tears - the ultimate rekt expression
      eyeExpression = `
        <circle cx="45" cy="54" r="3" fill="#000000"/>
        <circle cx="75" cy="54" r="3" fill="#000000"/>
        <path d="M42 58 Q45 62 48 58" stroke="#000" stroke-width="1" fill="none"/>
        <path d="M72 58 Q75 62 78 58" stroke="#000" stroke-width="1" fill="none"/>
      `;
      mouthExpression = `<ellipse cx="60" cy="82" rx="8" ry="4" fill="none" stroke="#000" stroke-width="2"/>`;
      // Animated tears
      extraElements = `
        <path d="M45 58 Q42 70 40 85" stroke="#87CEEB" stroke-width="2" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1s" repeatCount="indefinite"/>
        </path>
        <path d="M75 58 Q78 70 80 85" stroke="#87CEEB" stroke-width="2" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.2s" repeatCount="indefinite"/>
        </path>
        <circle cx="38" cy="85" r="2" fill="#87CEEB" opacity="0.8"/>
        <circle cx="82" cy="85" r="2" fill="#87CEEB" opacity="0.8"/>
        <circle cx="35" cy="90" r="1" fill="#87CEEB" opacity="0.6"/>
        <circle cx="85" cy="90" r="1" fill="#87CEEB" opacity="0.6"/>
      `;
      break;

    case 'god':
      // Ultimate godmode wojak for 10+ streaks
      eyeExpression = `
        <circle cx="45" cy="48" r="2" fill="#FFD700"/>
        <circle cx="75" cy="48" r="2" fill="#FFD700"/>
        <circle cx="45" cy="48" r="4" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
        <circle cx="75" cy="48" r="4" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
      `;
      mouthExpression = `<path d="M48 68 Q60 62 72 68" stroke="#FFD700" stroke-width="3" fill="none"/>`;
      accessories = `
        <path d="M60 20 L55 35 L65 35 Z" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
        <circle cx="60" cy="25" r="3" fill="#FFD700"/>
        <path d="M25 30 Q60 25 95 30" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
      `;
      specialEffects = `
        <circle cx="20" cy="20" r="2" fill="#FFD700" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="25" r="2" fill="#FFD700" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="15" r="1" fill="#FFD700" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="90" cy="15" r="1" fill="#FFD700" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      `;
      break;

    case 'diamond':
      // Diamond hands wojak for 7+ streaks
      eyeExpression = `
        <circle cx="45" cy="50" r="2.5" fill="#00D4AA"/>
        <circle cx="75" cy="50" r="2.5" fill="#00D4AA"/>
        <polygon points="45,47 42,50 45,53 48,50" fill="#FFFFFF" opacity="0.8"/>
        <polygon points="75,47 72,50 75,53 78,50" fill="#FFFFFF" opacity="0.8"/>
      `;
      mouthExpression = `<path d="M50 70 Q60 66 70 70" stroke="#00D4AA" stroke-width="2" fill="none"/>`;
      accessories = `
        <polygon points="35,40 38,45 41,40 38,35" fill="#00D4AA" opacity="0.8"/>
        <polygon points="79,40 82,45 85,40 82,35" fill="#00D4AA" opacity="0.8"/>
      `;
      specialEffects = `
        <polygon points="25,25 27,28 29,25 27,22" fill="#00D4AA" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
        </polygon>
        <polygon points="91,28 93,31 95,28 93,25" fill="#00D4AA" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite"/>
        </polygon>
      `;
      break;

    case 'whale':
      // Whale wojak for massive wins
      eyeExpression = `
        <circle cx="45" cy="50" r="3" fill="#4A9EFF"/>
        <circle cx="75" cy="50" r="3" fill="#4A9EFF"/>
        <circle cx="46" cy="48" r="1" fill="#FFFFFF"/>
        <circle cx="76" cy="48" r="1" fill="#FFFFFF"/>
      `;
      mouthExpression = `<path d="M46 70 Q60 64 74 70" stroke="#4A9EFF" stroke-width="3" fill="none"/>`;
      accessories = `
        <path d="M30 35 Q40 25 50 35 Q60 25 70 35 Q80 25 90 35" stroke="#4A9EFF" stroke-width="2" fill="none" opacity="0.6"/>
      `;
      specialEffects = `
        <circle cx="25" cy="30" r="2" fill="#4A9EFF" opacity="0.7">
          <animate attributeName="cy" values="30;25;30" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="95" cy="32" r="1.5" fill="#4A9EFF" opacity="0.6">
          <animate attributeName="cy" values="32;27;32" dur="2.2s" repeatCount="indefinite"/>
        </circle>
      `;
      break;
  }

  const svg = `
    <svg width="${baseWojak.width}" height="${baseWojak.height}" viewBox="0 0 ${baseWojak.width} ${baseWojak.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Head shape (balding wojak characteristic) -->
      <ellipse cx="60" cy="70" rx="35" ry="42" fill="${baseWojak.skinColor}" stroke="${baseWojak.strokeColor}" stroke-width="1"/>
      
      <!-- Hair on sides and back (balding pattern) -->
      <path d="M25 55 Q20 45 30 40 Q40 35 50 45" fill="${baseWojak.hairColor}" opacity="0.8"/>
      <path d="M95 55 Q100 45 90 40 Q80 35 70 45" fill="${baseWojak.hairColor}" opacity="0.8"/>
      <path d="M30 90 Q25 100 35 105 Q45 110 55 100" fill="${baseWojak.hairColor}" opacity="0.7"/>
      <path d="M90 90 Q95 100 85 105 Q75 110 65 100" fill="${baseWojak.hairColor}" opacity="0.7"/>
      
      <!-- Large nose (wojak characteristic) -->
      <ellipse cx="60" cy="62" rx="6" ry="10" fill="#e6a89a" stroke="${baseWojak.strokeColor}" stroke-width="0.5"/>
      <ellipse cx="58" cy="60" rx="1" ry="2" fill="#d4a574" opacity="0.6"/>
      <ellipse cx="62" cy="60" rx="1" ry="2" fill="#d4a574" opacity="0.6"/>
      
      <!-- Eyes -->
      ${eyeExpression}
      
      <!-- Mouth -->
      ${mouthExpression}
      
      <!-- Extra mood elements -->
      ${extraElements}
      
      <!-- Accessories -->
      ${accessories}
      
      <!-- Special effects -->
      ${specialEffects}
      
      <!-- Face outline -->
      <ellipse cx="60" cy="70" rx="35" ry="42" fill="none" stroke="${baseWojak.strokeColor}" stroke-width="0.8" opacity="0.6"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getWojakConfiguration(mood: WojakMood): WojakConfig {
  const config: Record<WojakMood, WojakConfig> = {
    chad: {
      imageSrc: generateAuthenticWojakSVG('chad'),
      altText: 'Chad Wojak - Confident and Based',
      mood: 'chad',
      message: 'ABSOLUTELY BASED ANON! 🚀',
      celebration: 'rocket'
    },
    comfy: {
      imageSrc: generateAuthenticWojakSVG('comfy'),
      altText: 'Comfy Wojak - Feels Good Man',
      mood: 'comfy',
      message: 'Feeling comfy anon 😊',
      celebration: 'sparkles'
    },
    neutral: {
      imageSrc: generateAuthenticWojakSVG('neutral'),
      altText: 'Neutral Wojak - Classic Sad',
      mood: 'neutral',
      message: 'Staying neutral... for now',
      celebration: undefined
    },
    coping: {
      imageSrc: generateAuthenticWojakSVG('coping'),
      altText: 'Coping Wojak - Sweating and Stressed',
      mood: 'coping',
      message: 'Diamond hands anon... diamond hands 💎',
      celebration: undefined
    },
    crying: {
      imageSrc: generateAuthenticWojakSVG('crying'),
      altText: 'Crying Wojak - Absolutely Rekt',
      mood: 'crying',
      message: 'JUST... why anon... why... 😭',
      celebration: undefined
    },
    god: {
      imageSrc: generateAuthenticWojakSVG('god'),
      altText: 'God Wojak - Ultimate Legendary Status',
      mood: 'god',
      message: 'GODMODE ACTIVATED! ANON IS UNSTOPPABLE! 👑',
      celebration: 'crown'
    },
    diamond: {
      imageSrc: generateAuthenticWojakSVG('diamond'),
      altText: 'Diamond Wojak - Diamond Hands Legend',
      mood: 'diamond',
      message: 'DIAMOND HANDS LEGENDARY! 💎💎💎',
      celebration: 'diamond'
    },
    whale: {
      imageSrc: generateAuthenticWojakSVG('whale'),
      altText: 'Whale Wojak - Massive Win Status',
      mood: 'whale',
      message: 'WHALE STATUS ACHIEVED! 🐋',
      celebration: 'whale'
    }
  };

  return config[mood];
}

// Determine wojak mood based on P&L and special conditions
export function determineWojakMood(pnl: number, streak: number, lastWinAmount?: number): WojakMood {
  // Special conditions first
  if (streak >= 10) return 'god';
  if (streak >= 7) return 'diamond';
  if (lastWinAmount && lastWinAmount >= 500) return 'whale';
  
  // P&L based moods
  if (pnl >= 100) return 'chad';
  if (pnl > 0) return 'comfy';
  if (pnl >= -1) return 'neutral';
  if (pnl >= -50) return 'coping';
  return 'crying';
}

// Preload all wojak images for smooth transitions
export function preloadWojakImages(): Promise<void[]> {
  const moods: WojakMood[] = ['chad', 'comfy', 'neutral', 'coping', 'crying', 'god', 'diamond', 'whale'];
  
  const promises = moods.map(mood => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load ${mood} wojak`));
      img.src = generateAuthenticWojakSVG(mood);
    });
  });

  return Promise.all(promises);
}