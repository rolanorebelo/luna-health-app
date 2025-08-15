import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import SensorComponent from '../components/health/Sensor';

const SensorPage: React.FC = () => {
  const handleStartTest = () => {
    console.log('Starting sensor test');
  };

  const handleViewHistory = () => {
    console.log('Viewing sensor history');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WIHHMS Smart Sensor</h1>
          <p className="text-lg text-gray-600">
            Advanced at-home health testing technology for comprehensive wellness monitoring
          </p>
        </motion.div>

        {/* Sensor Component */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <SensorComponent 
              onStartTest={handleStartTest}
              onViewHistory={handleViewHistory}
            />
          </div>
        </div>

        {/* Benefits Section */}
        <motion.div 
          className="bg-blue-50 rounded-2xl p-6 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use Smart Sensor Technology?</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              The WIHHMS Smart Sensor brings laboratory-quality testing to your home, providing 
              real-time insights into your health metrics with medical-grade accuracy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Convenience</h3>
                <p className="text-sm text-gray-600">Test from the comfort of your home, anytime</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Accuracy</h3>
                <p className="text-sm text-gray-600">Medical-grade sensors with clinical precision</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Results</h3>
                <p className="text-sm text-gray-600">Instant health insights and trend tracking</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Privacy</h3>
                <p className="text-sm text-gray-600">Your health data stays secure and private</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SensorPage;
