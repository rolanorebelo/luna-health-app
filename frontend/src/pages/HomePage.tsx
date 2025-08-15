import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Calendar, 
  Camera, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  Target, 
  Moon, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Bell,
  Plus,
  BarChart3,
  Thermometer,
  Droplets,
  Clock,
  User,
  Star
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useHealthStore from '../stores/healthStore';
import useReminderStore from '../stores/reminderStore';
import ReminderForm from '../components/health/ReminderForm';
import { llmHealthService, CycleInsight } from '../services/llmHealthService';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ReactNode;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { loadCurrentCycle, loadInsights, loadPredictions } = useHealthStore();
  const { reminders, getUpcomingReminders, generateCycleReminders } = useReminderStore();
  const [showReminderForm, setShowReminderForm] = React.useState(false);
  const [aiInsight, setAiInsight] = React.useState<CycleInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = React.useState(false);

  // Calculate current cycle day
  const getCurrentCycleDay = (): number => {
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

  // Calculate current phase
  const getCurrentPhase = (): { phase: string; description: string; progress: number } => {
    if (!profile?.reproductiveHealth) {
      return { phase: 'Menstrual Phase', description: 'Period days', progress: 0 };
    }
    
    const { 
      periodLength = 5, 
      averageCycleLength = 28 
    } = profile.reproductiveHealth;
    
    const currentDay = getCurrentCycleDay();
    
    // Dynamic phase calculations
    const follicularEnd = Math.floor(averageCycleLength * 0.5) - 2; // Around day 12 for 28-day cycle, day 9 for 22-day
    const ovulatoryStart = follicularEnd + 1;
    const ovulatoryEnd = ovulatoryStart + 2; // 2-day ovulation window
    const lutealStart = ovulatoryEnd + 1;
    
    if (currentDay <= periodLength) {
      return { 
        phase: 'Menstrual Phase', 
        description: 'Period days - time for rest and self-care',
        progress: (currentDay / averageCycleLength) * 100
      };
    } else if (currentDay <= follicularEnd) {
      return { 
        phase: 'Follicular Phase', 
        description: 'Energy building - great time for new activities',
        progress: (currentDay / averageCycleLength) * 100
      };
    } else if (currentDay <= ovulatoryEnd) {
      return { 
        phase: 'Ovulatory Phase', 
        description: 'Peak fertility - optimal for conception',
        progress: (currentDay / averageCycleLength) * 100
      };
    } else {
      return { 
        phase: 'Luteal Phase', 
        description: 'Energy may dip - focus on self-care',
        progress: (currentDay / averageCycleLength) * 100
      };
    }
  };

  const currentCycleDay = getCurrentCycleDay();
  const currentPhaseInfo = getCurrentPhase();

  // Generate cycle reminders when profile data is available
  useEffect(() => {
    console.log('🔍 HomePage useEffect for reminders triggered');
    console.log('🔍 Profile reproductive health:', profile?.reproductiveHealth);
    
    if (profile?.reproductiveHealth) {
      const { lastPeriodDate, averageCycleLength = 28, periodLength = 5 } = profile.reproductiveHealth;
      console.log('🔍 Generating reminders with:', { lastPeriodDate, averageCycleLength, periodLength });
      
      if (lastPeriodDate) {
        generateCycleReminders(lastPeriodDate, averageCycleLength, periodLength);
        console.log('🔍 Reminders generated');
      } else {
        console.log('🔍 No lastPeriodDate found');
      }
    } else {
      console.log('🔍 No reproductive health data found');
    }
  }, [profile?.reproductiveHealth, generateCycleReminders]);

  // Get upcoming reminders for display
  const upcomingReminders = getUpcomingReminders();

  // Generate AI insight based on cycle data
  useEffect(() => {
    const generateAIInsight = async () => {
      if (!profile?.reproductiveHealth) return;

      setLoadingInsight(true);
      try {
        const insight = await llmHealthService.generateCycleInsight({
          current_cycle_day: currentCycleDay,
          cycle_length: profile.reproductiveHealth.averageCycleLength || 28,
          period_length: profile.reproductiveHealth.periodLength || 5,
          last_period_date: profile.reproductiveHealth.lastPeriodDate || new Date().toISOString().split('T')[0],
          health_goals: profile.healthGoals,
          reproductive_stage: profile.reproductiveStage
        });
        setAiInsight(insight);
      } catch (error) {
        console.error('Failed to generate AI insight:', error);
      } finally {
        setLoadingInsight(false);
      }
    };

    generateAIInsight();
  }, [profile, currentCycleDay]);
  console.log('🔍 Upcoming reminders:', upcomingReminders);

  // Mock data - in real app this would come from your stores/API
  const [healthMetrics] = React.useState<HealthMetric[]>([
    {
      id: 'wellness',
      name: 'Wellness Score',
      value: 85,
      unit: '%',
      trend: 'up',
      color: 'from-green-500 to-emerald-500',
      icon: <Activity className="w-5 h-5" />
    },
    {
      id: 'cycle',
      name: 'Cycle Day',
      value: currentCycleDay,
      unit: '',
      trend: 'stable',
      color: 'from-pink-500 to-rose-500',
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: 'mood',
      name: 'Mood Score',
      value: 7.8,
      unit: '/10',
      trend: 'up',
      color: 'from-purple-500 to-indigo-500',
      icon: <Brain className="w-5 h-5" />
    },
    {
      id: 'sleep',
      name: 'Sleep Quality',
      value: 7.2,
      unit: 'hrs',
      trend: 'down',
      color: 'from-blue-500 to-cyan-500',
      icon: <Moon className="w-5 h-5" />
    }
  ]);

  const [insights] = React.useState<Insight[]>([
    // This will be replaced with AI-generated insight
    {
      id: '1',
      type: 'success',
      title: 'Perfect Timing!',
      description: 'You\'re in your fertile window. Great time for conception if trying to get pregnant.',
      action: 'Track Fertility',
      actionUrl: '/fertility'
    },
    {
      id: '2',
      type: 'info',
      title: 'Sleep Improvement Tip',
      description: 'Your sleep quality has decreased. Try avoiding screens 1 hour before bed.',
      action: 'Sleep Tracker',
      actionUrl: '/sleep'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Unusual Symptom Pattern',
      description: 'We noticed some changes in your symptoms. Consider tracking more details.',
      action: 'Log Symptoms',
      actionUrl: '/symptoms'
    }
  ]);

  // Create dynamic insights with AI-generated first insight
  const dynamicInsights = React.useMemo(() => {
    const baseInsights = [...insights];
    
    if (aiInsight && !loadingInsight) {
      baseInsights[0] = {
        id: '1',
        type: aiInsight.type,
        title: aiInsight.title,
        description: aiInsight.description,
        action: aiInsight.action,
        actionUrl: '/cycle'
      };
    }
    
    return baseInsights;
  }, [insights, aiInsight, loadingInsight]);

  useEffect(() => {
    // Load health data when component mounts
    loadCurrentCycle();
    loadInsights();
    loadPredictions();
  }, [loadCurrentCycle, loadInsights, loadPredictions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {profile?.firstName || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your health overview for {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{getCurrentTime()}</div>
            <div className="text-sm text-gray-600">Current time</div>
          </div>
          <button className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Current Cycle Status */}
      <motion.div 
        className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Day {currentCycleDay}</h2>
            <p className="text-white/80 text-lg">{currentPhaseInfo.phase}</p>
            <p className="text-white/70 text-sm mt-2">{currentPhaseInfo.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">85%</div>
            <div className="text-white/80 text-sm">Health Score</div>
          </div>
        </div>

        {/* Phase Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-2">
            <span>Period</span>
            <span>Ovulation</span>
            <span>PMS</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-3 bg-white rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${currentPhaseInfo.progress}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Health Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {healthMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} text-white`}>
                {metric.icon}
              </div>
              <div className={`text-sm flex items-center ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {metric.trend === 'up' && '↗️'}
                {metric.trend === 'down' && '↘️'}
                {metric.trend === 'stable' && '→'}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}{metric.unit}
            </div>
            <div className="text-sm text-gray-600">{metric.name}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights & Recommendations */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              AI Insights & Recommendations
            </h3>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {dynamicInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                className={`p-4 rounded-xl border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      insight.type === 'success' ? 'bg-green-100' :
                      insight.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {insight.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {insight.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                      {insight.type === 'info' && <Sparkles className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    </div>
                  </div>
                  {insight.action && (
                    <button
                      onClick={() => insight.actionUrl && navigate(insight.actionUrl)}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center"
                    >
                      {insight.action}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {loadingInsight && (
              <motion.div
                className="p-4 rounded-xl border-l-4 bg-gray-50 border-gray-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-gray-100">
                    <Sparkles className="w-4 h-4 text-gray-600 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Generating Personalized Insight...</h4>
                    <p className="text-sm text-gray-600 mb-2">Our AI is analyzing your cycle data to provide tailored recommendations.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Reminders & Alerts */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-600" />
              Reminders
            </h3>
            <button 
              onClick={() => setShowReminderForm(true)}
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No upcoming reminders</p>
                <button 
                  onClick={() => setShowReminderForm(true)}
                  className="text-purple-600 hover:text-purple-700 text-sm mt-1"
                >
                  Add your first reminder
                </button>
              </div>
            ) : (
              upcomingReminders.map((reminder, index) => {
                const reminderDate = new Date(reminder.date);
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);
                
                let timeDisplay = '';
                if (reminder.date === today.toISOString().split('T')[0]) {
                  timeDisplay = reminder.time ? `Today ${reminder.time}` : 'Today';
                } else if (reminder.date === tomorrow.toISOString().split('T')[0]) {
                  timeDisplay = reminder.time ? `Tomorrow ${reminder.time}` : 'Tomorrow';
                } else {
                  const daysFromNow = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  timeDisplay = reminder.description || `In ${daysFromNow} day${daysFromNow > 1 ? 's' : ''}`;
                }

                return (
                  <motion.div
                    key={reminder.id}
                    className={`p-4 rounded-xl ${
                      reminder.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        reminder.type === 'period' ? 'bg-red-100' :
                        reminder.type === 'ovulation' ? 'bg-yellow-100' :
                        reminder.type === 'appointment' ? 'bg-blue-100' :
                        reminder.type === 'medication' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {reminder.type === 'period' && <Calendar className="w-4 h-4 text-red-600" />}
                        {reminder.type === 'ovulation' && <Target className="w-4 h-4 text-yellow-600" />}
                        {reminder.type === 'appointment' && <Clock className="w-4 h-4 text-blue-600" />}
                        {reminder.type === 'medication' && <Zap className="w-4 h-4 text-green-600" />}
                        {reminder.type === 'custom' && <Bell className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{reminder.title}</div>
                        <div className="text-sm text-gray-600">{timeDisplay}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { 
              icon: <Camera className="w-6 h-6" />, 
              title: 'Photo Analysis', 
              description: 'Analyze symptoms with AI',
              color: 'from-green-500 to-emerald-500',
              path: '/photo-analysis'
            },
            { 
              icon: <MessageCircle className="w-6 h-6" />, 
              title: 'Chat with WIHHMS', 
              description: 'Ask health questions',
              color: 'from-purple-500 to-indigo-500',
              path: '/chat'
            },
            { 
              icon: <Heart className="w-6 h-6" />, 
              title: 'Log Symptoms', 
              description: 'Track daily symptoms',
              color: 'from-pink-500 to-rose-500',
              path: '/symptoms'
            },
            { 
              icon: <Brain className="w-6 h-6" />, 
              title: 'Mood Tracker', 
              description: 'Track your mood patterns',
              color: 'from-indigo-500 to-purple-500',
              path: '/mood'
            },
            { 
              icon: <TrendingUp className="w-6 h-6" />, 
              title: 'View Insights', 
              description: 'See health patterns',
              color: 'from-blue-500 to-cyan-500',
              path: '/insights'
            }
          ].map((action, index) => (
            <motion.button
              key={index}
              onClick={() => navigate(action.path)}
              className="p-6 text-left bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
              whileHover={{ scale: 1.02, y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Recent Activity
          </h3>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {[
            { time: '2 hours ago', action: 'Logged mood symptoms', icon: <Brain className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600' },
            { time: '1 day ago', action: 'Completed photo analysis', icon: <Camera className="w-4 h-4" />, color: 'bg-green-100 text-green-600' },
            { time: '2 days ago', action: 'Chatted with WIHHMS AI', icon: <MessageCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
            { time: '3 days ago', action: 'Updated cycle tracking', icon: <Heart className="w-4 h-4" />, color: 'bg-pink-100 text-pink-600' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={`p-2 rounded-lg ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.action}</div>
                <div className="text-sm text-gray-600">{activity.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Health Tips */}
      <motion.div 
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-600" />
          Today's Health Tip
        </h3>
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Stay Hydrated During Ovulation</h4>
              <p className="text-gray-600 text-sm mb-3">
                During your fertile window, staying hydrated helps maintain healthy cervical mucus production. 
                Aim for 8-10 glasses of water today to support your reproductive health.
              </p>
              <button 
                onClick={() => navigate('/chat')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
              >
                Ask WIHHMS for more tips
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reminder Form Modal */}
      <ReminderForm 
        isOpen={showReminderForm} 
        onClose={() => setShowReminderForm(false)} 
      />
    </div>
  );
};

export default HomePage;