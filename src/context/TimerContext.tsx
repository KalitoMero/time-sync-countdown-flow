
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
}

interface TimerContextType {
  users: User[];
  activeTimer: TimerData | null;
  setActiveTimer: (timer: TimerData | null) => void;
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

// Local storage key
const LOCAL_STORAGE_KEY = 'workshop-timer-data';
const MODE_STORAGE_KEY = 'workshop-timer-mode';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(defaultUsers);
  const [activeTimer, setActiveTimerState] = useState<TimerData | null>(null);
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timer));
      toast(`${timer.duration} Minuten wurden gesetzt für ${timer.userName}`, {
        position: "bottom-left",
        duration: 3000
      });
    } else {
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

      // Clear timer if it has ended
      if (timeLeft <= 0) {
        setActiveTimer(null);
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
            toast.info(`Timer updated`, {
              description: `${parsedData.userName}: ${parsedData.duration} minutes`,
            });
          } catch (error) {
            console.error('Error parsing stored timer data from event:', error);
          }
        } else {
          setActiveTimerState(null);
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
        setActiveTimer, 
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
