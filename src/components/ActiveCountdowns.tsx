
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Check } from 'lucide-react';
import { useTimers } from '@/hooks/useTimers';

// Create a separate component for each timer to properly use hooks
const CountdownTimer: React.FC<{ 
  timer: { 
    id?: string; 
    created_at: string; 
    dauer_min?: number;
    mitarbeiter: string; 
    special_case?: string;
  },
  onComplete: (id: string) => void
}> = ({ timer, onComplete }) => {
  const { formattedTime, isExpired, isUnderTenMinutes } = useCountdown({
    startTime: timer.created_at,
    durationMinutes: timer.dauer_min || 0
  });

  return (
    <Card 
      key={timer.id} 
      className={`border-workshop-light border-2 ${
        timer.special_case === 'morgen vor 8' ? 'bg-gray-50' : ''
      }`}
    >
      <CardContent className="p-3">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-center">
          <div className="text-lg">
            <span className="text-gray-600">Mitarbeiter: </span>
            <span className="font-semibold">{timer.mitarbeiter}</span>
          </div>
          
          <div className="text-gray-600">
            {timer.special_case === 'morgen vor 8' ? (
              <span className="text-workshop-accent font-medium">
                Status: morgen vor 8
              </span>
            ) : isExpired ? (
              <span className="text-2xl font-bold text-red-600">
                Abgelaufen
              </span>
            ) : (
              <span className={`text-2xl font-bold tracking-wider ${
                isUnderTenMinutes 
                  ? 'text-workshop-danger animate-pulse' 
                  : 'text-workshop'
              }`}>
                {formattedTime}
              </span>
            )}
          </div>

          <div className="text-sm text-gray-500">
            {timer.special_case === 'morgen vor 8' ? (
              <span>Morgen vor 8:00</span>
            ) : (
              <span>Dauer: {timer.dauer_min} Min.</span>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-2 border-green-500 hover:bg-green-500 hover:text-white"
            onClick={() => timer.id && onComplete(timer.id)}
          >
            <Check className="h-5 w-5 text-green-500 hover:text-white" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Import the useCountdown hook here to make it available for CountdownTimer
import { useCountdown } from '@/hooks/useCountdown';

const ActiveCountdowns: React.FC = () => {
  const { activeTimers, isLoading, completeTimer } = useTimers();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-xl">Lade Timer...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeTimers || activeTimers.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="border-workshop-light border-2">
          <CardHeader className="bg-workshop text-white">
            <CardTitle className="text-3xl font-bold text-center">
              Keine aktiven Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <Timer className="w-24 h-24 mx-auto text-workshop-light mb-6" />
            <p className="text-xl text-gray-600">
              Momentan sind keine Timer aktiv
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-workshop text-center mb-6">
        Aktive Timer
      </h1>
      <div className="space-y-2">
        {activeTimers.map((timer) => (
          <CountdownTimer 
            key={timer.id} 
            timer={timer} 
            onComplete={(id) => completeTimer.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveCountdowns;
