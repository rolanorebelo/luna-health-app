import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Camera, 
  Brain, 
  Heart, 
  Calendar, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Phone,
  Tablet,
  Monitor,
  Eye
} from 'lucide-react';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'AI Photo Analysis',
      description: 'Instant health insights from photos of skin, discharge, and symptoms',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Smart AI Companion',
      description: '24/7 personalized health guidance specialized in women\'s health',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Cycle Tracking',
      description: '95% accurate predictions that learn from your unique patterns',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Comprehensive Health',
      description: 'Track everything: periods, fertility, mood, sleep, symptoms, and more',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Personalized Insights',
      description: 'Recommendations based on your age, race, medical history, and goals',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy First',
      description: 'Your health data is encrypted, secure, and never shared without consent',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { number: '95%', label: 'Prediction Accuracy' },
    { number: '24/7', label: 'AI Support' },
    { number: '100K+', label: 'Health Insights' },
    { number: '🔒', label: 'Secure & Private' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Luna</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Your Ultimate
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> AI-Powered </span>
                Women's Health Companion
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The first comprehensive health app that combines AI photo analysis, smart cycle tracking, 
                and personalized insights to revolutionize women's healthcare.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all shadow-lg"
              >
                Sign In
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Privacy First Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Privacy is Our Priority
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Unlike other health apps that sell your data, Luna uses military-grade encryption 
              and never shares your personal information without your explicit consent.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'End-to-End Encryption',
                description: 'Your health data is encrypted with AES-256 before it ever leaves your device',
                feature: 'Military-grade security'
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: 'Zero Data Selling',
                description: 'We never sell, rent, or share your personal health information with third parties',
                feature: 'Your data stays yours'
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: 'HIPAA Compliant',
                description: 'Medical-grade privacy protection that exceeds healthcare industry standards',
                feature: 'Certified compliance'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-indigo-100 mb-3">{item.description}</p>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                  {item.feature}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Complete Control Over Your Data</h3>
                <div className="space-y-3 text-indigo-100">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Delete your account and all data anytime</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Export your health data in standard formats</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Granular privacy controls for every data type</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Optional anonymous research participation</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-block p-6 bg-white/20 rounded-2xl mb-4">
                  <Users className="w-12 h-12 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-indigo-100 text-sm">Data brokers we work with</div>
                </div>
                <p className="text-indigo-100 text-sm">
                  While other apps profit from your data, we profit from helping you achieve better health.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Luna is Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another period tracker. Luna is the first AI-powered comprehensive 
              women's health platform that goes beyond basic tracking.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Luna vs. Other Apps
            </h2>
            <p className="text-xl text-gray-600">
              See why thousands are switching from Flo, Clue, and other period trackers
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Feature */}
                <div className="p-6 bg-gray-50">
                  <h3 className="font-bold text-gray-900 mb-4">Features</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700">AI Photo Analysis</div>
                    <div className="text-sm text-gray-700">Personalized AI Chat</div>
                    <div className="text-sm text-gray-700">Smart Predictions</div>
                    <div className="text-sm text-gray-700">Comprehensive Health</div>
                    <div className="text-sm text-gray-700">Medical-Grade Privacy</div>
                    <div className="text-sm text-gray-700">Race-Specific Insights</div>
                  </div>
                </div>

                {/* Other Apps */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-600 mb-4">Other Apps</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-red-500">❌ Not available</div>
                    <div className="text-sm text-red-500">❌ Basic chatbots</div>
                    <div className="text-sm text-yellow-500">⚠️ Limited accuracy</div>
                    <div className="text-sm text-yellow-500">⚠️ Period-focused only</div>
                    <div className="text-sm text-red-500">❌ Data selling concerns</div>
                    <div className="text-sm text-red-500">❌ One-size-fits-all</div>
                  </div>
                </div>

                {/* Luna */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                  <h3 className="font-bold text-purple-900 mb-4">Luna</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-green-600">✅ Revolutionary AI analysis</div>
                    <div className="text-sm text-green-600">✅ Specialized women's health AI</div>
                    <div className="text-sm text-green-600">✅ 95% accuracy</div>
                    <div className="text-sm text-green-600">✅ Complete health platform</div>
                    <div className="text-sm text-green-600">✅ Encrypted & secure</div>
                    <div className="text-sm text-green-600">✅ Personalized for you</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Women Everywhere
            </h2>
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.9/5 from 10,000+ users</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                age: "28, Seattle",
                text: "Luna's photo analysis caught a skin issue I didn't even notice. It suggested I see a dermatologist, and they confirmed early melanoma. Luna literally saved my life.",
                rating: 5
              },
              {
                name: "Maria R.",
                age: "32, Miami",
                text: "Finally, an app that understands my body as a Latina woman. The predictions are spot-on, and the AI chat actually knows about my health concerns.",
                rating: 5
              },
              {
                name: "Jennifer L.",
                age: "25, Chicago",
                text: "I've tried Flo, Clue, and others. None come close to Luna's accuracy and features. The comprehensive health tracking is exactly what I needed.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.age}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Health Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of women who've already discovered the future of women's healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Start Your Free Journey</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Luna</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Luna. Your health, your data, your choice.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;