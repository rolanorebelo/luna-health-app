import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Camera, TrendingUp, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      path: '/',
      icon: Heart,
      label: 'Home',
    },
    {
      id: 'chat',
      path: '/chat',
      icon: MessageCircle,
      label: 'WIHHMS AI',
    },
    {
      id: 'camera',
      path: '/photo-analysis',
      icon: Camera,
      label: 'Analyze',
    },
    {
      id: 'insights',
      path: '/insights',
      icon: TrendingUp,
      label: 'Insights',
    },
    {
      id: 'profile',
      path: '/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50 scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary-600' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;