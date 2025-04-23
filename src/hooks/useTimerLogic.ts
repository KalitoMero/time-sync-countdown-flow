
import { useState, useEffect } from 'react';
import { TimerData } from '@/context/TimerContext';

export const useTimerLogic = (activeTimer: TimerData | null) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (!activeTimer) {
      setRemainingTime(null);
      return;
    }

    const updateRemainingTime = () => {
      const now = Date.now();
      
      if (activeTimer.isMorgenVor8) {
        return;
      }

      const timeLeft = Math.max(0, activeTimer.endTime - now);
      setRemainingTime(timeLeft);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  return { remainingTime };
};
