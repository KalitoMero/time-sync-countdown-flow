
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postgres } from '@/integrations/postgres/client';
import { toast } from 'sonner';
import { useTimer } from '@/context/TimerContext';

interface CreateTimerParams {
  mitarbeiter: string;
  dauer_min?: number;
  special_case?: string;
}

export const useTimers = () => {
  const queryClient = useQueryClient();
  const { setActiveTimer } = useTimer();

  const { data: activeTimers = [], isLoading } = useQuery({
    queryKey: ['active-timers'],
    queryFn: async () => {
      try {
        const result = await postgres
          .from('timer')
          .select('*')
          .in('status', ['aktiv', 'abgelaufen'])
          .order('created_at')
          .execute();

        return result.rows || [];
      } catch (error) {
        toast.error('Fehler beim Laden der Timer');
        console.error('Error loading timers:', error);
        throw error;
      }
    },
  });

  const getTimerById = async (id: string) => {
    try {
      const result = await postgres
        .from('timer')
        .select('*')
        .eq('id', id)
        .execute();

      if (result.rows && result.rows.length > 0) {
        return result.rows[0];
      } else {
        toast.error('Timer nicht gefunden');
        throw new Error('Timer not found');
      }
    } catch (error) {
      toast.error('Fehler beim Laden des Timers');
      console.error('Error loading timer:', error);
      throw error;
    }
  };

  const createTimer = useMutation({
    mutationFn: async ({ mitarbeiter, dauer_min, special_case }: CreateTimerParams) => {
      try {
        const result = await postgres
          .from('timer')
          .insert([{
            mitarbeiter,
            dauer_min,
            special_case,
            status: 'aktiv'
          }])
          .execute();

        if (result.rows && result.rows.length > 0) {
          const newTimer = {
            userId: result.rows[0].id,
            userName: mitarbeiter,
            startTime: Date.now(),
            duration: dauer_min || 0,
            endTime: Date.now() + (dauer_min || 0) * 60 * 1000,
            isMorgenVor8: special_case === 'morgen vor 8'
          };

          setActiveTimer(newTimer);
          toast.success('Timer wurde erstellt');
          return result.rows[0];
        }

        return null;
      } catch (error) {
        toast.error('Fehler beim Erstellen des Timers');
        console.error('Error creating timer:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timers'] });
    },
  });

  const completeTimer = useMutation({
    mutationFn: async (id: string) => {
      try {
        const now = new Date();
        console.log(`Completing timer ${id} at ${now.toISOString()}`);

        await postgres
          .from('timer')
          .update({
            status: 'beendet',
            confirmed_at: now.toISOString()
          })
          .eq('id', id)
          .execute();

        toast.success('Timer wurde beendet');
      } catch (error) {
        console.error('Error completing timer:', error);
        toast.error('Fehler beim Beenden des Timers');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timers'] });
    },
  });

  return {
    activeTimers,
    isLoading,
    createTimer,
    completeTimer,
    getTimerById
  };
};
