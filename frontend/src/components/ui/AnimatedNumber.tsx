import React, { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number | string;
  duration?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 600,
  className = '',
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const isNumeric = !isNaN(numericValue) && isFinite(numericValue);

  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (!isNumeric) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(numericValue);
      return;
    }

    let startTimestamp: number | null = null;
    const initialValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(initialValue + (numericValue - initialValue) * easeOut);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(numericValue);
      }
    };

    const animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue, duration, isNumeric]);

  if (!isNumeric) {
    return <span className={className}>{value}</span>;
  }

  return <span className={className}>{displayValue.toLocaleString()}</span>;
};
