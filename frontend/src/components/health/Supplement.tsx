import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, 
  Shield, 
  Heart, 
  Sparkles
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

export default Supplement;