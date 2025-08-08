import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface HealthMetricCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  insight: string;
  action: string;
  onClick?: () => void;
}

const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  score,
  icon,
  color,
  insight,
  action,
  onClick
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <motion.div 
          className={`p-3 rounded-xl ${color}`}
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        <div className="text-right">
          <motion.div 
            className={`text-2xl font-bold ${getScoreColor(score)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            {score}%
          </motion.div>
          <div className="text-xs text-gray-500">Today</div>
        </div>
      </div>

      {/* Title and Progress */}
      <motion.h3 
        className="font-semibold text-gray-900 mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className={`h-2 rounded-full ${getProgressColor(score)} transition-all duration-500`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </div>
      </div>

      {/* Insight */}
      <motion.p 
        className="text-sm text-gray-600 mb-3 line-clamp-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {insight}
      </motion.p>

      {/* Action Button */}
      <motion.button 
        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center group"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        {action}
        <ChevronRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
};

export default HealthMetricCard;