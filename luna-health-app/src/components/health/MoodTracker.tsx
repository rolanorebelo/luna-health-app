import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Zap, Moon, Sun, Cloud, CloudRain, Smile, Frown, Meh } from 'lucide-react';

interface MoodData {
  overall: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  stress: number; // 1-10 scale
  emotions: string[];
  notes?: string;
  sleepQuality?: number; // 1-10 scale
  triggers?: string[];
}

interface MoodTrackerProps {
  onSaveMood: (mood: MoodData) => void;
  cycleDay?: number;
  phase?: string;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ 
  onSaveMood, 
  cycleDay, 
  phase 
}) => {
  const [moodData, setMoodData] = useState<MoodData>({
    overall: 5,
    energy: 5,
    anxiety: 5,
    stress: 5,
    emotions: [],
    sleepQuality: 5,
    triggers: []
  });

  const [notes, setNotes] = useState('');

  const emotionOptions = [
    { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 text-yellow-700' },
    { emoji: '😢', label: 'Sad', color: 'bg-blue-100 text-blue-700' },
    { emoji: '😠', label: 'Angry', color: 'bg-red-100 text-red-700' },
    { emoji: '😰', label: 'Anxious', color: 'bg-purple-100 text-purple-700' },
    { emoji: '😴', label: 'Tired', color: 'bg-gray-100 text-gray-700' },
    { emoji: '🥰', label: 'Loved', color: 'bg-pink-100 text-pink-700' },
    { emoji: '😤', label: 'Frustrated', color: 'bg-orange-100 text-orange-700' },
    { emoji: '😌', label: 'Peaceful', color: 'bg-green-100 text-green-700' },
    { emoji: '🤔', label: 'Confused', color: 'bg-indigo-100 text-indigo-700' },
    { emoji: '💪', label: 'Confident', color: 'bg-emerald-100 text-emerald-700' }
  ];

  const triggerOptions = [
    'Work stress', 'Relationship issues', 'Financial concerns', 'Health worries',
    'Family problems', 'Social situations', 'Weather changes', 'Diet changes',
    'Exercise', 'Sleep quality', 'Hormonal changes', 'Other'
  ];

  const getMoodIcon = (value: number) => {
    if (value <= 3) return <Frown className="w-6 h-6 text-red-500" />;
    if (value <= 7) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Smile className="w-6 h-6 text-green-500" />;
  };

  const getMoodColor = (value: number) => {
    if (value <= 3) return 'from-red-400 to-red-500';
    if (value <= 7) return 'from-yellow-400 to-yellow-500';
    return 'from-green-400 to-green-500';
  };

  const getMoodLabel = (value: number) => {
    const labels = ['', 'Terrible', 'Very Bad', 'Bad', 'Poor', 'Okay', 'Fair', 'Good', 'Very Good', 'Great', 'Excellent'];
    return labels[value] || 'Okay';
  };

  const handleEmotionToggle = (emotion: string) => {
    setMoodData(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const handleTriggerToggle = (trigger: string) => {
    setMoodData(prev => ({
      ...prev,
      triggers: prev.triggers?.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...(prev.triggers || []), trigger]
    }));
  };

  const handleSave = () => {
    onSaveMood({ ...moodData, notes: notes || undefined });
    // Reset form
    setMoodData({
      overall: 5,
      energy: 5,
      anxiety: 5,
      stress: 5,
      emotions: [],
      sleepQuality: 5,
      triggers: []
    });
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling?</h2>
        <p className="text-gray-600">
          Track your mood to understand patterns with your cycle
          {cycleDay && phase && (
            <span className="block text-sm text-primary-600 mt-1">
              Day {cycleDay} • {phase} phase
            </span>
          )}
        </p>
      </div>

      {/* Overall Mood */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          {getMoodIcon(moodData.overall)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Mood</h3>
            <p className="text-sm text-gray-600">{getMoodLabel(moodData.overall)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Terrible</span>
            <span className="text-sm text-gray-600">Excellent</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={moodData.overall}
              onChange={(e) => setMoodData(prev => ({ ...prev, overall: parseInt(e.target.value) }))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #22c55e 100%)`
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Mood Metrics */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energy Level */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-gray-900">Energy Level</span>
              <span className="text-sm text-gray-600">({moodData.energy}/10)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodData.energy}
              onChange={(e) => setMoodData(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Anxiety Level */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-gray-900">Anxiety Level</span>
              <span className="text-sm text-gray-600">({moodData.anxiety}/10)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodData.anxiety}
              onChange={(e) => setMoodData(prev => ({ ...prev, anxiety: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Stress Level */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <CloudRain className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">Stress Level</span>
              <span className="text-sm text-gray-600">({moodData.stress}/10)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodData.stress}
              onChange={(e) => setMoodData(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Sleep Quality */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Moon className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-gray-900">Sleep Quality</span>
              <span className="text-sm text-gray-600">({moodData.sleepQuality}/10)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodData.sleepQuality}
              onChange={(e) => setMoodData(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </motion.div>

      {/* Emotions */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What emotions are you feeling?</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {emotionOptions.map((emotion) => (
            <motion.button
              key={emotion.label}
              onClick={() => handleEmotionToggle(emotion.label)}
              className={`p-3 rounded-xl border-2 transition-all ${
                moodData.emotions.includes(emotion.label)
                  ? `${emotion.color} border-current`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-1">{emotion.emoji}</div>
              <div className="text-xs font-medium">{emotion.label}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Triggers */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Any triggers affecting your mood?</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {triggerOptions.map((trigger) => (
            <button
              key={trigger}
              onClick={() => handleTriggerToggle(trigger)}
              className={`p-2 text-sm rounded-lg border transition-all ${
                moodData.triggers?.includes(trigger)
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {trigger}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notes */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today? Any specific thoughts or experiences you'd like to track..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={4}
        />
      </motion.div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 px-6 rounded-2xl font-medium hover:from-primary-700 hover:to-accent-700 transition-all shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Save Mood Entry
      </motion.button>

      {/* Mood Insights */}
      <motion.div 
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {moodData.overall <= 4 && (
            <p>• Consider gentle activities like walking, deep breathing, or calling a friend</p>
          )}
          {moodData.energy <= 4 && (
            <p>• Low energy is normal during certain cycle phases - prioritize rest and nutrition</p>
          )}
          {moodData.anxiety >= 7 && (
            <p>• Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8</p>
          )}
          {moodData.stress >= 7 && (
            <p>• Consider meditation, journaling, or talking to someone you trust</p>
          )}
          {cycleDay && cycleDay > 21 && (
            <p>• PMS symptoms are common in late luteal phase - practice extra self-care</p>
          )}
          <p>• Tracking mood patterns helps identify cycle-related changes</p>
        </div>
      </motion.div>
    </div>
  );
};

export default MoodTracker;