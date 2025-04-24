
import { useState, useEffect } from 'react';

interface CountdownProps {
  startTime: string;
  durationMinutes: number;
}

export const useCountdown = ({ startTime, durationMinutes }: CountdownProps) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateRemaining = () => {
      const start = new Date(startTime).getTime();
      const end = start + (durationMinutes * 60 * 1000);
      const now = Date.now();
      const remaining = end - now;
      
      setRemainingTime(remaining);
      setIsExpired(remaining <= 0);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationMinutes]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    remainingTime,
    isExpired,
    formattedTime: remainingTime !== null ? formatTime(remainingTime) : "--:--",
    isUnderTenMinutes: remainingTime !== null && remainingTime < 600000
  };
};
