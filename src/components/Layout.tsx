
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTimer } from '@/context/TimerContext';
import ModeSwitcher from './ModeSwitcher';

const Layout: React.FC = () => {
  const { isMonitorMode, activeTimer } = useTimer();
  const navigate = useNavigate();
  const location = useLocation();

  // If in monitor mode, always redirect to countdown view
  useEffect(() => {
    if (isMonitorMode && location.pathname !== '/countdown') {
      navigate('/countdown');
    }
  }, [isMonitorMode, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-workshop-background">
      <div className="py-10 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-workshop text-center">
            Workshop Timer
          </h1>
        </header>

        <main>
          <Outlet />
        </main>

        {/* Show mode switcher on all pages */}
        <ModeSwitcher />
      </div>
    </div>
  );
};

export default Layout;
