
import React from 'react';
import { useTimer } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Monitor } from 'lucide-react';

const ModeSwitcher: React.FC = () => {
  const { isMonitorMode, toggleMode } = useTimer();

  return (
    <div className="fixed bottom-4 right-4">
      <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-2">
        <Monitor className="h-5 w-5 text-workshop" />
        <span className="text-sm font-medium">Monitor Mode</span>
        <Switch
          checked={isMonitorMode}
          onCheckedChange={toggleMode}
        />
      </div>
    </div>
  );
};

export default ModeSwitcher;
