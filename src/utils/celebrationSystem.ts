// TrenchWars Celebration System - World-Class Animations
// Particle effects, confetti, and visual celebrations for achievements

export type CelebrationType = 'fire' | 'rocket' | 'diamond' | 'crown' | 'whale' | 'sparkles' | 'explosion';

interface ParticleConfig {
  count: number;
  colors: string[];
  shapes: string[];
  duration: number;
  size: { min: number; max: number };
  velocity: { min: number; max: number };
  gravity: number;
  spread: number;
}

interface CelebrationConfig {
  particles: ParticleConfig;
  screenEffect?: {
    type: 'flash' | 'shake' | 'glow';
    duration: number;
    intensity: number;
  };
  sound?: string;
  message?: string;
}

const CELEBRATION_CONFIGS: Record<CelebrationType, CelebrationConfig> = {
  fire: {
    particles: {
      count: 30,
      colors: ['#FF6B6B', '#FF8E53', '#FFD93D', '#FF4757'],
      shapes: ['🔥', '💥', '⭐'],
      duration: 3000,
      size: { min: 12, max: 24 },
      velocity: { min: 5, max: 15 },
      gravity: 0.3,
      spread: 120
    },
    screenEffect: {
      type: 'flash',
      duration: 200,
      intensity: 0.3
    },
    message: 'HOT STREAK! 🔥🔥🔥'
  },
  rocket: {
    particles: {
      count: 40,
      colors: ['#4A9EFF', '#00D4AA', '#FFFFFF', '#FFD93D'],
      shapes: ['🚀', '⭐', '✨', '💫'],
      duration: 4000,
      size: { min: 8, max: 20 },
      velocity: { min: 8, max: 20 },
      gravity: 0.2,
      spread: 90
    },
    screenEffect: {
      type: 'shake',
      duration: 500,
      intensity: 8
    },
    message: 'ABSOLUTELY BASED! 🚀'
  },
  diamond: {
    particles: {
      count: 25,
      colors: ['#00D4AA', '#4ECDC4', '#45B7D1', '#96CEB4'],
      shapes: ['💎', '✨', '⭐', '🌟'],
      duration: 5000,
      size: { min: 10, max: 18 },
      velocity: { min: 3, max: 12 },
      gravity: 0.1,
      spread: 180
    },
    screenEffect: {
      type: 'glow',
      duration: 1000,
      intensity: 0.4
    },
    message: 'DIAMOND HANDS! 💎💎💎'
  },
  crown: {
    particles: {
      count: 50,
      colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFE135'],
      shapes: ['👑', '⭐', '✨', '🌟', '💫'],
      duration: 6000,
      size: { min: 14, max: 28 },
      velocity: { min: 10, max: 25 },
      gravity: 0.2,
      spread: 160
    },
    screenEffect: {
      type: 'flash',
      duration: 800,
      intensity: 0.5
    },
    message: 'GODMODE ACTIVATED! 👑'
  },
  whale: {
    particles: {
      count: 35,
      colors: ['#4A9EFF', '#74B9FF', '#0984E3', '#6C5CE7'],
      shapes: ['🐋', '🌊', '💧', '✨'],
      duration: 4500,
      size: { min: 16, max: 32 },
      velocity: { min: 6, max: 18 },
      gravity: 0.25,
      spread: 140
    },
    screenEffect: {
      type: 'glow',
      duration: 1200,
      intensity: 0.3
    },
    message: 'WHALE STATUS! 🐋'
  },
  sparkles: {
    particles: {
      count: 20,
      colors: ['#FFFFFF', '#FFD93D', '#4A9EFF', '#00D4AA'],
      shapes: ['✨', '⭐', '🌟', '💫'],
      duration: 2500,
      size: { min: 6, max: 16 },
      velocity: { min: 4, max: 10 },
      gravity: 0.15,
      spread: 100
    },
    message: 'Nice work anon! ✨'
  },
  explosion: {
    particles: {
      count: 60,
      colors: ['#FF6B6B', '#FFD93D', '#4A9EFF', '#00D4AA', '#FFFFFF'],
      shapes: ['💥', '⭐', '✨', '🔥', '💫'],
      duration: 3500,
      size: { min: 10, max: 24 },
      velocity: { min: 12, max: 30 },
      gravity: 0.4,
      spread: 180
    },
    screenEffect: {
      type: 'shake',
      duration: 800,
      intensity: 12
    },
    message: 'EXPLOSIVE WIN! 💥'
  }
};

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: string;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

class CelebrationSystem {
  private static instance: CelebrationSystem;
  private particles: Particle[] = [];
  private animationFrame: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isInitialized = false;

  static getInstance(): CelebrationSystem {
    if (!CelebrationSystem.instance) {
      CelebrationSystem.instance = new CelebrationSystem();
    }
    return CelebrationSystem.instance;
  }

  private initialize(): void {
    if (this.isInitialized) return;

    // Create celebration canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'celebration-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.isInitialized = true;
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Main celebration trigger
  triggerCelebration(type: CelebrationType, originX?: number, originY?: number): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    const config = CELEBRATION_CONFIGS[type];
    
    // Default origin to center of screen
    const x = originX ?? window.innerWidth / 2;
    const y = originY ?? window.innerHeight / 2;

    // Create particles
    this.createParticles(config.particles, x, y);

    // Apply screen effects
    if (config.screenEffect) {
      this.applyScreenEffect(config.screenEffect);
    }

    // Show celebration message
    if (config.message) {
      this.showCelebrationMessage(config.message, type);
    }

    // Start animation loop if not already running
    if (!this.animationFrame) {
      this.startAnimation();
    }

    // Analytics event
    this.trackCelebration(type);
  }

  private createParticles(config: ParticleConfig, originX: number, originY: number): void {
    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count + (Math.random() - 0.5) * (config.spread * Math.PI / 180);
      const velocity = config.velocity.min + Math.random() * (config.velocity.max - config.velocity.min);
      
      const particle: Particle = {
        id: `particle_${Date.now()}_${i}`,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: config.size.min + Math.random() * (config.size.max - config.size.min),
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
        life: config.duration,
        maxLife: config.duration,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      };

      this.particles.push(particle);
    }
  }

  private applyScreenEffect(effect: NonNullable<CelebrationConfig['screenEffect']>): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9998;
    `;

    switch (effect.type) {
      case 'flash':
        overlay.style.background = `rgba(255, 255, 255, ${effect.intensity})`;
        overlay.style.animation = `celebrationFlash ${effect.duration}ms ease-out`;
        break;
      
      case 'shake':
        document.body.style.animation = `celebrationShake ${effect.duration}ms ease-in-out`;
        setTimeout(() => {
          document.body.style.animation = '';
        }, effect.duration);
        break;
      
      case 'glow':
        overlay.style.background = `radial-gradient(circle, rgba(255, 215, 0, ${effect.intensity}) 0%, transparent 70%)`;
        overlay.style.animation = `celebrationGlow ${effect.duration}ms ease-in-out`;
        break;
    }

    if (effect.type !== 'shake') {
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), effect.duration);
    }
  }

  private showCelebrationMessage(message: string, type: CelebrationType): void {
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 24px;
      font-weight: 900;
      font-family: var(--font-display);
      text-align: center;
      z-index: 10000;
      border: 2px solid ${this.getTypeColor(type)};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: celebrationMessageShow 3s ease-out forwards;
    `;

    document.body.appendChild(messageEl);
    setTimeout(() => messageEl.remove(), 3000);
  }

  private getTypeColor(type: CelebrationType): string {
    const colors = {
      fire: '#FF6B6B',
      rocket: '#4A9EFF',
      diamond: '#00D4AA',
      crown: '#FFD700',
      whale: '#4A9EFF',
      sparkles: '#FFFFFF',
      explosion: '#FF6B6B'
    };
    return colors[type];
  }

  private startAnimation(): void {
    const animate = () => {
      this.updateParticles();
      this.renderParticles();

      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = null;
      }
    };

    animate();
  }

  private updateParticles(): void {
    this.particles = this.particles.filter(particle => {
      particle.life -= 16; // ~60fps
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.3; // gravity
      particle.rotation += particle.rotationSpeed;

      return particle.life > 0;
    });
  }

  private renderParticles(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      
      this.ctx!.save();
      this.ctx!.translate(particle.x, particle.y);
      this.ctx!.rotate(particle.rotation);
      this.ctx!.globalAlpha = alpha;
      
      // Use emoji/text for shapes
      this.ctx!.font = `${particle.size}px Arial`;
      this.ctx!.textAlign = 'center';
      this.ctx!.textBaseline = 'middle';
      this.ctx!.fillText(particle.shape, 0, 0);
      
      this.ctx!.restore();
    });
  }

  private trackCelebration(type: CelebrationType): void {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'celebration_triggered', {
        celebration_type: type,
        timestamp: Date.now()
      });
    }
  }

  // Special celebration sequences
  triggerStreakCelebration(streak: number): void {
    if (streak >= 15) {
      this.triggerCelebration('explosion');
    } else if (streak >= 10) {
      this.triggerCelebration('crown');
    } else if (streak >= 7) {
      this.triggerCelebration('diamond');
    } else if (streak >= 5) {
      this.triggerCelebration('rocket');
    } else if (streak >= 3) {
      this.triggerCelebration('fire');
    } else {
      this.triggerCelebration('sparkles');
    }
  }

  triggerAchievementCelebration(achievementType: string): void {
    switch (achievementType) {
      case 'WHALE_STATUS':
        this.triggerCelebration('whale');
        break;
      case 'UNSTOPPABLE_CHAD':
        this.triggerCelebration('crown');
        break;
      case 'DIAMOND_LEGEND':
        this.triggerCelebration('diamond');
        break;
      case 'BASED_ANON':
        this.triggerCelebration('rocket');
        break;
      case 'HOT_HANDS':
        this.triggerCelebration('fire');
        break;
      default:
        this.triggerCelebration('sparkles');
    }
  }

  // Clean up
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.canvas) {
      this.canvas.remove();
    }
    this.particles = [];
    this.isInitialized = false;
  }
}

// CSS animations to inject
export function injectCelebrationCSS(): void {
  if (document.getElementById('celebration-styles')) return;

  const style = document.createElement('style');
  style.id = 'celebration-styles';
  style.textContent = `
    @keyframes celebrationFlash {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }

    @keyframes celebrationShake {
      0%, 100% { transform: translateX(0); }
      10% { transform: translateX(-5px); }
      20% { transform: translateX(5px); }
      30% { transform: translateX(-5px); }
      40% { transform: translateX(5px); }
      50% { transform: translateX(-3px); }
      60% { transform: translateX(3px); }
      70% { transform: translateX(-2px); }
      80% { transform: translateX(2px); }
      90% { transform: translateX(-1px); }
    }

    @keyframes celebrationGlow {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }

    @keyframes celebrationMessageShow {
      0% { 
        opacity: 0; 
        transform: translateX(-50%) translateY(-20px) scale(0.8); 
      }
      20% { 
        opacity: 1; 
        transform: translateX(-50%) translateY(0) scale(1.1); 
      }
      30% { 
        transform: translateX(-50%) translateY(0) scale(1); 
      }
      90% { 
        opacity: 1; 
        transform: translateX(-50%) translateY(0) scale(1); 
      }
      100% { 
        opacity: 0; 
        transform: translateX(-50%) translateY(-10px) scale(0.9); 
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize CSS on module load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCelebrationCSS);
  } else {
    injectCelebrationCSS();
  }
}

// Export singleton
export const celebrationSystem = CelebrationSystem.getInstance();

// Helper functions
export function celebrateWin(amount: number, streak: number): void {
  if (amount >= 500) {
    celebrationSystem.triggerCelebration('whale');
  } else {
    celebrationSystem.triggerStreakCelebration(streak);
  }
}

export function celebrateAchievement(achievementId: string): void {
  celebrationSystem.triggerAchievementCelebration(achievementId);
}

export function celebrateCustom(type: CelebrationType, x?: number, y?: number): void {
  celebrationSystem.triggerCelebration(type, x, y);
}