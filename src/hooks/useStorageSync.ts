
import { useEffect } from 'react';
import { TimerData } from '@/context/TimerContext';
import { toast } from 'sonner';

const LOCAL_STORAGE_KEY = 'workshop-timer-data';
const TIMERS_STORAGE_KEY = 'workshop-all-timers';
const MODE_STORAGE_KEY = 'workshop-timer-mode';

export const useStorageSync = (
  setActiveTimerState: (timer: TimerData | null) => void,
  setActiveTimers: React.Dispatch<React.SetStateAction<TimerData[]>>,
  setIsMonitorMode: React.Dispatch<React.SetStateAction<boolean>>
) => {
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
  }, [setActiveTimerState, setActiveTimers, setIsMonitorMode]);

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
  }, [setActiveTimerState, setActiveTimers]);
};
