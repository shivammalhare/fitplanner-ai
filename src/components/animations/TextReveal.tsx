import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface TextRevealProps {
  children: string;
  delay?: number;
  className?: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({ 
  children, 
  delay = 0, 
  className = "" 
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const chars = textRef.current.querySelectorAll('.char');
    
    gsap.fromTo(chars, 
      { 
        opacity: 0, 
        y: 50,
        rotateZ: -10 
      },
      { 
        opacity: 1, 
        y: 0, 
        rotateZ: 0,
        duration: 0.8, 
        stagger: 0.05,
        delay: delay,
        ease: "back.out(1.7)"
      }
    );
  }, [delay]);

  return (
    <div ref={textRef} className={className}>
      {children.split('').map((char, i) => (
        <span 
          key={i} 
          className="char inline-block"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};
