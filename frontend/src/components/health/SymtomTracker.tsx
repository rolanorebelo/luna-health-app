import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Calendar, Clock, Edit3 } from 'lucide-react';
import { SYMPTOMS } from '../../constants';
import type { SymptomType, Symptom } from '../../types';

interface SymptomTrackerProps {
  onLogSymptom: (symptom: Omit<Symptom, 'id'>) => void;
  recentSymptoms?: Symptom[];
}

const SymptomTracker: React.FC<SymptomTrackerProps> = ({ 
  onLogSymptom, 
  recentSymptoms = [] 
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [intensities, setIntensities] = useState<Partial<Record<SymptomType, number>>>({});
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSymptomToggle = (symptom: SymptomType) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        const newSymptoms = prev.filter(s => s !== symptom);
        const newIntensities = { ...intensities };
        delete newIntensities[symptom];
        setIntensities(newIntensities);
        return newSymptoms;
      } else {
        setIntensities(prev => ({ ...prev, [symptom]: 3 }));
        return [...prev, symptom];
      }
    });
  };

  const handleIntensityChange = (symptom: SymptomType, intensity: number) => {
    setIntensities(prev => ({ ...prev, [symptom]: intensity }));
  };

  const handleSubmit = () => {
    selectedSymptoms.forEach(symptom => {
      const symptomData: Omit<Symptom, 'id'> = {
        type: symptom,
        intensity: intensities[symptom] || 3,
        date: new Date(selectedDate),
        notes: notes || undefined
      };
      onLogSymptom(symptomData);
    });

    // Reset form
    setSelectedSymptoms([]);
    setIntensities({});
    setNotes('');
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return 'bg-green-500';
    if (intensity <= 3) return 'bg-yellow-500';
    if (intensity <= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIntensityLabel = (intensity: number) => {
    const labels = ['', 'Very Mild', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
    return labels[intensity] || 'Moderate';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Symptoms</h2>
        <p className="text-gray-600">Log how you're feeling to help Luna understand your patterns</p>
      </div>

      {/* Date Selection */}
      <motion.div 
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </motion.div>

      {/* Simplified Symptom Selection */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Symptoms</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(['cramps', 'bloating', 'mood-swings', 'fatigue', 'headache', 'breast-tenderness'] as SymptomType[]).map((symptomKey) => {
            const symptom = SYMPTOMS[symptomKey];
            if (!symptom) return null;
            
            return (
              <motion.div
                key={symptomKey}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSymptoms.includes(symptomKey)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSymptomToggle(symptomKey)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{symptom.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{symptom.label}</h4>
                      <p className="text-xs text-gray-600">{symptom.description}</p>
                    </div>
                  </div>
                  {selectedSymptoms.includes(symptomKey) && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                {/* Intensity Slider */}
                <AnimatePresence>
                  {selectedSymptoms.includes(symptomKey) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Intensity</span>
                        <span className="text-sm text-gray-600">
                          {getIntensityLabel(intensities[symptomKey] || 3)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = intensities[symptomKey] || 3;
                            if (current > 1) {
                              handleIntensityChange(symptomKey, current - 1);
                            }
                          }}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <div className="flex-1 flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded-full transition-colors ${
                                level <= (intensities[symptomKey] || 3)
                                  ? getIntensityColor(intensities[symptomKey] || 3)
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = intensities[symptomKey] || 3;
                            if (current < 5) {
                              handleIntensityChange(symptomKey, current + 1);
                            }
                          }}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Notes Section */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <Edit3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional details about how you're feeling..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
        />
      </motion.div>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={selectedSymptoms.length === 0}
        className={`w-full py-4 px-6 rounded-2xl font-medium text-white transition-all ${
          selectedSymptoms.length > 0
            ? 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 shadow-lg'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
        whileHover={selectedSymptoms.length > 0 ? { scale: 1.02 } : {}}
        whileTap={selectedSymptoms.length > 0 ? { scale: 0.98 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {selectedSymptoms.length > 0 
          ? `Log ${selectedSymptoms.length} Symptom${selectedSymptoms.length > 1 ? 's' : ''}`
          : 'Select symptoms to log'
        }
      </motion.button>
    </div>
  );
};

export default SymptomTracker;