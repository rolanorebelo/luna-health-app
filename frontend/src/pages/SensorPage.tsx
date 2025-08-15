import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Shield, 
  Clock,
  Lock,
  Target,
  Home,
  CheckCircle
} from 'lucide-react';

interface SensorComponentProps {
  onStartTest: () => void;
  onViewHistory: () => void;
}

const SensorComponent: React.FC<SensorComponentProps> = ({ onStartTest, onViewHistory }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">WIHHMS Smart Sensor</h3>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          Advanced at-home health testing technology that provides laboratory-quality results 
          in minutes. Monitor key health metrics with medical-grade accuracy from the comfort 
          of your home.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {[
          {
            icon: <Target className="w-5 h-5" />,
            title: 'Precision Testing',
            description: 'Medical-grade sensors with clinical accuracy',
            color: 'text-blue-500'
          },
          {
            icon: <Clock className="w-5 h-5" />,
            title: 'Instant Results',
            description: 'Get comprehensive health insights in under 5 minutes',
            color: 'text-green-500'
          },
          {
            icon: <Shield className="w-5 h-5" />,
            title: 'Secure & Private',
            description: 'Your health data is encrypted and stays completely private',
            color: 'text-purple-500'
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-start space-x-3 p-3 bg-white rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className={`${feature.color} mt-1`}>
              {feature.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onStartTest}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg text-sm"
        >
          Start Test
        </button>
        <button
          onClick={onViewHistory}
          className="bg-white text-blue-600 py-3 px-4 rounded-xl font-semibold border-2 border-blue-200 hover:border-blue-300 transition-all text-sm"
        >
          View History
        </button>
      </div>
    </motion.div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  </div>
);

const SensorPage: React.FC = () => {
  const handleStartTest = () => {
    console.log('Starting sensor test');
    alert('Initializing WIHHMS Smart Sensor...\nPlease follow the on-screen instructions.');
  };

  const handleViewHistory = () => {
    console.log('Viewing sensor history');
    alert('Opening your sensor test history...');
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto px-6 space-y-8">
          {/* Page Header */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">WIHHMS Smart Sensor</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced at-home health testing technology for comprehensive wellness monitoring
            </p>
          </motion.div>

          {/* Sensor Component */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-full max-w-2xl">
              <SensorComponent 
                onStartTest={handleStartTest}
                onViewHistory={handleViewHistory}
              />
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div 
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Use Smart Sensor Technology?</h2>
            <div className="space-y-6 text-gray-600">
              <p className="text-lg text-center">
                The WIHHMS Smart Sensor brings laboratory-quality testing to your home, providing 
                real-time insights into your health metrics with medical-grade accuracy.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {[
                  { icon: <Home className="w-6 h-6 text-blue-500" />, title: "Convenience", text: "Test from the comfort of your home, anytime" },
                  { icon: <Target className="w-6 h-6 text-green-500" />, title: "Accuracy", text: "Medical-grade sensors with clinical precision" },
                  { icon: <Zap className="w-6 h-6 text-yellow-500" />, title: "Real-time Results", text: "Instant health insights and trend tracking" },
                  { icon: <Lock className="w-6 h-6 text-purple-500" />, title: "Privacy", text: "Your health data stays secure and private" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    {item.icon}
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Technology Features */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Activity className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Parameter Testing</h3>
                <p className="text-gray-600">Test multiple health markers simultaneously</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">Advanced algorithms provide personalized insights</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">FDA Cleared</h3>
                <p className="text-gray-600">Meet the highest medical device standards</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SensorPage;