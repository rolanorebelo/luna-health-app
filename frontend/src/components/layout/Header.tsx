import React from 'react';
import { User, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import WIHHMSLogo from '../ui/WIHHMSLogo';

const PhylacticsLogo = ({ size = 'small', variant = 'light' }: { size?: 'small' | 'large', variant?: 'light' | 'dark' }) => (
  <div 
    className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
    onClick={() => window.open('https://phylactics.com/', '_blank')}
  >
    {/* Phi symbol */}
    <div className={`${size === 'large' ? 'w-8 h-8' : 'w-5 h-5'} ${variant === 'dark' ? 'bg-white' : 'bg-black'} rounded flex items-center justify-center`}>
      <span className={`${variant === 'dark' ? 'text-black' : 'text-white'} font-bold ${size === 'large' ? 'text-lg' : 'text-xs'}`}>φ</span>
    </div>
    {/* PHYLACTICS with taglines */}
    <div className="flex flex-col">
      <span className={`font-bold tracking-tight ${size === 'large' ? 'text-lg' : 'text-xs'}`}>
        <span className={variant === 'dark' ? 'text-red-400' : 'text-red-500'}>P</span>
        <span className={variant === 'dark' ? 'text-red-400' : 'text-red-500'}>H</span>
        <span className={variant === 'dark' ? 'text-orange-400' : 'text-orange-500'}>Y</span>
        <span className={variant === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}>L</span>
        <span className={variant === 'dark' ? 'text-green-400' : 'text-green-500'}>A</span>
        <span className={variant === 'dark' ? 'text-teal-400' : 'text-teal-500'}>C</span>
        <span className={variant === 'dark' ? 'text-blue-400' : 'text-blue-500'}>T</span>
        <span className={variant === 'dark' ? 'text-purple-400' : 'text-purple-500'}>I</span>
        <span className={variant === 'dark' ? 'text-purple-500' : 'text-purple-600'}>C</span>
        <span className={variant === 'dark' ? 'text-purple-600' : 'text-purple-700'}>S</span>
      </span>
    </div>
  </div>
);

const Header: React.FC = () => {

   const navigate = useNavigate();
  
  const { profile, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
         <div className="flex items-center">
  <div className="w-15 h-15 flex items-center justify-center">
     <WIHHMSLogo size="large" />
  </div>
  <div className="flex flex-col">
  <h1 className="text-xl font-bold text-gray-900 leading-tight">WIHHMS</h1>
  <div className="flex items-center text-xs text-gray-600">
    <span className="mr-1">by</span> {/* Add margin-right to "by" */}
    <div className="flex items-center space-x-0.5"> {/* Reduce space between Phi and Phylactics */}
      <PhylacticsLogo size="small" variant="light" />
    </div>
  </div>
</div>
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