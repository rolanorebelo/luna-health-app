import React from 'react';
import { Bell, Search, Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Luna</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Your AI Health Companion</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/search')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Avatar */}
            <button 
              onClick={() => navigate('/profile')}
              className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
            >
              {user?.firstName?.charAt(0) || 'U'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;