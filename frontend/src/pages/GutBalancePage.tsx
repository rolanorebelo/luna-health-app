import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Zap } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SupplementComponent from '../components/health/Supplement';

const GutBalancePage: React.FC = () => {
  const handleOrderNow = () => {
    // Handle supplement order
    console.log('Ordering WIHHMS Gut Balance supplement');
    // You could open a modal, navigate to checkout, etc.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WIHHMS Gut Balance</h1>
          <p className="text-lg text-gray-600">
            Advanced gut health formula specifically designed for women's unique microbiome needs
          </p>
        </motion.div>

        {/* Product Component */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <SupplementComponent onOrderNow={handleOrderNow} />
          </div>
        </div>

        {/* Why Gut Health Matters for Women */}
        <motion.div 
          className="bg-white rounded-2xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Gut Health Matters for Women</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Women's hormonal fluctuations throughout their menstrual cycle, pregnancy, and menopause 
              significantly impact gut health. A balanced microbiome is crucial for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Hormone regulation and balance</li>
              <li>Improved mood and mental clarity</li>
              <li>Enhanced immune system function</li>
              <li>Better nutrient absorption</li>
              <li>Reduced inflammation</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default GutBalancePage;
