
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
  
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const calculateRemaining = () => {
      if (!startTime || !durationMinutes) {
        setFormattedTime("--:--");
        return;
      }
      
      try {
        // 1. Get start time
        const start = new Date(startTime).getTime();
        
        // 2. Calculate end time
        const end = start + (durationMinutes * 60 * 1000);
        
        // 3. Calculate remaining time
        const now = Date.now();
        const remaining = Math.max(0, end - now);
        
        // Calculate progress
        const totalDuration = durationMinutes * 60 * 1000;
        const elapsed = Math.min(totalDuration, totalDuration - remaining);
        const currentProgress = Math.min(100, (elapsed / totalDuration) * 100);
        
        // Update states
        setRemainingTime(remaining);
        setIsExpired(remaining <= 0);
        setIsUnderTenMinutes(remaining > 0 && remaining < 600000);
        
        // 4. Format time as MM:SS
        // 5. Show 00:00 when expired
        setFormattedTime(remaining <= 0 ? "00:00" : formatTime(remaining));
        
        // 6. Update progress bar
        setProgress(remaining <= 0 ? 100 : currentProgress);
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
    
    // 3. Update every 1000ms
    intervalRef.current = window.setInterval(calculateRemaining, 1000);

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
