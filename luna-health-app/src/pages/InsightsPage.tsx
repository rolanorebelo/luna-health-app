import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Brain, 
  Heart, 
  Moon, 
  Activity, 
  Calendar, 
  BarChart3, 
  LineChart,
  PieChart,
  Target,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Thermometer,
  Droplets,
  Users,
  Award
} from 'lucide-react';
import useAuthStore from '../stores/authStore';

interface InsightCard {
  id: string;
  type: 'cycle' | 'mood' | 'sleep' | 'symptoms' | 'fertility' | 'wellness';
  title: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  value: string;
  change: string;
  color: string;
  icon: React.ReactNode;
  recommendations: string[];
}

interface PatternInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface HealthScore {
  category: string;
  score: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

const InsightsPage: React.FC = () => {
  const { profile } = useAuthStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cycle' | 'mood' | 'sleep' | 'symptoms'>('all');

  // Mock insights data
  const [insights] = useState<InsightCard[]>([
    {
      id: '1',
      type: 'cycle',
      title: 'Cycle Regularity',
      description: 'Your cycles have been highly consistent',
      trend: 'up',
      value: '95%',
      change: '+5% from last month',
      color: 'from-pink-500 to-rose-500',
      icon: <Heart className="w-6 h-6" />,
      recommendations: [
        'Continue current lifestyle habits',
        'Keep tracking cycle patterns',
        'Maintain regular exercise routine'
      ]
    },
    {
      id: '2',
      type: 'mood',
      title: 'Mood Stability',
      description: 'Emotional wellbeing shows improvement',
      trend: 'up',
      value: '7.8/10',
      change: '+1.2 from last month',
      color: 'from-purple-500 to-indigo-500',
      icon: <Brain className="w-6 h-6" />,
      recommendations: [
        'Continue mindfulness practices',
        'Maintain consistent sleep schedule',
        'Consider adding meditation to routine'
      ]
    },
    {
      id: '3',
      type: 'sleep',
      title: 'Sleep Quality',
      description: 'Sleep patterns need attention',
      trend: 'down',
      value: '6.9 hrs',
      change: '-0.8 hrs from target',
      color: 'from-blue-500 to-cyan-500',
      icon: <Moon className="w-6 h-6" />,
      recommendations: [
        'Aim for 7-9 hours nightly',
        'Avoid screens 1 hour before bed',
        'Create a consistent bedtime routine'
      ]
    },
    {
      id: '4',
      type: 'wellness',
      title: 'Overall Wellness',
      description: 'Comprehensive health score trending up',
      trend: 'up',
      value: '85%',
      change: '+7% this month',
      color: 'from-green-500 to-emerald-500',
      icon: <Activity className="w-6 h-6" />,
      recommendations: [
        'Great progress on health goals',
        'Keep up current wellness routine',
        'Consider setting new challenges'
      ]
    }
  ]);

  const [patternInsights] = useState<PatternInsight[]>([
    {
      id: '1',
      title: 'PMS Symptoms Peak on Day 25',
      description: 'Your mood dips and physical symptoms consistently intensify 3 days before your period starts.',
      confidence: 92,
      category: 'Cycle Patterns',
      impact: 'high',
      actionable: true
    },
    {
      id: '2',
      title: 'Sleep Quality Affects Next-Day Mood',
      description: 'Poor sleep quality (below 7 hours) correlates with 40% lower mood scores the following day.',
      confidence: 88,
      category: 'Lifestyle Correlation',
      impact: 'high',
      actionable: true
    },
    {
      id: '3',
      title: 'Ovulation Energy Boost Pattern',
      description: 'You consistently report 25% higher energy levels during your ovulatory phase (days 12-16).',
      confidence: 85,
      category: 'Hormonal Patterns',
      impact: 'medium',
      actionable: false
    },
    {
      id: '4',
      title: 'Stress Impacts Cycle Length',
      description: 'High stress periods correlate with slightly longer cycles (+2-3 days) in your data.',
      confidence: 76,
      category: 'Stress Correlation',
      impact: 'medium',
      actionable: true
    }
  ]);

  const [healthScores] = useState<HealthScore[]>([
    {
      category: 'Cycle Health',
      score: 92,
      maxScore: 100,
      trend: 'up',
      factors: ['Regular periods', 'Consistent cycle length', 'Healthy flow patterns']
    },
    {
      category: 'Mental Wellness',
      score: 78,
      maxScore: 100,
      trend: 'up',
      factors: ['Mood stability', 'Stress management', 'Sleep quality']
    },
    {
      category: 'Fertility Indicators',
      score: 88,
      maxScore: 100,
      trend: 'stable',
      factors: ['Ovulation tracking', 'Cervical mucus patterns', 'Temperature trends']
    },
    {
      category: 'Lifestyle Balance',
      score: 75,
      maxScore: 100,
      trend: 'down',
      factors: ['Exercise frequency', 'Nutrition habits', 'Sleep consistency']
    }
  ]);

  const timeframes = [
    { id: 'week', label: 'Past Week' },
    { id: 'month', label: 'Past Month' },
    { id: '3months', label: 'Past 3 Months' },
    { id: 'year', label: 'Past Year' }
  ];

  const categories = [
    { id: 'all', label: 'All Insights' },
    { id: 'cycle', label: 'Cycle' },
    { id: 'mood', label: 'Mood' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'symptoms', label: 'Symptoms' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Insights</h1>
          <p className="text-gray-600 mt-1">
            Discover patterns and trends in your health data with AI-powered analysis
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">AI Powered</div>
            <div className="text-sm text-gray-600">Smart Analysis</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Timeframe Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <div className="flex space-x-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTimeframe === timeframe.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Health Score Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {healthScores.map((score, index) => (
          <motion.div
            key={score.category}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{score.category}</h3>
              {getTrendIcon(score.trend)}
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">{score.score}</span>
                <span className="text-lg text-gray-600">/{score.maxScore}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    score.score >= 80 ? 'bg-green-500' :
                    score.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              {score.factors.slice(0, 2).map((factor, idx) => (
                <div key={idx} className="text-xs text-gray-600 flex items-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                  {factor}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Insights */}
        <motion.div 
          className="lg:col-span-2 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Key Health Insights
          </h2>

          {filteredInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${insight.color} text-white`}>
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{insight.title}</h3>
                    <p className="text-gray-600 text-sm">{insight.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{insight.value}</div>
                  <div className={`text-sm flex items-center ${
                    insight.trend === 'up' ? 'text-green-600' :
                    insight.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getTrendIcon(insight.trend)}
                    <span className="ml-1">{insight.change}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                <div className="space-y-1">
                  {insight.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-center">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pattern Analysis */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
              <Zap className="w-5 h-5 mr-2 text-orange-600" />
              AI Pattern Analysis
            </h2>

            <div className="space-y-4">
              {patternInsights.map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{pattern.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(pattern.impact)}`}>
                        {pattern.impact}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-500">Confidence:</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${pattern.confidence}%` }}
                        />
                      </div>
                      <div className="text-xs font-medium text-gray-700">{pattern.confidence}%</div>
                    </div>
                    {pattern.actionable && (
                      <div className="text-xs text-green-600 flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        Actionable
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-600" />
              Your Progress
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Data Points Analyzed</span>
                <span className="font-bold text-gray-900">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Patterns Identified</span>
                <span className="font-bold text-purple-600">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Accuracy Score</span>
                <span className="font-bold text-green-600">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Tracking Streak</span>
                <span className="font-bold text-orange-600">47 days</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="text-xs text-purple-700">
                <strong>Tip:</strong> The more data you track, the more accurate and personalized your insights become!
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Achievement Section */}
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
          <Star className="w-5 h-5 mr-2 text-yellow-600" />
          Health Achievements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Cycle Consistency Champion',
              description: 'Maintained regular cycles for 3+ months',
              icon: <Heart className="w-6 h-6 text-pink-600" />,
              progress: 100,
              earned: true
            },
            {
              title: 'Mood Master',
              description: 'Improved mood stability by 20%',
              icon: <Brain className="w-6 h-6 text-purple-600" />,
              progress: 85,
              earned: false
            },
            {
              title: 'Sleep Optimizer',
              description: 'Achieve 7+ hours sleep for 7 days',
              icon: <Moon className="w-6 h-6 text-blue-600" />,
              progress: 60,
              earned: false
            }
          ].map((achievement, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                achievement.earned 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {achievement.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{achievement.title}</h4>
                  {achievement.earned && (
                    <div className="text-xs text-yellow-600 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Earned!
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    achievement.earned ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{achievement.progress}%</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default InsightsPage;