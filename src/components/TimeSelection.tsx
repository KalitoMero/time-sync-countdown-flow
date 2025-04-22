import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTimer } from '@/context/TimerContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TimeSelection: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userName = searchParams.get('name') || 'Unbekannter Mitarbeiter';
  const { setActiveTimer } = useTimer();

  const timeOptions = [15, 30, 45, 60, 90, 120];

  const handleTimeSelect = (duration: number) => {
    if (!userId) return;
    
    const now = Date.now();
    const durationMs = duration * 60 * 1000;
    const endTime = now + durationMs;

    const timerData = {
      userId,
      userName,
      startTime: now,
      duration,
      endTime
    };

    setActiveTimer(timerData);
    navigate('/countdown');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="border-workshop-light border-2">
        <CardHeader className="bg-workshop text-white">
          <Button 
            variant="ghost" 
            className="absolute left-4 top-4 text-white hover:text-workshop-accent hover:bg-workshop"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Zurück
          </Button>
          <CardTitle className="text-3xl font-bold text-center mt-4">
            Mitarbeiter: {userName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {timeOptions.map((time) => (
              <button
                key={time}
                className="bg-workshop-light hover:bg-workshop text-white p-6 rounded-lg text-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg h-24"
                onClick={() => handleTimeSelect(time)}
              >
                {time} min
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center py-4">
          <Button
            variant="outline"
            size="lg"
            className="text-workshop border-workshop hover:bg-workshop hover:text-white"
            onClick={() => navigate('/')}
          >
            Abbrechen
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeSelection;
