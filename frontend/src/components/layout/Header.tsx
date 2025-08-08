import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Sparkles } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore(); // Changed from 'user' to 'profile'

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">WIHHMS</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Name */}
            <div className="hidden md:block text-sm text-gray-700">
              Welcome, {profile?.firstName || 'User'}!
            </div>

            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Profile
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:block text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;