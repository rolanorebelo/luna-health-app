import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, 
  Shield, 
  Heart, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Clock,
  Truck,
  Plus,
  Minus,
  ShoppingCart,
  Info
} from 'lucide-react';

interface SupplementProps {
  onOrderNow?: () => void;
}

const Supplement: React.FC<SupplementProps> = ({ onOrderNow }) => {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

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

  const ingredients = [
    'Lactobacillus acidophilus (10 billion CFU)',
    'Bifidobacterium longum (8 billion CFU)',
    'Saccharomyces boulardii (5 billion CFU)',
    'Prebiotic Fiber Complex',
    'Digestive Enzyme Blend',
    'Zinc Carnosine for gut lining support'
  ];

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Luna Gut Balance</h3>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
              <span className="text-sm text-gray-600 ml-1">(4.9/5)</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">$49</div>
          <div className="text-sm text-gray-600">30-day supply</div>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          Luna's proprietary gut health formula, specifically designed for women's unique microbiome needs. 
          Our advanced probiotic blend eliminates harmful bacteria while promoting beneficial flora, 
          leading to improved digestion, enhanced immune function, and better overall health.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 gap-3 mb-4">
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

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-xs text-gray-700">30-day guarantee</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
          <Truck className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-700">Free shipping</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
          <Shield className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-gray-700">Third-party tested</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-white rounded-lg">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-gray-700">2-3 day delivery</span>
        </div>
      </div>

      {/* Quantity Selector and Order */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              disabled={quantity >= 10}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            ${(49 * quantity).toFixed(2)}
          </div>
          {quantity > 1 && (
            <div className="text-xs text-green-600">
              Save ${((quantity - 1) * 5).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Order Button */}
      <button
        onClick={onOrderNow}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center space-x-2 shadow-lg"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Add to Cart - ${(49 * quantity).toFixed(2)}</span>
      </button>

      {/* Details Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-medium w-full justify-center"
        >
          <Info className="w-4 h-4" />
          <span>{showDetails ? 'Hide Details' : 'View Ingredients & Details'}</span>
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 bg-white rounded-xl p-4"
            >
              <h4 className="font-semibold text-gray-900 mb-2">Key Ingredients:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Serving Size:</span>
                    <div className="text-gray-600">2 capsules daily</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Best Time:</span>
                    <div className="text-gray-600">With breakfast</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Storage:</span>
                    <div className="text-gray-600">Cool, dry place</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Shelf Life:</span>
                    <div className="text-gray-600">2 years</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Supplement;