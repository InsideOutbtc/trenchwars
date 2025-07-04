'use client';

import { useEffect } from 'react';

export default function ChaosEffects() {
  useEffect(() => {
    // Screen shake function
    const triggerScreenShake = () => {
      document.body.style.animation = 'screenShake 0.5s ease-in-out';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    };

    // Random screen shake
    const shakeInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        triggerScreenShake();
      }
    }, 5000);

    // Add click handlers for chaos interactions
    const buttons = document.querySelectorAll('.btn-send-it, .pepe-bet, .shib-bet');
    buttons.forEach(button => {
      button.addEventListener('click', triggerScreenShake);
    });

    // Glitch text randomly
    const glitchElements = document.querySelectorAll('.glitch-text');
    const glitchInterval = setInterval(() => {
      glitchElements.forEach(element => {
        if (Math.random() < 0.3) {
          element.classList.add('glitch-corruption');
          setTimeout(() => {
            element.classList.remove('glitch-corruption');
          }, 200);
        }
      });
    }, 3000);

    // Add corruption effects to battle cards
    const cards = document.querySelectorAll('.battle-card');
    const corruptionInterval = setInterval(() => {
      cards.forEach(card => {
        if (Math.random() < 0.2) {
          card.classList.add('corruption-border');
          setTimeout(() => {
            card.classList.remove('corruption-border');
          }, 1000);
        }
      });
    }, 4000);

    return () => {
      clearInterval(shakeInterval);
      clearInterval(glitchInterval);
      clearInterval(corruptionInterval);
    };
  }, []);

  return null; // This component only adds effects, no UI
}