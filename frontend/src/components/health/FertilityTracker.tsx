import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Calendar, Thermometer, Droplets, Target } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface FertilityData {
  basalBodyTemp?: number;
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white';
  ovulationTest?: 'negative' | 'positive';
  cervixPosition?: 'low' | 'medium' | 'high';
  libido?: number; // 1-5 scale
}

interface FertilityTrackerProps {
  cycleDay: number;
  cycleLength: number;
  lastPeriodDate: Date;
  onUpdateFertilityData: (data: FertilityData) => void;
  fertilityGoal?: 'conceiving' | 'avoiding' | 'tracking';
}

const FertilityTracker: React.FC<FertilityTrackerProps> = ({
  cycleDay,
  cycleLength,
  lastPeriodDate,
  onUpdateFertilityData,
  fertilityGoal = 'tracking'
}) => {
  const [fertilityData, setFertilityData] = useState<FertilityData>({});
  const [showDetailedTracking, setShowDetailedTracking] = useState(false);

  // Calculate fertility window
  const ovulationDay = cycleLength - 14;
  const ovulationDate = addDays(lastPeriodDate, ovulationDay);
  const fertilityWindowStart = addDays(ovulationDate, -5);
  const fertilityWindowEnd = addDays(ovulationDate, 1);
  
  const daysToOvulation = differenceInDays(ovulationDate, new Date());
  const isInFertilityWindow = cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1;
  
  const getFertilityScore = () => {
    if (Math.abs(daysToOvulation) <= 1) return 95;
    if (Math.abs(daysToOvulation) <= 2) return 85;
    if (Math.abs(daysToOvulation) <= 3) return 70;
    if (Math.abs(daysToOvulation) <= 5) return 45;
    return 15;
  };

  const getFertilityPhase = () => {
    if (daysToOvulation > 5) return 'Low Fertility';
    if (daysToOvulation > 1) return 'High Fertility';
    if (Math.abs(daysToOvulation) <= 1) return 'Peak Fertility';
    return 'Post-Ovulation';
  };

  const getMucusDescription = (type: string) => {
    const descriptions = {
      'dry': 'Little to no cervical mucus',
      'sticky': 'Thick, tacky mucus',
      'creamy': 'Smooth, lotion-like consistency',
      'watery': 'Thin, slippery mucus',
      'egg-white': 'Clear, stretchy, like raw egg white'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  const handleDataUpdate = (updates: Partial<FertilityData>) => {
    const newData = { ...fertilityData, ...updates };
    setFertilityData(newData);
    onUpdateFertilityData(newData);
  };

  const fertilityScore = getFertilityScore();
  const fertilityPhase = getFertilityPhase();

  return (
    <div className="space-y-6">
      {/* Fertility Overview */}
      <motion.div 
        className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fertility Tracking</h2>
            <p className="text-pink-600">
              {fertilityGoal === 'conceiving' && 'Optimizing for conception'}
              {fertilityGoal === 'avoiding' && 'Natural family planning'}
              {fertilityGoal === 'tracking' && 'Understanding your cycle'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-pink-600">{fertilityScore}%</div>
            <div className="text-sm text-gray-600">{fertilityPhase}</div>
          </div>
        </div>

        {/* Fertility Timeline */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Period</span>
            <span>Fertile Window</span>
            <span>Ovulation</span>
            <span>Next Period</span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
              style={{ width: '15%' }}
              initial={{ width: 0 }}
              animate={{ width: '15%' }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.div 
              className="absolute top-0 h-full bg-gradient-to-r from-green-400 to-yellow-500 rounded-full"
              style={{ left: `${((ovulationDay - 5) / cycleLength) * 100}%`, width: '25%' }}
              initial={{ width: 0 }}
              animate={{ width: '25%' }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.div 
              className="absolute top-0 h-full w-1 bg-orange-500"
              style={{ left: `${(cycleDay / cycleLength) * 100}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            />
          </div>
        </div>

        {/* Key Dates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-xl">
            <div className="text-lg font-bold text-gray-900">
              {daysToOvulation > 0 ? daysToOvulation : 'Today'}
            </div>
            <div className="text-xs text-gray-600">
              {daysToOvulation > 0 ? 'Days to Ovulation' : 'Ovulation Day'}
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <div className="text-lg font-bold text-pink-600">
              {isInFertilityWindow ? 'Active' : 'Closed'}
            </div>
            <div className="text-xs text-gray-600">Fertility Window</div>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <div className="text-lg font-bold text-blue-600">Day {cycleDay}</div>
            <div className="text-xs text-gray-600">Cycle Day</div>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <div className="text-lg font-bold text-purple-600">
              {format(addDays(lastPeriodDate, cycleLength), 'MMM d')}
            </div>
            <div className="text-xs text-gray-600">Next Period</div>
          </div>
        </div>
      </motion.div>

      {/* Fertility Signs Tracking */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Fertility Signs</h3>
          <button
            onClick={() => setShowDetailedTracking(!showDetailedTracking)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showDetailedTracking ? 'Simple View' : 'Detailed Tracking'}
          </button>
        </div>

        <div className="space-y-4">
          {/* Basal Body Temperature */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Thermometer className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="font-medium text-gray-900">Basal Body Temperature</h4>
                <p className="text-sm text-gray-600">Take first thing in the morning</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                step="0.1"
                min="95"
                max="100"
                placeholder="98.6"
                value={fertilityData.basalBodyTemp || ''}
                onChange={(e) => handleDataUpdate({ basalBodyTemp: parseFloat(e.target.value) })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">°F</span>
            </div>
          </div>

          {/* Cervical Mucus */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Droplets className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-medium text-gray-900">Cervical Mucus</h4>
                <p className="text-sm text-gray-600">
                  {fertilityData.cervicalMucus 
                    ? getMucusDescription(fertilityData.cervicalMucus)
                    : 'Track changes throughout your cycle'
                  }
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['dry', 'sticky', 'creamy', 'watery', 'egg-white'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleDataUpdate({ cervicalMucus: type })}
                  className={`p-2 text-xs rounded-lg border transition-all ${
                    fertilityData.cervicalMucus === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Ovulation Test */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-5 h-5 text-yellow-500" />
              <div>
                <h4 className="font-medium text-gray-900">Ovulation Test</h4>
                <p className="text-sm text-gray-600">LH surge detection</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDataUpdate({ ovulationTest: 'negative' })}
                className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                  fertilityData.ovulationTest === 'negative'
                    ? 'border-gray-500 bg-gray-100 text-gray-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Negative
              </button>
              <button
                onClick={() => handleDataUpdate({ ovulationTest: 'positive' })}
                className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                  fertilityData.ovulationTest === 'positive'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Positive
              </button>
            </div>
          </div>

          {/* Detailed Tracking Options */}
          {showDetailedTracking && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {/* Cervix Position */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-full" />
                  <div>
                    <h4 className="font-medium text-gray-900">Cervix Position</h4>
                    <p className="text-sm text-gray-600">High and soft indicates fertility</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((position) => (
                    <button
                      key={position}
                      onClick={() => handleDataUpdate({ cervixPosition: position })}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        fertilityData.cervixPosition === position
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {position.charAt(0).toUpperCase() + position.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Libido */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Libido Level</h4>
                    <p className="text-sm text-gray-600">Often increases during fertile window</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleDataUpdate({ libido: level })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        (fertilityData.libido || 0) >= level
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      ♥
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div 
        className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {fertilityGoal === 'conceiving' && 'Conception Tips'}
          {fertilityGoal === 'avoiding' && 'Natural Family Planning'}
          {fertilityGoal === 'tracking' && 'Cycle Insights'}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-700">
          {fertilityGoal === 'conceiving' && isInFertilityWindow && (
            <>
              <p>• You're in your fertile window - optimal time for conception!</p>
              <p>• Consider intimacy every other day during this period</p>
              <p>• Track basal body temperature for confirmation</p>
              <p>• Stay hydrated and maintain a healthy diet</p>
            </>
          )}
          
          {fertilityGoal === 'avoiding' && isInFertilityWindow && (
            <>
              <p>• High fertility period - use additional protection</p>
              <p>• Continue tracking temperature and mucus changes</p>
              <p>• Consider abstinence or barrier methods</p>
            </>
          )}
          
          {fertilityGoal === 'tracking' && (
            <>
              <p>• Track daily signs to understand your unique patterns</p>
              <p>• Look for consistency in ovulation timing</p>
              <p>• Note any factors that might affect your cycle</p>
            </>
          )}
          
          {!isInFertilityWindow && (
            <p>• Continue daily tracking for best predictions</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FertilityTracker;