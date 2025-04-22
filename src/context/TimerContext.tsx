import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
}

export interface TimerData {
  userId: string;
  userName: string;
  startTime: number;
  duration: number;
  endTime: number;
  remainingTime?: number;
  isMorgenVor8?: boolean;
}

interface TimerContextType {
  users: User[];
  activeTimer: TimerData | null;
  activeTimers: TimerData[];
  setActiveTimer: (timer: TimerData | null) => void;
  removeTimer: (userId: string) => void;
  isMonitorMode: boolean;
  toggleMode: () => void;
  remainingTime: number | null;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const defaultUsers: User[] = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Emma Johnson' },
  { id: '3', name: 'Michael Brown' },
  { id: '4', name: 'Sarah Davis' },
  { id: '5', name: 'Robert Wilson' },
  { id: '6', name: 'Jennifer Taylor' },
  { id: '7', name: 'David Martinez' },
  { id: '8', name: 'Lisa Anderson' },
];

const LOCAL_STORAGE_KEY = 'workshop-timer-data';
const TIMERS_STORAGE_KEY = 'workshop-all-timers';
const MODE_STORAGE_KEY = 'workshop-timer-mode';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(defaultUsers);
  const [activeTimer, setActiveTimerState] = useState<TimerData | null>(null);
  const [activeTimers, setActiveTimers] = useState<TimerData[]>([]);
  const [isMonitorMode, setIsMonitorMode] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    const storedTimerData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTimerData) {
      try {
        const parsedData = JSON.parse(storedTimerData) as TimerData;
        setActiveTimerState(parsedData);
      } catch (error) {
        console.error('Error parsing stored timer data:', error);
      }
    }

    const storedAllTimers = localStorage.getItem(TIMERS_STORAGE_KEY);
    if (storedAllTimers) {
      try {
        const parsedTimers = JSON.parse(storedAllTimers) as TimerData[];
        setActiveTimers(parsedTimers);
      } catch (error) {
        console.error('Error parsing all timers data:', error);
      }
    }

    const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (storedMode) {
      setIsMonitorMode(storedMode === 'true');
    }
  }, []);

  const setActiveTimer = (timer: TimerData | null) => {
    setActiveTimerState(timer);
    
    if (timer) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timer));
      
      setActiveTimers(prev => {
        const filteredTimers = prev.filter(t => t.userId !== timer.userId);
        return [...filteredTimers, timer];
      });
      
      localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify([...activeTimers.filter(t => t.userId !== timer.userId), timer]));
      
      const message = timer.isMorgenVor8 
        ? `Timer für ${timer.userName} wurde auf "morgen vor 8 Uhr" gesetzt`
        : `${timer.duration} Minuten wurden gesetzt für ${timer.userName}`;
      
      toast(message, {
        position: "bottom-left",
        duration: 3000
      });
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const removeTimer = (userId: string) => {
    const updatedTimers = activeTimers.filter(timer => timer.userId !== userId);
    setActiveTimers(updatedTimers);
    
    localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(updatedTimers));
    
    if (activeTimer && activeTimer.userId === userId) {
      setActiveTimerState(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const toggleMode = () => {
    const newMode = !isMonitorMode;
    setIsMonitorMode(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, String(newMode));
  };

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

      setActiveTimers(prevTimers => {
        return prevTimers.map(timer => {
          if (timer.isMorgenVor8) {
            return timer;
          }
          const timerTimeLeft = Math.max(0, timer.endTime - now);
          return {
            ...timer,
            remainingTime: timerTimeLeft
          };
        });
      });
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsedData = JSON.parse(e.newValue) as TimerData;
            setActiveTimerState(parsedData);
          } catch (error) {
            console.error('Error parsing stored timer data from event:', error);
          }
        } else {
          setActiveTimerState(null);
        }
      } else if (e.key === TIMERS_STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsedTimers = JSON.parse(e.newValue) as TimerData[];
            setActiveTimers(parsedTimers);
          } catch (error) {
            console.error('Error parsing all timers data from event:', error);
          }
        } else {
          setActiveTimers([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <TimerContext.Provider 
      value={{ 
        users, 
        activeTimer,
        activeTimers,
        setActiveTimer,
        removeTimer,
        isMonitorMode,
        toggleMode,
        remainingTime
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
