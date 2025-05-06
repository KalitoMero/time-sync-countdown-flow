
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('timer')
        .select('*')
        .in('status', ['aktiv', 'abgelaufen'])
        .order('created_at');

      if (error) {
        toast.error('Fehler beim Laden der Timer');
        throw error;
      }

      return data || [];
    },
  });

  const getTimerById = async (id: string) => {
    const { data, error } = await supabase
      .from('timer')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Fehler beim Laden des Timers');
      throw error;
    }

    return data;
  };

  const createTimer = useMutation({
    mutationFn: async ({ mitarbeiter, dauer_min, special_case }: CreateTimerParams) => {
      const { data, error } = await supabase
        .from('timer')
        .insert([{
          mitarbeiter,
          dauer_min,
          special_case,
          status: 'aktiv'
        }])
        .select();

      if (error) {
        toast.error('Fehler beim Erstellen des Timers');
        throw error;
      }
      
      if (data && data[0]) {
        // Create a properly formatted timer object for the context
        const newTimer = {
          userId: data[0].id,
          userName: mitarbeiter,
          startTime: Date.now(),
          duration: dauer_min || 0,
          endTime: Date.now() + (dauer_min || 0) * 60 * 1000,
          isMorgenVor8: special_case === 'morgen vor 8'
        };
        
        // Update the active timer in context
        setActiveTimer(newTimer);
        
        toast.success('Timer wurde erstellt');
        return data[0];
      }
      
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timers'] });
    },
  });

  const completeTimer = useMutation({
    mutationFn: async (id: string) => {
      // Update timer status and set confirmed_at to current timestamp
      const now = new Date();
      console.log(`Completing timer ${id} at ${now.toISOString()}`);
      
      const { error } = await supabase
        .from('timer')
        .update({ 
          status: 'beendet',
          confirmed_at: now.toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error completing timer:', error);
        toast.error('Fehler beim Beenden des Timers');
        throw error;
      }
      toast.success('Timer wurde beendet');
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
