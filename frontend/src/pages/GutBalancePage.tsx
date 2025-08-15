import React from 'react';
import { motion } from 'framer-motion';
import { 
   Pill, 
  Shield, 
  Heart, 
  Sparkles,
  Zap,
  CheckCircle
} from 'lucide-react';

interface SupplementProps {
  onOrderNow?: () => void;
}

const Supplement: React.FC<SupplementProps> = ({ onOrderNow }) => {
  const benefits = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Eliminates Harmful Bacteria',
      description: 'Targets and removes bad bacteria that disrupt your gut microbiome',
      color: 'text-red-500'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'Boosts Good Bacteria',
      description: 'Promotes growth of beneficial probiotics for optimal gut health',
      color: 'text-green-500'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Improves Intestinal Health',
      description: 'Strengthens intestinal lining and enhances nutrient absorption',
      color: 'text-purple-500'
    }
  ];

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Pill className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">WIHHMS Gut Balance</h3>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          WIHHMS's proprietary gut health formula, specifically designed for women's unique microbiome needs. 
          Our advanced probiotic blend eliminates harmful bacteria while promoting beneficial flora, 
          leading to improved digestion, enhanced immune function, and better overall health.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 gap-3">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="flex items-start space-x-3 p-3 bg-white rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div className={`${benefit.color} mt-1`}>
              {benefit.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
              <p className="text-xs text-gray-600">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  </div>
);

const GutBalancePage: React.FC = () => {
  const handleOrderNow = () => {
    // Handle supplement order
    console.log('Ordering WIHHMS Gut Balance supplement');
    alert('Redirecting to checkout...');
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">WIHHMS Gut Balance</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced gut health formula specifically designed for women's unique microbiome needs
            </p>
          </motion.div>

          {/* Product Component */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="w-full max-w-2xl">
              <Supplement onOrderNow={handleOrderNow} />
            </div>
          </motion.div>

          {/* Why Gut Health Matters for Women */}
          <motion.div 
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Gut Health Matters for Women</h2>
            <div className="space-y-6 text-gray-600">
              <p className="text-lg text-center">
                Women's hormonal fluctuations throughout their menstrual cycle, pregnancy, and menopause 
                significantly impact gut health. A balanced microbiome is crucial for:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {[
                  { icon: <Shield className="w-6 h-6 text-purple-500" />, text: "Hormone regulation and balance" },
                  { icon: <Heart className="w-6 h-6 text-pink-500" />, text: "Improved mood and mental clarity" },
                  { icon: <Zap className="w-6 h-6 text-yellow-500" />, text: "Enhanced immune system function" },
                  { icon: <CheckCircle className="w-6 h-6 text-green-500" />, text: "Better nutrient absorption" },
                  { icon: <Shield className="w-6 h-6 text-blue-500" />, text: "Reduced inflammation" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    {item.icon}
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Additional Benefits Section */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinically Tested</h3>
                <p className="text-gray-600">Backed by scientific research and clinical studies</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Made for Women</h3>
                <p className="text-gray-600">Formulated specifically for women's unique needs</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Results</h3>
                <p className="text-gray-600">Notice improvements in just 7-14 days</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default GutBalancePage;