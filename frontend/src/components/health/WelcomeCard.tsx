import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeCardProps {
  name: string;
  phase: string;
  cycleDay: number;
  energyLevel: number;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ 
  name, 
  phase, 
  cycleDay, 
  energyLevel 
}) => {
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getPhaseEmoji = (phase: string) => {
    switch (phase) {
      case 'menstrual': return '🌙';
      case 'follicular': return '🌱';
      case 'ovulation': return '🌟';
      case 'luteal': return '🍂';
      default: return '✨';
    }
  };

  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <motion.div 
      className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <motion.h2 
              className="text-2xl font-bold mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Good {getTimeOfDay()}, {name}! {getPhaseEmoji(phase)}
            </motion.h2>
            <motion.p 
              className="text-primary-100 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              You're in your {phase} phase • Day {cycleDay}
            </motion.p>
          </div>
          
          <motion.div 
            className="text-right"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`text-3xl font-bold ${getEnergyColor(energyLevel)}`}>
              {energyLevel}%
            </div>
            <div className="text-primary-100 text-sm">Energy Level</div>
          </motion.div>
        </div>

        {/* Energy Bar */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-primary-100">Today's Energy</span>
            <span className="text-white font-medium">{energyLevel}%</span>
          </div>
          <div className="w-full bg-primary-700 rounded-full h-2">
            <motion.div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${energyLevel}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
            ></motion.div>
          </div>
        </motion.div>

        {/* Phase Indicator */}
        <motion.div 
          className="mt-4 flex items-center space-x-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-primary-100 text-sm capitalize">
            {phase} phase is optimal for energy and focus
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;