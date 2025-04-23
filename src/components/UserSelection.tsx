import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/context/TimerContext';
import SettingsDialog from './SettingsDialog';
import ActiveCountdowns from './ActiveCountdowns';
import { useEmployees } from '@/hooks/useEmployees';

const UserSelection: React.FC = () => {
  const navigate = useNavigate();
  const { isMonitorMode } = useTimer();
  const { employees, isLoading } = useEmployees();

  const handleUserSelect = (userId: string, userName: string) => {
    navigate(`/time-selection/${userId}?name=${encodeURIComponent(userName)}`);
  };

  if (isMonitorMode) {
    return <ActiveCountdowns />;
  }

  if (isLoading) {
    return <div>Lade Mitarbeiter...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-workshop text-white">
          <CardTitle className="text-3xl font-bold">Mitarbeiter auswählen</CardTitle>
          <SettingsDialog />
        </CardHeader>
        <CardContent className="grid gap-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            {employees.map((employee) => (
              <Button
                key={employee.id}
                onClick={() => handleUserSelect(String(employee.id), employee.name)}
                className="h-24 text-xl bg-workshop hover:bg-workshop-light"
              >
                {employee.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSelection;
