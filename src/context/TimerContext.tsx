
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define interfaces for our data
export interface User {
  id: string;
  name: string;
}

export interface TimerData {
  userId: string;
  userName: string;
  startTime: number; // unix timestamp
  duration: number; // in minutes
  endTime: number; // unix timestamp
  remainingTime?: number; // calculated remaining time
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

// Sample user data - can be replaced with dynamic data later
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

// Local storage keys
const LOCAL_STORAGE_KEY = 'workshop-timer-data';
const TIMERS_STORAGE_KEY = 'workshop-all-timers';
const MODE_STORAGE_KEY = 'workshop-timer-mode';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(defaultUsers);
  const [activeTimer, setActiveTimerState] = useState<TimerData | null>(null);
  const [activeTimers, setActiveTimers] = useState<TimerData[]>([]);
  const [isMonitorMode, setIsMonitorMode] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Load timer data from localStorage on mount
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

    // Load all timers
    const storedAllTimers = localStorage.getItem(TIMERS_STORAGE_KEY);
    if (storedAllTimers) {
      try {
        const parsedTimers = JSON.parse(storedAllTimers) as TimerData[];
        setActiveTimers(parsedTimers);
      } catch (error) {
        console.error('Error parsing all timers data:', error);
      }
    }

    // Check if device is in monitor mode
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (storedMode) {
      setIsMonitorMode(storedMode === 'true');
    }
  }, []);

  // Update timer data in localStorage
  const setActiveTimer = (timer: TimerData | null) => {
    setActiveTimerState(timer);
    
    if (timer) {
      // Store the current timer
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timer));
      
      // Add or update in activeTimers array
      setActiveTimers(prev => {
        // Remove any existing timer with the same userId
        const filteredTimers = prev.filter(t => t.userId !== timer.userId);
        // Add the new timer
        return [...filteredTimers, timer];
      });
      
      // Store updated timers array
      localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify([...activeTimers.filter(t => t.userId !== timer.userId), timer]));
      
      // Show only a single toast at the bottom left
      toast(`${timer.duration} Minuten wurden gesetzt für ${timer.userName}`, {
        position: "bottom-left",
        duration: 3000
      });
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Remove a timer by userId
  const removeTimer = (userId: string) => {
    // Remove from activeTimers
    const updatedTimers = activeTimers.filter(timer => timer.userId !== userId);
    setActiveTimers(updatedTimers);
    
    // Update localStorage
    localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(updatedTimers));
    
    // Update activeTimer if it's the current one
    if (activeTimer && activeTimer.userId === userId) {
      setActiveTimerState(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Toggle between user and monitor mode
  const toggleMode = () => {
    const newMode = !isMonitorMode;
    setIsMonitorMode(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, String(newMode));
  };

  // Calculate and update remaining time every second
  useEffect(() => {
    if (!activeTimer) {
      setRemainingTime(null);
      return;
    }

    const updateRemainingTime = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, activeTimer.endTime - now);
      setRemainingTime(timeLeft);

      // Update activeTimers with current time
      setActiveTimers(prevTimers => {
        return prevTimers.map(timer => {
          const timerTimeLeft = Math.max(0, timer.endTime - now);
          return {
            ...timer,
            remainingTime: timerTimeLeft
          };
        }).filter(timer => timer.remainingTime > 0);
      });

      // Clear timer if it has ended
      if (timeLeft <= 0) {
        removeTimer(activeTimer.userId);
      }
    };

    // Update immediately
    updateRemainingTime();

    // Then update every second
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Add event listeners for storage changes (cross-tab sync)
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

// Create a hook for using the context
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
