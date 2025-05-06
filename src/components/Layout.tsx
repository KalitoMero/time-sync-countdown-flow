
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTimer } from '@/context/TimerContext';
import ModeSwitcher from './ModeSwitcher';
import SettingsDialog from './SettingsDialog';

const Layout: React.FC = () => {
  const {
    isMonitorMode,
    activeTimer
  } = useTimer();
  const navigate = useNavigate();
  const location = useLocation();

  // If in monitor mode, always redirect to countdown view
  useEffect(() => {
    if (isMonitorMode && location.pathname !== '/countdown') {
      navigate('/countdown');
    }
  }, [isMonitorMode, navigate, location.pathname]);
  
  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-workshop-background">
      <div className="py-10 px-4 h-full flex flex-col">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-workshop text-center flex-grow">Schleifzeit</h1>
          {!isMonitorMode && <SettingsDialog />}
        </header>

        <main className="flex-grow overflow-auto">
          <Outlet />
        </main>

        {/* Show mode switcher on all pages */}
        <ModeSwitcher />
      </div>
    </div>
  );
};

export default Layout;
