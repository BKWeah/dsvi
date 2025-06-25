import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../../pages/public/components/Navigation';
import { Footer } from '../../pages/public/components/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
