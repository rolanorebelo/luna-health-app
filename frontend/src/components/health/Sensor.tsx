import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  Wifi, 
  Battery, 
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Zap,
  Shield,
  Bluetooth,
  Play,
  Download
} from 'lucide-react';

interface SensorReading {
  type: 'temperature' | 'ph' | 'hormones' | 'glucose';
  value: number;
  unit: string;
  status: 'normal' | 'elevated' | 'low';
  timestamp: Date;
}

interface SensorProps {
  onStartTest?: () => void;
  onViewHistory?: () => void;
}

const Sensor: React.FC<SensorProps> = ({ onStartTest, onViewHistory }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Mock sensor readings
  const [readings, setReadings] = useState<SensorReading[]>([
    {
      type: 'temperature',
      value: 98.6,
      unit: '°F',
      status: 'normal',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      type: 'ph',
      value: 4.2,
      unit: 'pH',
      status: 'normal',
      timestamp: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      type: 'hormones',
      value: 125,
      unit: 'pg/mL',
      status: 'elevated',
      timestamp: new Date(Date.now() - 1000 * 60 * 60)
    }
  ]);

  const testTypes = [
    {
      id: 'hormone',
      name: 'Hormone Panel',
      description: 'Estrogen, Progesterone, LH, FSH levels',
      duration: '3-5 minutes',
      icon: <Activity className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'ph',
      name: 'Vaginal pH',
      description: 'Monitor vaginal health and balance',
      duration: '1-2 minutes',
      icon: <Droplets className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'fertility',
      name: 'Fertility Markers',
      description: 'LH surge, ovulation prediction',
      duration: '2-3 minutes',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'inflammation',
      name: 'Inflammation',
      description: 'C-reactive protein, infection markers',
      duration: '3-4 minutes',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'elevated': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const startTest = (testType: string) => {
    setCurrentTest(testType);
    setTestProgress(0);
    setShowResults(false);
    
    // Simulate test progress
    const interval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentTest(null);
          setShowResults(true);
          return 100;
        }
        return prev + 20;
      });
    }, 1000);
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">WIHMMScope</h3>
            <p className="text-sm text-gray-600">At-home health testing</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <motion.div 
          className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <Bluetooth className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Connect Your Sensor</h4>
              <p className="text-sm text-blue-700">Pair your WIHHMS sensor to start testing</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsConnected(true)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Connect Sensor
            </button>
            <button className="px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm">
              Download App
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Device Status */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Battery className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-900">{batteryLevel}%</div>
              <div className="text-xs text-gray-600">Battery</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Wifi className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-900">Strong</div>
              <div className="text-xs text-gray-600">Signal</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-900">Ready</div>
              <div className="text-xs text-gray-600">Status</div>
            </div>
          </div>

          {/* Current Test Progress */}
          <AnimatePresence>
            {currentTest && (
              <motion.div 
                className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-900">Testing in Progress</h4>
                    <p className="text-sm text-purple-700">
                      {testTypes.find(t => t.id === currentTest)?.name} - {testTypes.find(t => t.id === currentTest)?.duration}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <motion.div 
                    className="bg-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${testProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm font-medium text-purple-900">{testProgress}% Complete</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Test Results */}
          <AnimatePresence>
            {showResults && (
              <motion.div 
                className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Test Complete!</h4>
                    <p className="text-sm text-green-700">Results have been added to your health profile</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowResults(false)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View Detailed Results →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Available Tests */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Available Tests</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testTypes.map((test) => (
                <motion.button
                  key={test.id}
                  onClick={() => startTest(test.id)}
                  disabled={!!currentTest}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    currentTest ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                  } bg-white border-gray-200 hover:border-gray-300`}
                  whileHover={!currentTest ? { scale: 1.02 } : {}}
                  whileTap={!currentTest ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${test.color} text-white`}>
                      {test.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{test.name}</h5>
                      <p className="text-xs text-gray-600 mb-2">{test.description}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{test.duration}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Recent Results</h4>
              <button 
                onClick={onViewHistory}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {readings.slice(0, 3).map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="capitalize font-medium text-gray-900">
                      {reading.type.replace('-', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {reading.value} {reading.unit}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reading.status)}`}>
                      {reading.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export Data</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-purple-100 rounded-xl hover:bg-purple-200 transition-colors text-purple-700">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm font-medium">Sync App</span>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Sensor;