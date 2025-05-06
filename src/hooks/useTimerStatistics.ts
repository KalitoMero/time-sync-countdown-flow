
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface TimerData {
  id: string;
  mitarbeiter: string;
  created_at: string;
  confirmed_at: string | null;
  dauer_min: number | null;
  status: string | null;
  special_case: string | null;
}

export interface TimerStatisticsData {
  total: number;
  onTime: number;
  late: number;
  successRate: number;
}

type FilterPeriod = 'week' | 'month' | 'year' | 'all';

export const useTimerStatistics = () => {
  const fetchCompletedTimers = async () => {
    try {
      const { data, error } = await supabase
        .from('timer')
        .select('*')
        .eq('status', 'beendet')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error('Fehler beim Laden der Timer-Statistiken');
        console.error('Error fetching completed timers:', error);
        throw error;
      }
      
      return data as TimerData[] || [];
    } catch (error) {
      console.error('Error in fetchCompletedTimers:', error);
      return [];
    }
  };

  const { data: completedTimers = [], isLoading, refetch } = useQuery({
    queryKey: ['completed-timers'],
    queryFn: fetchCompletedTimers,
  });

  const filterTimersByPeriod = (period: FilterPeriod, date: Date = new Date()) => {
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
        endDate = endOfWeek(date, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case 'year':
        startDate = startOfYear(date);
        endDate = endOfYear(date);
        break;
      default:
        // 'all' - no date filtering
        return completedTimers;
    }

    return completedTimers.filter(timer => {
      const createdDate = new Date(timer.created_at);
      return createdDate >= startDate && createdDate <= endDate;
    });
  };

  const calculateStatistics = (timers: TimerData[]): TimerStatisticsData => {
    if (timers.length === 0) {
      return {
        total: 0,
        onTime: 0,
        late: 0,
        successRate: 0
      };
    }

    const total = timers.length;
    
    // Filter out timers with "morgen vor 8" special case since they don't have a set completion time
    const regularTimers = timers.filter(timer => timer.special_case !== 'morgen vor 8');
    
    if (regularTimers.length === 0) {
      return {
        total,
        onTime: 0,
        late: 0,
        successRate: 0
      };
    }

    const onTime = regularTimers.filter(timer => {
      if (!timer.confirmed_at || !timer.dauer_min) return false;
      
      const createdAt = new Date(timer.created_at).getTime();
      const confirmedAt = new Date(timer.confirmed_at).getTime();
      const targetTime = createdAt + (timer.dauer_min * 60 * 1000);
      
      return confirmedAt <= targetTime;
    }).length;

    const late = regularTimers.length - onTime;
    const successRate = regularTimers.length > 0 ? (onTime / regularTimers.length) * 100 : 0;

    return {
      total,
      onTime,
      late,
      successRate
    };
  };

  return {
    completedTimers,
    isLoading,
    refetch,
    filterTimersByPeriod,
    calculateStatistics
  };
};
