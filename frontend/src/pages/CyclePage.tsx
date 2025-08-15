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
import { cyclePredictionAI, type CyclePredictionData, type PredictionResult } from '../services/cyclePredictionAI';

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
  fertilityWindow: { start: Date; end: Date };
  recommendations: string[];
  confidence: number;
}

const CyclePage: React.FC = () => {
  const { profile } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'chart' | 'log'>('calendar');
  const [cycleData, setCycleData] = useState<CycleDay[]>([]);
  const [cycleStats, setCycleStats] = useState<CycleStats | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [logData, setLogData] = useState({
    periodFlow: '',
    symptoms: [] as string[],
    mood: 5,
    notes: ''
  });

  const symptoms = [
    'Cramps', 'Bloating', 'Headache', 'Breast tenderness', 'Back pain',
    'Nausea', 'Fatigue', 'Mood swings', 'Acne', 'Food cravings',
    'Insomnia', 'Anxiety', 'Irritability', 'Joint pain'
  ];

  useEffect(() => {
    if (profile?.reproductiveHealth) {
      loadCycleData();
      generateAIPredictions();
    }
  }, [profile]);

  const loadCycleData = async () => {
    if (!profile?.reproductiveHealth) return;

    // Start with user's actual data with defaults
    const { 
      lastPeriodDate = new Date().toISOString().split('T')[0], 
      averageCycleLength = 28, 
      periodLength = 5 
    } = profile.reproductiveHealth;
    
    const cycleData: CycleDay[] = [];
    const today = new Date();
    const lastPeriod = new Date(lastPeriodDate);
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only generate data from the last period date onwards, not arbitrary past dates
    const startDate = new Date(Math.max(lastPeriod.getTime(), today.getTime() - (60 * 24 * 60 * 60 * 1000))); // Max 60 days back or last period, whichever is more recent
    const endDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days future
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const daysSinceLastPeriod = Math.floor((currentDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate which cycle we're in and the day within that cycle
      let cycleDay;
      if (daysSinceLastPeriod >= 0) {
        cycleDay = (daysSinceLastPeriod % averageCycleLength) + 1;
      } else {
        // Handle days before the last period (previous cycle)
        const daysFromPreviousCycle = Math.abs(daysSinceLastPeriod) % averageCycleLength;
        cycleDay = averageCycleLength - daysFromPreviousCycle + 1;
      }
      
      let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
      
      // Dynamic phase breakdown based on user's actual cycle length:
      const follicularEnd = Math.floor(averageCycleLength * 0.45); // ~45% of cycle
      const ovulatoryEnd = Math.floor(averageCycleLength * 0.6);   // ~60% of cycle
      
      if (cycleDay <= periodLength) {
        phase = 'menstrual';
      } else if (cycleDay <= follicularEnd) {
        phase = 'follicular';
      } else if (cycleDay <= ovulatoryEnd) {
        phase = 'ovulatory';
      } else {
        phase = 'luteal';
      }

      const dayData: CycleDay = {
        date: new Date(currentDate),
        cycleDay,
        phase,
        symptoms: [], // No random symptoms - users log their own
        mood: Math.floor(Math.random() * 4) + 6, // 6-10 range for mock data
        isPredicted: currentDate > today // Future dates are predictions
      };

      // Only add period flow if user has actually logged it
      // For now, we'll show predicted period flow only for future menstrual days
      if (phase === 'menstrual' && dayData.isPredicted) {
        dayData.periodFlow = 'medium'; // Default prediction
      }

      cycleData.push(dayData);
      
      // Increment to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCycleData(cycleData);
  };

  const generateAIPredictions = async () => {
    if (!profile?.reproductiveHealth) return;

    try {
      // Use defaults if values are undefined
      const {
        lastPeriodDate = new Date().toISOString().split('T')[0],
        averageCycleLength = 28,
        periodLength = 5
      } = profile.reproductiveHealth;

      // Find the most recent menstrual phase start from our generated cycle data
      const today = new Date();
      const recentMenstrualStart = findMostRecentMenstrualStart(today, lastPeriodDate, averageCycleLength);
      
      const predictionData: CyclePredictionData = {
        lastPeriodDate: recentMenstrualStart.toISOString().split('T')[0], // Use the aligned cycle start
        averageCycleLength,
        periodLength,
        // Add mock historical data for better predictions
        historicalData: [], // Temporarily disable to avoid interference
        age: profile.age,
        lifestyle: {
          stressLevel: 5, // Mock data
          exerciseFrequency: 'moderate',
          sleepHours: 7
        }
      };

      console.log(`Input to AI: Recent menstrual start: ${recentMenstrualStart.toDateString()}, Cycle length: ${averageCycleLength}, Period length: ${periodLength}`);

      const aiPredictions = await cyclePredictionAI.predictCycle(predictionData);
      console.log(`✅ AI predictions successful - Next period: ${aiPredictions.nextPeriodDate.toDateString()}`);

      // Update cycle stats with AI predictions
      const stats: CycleStats = {
        averageLength: averageCycleLength,
        lastPeriodLength: periodLength,
        nextPeriodDate: aiPredictions.nextPeriodDate,
        nextOvulationDate: aiPredictions.nextOvulationDate,
        fertilityWindow: aiPredictions.fertilityWindow,
        cycleVariability: 2, // This would be calculated from historical data
        predictionsAccuracy: Math.round(aiPredictions.confidence * 100),
        recommendations: aiPredictions.recommendations,
        confidence: aiPredictions.confidence
      };
      setCycleStats(stats);

    } catch (error) {
      console.error('Failed to generate AI predictions:', error);
      // Fallback to basic calculations
      calculateBasicStats();
    }
  };

  const generateMockHistoricalData = () => {
    // Generate mock historical data for the AI to work with
    const historicalData = [];
    const today = new Date();
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        cycleDay: ((i % 28) + 1),
        symptoms: i % 5 === 0 ? ['Cramps', 'Fatigue'] : [],
        mood: Math.floor(Math.random() * 3) + 7,
        flow: i % 28 < 5 ? 'medium' : undefined
      });
    }
    
    return historicalData;
  };

  const findMostRecentMenstrualStart = (today: Date, lastPeriodDate: string, averageCycleLength: number) => {
    const lastPeriod = new Date(lastPeriodDate);
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    
    // Find how many complete cycles have passed
    const cyclesSinceLastPeriod = Math.floor(daysSinceLastPeriod / averageCycleLength);
    
    // Calculate the most recent cycle start
    const recentCycleStart = new Date(lastPeriod);
    recentCycleStart.setDate(recentCycleStart.getDate() + (cyclesSinceLastPeriod * averageCycleLength));
    
    console.log(`📊 CYCLE CALCULATION: Days since ${lastPeriod.toDateString()}: ${daysSinceLastPeriod}, Complete cycles: ${cyclesSinceLastPeriod}`);
    console.log(`📅 Recent cycle start: ${recentCycleStart.toDateString()}`);
    
    return recentCycleStart;
  };

  const calculateBasicStats = () => {
    if (!profile?.reproductiveHealth) return;

    // Use defaults if values are undefined
    const {
      lastPeriodDate = new Date().toISOString().split('T')[0],
      averageCycleLength = 28,
      periodLength = 5
    } = profile.reproductiveHealth;

    const today = new Date();
    const lastPeriod = new Date(lastPeriodDate);
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    
    // Find the most recent cycle start that aligns with our calendar display
    const cyclesSinceLastPeriod = Math.floor(daysSinceLastPeriod / averageCycleLength);
    const currentCycleStartDate = new Date(lastPeriod);
    currentCycleStartDate.setDate(currentCycleStartDate.getDate() + (cyclesSinceLastPeriod * averageCycleLength));
    
    // Calculate next period start (one full cycle from current cycle start)
    const nextPeriod = new Date(currentCycleStartDate);
    nextPeriod.setDate(nextPeriod.getDate() + averageCycleLength);
    
    console.log(`Debug - Current cycle start: ${currentCycleStartDate.toDateString()}, Next period: ${nextPeriod.toDateString()}, Today: ${today.toDateString()}`);
    
    const nextOvulation = new Date(nextPeriod);
    nextOvulation.setDate(nextOvulation.getDate() - 14);

    const fertilityStart = new Date(nextOvulation);
    fertilityStart.setDate(fertilityStart.getDate() - 5);
    const fertilityEnd = new Date(nextOvulation);
    fertilityEnd.setDate(fertilityEnd.getDate() + 1);

    const stats: CycleStats = {
      averageLength: averageCycleLength,
      lastPeriodLength: periodLength,
      nextPeriodDate: nextPeriod,
      nextOvulationDate: nextOvulation,
      fertilityWindow: { start: fertilityStart, end: fertilityEnd },
      cycleVariability: 2,
      predictionsAccuracy: 85,
      recommendations: ["Track your symptoms to improve predictions", "Maintain a regular sleep schedule"],
      confidence: 0.85
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
    if (!profile?.reproductiveHealth) return 1;
    
    const { 
      lastPeriodDate = new Date().toISOString().split('T')[0], 
      averageCycleLength = 28 
    } = profile.reproductiveHealth;
    const today = new Date();
    const lastPeriod = new Date(lastPeriodDate);
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate current cycle day
    let currentCycleDay;
    if (daysSinceLastPeriod >= 0) {
      currentCycleDay = (daysSinceLastPeriod % averageCycleLength) + 1;
    } else {
      // Handle days before the last period (previous cycle)
      const daysFromPreviousCycle = Math.abs(daysSinceLastPeriod) % averageCycleLength;
      currentCycleDay = averageCycleLength - daysFromPreviousCycle + 1;
    }
    
    return currentCycleDay;
  };

  const getCurrentPhase = () => {
    if (!profile?.reproductiveHealth) return 'follicular';
    
    const { periodLength = 5, averageCycleLength = 28 } = profile.reproductiveHealth;
    const currentCycleDay = getCurrentCycleDay();
    
    // Calculate phase based on current cycle day
    const follicularEnd = Math.floor(averageCycleLength * 0.45);
    const ovulatoryEnd = Math.floor(averageCycleLength * 0.6);
    
    if (currentCycleDay <= periodLength) {
      return 'menstrual';
    } else if (currentCycleDay <= follicularEnd) {
      return 'follicular';
    } else if (currentCycleDay <= ovulatoryEnd) {
      return 'ovulatory';
    } else {
      return 'luteal';
    }
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
        notes: dayData.notes || ''
      });
    }
    setIsLogging(true);
  };

  const saveDayLog = async () => {
    if (!selectedDate) return;

    setCycleData(prev => prev.map(day => {
      if (day.date.toDateString() === selectedDate.toDateString()) {
        return {
          ...day,
          periodFlow: logData.periodFlow as any,
          symptoms: logData.symptoms,
          mood: logData.mood,
          notes: logData.notes
        };
      }
      return day;
    }));

    // Regenerate AI predictions with new data
    if (profile?.reproductiveHealth) {
      await generateAIPredictions();
    }

    setIsLogging(false);
    setSelectedDate(null);
    
    // Reset form
    setLogData({
      periodFlow: '',
      symptoms: [],
      mood: 5,
      notes: ''
    });
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

  const isPredictedEvent = (date: Date) => {
    if (!cycleStats) return null;
    
    const dateStr = date.toDateString();
    
    // Check if it's predicted period start (highest priority)
    if (dateStr === cycleStats.nextPeriodDate.toDateString()) {
      return { type: 'period', label: 'Predicted Period Start' };
    }
    
    // Check if it's predicted ovulation (second priority)
    if (dateStr === cycleStats.nextOvulationDate.toDateString()) {
      return { type: 'ovulation', label: 'Predicted Ovulation' };
    }
    
    // Check if it's in fertility window (but not ovulation day)
    if (date >= cycleStats.fertilityWindow.start && 
        date <= cycleStats.fertilityWindow.end &&
        dateStr !== cycleStats.nextOvulationDate.toDateString()) {
      return { type: 'fertility', label: 'Fertility Window' };
    }
    
    return null;
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
        </div>
      </motion.div>

      {/* AI Insights & Recommendations */}
      {cycleStats && predictions && (
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {Math.round(cycleStats.confidence * 100)}% Confidence
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Predictions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Predictions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">Next Period</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {cycleStats.nextPeriodDate.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">Ovulation</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {cycleStats.nextOvulationDate.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Fertility Window</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {cycleStats.fertilityWindow.start.toLocaleDateString()} - {cycleStats.fertilityWindow.end.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* AI Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Personalized Recommendations</h4>
              <div className="space-y-2">
                {cycleStats.recommendations.slice(0, 4).map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
              const predictedEvent = isPredictedEvent(date);

              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`relative h-12 rounded-lg border transition-all hover:border-purple-300 ${
                    today 
                      ? 'border-purple-500 bg-purple-50' 
                      : predictedEvent
                      ? predictedEvent.type === 'period' 
                        ? 'border-red-400 bg-red-50' 
                        : predictedEvent.type === 'ovulation'
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={predictedEvent?.label || ''}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-sm ${
                      today 
                        ? 'font-bold text-purple-900' 
                        : predictedEvent
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </span>
                    {dayData && (
                      <div className="flex space-x-0.5 mt-1 justify-center">
                        {/* Primary indicator: Period flow takes priority over phase */}
                        {dayData.periodFlow ? (
                          <div className={`w-2 h-2 rounded-full ${
                            dayData.periodFlow === 'heavy' ? 'bg-red-700' :
                            dayData.periodFlow === 'medium' ? 'bg-red-500' : 'bg-red-300'
                          }`} title={`${dayData.periodFlow} flow`}></div>
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${getPhaseColor(dayData.phase)}`} title={`${dayData.phase} phase`}></div>
                        )}
                        
                        {/* Symptoms indicator - only if there are symptoms */}
                        {dayData.symptoms.length > 0 && (
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-sm" title={`${dayData.symptoms.length} symptoms`}></div>
                        )}
                      </div>
                    )}
                    {/* Prediction indicator - star shape for AI predictions */}
                    {predictedEvent && (
                      <div className="absolute -top-0.5 -right-0.5">
                        <div className={`w-2.5 h-2.5 transform rotate-45 ${
                          predictedEvent.type === 'period' 
                            ? 'bg-red-600 border border-red-700' 
                            : predictedEvent.type === 'ovulation'
                            ? 'bg-yellow-500 border border-yellow-600'
                            : 'bg-green-500 border border-green-600'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-4">Calendar Legend</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {/* Cycle Phases */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800 text-xs uppercase tracking-wide border-b border-gray-300 pb-1">Cycle Phases</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Menstrual</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Follicular</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Ovulatory</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Luteal</span>
                  </div>
                </div>
              </div>
              
              {/* Flow & Tracking */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800 text-xs uppercase tracking-wide border-b border-gray-300 pb-1">Flow & Symptoms</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-700"></div>
                    <span>Heavy Flow</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-500"></div>
                    <span>Medium Flow</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-red-300"></div>
                    <span>Light Flow</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                    <span>Symptoms Logged</span>
                  </div>
                </div>
              </div>
              
              {/* AI Predictions */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-800 text-xs uppercase tracking-wide border-b border-gray-300 pb-1">AI Predictions</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-red-600 border border-red-700 transform rotate-45"></div>
                    </div>
                    <span>Next Period Start</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-yellow-500 border border-yellow-600 transform rotate-45"></div>
                    </div>
                    <span>Ovulation Day</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 border border-green-600 transform rotate-45"></div>
                    </div>
                    <span>Fertility Window</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <Info className="w-3 h-3" />
                    <span>Diamond shapes indicate AI predictions</span>
                  </div>
                </div>
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
              Current Cycle Progress
            </h3>
            <div className="h-64 bg-gray-50 rounded-xl p-6">
              {/* Current Cycle Progress */}
              <div className="h-full flex flex-col justify-center">
                {/* Cycle Day Display */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">Day 4</div>
                  <div className="text-lg text-gray-700 mb-1">Menstrual Phase</div>
                  <div className="text-sm text-gray-500">of your 22-day cycle</div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Cycle Start</span>
                    <span>18% Complete</span>
                    <span>Next Period</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: '18%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Day 1</span>
                    <span>Day 22</span>
                  </div>
                </div>
                
                {/* Phase Indicators */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-pink-100 rounded-lg border-2 border-pink-300">
                    <div className="font-semibold text-pink-700">Menstrual</div>
                    <div className="text-pink-600">Days 1-5</div>
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mx-auto"></div>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-100 rounded-lg">
                    <div className="font-semibold text-gray-600">Follicular</div>
                    <div className="text-gray-500">Days 6-9</div>
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-100 rounded-lg">
                    <div className="font-semibold text-gray-600">Ovulatory</div>
                    <div className="text-gray-500">Days 10-12</div>
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-100 rounded-lg">
                    <div className="font-semibold text-gray-600">Luteal</div>
                    <div className="text-gray-500">Days 13-22</div>
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                    </div>
                  </div>
                </div>
                
                {/* Next Period Countdown */}
                <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <span className="font-semibold">18 days</span> until your next period
                  </div>
                </div>
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{cycleStats.averageLength}</div>
                <div className="text-sm text-gray-600">Avg Cycle Length</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{cycleStats.lastPeriodLength}</div>
                <div className="text-sm text-gray-600">Last Period Length</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{cycleStats.cycleVariability}</div>
                <div className="text-sm text-gray-600">Cycle Variability</div>
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