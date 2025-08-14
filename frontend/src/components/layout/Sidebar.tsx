import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Calendar, 
  Camera, 
  MessageCircle, 
  User,
  Heart,
  Brain,
  Moon,
  Activity,
  Pill
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuthStore(); // Using 'profile' instead of 'user'

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      path: '/',
      color: 'text-purple-600'
    },
    {
      id: 'cycle',
      label: 'Cycle Tracking',
      icon: <Calendar className="w-5 h-5" />,
      path: '/cycle',
      color: 'text-pink-600'
    },
    {
      id: 'gut-balance',
      label: 'WIHHMS Gut Balance',
      icon: <Pill className="w-5 h-5" />,
      path: '/gut-balance',
      color: 'text-purple-600'
    },
    {
      id: 'sensor',
      label: 'WIHHMS Smart Sensor',
      icon: <Activity className="w-5 h-5" />,
      path: '/sensor',
      color: 'text-blue-600'
    },
    {
      id: 'photo-analysis',
      label: 'Photo Analysis',
      icon: <Camera className="w-5 h-5" />,
      path: '/photo-analysis',
      color: 'text-green-600'
    },
    {
      id: 'chat',
      label: 'AI Chat',
      icon: <MessageCircle className="w-5 h-5" />,
      path: '/chat',
      color: 'text-indigo-600'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      path: '/profile',
      color: 'text-gray-600'
    }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
      <div className="p-6">
        {/* User Info */}
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {profile?.firstName ? `Hi, ${profile.firstName}!` : 'Welcome!'}
              </h3>
              <p className="text-sm text-gray-600">
                {profile?.reproductiveStage ? 
                  profile.reproductiveStage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                  'Health Journey'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                isActiveRoute(item.path)
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <span className={isActiveRoute(item.path) ? 'text-purple-600' : item.color}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Health Goals (if available) */}
        {profile?.healthGoals && profile.healthGoals.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Your Goals
            </h4>
            <div className="space-y-1">
              {profile.healthGoals.slice(0, 3).map((goal, index) => (
                <div key={index} className="text-xs text-blue-700">
                  • {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              ))}
              {profile.healthGoals.length > 3 && (
                <div className="text-xs text-blue-600">
                  +{profile.healthGoals.length - 3} more goals
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Health Score</span>
            </div>
            <span className="text-sm font-bold text-green-700">85%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Cycle Day</span>
            </div>
            <span className="text-sm font-bold text-yellow-700">14</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;