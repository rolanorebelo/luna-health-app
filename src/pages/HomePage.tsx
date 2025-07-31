import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useHealthStore from '../stores/healthStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { loadCurrentCycle, loadInsights, loadPredictions } = useHealthStore();

  useEffect(() => {
    // Load health data when component mounts
    loadCurrentCycle();
    loadInsights();
    loadPredictions();
  }, [loadCurrentCycle, loadInsights, loadPredictions]);

  return (
    <div className="py-6 space-y-6">
      {/* Welcome Card */}
      <motion.div 
        className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Good morning, {profile?.firstName || 'Sarah'}!</h2>
            <p className="text-primary-100">You're in your ovulation phase • Day 14</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">72%</div>
            <div className="text-primary-100">Energy Level</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button 
          onClick={() => navigate('/photo-analysis')}
          className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            📷
          </div>
          <span className="text-xs font-medium text-gray-700">Photo Analysis</span>
        </button>

        <button 
          onClick={() => navigate('/chat')}
          className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            💬
          </div>
          <span className="text-xs font-medium text-gray-700">Ask Luna</span>
        </button>

        <button 
          onClick={() => navigate('/symptoms')}
          className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            ➕
          </div>
          <span className="text-xs font-medium text-gray-700">Log Symptoms</span>
        </button>

        <button 
          onClick={() => navigate('/mood')}
          className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            🎯
          </div>
          <span className="text-xs font-medium text-gray-700">Track Mood</span>
        </button>
      </motion.div>

      {/* Health Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-pink-100">
              🍼
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-600">85%</div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fertility Window</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="h-2 rounded-full bg-pink-500 transition-all duration-500" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Peak fertility today! Perfect timing for conception.</p>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View fertility tips →
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-indigo-100">
              🌙
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">81%</div>
              <div className="text-xs text-gray-500">Last Night</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sleep Quality</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="h-2 rounded-full bg-indigo-500 transition-all duration-500" style={{ width: '81%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mb-3">Great sleep! Your recovery is optimized.</p>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View sleep patterns →
          </button>
        </div>
      </motion.div>

      {/* Cycle Tracker */}
      <motion.div 
        className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Cycle Tracking</h3>
            <p className="text-sm text-pink-600">Day 14 • Ovulation Phase</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-pink-600">85%</div>
            <div className="text-xs text-gray-500">Fertility</div>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Period</span>
            <span>Ovulation</span>
            <span>PMS</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white rounded-xl">
            <div className="text-lg font-bold text-gray-900">5</div>
            <div className="text-xs text-gray-500">Days to Period</div>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <div className="text-lg font-bold text-green-600">High</div>
            <div className="text-xs text-gray-500">Fertility</div>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <div className="text-lg font-bold text-blue-600">28</div>
            <div className="text-xs text-gray-500">Cycle Length</div>
          </div>
        </div>
      </motion.div>

      {/* AI Photo Analysis */}
      <motion.div 
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center mb-4">
          <div className="p-3 bg-purple-100 rounded-xl mr-3">
            📷
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Photo Analysis</h3>
            <p className="text-sm text-purple-600">Instant insights from your photos</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center p-3 bg-white rounded-xl">
            <div className="p-2 bg-purple-50 rounded-lg mr-2 text-purple-600">
              👁️
            </div>
            <div>
              <div className="text-xs font-medium text-gray-900">Skin Analysis</div>
              <div className="text-xs text-green-600">Ready</div>
            </div>
          </div>
          <div className="flex items-center p-3 bg-white rounded-xl">
            <div className="p-2 bg-purple-50 rounded-lg mr-2 text-purple-600">
              🔍
            </div>
            <div>
              <div className="text-xs font-medium text-gray-900">Discharge Check</div>
              <div className="text-xs text-green-600">Ready</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/photo-analysis')}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2 font-medium"
        >
          <span>📷</span>
          <span>Take Photo for Analysis</span>
        </button>
      </motion.div>
    </div>
  );
};

export default HomePage;