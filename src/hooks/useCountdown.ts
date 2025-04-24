
import { useState, useEffect, useRef } from 'react';

interface CountdownProps {
  startTime: string;
  durationMinutes: number;
}

export const useCountdown = ({ startTime, durationMinutes }: CountdownProps) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [formattedTime, setFormattedTime] = useState("--:--");
  const [isUnderTenMinutes, setIsUnderTenMinutes] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Use a ref to store the interval ID
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const calculateRemaining = () => {
      if (!startTime || !durationMinutes) {
        setFormattedTime("--:--");
        return;
      }
      
      try {
        const start = new Date(startTime).getTime();
        const end = start + (durationMinutes * 60 * 1000);
        const now = Date.now();
        const remaining = Math.max(0, end - now);
        const totalDuration = durationMinutes * 60 * 1000;
        const elapsed = Math.min(totalDuration, totalDuration - remaining);
        
        // Calculate progress percentage
        const currentProgress = Math.min(100, (elapsed / totalDuration) * 100);
        
        setRemainingTime(remaining);
        setIsExpired(remaining <= 0);
        setIsUnderTenMinutes(remaining > 0 && remaining < 600000);
        setFormattedTime(remaining <= 0 ? "00:00" : formatTime(remaining));
        setProgress(currentProgress);
      } catch (error) {
        console.error("Error calculating countdown:", error);
        setFormattedTime("--:--");
      }
    };

    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Initial calculation
    calculateRemaining();
    
    // Set up interval
    intervalRef.current = window.setInterval(calculateRemaining, 1000);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [startTime, durationMinutes]);

  return {
    remainingTime,
    isExpired,
    formattedTime,
    isUnderTenMinutes,
    progress
  };
};
