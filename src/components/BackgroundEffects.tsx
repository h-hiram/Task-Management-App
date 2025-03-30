
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const BackgroundEffects: React.FC = () => {
  const isMobile = useIsMobile();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState(0);

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate parallax effect
  const getParallaxStyle = (speed: number) => {
    if (isMobile) return {}; // Disable parallax on mobile for better performance
    
    const x = (mousePos.x - window.innerWidth / 2) * speed;
    const y = (mousePos.y - window.innerHeight / 2) * speed;
    
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };

  return (
    <>
      {/* Main background bubbles */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="floating-bubble bubble-1" style={getParallaxStyle(0.01)}></div>
        <div className="floating-bubble bubble-2" style={getParallaxStyle(0.02)}></div>
        <div className="floating-bubble bubble-3" style={getParallaxStyle(0.015)}></div>
        <div className="floating-bubble bubble-4" style={getParallaxStyle(0.025)}></div>
        <div className="floating-bubble bubble-5" style={getParallaxStyle(0.018)}></div>
      </div>

      {/* Animated gradient overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/30"
        style={{
          opacity: 0.7,
          animation: 'rotate-bg 30s linear infinite',
        }}
      ></div>

      {/* Light beam effect */}
      <div 
        className="fixed top-0 -right-1/4 w-1/2 h-1/3 bg-gradient-radial from-blue-200/20 to-transparent rounded-full blur-3xl"
        style={{
          transform: `translateY(${scrollPos * 0.2}px)`,
          opacity: 0.6,
        }}
      ></div>
      
      <div 
        className="fixed -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-purple-200/20 to-transparent rounded-full blur-3xl"
        style={{
          transform: `translateY(${-scrollPos * 0.1}px)`,
          opacity: 0.5,
        }}
      ></div>

      {/* Additional subtle patterns */}
      {!isMobile && (
        <div className="fixed inset-0 bg-repeat opacity-30 pointer-events-none" 
          style={{
            backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\"%3E%3Ccircle cx=\"10\" cy=\"10\" r=\"1\" fill=\"rgba(255,255,255,0.2)\"%2F%3E%3C/svg%3E')"
          }}
        ></div>
      )}
    </>
  );
};

export default BackgroundEffects;
