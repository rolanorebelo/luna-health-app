import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock, Zap, Brain, Heart } from 'lucide-react';
import { format, parse, differenceInHours, differenceInMinutes } from 'date-fns';

interface SleepData {
  bedtime: string;
  wakeTime: string;
  sleepQuality: number; // 1-10 scale
  timeToFallAsleep: number; // minutes
  nightWakeups: number;
  feelingUponWaking: number; // 1-10 scale
  factors: string[];
  notes?: string;
}

interface SleepTrackerProps {
  onSaveSleep: (sleep: SleepData) => void;
  cycleDay?: number;
  phase?: string;
}

const SleepTracker: React.FC<SleepTrackerProps> = ({ 
  onSaveSleep, 
  cycleDay, 
  phase 
}) => {
  const [sleepData, setSleepData] = useState<SleepData>({
    bedtime: '22:00',
    wakeTime: '07:00',
    sleepQuality: 7,
    timeToFallAsleep: 15,
    nightWakeups: 0,
    feelingUponWaking: 7,
    factors: []
  });

  const [notes, setNotes] = useState('');

  const sleepFactors = [
    { label: 'Caffeine', category: 'dietary', icon: '☕' },
    { label: 'Alcohol', category: 'dietary', icon: '🍷' },
    { label: 'Heavy meal', category: 'dietary', icon: '🍽️' },
    { label: 'Exercise', category: 'activity', icon: '🏃‍♀️' },
    { label: 'Screen time', category: 'environment', icon: '📱' },
    { label: 'Stress/Anxiety', category: 'mental', icon: '😰' },
    { label: 'Room too hot', category: 'environment', icon: '🌡️' },
    { label: 'Room too cold', category: 'environment', icon: '❄️' },
    { label: 'Noise', category: 'environment', icon: '🔊' },
    { label: 'Uncomfortable bed', category: 'environment', icon: '🛏️' },
    { label: 'Hormonal changes', category: 'physical', icon: '⚖️' },
    { label: 'Pain/Discomfort', category: 'physical', icon: '😣' }
  ];

  const calculateSleepDuration = () => {
    if (!sleepData.bedtime || !sleepData.wakeTime) return { hours: 0, minutes: 0 };
    
    const bedtime = parse(sleepData.bedtime, 'HH:mm', new Date());
    let wakeTime = parse(sleepData.wakeTime, 'HH:mm', new Date());
    
    // If wake time is earlier than bedtime, assume next day
    if (wakeTime < bedtime) {
      wakeTime = new Date(wakeTime.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const hours = differenceInHours(wakeTime, bedtime);
    const minutes = differenceInMinutes(wakeTime, bedtime) % 60;
    
    return { hours, minutes };
  };

  const getSleepQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-green-600';
    if (quality >= 6) return 'text-yellow-600';
    if (quality >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSleepQualityLabel = (quality: number) => {
    if (quality >= 9) return 'Excellent';
    if (quality >= 7) return 'Good';
    if (quality >= 5) return 'Fair';
    if (quality >= 3) return 'Poor';
    return 'Very Poor';
  };

  const getSleepDurationFeedback = (hours: number) => {
    if (hours >= 7 && hours <= 9) return { text: 'Optimal duration', color: 'text-green-600' };
    if (hours >= 6 && hours < 7) return { text: 'Slightly short', color: 'text-yellow-600' };
    if (hours > 9) return { text: 'Quite long', color: 'text-blue-600' };
    return { text: 'Too short', color: 'text-red-600' };
  };

  const handleFactorToggle = (factor: string) => {
    setSleepData(prev => ({
      ...prev,
      factors: prev.factors.includes(factor)
        ? prev.factors.filter(f => f !== factor)
        : [...prev.factors, factor]
    }));
  };

  const handleSave = () => {
    onSaveSleep({ ...sleepData, notes: notes || undefined });
    // Reset form
    setSleepData({
      bedtime: '22:00',
      wakeTime: '07:00',
      sleepQuality: 7,
      timeToFallAsleep: 15,
      nightWakeups: 0,
      feelingUponWaking: 7,
      factors: []
    });
    setNotes('');
  };

  const duration = calculateSleepDuration();
  const durationFeedback = getSleepDurationFeedback(duration.hours);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sleep Tracking</h2>
        <p className="text-gray-600">
          Monitor your sleep to understand its impact on your cycle and health
          {cycleDay && phase && (
            <span className="block text-sm text-primary-600 mt-1">
              Day {cycleDay} • {phase} phase
            </span>
          )}
        </p>
      </div>

      {/* Sleep Duration Overview */}
      <motion.div 
        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Moon className="w-8 h-8 text-indigo-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Sleep Duration</h3>
              <p className="text-indigo-600">Last night's sleep</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">
              {duration.hours}h {duration.minutes}m
            </div>
            <div className={`text-sm font-medium ${durationFeedback.color}`}>
              {durationFeedback.text}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Bedtime
            </label>
            <input
              type="time"
              value={sleepData.bedtime}
              onChange={(e) => setSleepData(prev => ({ ...prev, bedtime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Sun className="w-4 h-4 inline mr-1" />
              Wake Time
            </label>
            <input
              type="time"
              value={sleepData.wakeTime}
              onChange={(e) => setSleepData(prev => ({ ...prev, wakeTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Sleep Quality */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sleep Quality</h3>
            <p className={`text-sm ${getSleepQualityColor(sleepData.sleepQuality)}`}>
              {getSleepQualityLabel(sleepData.sleepQuality)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Poor</span>
            <span className="text-sm text-gray-600">Excellent</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={sleepData.sleepQuality}
            onChange={(e) => setSleepData(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{sleepData.sleepQuality}/10</span>
          </div>
        </div>
      </motion.div>

      {/* Sleep Details */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time to fall asleep (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={sleepData.timeToFallAsleep}
              onChange={(e) => setSleepData(prev => ({ ...prev, timeToFallAsleep: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of times you woke up
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={sleepData.nightWakeups}
              onChange={(e) => setSleepData(prev => ({ ...prev, nightWakeups: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Brain className="w-4 h-4 inline mr-1" />
            How did you feel when you woke up?
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Exhausted</span>
              <span>Refreshed</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sleepData.feelingUponWaking}
              onChange={(e) => setSleepData(prev => ({ ...prev, feelingUponWaking: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-900">{sleepData.feelingUponWaking}/10</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sleep Factors */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What factors affected your sleep?
        </h3>
        
        <div className="space-y-4">
          {['dietary', 'activity', 'environment', 'mental', 'physical'].map((category) => {
            const categoryFactors = sleepFactors.filter(f => f.category === category);
            const categoryLabels = {
              dietary: 'Diet & Substances',
              activity: 'Activities',
              environment: 'Environment',
              mental: 'Mental State',
              physical: 'Physical Factors'
            };
            
            return (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categoryFactors.map((factor) => (
                    <button
                      key={factor.label}
                      onClick={() => handleFactorToggle(factor.label)}
                      className={`p-2 text-sm rounded-lg border transition-all flex items-center space-x-2 ${
                        sleepData.factors.includes(factor.label)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span>{factor.icon}</span>
                      <span>{factor.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Notes */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sleep Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any dreams, sleep disturbances, or other observations about your sleep..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
        />
      </motion.div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Save Sleep Data
      </motion.button>

      {/* Sleep Insights */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💤 Sleep Insights</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {duration.hours < 7 && (
            <p>• Try to get 7-9 hours of sleep for optimal hormonal balance</p>
          )}
          {sleepData.timeToFallAsleep > 30 && (
            <p>• Consider a relaxing bedtime routine to help you fall asleep faster</p>
          )}
          {sleepData.nightWakeups > 2 && (
            <p>• Frequent wake-ups might be related to hormonal changes during your cycle</p>
          )}
          {sleepData.factors.includes('Screen time') && (
            <p>• Blue light from screens can disrupt melatonin production - try avoiding screens 1 hour before bed</p>
          )}
          {sleepData.factors.includes('Caffeine') && (
            <p>• Avoid caffeine 6-8 hours before bedtime for better sleep quality</p>
          )}
          {cycleDay && cycleDay > 21 && (
            <p>• Sleep disturbances are common in the luteal phase due to progesterone changes</p>
          )}
          {phase === 'menstrual' && (
            <p>• During menstruation, prioritize rest as your body is working hard</p>
          )}
          <p>• Consistent sleep patterns help regulate your circadian rhythm and hormones</p>
        </div>
      </motion.div>

      {/* Sleep Score Summary */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Score Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration Score</span>
            <span className={`text-sm font-medium ${
              duration.hours >= 7 && duration.hours <= 9 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {duration.hours >= 7 && duration.hours <= 9 ? '100%' : '70%'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Quality Score</span>
            <span className={`text-sm font-medium ${getSleepQualityColor(sleepData.sleepQuality)}`}>
              {sleepData.sleepQuality * 10}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Wake-up Feeling</span>
            <span className={`text-sm font-medium ${
              sleepData.feelingUponWaking >= 7 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {sleepData.feelingUponWaking * 10}%
            </span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Overall Sleep Score</span>
              <span className={`text-lg font-bold ${
                ((sleepData.sleepQuality + sleepData.feelingUponWaking) / 2) >= 7 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {Math.round(((sleepData.sleepQuality + sleepData.feelingUponWaking) / 2) * 10)}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SleepTracker;