
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mitarbeiter')
        .select('*')
        .order('name');

      if (error) {
        toast.error('Fehler beim Laden der Mitarbeiter');
        throw error;
      }

      return data || [];
    },
  });

  const addEmployee = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('mitarbeiter')
        .insert([{ name }]);

      if (error) {
        toast.error('Fehler beim Hinzufügen des Mitarbeiters');
        throw error;
      }
      toast.success(`Mitarbeiter ${name} wurde hinzugefügt`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { error } = await supabase
        .from('mitarbeiter')
        .update({ name })
        .eq('id', id);

      if (error) {
        toast.error('Fehler beim Aktualisieren des Mitarbeiters');
        throw error;
      }
      toast.success('Mitarbeiter wurde aktualisiert');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('mitarbeiter')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Fehler beim Löschen des Mitarbeiters');
        throw error;
      }
      toast.success('Mitarbeiter wurde gelöscht');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees,
    isLoading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
