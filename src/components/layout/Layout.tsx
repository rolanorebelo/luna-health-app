import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import { BaseComponentProps } from '../../types';

interface LayoutProps extends BaseComponentProps {
  showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '', 
  showNavigation = true 
}) => {
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {!isOnboarding && <Header />}
      
      {/* Main Content */}
      <main className={`${!isOnboarding ? 'pt-16' : ''} ${showNavigation ? 'pb-20' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showNavigation && !isOnboarding && <Navigation />}
    </div>
  );
};

export default Layout;