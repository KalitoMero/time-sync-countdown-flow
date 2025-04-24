
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Home, Clock, X } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import ActiveCountdowns from './ActiveCountdowns';

const CountdownDisplay: React.FC = () => {
  const { activeTimer, isMonitorMode } = useTimer();
  const navigate = useNavigate();

  const { formattedTime, isExpired, progress } = useCountdown({
    startTime: activeTimer?.startTime || '',
    durationMinutes: activeTimer?.duration || 0
  });

  // If in monitor mode, show the ActiveCountdowns component
  if (isMonitorMode) {
    return <ActiveCountdowns />;
  }

  // If no active timer, display a message
  if (!activeTimer) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-2xl border-workshop-light border-2">
          <CardHeader className="bg-workshop text-white">
            <CardTitle className="text-3xl font-bold text-center">
              Kein aktiver Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <Clock className="w-24 h-24 mx-auto text-workshop-light mb-6" />
            <p className="text-xl mb-6">
              Bitte wählen Sie einen Benutzer und stellen Sie einen Timer ein.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center py-4">
            <Button
              size="lg"
              className="bg-workshop hover:bg-workshop-light text-white"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-5 w-5" /> Zur Startseite
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-2xl border-workshop-light border-2">
        <CardHeader className="bg-workshop text-white">
          <CardTitle className="text-3xl font-bold text-center">
            {activeTimer?.userName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-7xl font-mono font-bold mb-8 text-workshop">
              {formattedTime}
            </div>
            
            <div className="mb-2 text-sm font-medium">
              Fortschritt: {Math.round(progress)}%
            </div>
            <Progress 
              value={progress} 
              className={`h-4 ${isExpired ? 'bg-black' : 'bg-workshop'}`}
            />
            
            <div className="mt-8 text-lg">
              <p><span className="font-medium">Gestartet:</span> {activeTimer && new Date(activeTimer.startTime).toLocaleTimeString()}</p>
              <p><span className="font-medium">Voraussichtliches Ende:</span> {activeTimer && new Date(activeTimer.endTime).toLocaleTimeString()}</p>
              <p className="mt-2"><span className="font-medium">Dauer:</span> {activeTimer?.duration} Minuten</p>
            </div>
          </div>
        </CardContent>
        {!isMonitorMode && (
          <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 py-4">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-workshop text-workshop hover:bg-workshop hover:text-white"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-5 w-5" /> Zur Startseite
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => {
                navigate('/');
                navigate(0);
              }}
            >
              <X className="mr-2 h-5 w-5" /> Timer abbrechen
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default CountdownDisplay;
