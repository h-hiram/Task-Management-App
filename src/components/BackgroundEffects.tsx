
import React, { useEffect } from 'react';

const BackgroundEffects: React.FC = () => {
  useEffect(() => {
    // Create floating bubbles
    const bubbles = [];
    for (let i = 0; i < 3; i++) {
      const bubble = document.createElement('div');
      bubble.className = `floating-bubble bubble-${i + 1}`;
      document.body.appendChild(bubble);
      bubbles.push(bubble);
    }

    return () => {
      // Clean up
      bubbles.forEach(bubble => {
        if (bubble.parentNode) {
          bubble.parentNode.removeChild(bubble);
        }
      });
    };
  }, []);

  return null; // Component doesn't render anything visible directly
};

export default BackgroundEffects;
