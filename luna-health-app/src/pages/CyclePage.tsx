import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Heart, 
  Target, 
  TrendingUp, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Droplets,
  Thermometer,
  Moon,
  Activity,
  AlertCircle,
  CheckCircle,
  Edit3,
  Save,
  X,
  BarChart3,
  Download,
  Share2,
  Info
} from 'lucide-react';
import useAuthStore from '../stores/authStore';

interface CycleDay {
  date: Date;
  cycleDay: number;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  periodFlow?: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: number; // 1-10 scale
  temperature?: number;
  notes?: string;
  isPredicted?: boolean;
}

interface CycleStats {
  averageLength: number;
  lastPeriodLength: number;
  nextPeriodDate: Date;
  nextOvulationDate: Date;
  cycleVariability: number;
  predictionsAccuracy: number;
}

const CyclePage: React.FC = () => {
  const { profile } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'chart' | 'log'>('calendar');
  const [cycleData, setCycleData] = useState<CycleDay[]>([]);
  const [cycleStats, setCycleStats] = useState<CycleStats | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logData, setLogData] = useState({
    periodFlow: '',
    symptoms: [] as string[],
    mood: 5,
    temperature: '',
    notes: ''
  });

  const symptoms = [
    'Cramps', 'Bloating', 'Headache', 'Breast tenderness', 'Back pain',
    'Nausea', 'Fatigue', 'Mood swings', 'Acne', 'Food cravings',
    'Insomnia', 'Anxiety', 'Irritability', 'Joint pain'
  ];

  useEffect(() => {
    loadCycleData();
    calculateCycleStats();
  }, []);

  const loadCycleData = () => {
    // Mock cycle data for the past 3 months
    const mockData: CycleDay[] = [];
    const today = new Date();
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const cycleDay = ((90 - i) % 28) + 1;
      let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
      
      if (cycleDay <= 5) phase = 'menstrual';
      else if (cycleDay <= 12) phase = 'follicular';
      else if (cycleDay <= 16) phase = 'ovulatory';
      else phase = 'luteal';

      const dayData: CycleDay = {
        date,
        cycleDay,
        phase,
        symptoms: [],
        mood: Math.floor(Math.random() * 4) + 6, // 6-10 range
        isPredicted: i < 28 // Future predictions
      };

      // Add period flow for menstrual phase
      if (phase === 'menstrual') {
        const flows = ['light', 'medium', 'heavy'] as const;
        dayData.periodFlow = flows[Math.floor(Math.random() * flows.length)];
      }

      // Add random symptoms
      if (Math.random() > 0.7) {
        const randomSymptoms = symptoms.slice(0, Math.floor(Math.random() * 3) + 1);
        dayData.symptoms = randomSymptoms;
      }

      mockData.push(dayData);
    }

    setCycleData(mockData);
  };

  const calculateCycleStats = () => {
    const stats: CycleStats = {
      averageLength: 28,
      lastPeriodLength: 5,
      nextPeriodDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      nextOvulationDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      cycleVariability: 2,
      predictionsAccuracy: 94
    };
    setCycleStats(stats);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'bg-red-500';
      case 'follicular': return 'bg-green-500';
      case 'ovulatory': return 'bg-yellow-500';
      case 'luteal': return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'Menstrual';
      case 'follicular': return 'Follicular';
      case 'ovulatory': return 'Ovulatory';
      case 'luteal': return 'Luteal';
      default: return 'Unknown';
    }
  };

  const getCurrentCycleDay = () => {
    const today = new Date();
    const todayData = cycleData.find(day => 
      day.date.toDateString() === today.toDateString()
    );
    return todayData?.cycleDay || 14;
  };

  const getCurrentPhase = () => {
    const today = new Date();
    const todayData = cycleData.find(day => 
      day.date.toDateString() === today.toDateString()
    );
    return todayData?.phase || 'ovulatory';
  };

  const getDayData = (date: Date) => {
    return cycleData.find(day => 
      day.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayData = getDayData(date);
    if (dayData) {
      setLogData({
        periodFlow: dayData.periodFlow || '',
        symptoms: dayData.symptoms || [],
        mood: dayData.mood || 5,
        temperature: dayData.temperature?.toString() || '',
        notes: dayData.notes || ''
      });
    }
    setIsLogging(true);
  };

  const saveDayLog = () => {
    if (!selectedDate) return;

    setCycleData(prev => prev.map(day => {
      if (day.date.toDateString() === selectedDate.toDateString()) {
        return {
          ...day,
          periodFlow: logData.periodFlow as any,
          symptoms: logData.symptoms,
          mood: logData.mood,
          temperature: logData.temperature ? parseFloat(logData.temperature) : undefined,
          notes: logData.notes
        };
      }
      return day;
    }));

    setIsLogging(false);
    setSelectedDate(null);
  };

  const toggleSymptom = (symptom: string) => {
    setLogData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cycle Tracking</h1>
          <p className="text-gray-600 mt-1">
            Track your menstrual cycle and get personalized insights
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </motion.div>

      {/* Current Status */}
      <motion.div 
        className={`bg-gradient-to-r ${getPhaseColor(getCurrentPhase()).replace('bg-', 'from-')} to-pink-500 rounded-2xl p-6 text-white`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Day {getCurrentCycleDay()}</h2>
            <p className="text-white/80 text-lg">{getPhaseLabel(getCurrentPhase())} Phase</p>
            {cycleStats && (
              <p className="text-white/70 text-sm mt-2">
                Next period in {Math.ceil((cycleStats.nextPeriodDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </p>
            )}
          </div>
          <div className="text-right">
            {cycleStats && (
              <>
                <div className="text-3xl font-bold">{cycleStats.predictionsAccuracy}%</div>
                <div className="text-white/80 text-sm">Prediction Accuracy</div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* View Mode Tabs */}
      <motion.div 
        className="flex space-x-1 bg-gray-100 rounded-xl p-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
          { id: 'chart', label: 'Charts', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'log', label: 'Daily Log', icon: <Edit3 className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              viewMode === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{formatDate(currentDate)}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-12"></div>;
              }

              const dayData = getDayData(date);
              const today = isToday(date);

              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`relative h-12 rounded-lg border transition-all hover:border-purple-300 ${
                    today ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-sm ${today ? 'font-bold text-purple-900' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </span>
                    {dayData && (
                      <div className="flex space-x-1 mt-1">
                        {/* Phase indicator */}
                        <div className={`w-2 h-2 rounded-full ${getPhaseColor(dayData.phase)}`}></div>
                        {/* Period flow indicator */}
                        {dayData.periodFlow && (
                          <div className={`w-2 h-2 rounded-full ${
                            dayData.periodFlow === 'heavy' ? 'bg-red-600' :
                            dayData.periodFlow === 'medium' ? 'bg-red-400' : 'bg-red-200'
                          }`}></div>
                        )}
                        {/* Symptoms indicator */}
                        {dayData.symptoms.length > 0 && (
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Menstrual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Follicular</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Ovulatory</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Luteal</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts View */}
      {viewMode === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cycle Length Chart */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Cycle Length Trends
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart visualization would appear here</p>
                <p className="text-sm text-gray-500">Average cycle: {cycleStats?.averageLength} days</p>
              </div>
            </div>
          </motion.div>

          {/* Mood Chart */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Mood Patterns
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Mood tracking chart would appear here</p>
                <p className="text-sm text-gray-500">Track daily mood to see patterns</p>
              </div>
            </div>
          </motion.div>

          {/* Symptoms Frequency */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
              Common Symptoms
            </h3>
            <div className="space-y-3">
              {symptoms.slice(0, 5).map((symptom, index) => (
                <div key={symptom} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{symptom}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.random() * 80 + 20}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.floor(Math.random() * 40 + 10)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Predictions Accuracy */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Prediction Accuracy
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {cycleStats?.predictionsAccuracy}%
              </div>
              <p className="text-gray-600 mb-4">Overall accuracy</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Period predictions</span>
                  <span className="font-medium">96%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ovulation predictions</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Symptom predictions</span>
                  <span className="font-medium">89%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Daily Log View */}
      {viewMode === 'log' && (
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Today's Log</h3>
            <button
              onClick={() => handleDateClick(new Date())}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today</span>
            </button>
          </div>

          {/* Recent Logs */}
          <div className="space-y-4">
            {cycleData.slice(-7).reverse().map((day) => (
              <div key={day.date.toISOString()} className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getPhaseColor(day.phase)}`}></div>
                    <span className="font-medium">{day.date.toLocaleDateString()}</span>
                    <span className="text-sm text-gray-600">Day {day.cycleDay}</span>
                  </div>
                  <button
                    onClick={() => handleDateClick(day.date)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Flow: </span>
                    <span className="font-medium">{day.periodFlow || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mood: </span>
                    <span className="font-medium">{day.mood}/10</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Symptoms: </span>
                    <span className="font-medium">{day.symptoms.length || 'None'}</span>
                  </div>
                </div>
                
                {day.symptoms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {day.symptoms.map((symptom) => (
                      <span key={symptom} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                        {symptom}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cycle Stats */}
      {cycleStats && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{cycleStats.averageLength}</div>
                <div className="text-sm text-gray-600">Avg Cycle Length</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{cycleStats.lastPeriodLength}</div>
                <div className="text-sm text-gray-600">Last Period Length</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{cycleStats.cycleVariability}</div>
                <div className="text-sm text-gray-600">Cycle Variability</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{cycleStats.predictionsAccuracy}%</div>
                <div className="text-sm text-gray-600">Prediction Accuracy</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Logging Modal */}
      <AnimatePresence>
        {isLogging && selectedDate && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Log for {selectedDate.toLocaleDateString()}
                </h3>
                <button
                  onClick={() => setIsLogging(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Period Flow */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Period Flow</label>
                  <div className="flex space-x-3">
                    {['light', 'medium', 'heavy'].map((flow) => (
                      <button
                        key={flow}
                        onClick={() => setLogData(prev => ({ ...prev, periodFlow: flow }))}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          logData.periodFlow === flow
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {flow.charAt(0).toUpperCase() + flow.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Symptoms</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {symptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          logData.symptoms.includes(symptom)
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mood (1-10): {logData.mood}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={logData.mood}
                    onChange={(e) => setLogData(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Terrible</span>
                    <span>Amazing</span>
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Basal Body Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={logData.temperature}
                    onChange={(e) => setLogData(prev => ({ ...prev, temperature: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="98.6"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={logData.notes}
                    onChange={(e) => setLogData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={saveDayLog}
                    className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Log</span>
                  </button>
                  <button
                    onClick={() => setIsLogging(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyclePage;