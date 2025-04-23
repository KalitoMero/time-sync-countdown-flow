
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Home, Clock, X } from 'lucide-react';
import ActiveCountdowns from './ActiveCountdowns';

const CountdownDisplay: React.FC = () => {
  const { activeTimer, remainingTime, isMonitorMode } = useTimer();
  const navigate = useNavigate();

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
              {isMonitorMode 
                ? "Warten auf einen Benutzer, der einen Timer startet..." 
                : "Bitte wählen Sie einen Benutzer und stellen Sie einen Timer ein."}
            </p>
          </CardContent>
          {!isMonitorMode && (
            <CardFooter className="flex justify-center py-4">
              <Button
                size="lg"
                className="bg-workshop hover:bg-workshop-light text-white"
                onClick={() => navigate('/')}
              >
                <Home className="mr-2 h-5 w-5" /> Zur Startseite
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  // Format the remaining time nicely
  const formatTime = () => {
    if (remainingTime === null) return '00:00';
    
    const totalSeconds = Math.floor(remainingTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (inverted - starts at 100%, goes to 0%)
  const calculateProgress = () => {
    if (!activeTimer || remainingTime === null) return 0;
    
    const totalDuration = activeTimer.duration * 60 * 1000;
    const elapsed = totalDuration - remainingTime;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  // Determine the progress color based on remaining time
  const getProgressColor = () => {
    if (!activeTimer || remainingTime === null) return 'bg-workshop-light';
    
    const totalDuration = activeTimer.duration * 60 * 1000;
    const percentage = remainingTime / totalDuration;
    
    if (percentage > 0.5) return 'bg-workshop-success';
    if (percentage > 0.25) return 'bg-workshop-accent';
    return 'bg-workshop-danger';
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-2xl border-workshop-light border-2">
        <CardHeader className={`${remainingTime && remainingTime <= 300000 ? 'bg-workshop-danger animate-pulse-subtle' : 'bg-workshop'} text-white`}>
          <CardTitle className="text-3xl font-bold text-center">
            {activeTimer.userName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center">
            <div className={`text-7xl font-mono font-bold mb-8 ${
              remainingTime && remainingTime <= 300000 ? 'text-workshop-danger' : 'text-workshop'
            }`}>
              {formatTime()}
            </div>
            
            <div className="mb-2 text-sm font-medium">
              Progress: {Math.round(calculateProgress())}%
            </div>
            <Progress 
              value={calculateProgress()} 
              className={`h-4 ${getProgressColor()}`}
            />
            
            <div className="mt-8 text-lg">
              <p><span className="font-medium">Started:</span> {new Date(activeTimer.startTime).toLocaleTimeString()}</p>
              <p><span className="font-medium">Estimated finish:</span> {new Date(activeTimer.endTime).toLocaleTimeString()}</p>
              <p className="mt-2"><span className="font-medium">Duration:</span> {activeTimer.duration} minutes</p>
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
                navigate(0); // Force a complete refresh
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

