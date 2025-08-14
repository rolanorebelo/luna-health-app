import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Sparkles, RefreshCw, Heart, Brain, Baby, Stethoscope, Apple, Shield, Droplets, Flower2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date | string; // Handle both Date and string
  category?: string;
  attachments?: { type: 'image'; url: string; name: string }[];
  quickActions?: string[];
}

interface HealthContext {
  cycleDay: number;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  age: number;
  reproductiveStage: string;
  recentSymptoms: string[];
  healthGoals: string[];
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userContext] = useState<HealthContext>({
    cycleDay: 14,
    phase: 'ovulatory',
    age: 28,
    reproductiveStage: 'sexually-active',
    recentSymptoms: ['mild cramping', 'breast tenderness'],
    healthGoals: ['maintaining-health', 'tracking-fertility']
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const healthCategories = [
    { id: 'periods', name: 'Periods & Cycles', icon: <Heart className="w-5 h-5" />, color: 'from-red-500 to-pink-500' },
    { id: 'fertility', name: 'Fertility & Pregnancy', icon: <Baby className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { id: 'symptoms', name: 'Symptoms & Health', icon: <Stethoscope className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'mental', name: 'Mental Wellness', icon: <Brain className="w-5 h-5" />, color: 'from-purple-500 to-indigo-500' },
    { id: 'lifestyle', name: 'Lifestyle & Nutrition', icon: <Apple className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
    { id: 'sexual', name: 'Sexual Health', icon: <Shield className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
    { id: 'uti', name: 'UTI & Bladder Health', icon: <Droplets className="w-5 h-5" />, color: 'from-teal-500 to-cyan-500' },
    { id: 'vaginal', name: 'Vaginal Health', icon: <Flower2 className="w-5 h-5" />, color: 'from-rose-500 to-pink-600' }
  ];

  const smartSuggestions = [
    { category: 'periods', questions: [
      "Is my discharge normal?",
      "Why am I bleeding between periods?",
      "How to reduce period cramps naturally?",
      "When should I be concerned about heavy bleeding?"
    ]},
    { category: 'fertility', questions: [
      "Am I ovulating normally?",
      "Best time to conceive this cycle?",
      "How to track fertility signs?",
      "What affects egg quality?"
    ]},
    { category: 'symptoms', questions: [
      "Why do I have breast pain?",
      "Is this headache hormone-related?",
      "What causes bloating before periods?",
      "Signs of hormonal imbalance?"
    ]},
    { category: 'mental', questions: [
      "How do hormones affect mood?",
      "Managing PMS anxiety naturally",
      "Why am I so emotional lately?",
      "Stress and cycle connection"
    ]},
    { category: 'lifestyle', questions: [
      "Best foods for hormonal balance",
      "Exercise during different cycle phases",
      "Sleep and menstrual health",
      "Supplements for women's health"
    ]},
    { category: 'sexual', questions: [
      "Pain during intercourse - causes?",
      "Low libido and hormones",
      "Safe sex practices",
      "Vaginal dryness solutions"
    ]},
    { category: 'uti', questions: [
      "Could this be a UTI?",
      "How to prevent UTIs naturally?",
      "UTI symptoms vs other infections",
      "When should I see a doctor for UTI?"
    ]},
    { category: 'vaginal', questions: [
      "What's normal vaginal pH?",
      "Yeast infection vs bacterial vaginosis",
      "Natural vaginal health tips",
      "Changes in vaginal discharge"
    ]}
  ];

  // Helper function to get category colors
  const getCategoryColors = (category?: string) => {
    const categoryColorMap: { [key: string]: { bg: string; text: string; hover: string; border: string } } = {
      'reproductive-health': { bg: 'bg-pink-50', text: 'text-pink-700', hover: 'hover:bg-pink-100', border: 'border-pink-200' },
      'symptom-management': { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100', border: 'border-blue-200' },
      'fertility': { bg: 'bg-green-50', text: 'text-green-700', hover: 'hover:bg-green-100', border: 'border-green-200' },
      'mental-health': { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', border: 'border-purple-200' },
      'uti-health': { bg: 'bg-teal-50', text: 'text-teal-700', hover: 'hover:bg-teal-100', border: 'border-teal-200' },
      'vaginal-health': { bg: 'bg-rose-50', text: 'text-rose-700', hover: 'hover:bg-rose-100', border: 'border-rose-200' },
      'general': { bg: 'bg-gray-50', text: 'text-gray-700', hover: 'hover:bg-gray-100', border: 'border-gray-200' }
    };
    return categoryColorMap[category || 'general'] || categoryColorMap.general;
  };

  // Helper function to safely format timestamp
  const formatTimestamp = (timestamp: Date | string): string => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Hello! 🌸 I'm Luna, your personal AI women's health companion, and I'm delighted to meet you!\n\nI can see you're currently on day ${userContext.cycleDay} of your cycle in the ${userContext.phase} phase. As your dedicated health assistant, I'm here to provide personalized, medically-informed guidance on all aspects of women's wellness.\n\n✨ **What I can help you with today:**\n• Menstrual cycles, periods, and reproductive health\n• UTI prevention, symptoms, and testing guidance\n• Vaginal health and intimate wellness\n• Fertility tracking and pregnancy planning\n• Mood changes and mental wellness\n• Symptom analysis and health concerns\n• Nutrition and lifestyle optimization\n\nI'm trained on the latest women's health research and always prioritize your wellbeing. What would you like to explore together today?`,
        timestamp: new Date(),
        quickActions: ['UTI symptoms checker', 'Vaginal health questions', 'Cycle insights', 'Mood & hormones']
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, userContext.cycleDay, userContext.phase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = (userMessage: string, category?: string): ChatMessage => {
    // Advanced AI response simulation with context awareness
    const responses = {
      discharge: {
        content: `Based on your current cycle phase (${userContext.phase}), let me help you understand your discharge patterns.\n\nDuring ovulation (which you're in now), it's completely normal to have:\n• Clear, stretchy discharge (like egg whites)\n• Increased amount of discharge\n• Slippery, wet feeling\n\nThis is actually a positive sign that your body is working normally! This type of discharge indicates peak fertility.\n\n**When to be concerned:**\n• Strong fishy or foul odor\n• Green or gray color\n• Cottage cheese-like texture with itching\n• Burning sensation\n\nYour current discharge sounds perfectly normal for day ${userContext.cycleDay} of your cycle. Would you like me to explain more about what to expect in your upcoming luteal phase?`,
        category: 'reproductive-health',
        quickActions: ['What happens in luteal phase?', 'Track my discharge patterns', 'Signs of infection']
      },
      cramps: {
        content: `I understand period cramps can be really challenging! Since you mentioned mild cramping recently, let me share some effective natural relief methods:\n\n**Immediate Relief:**\n• Heat therapy (heating pad, warm bath)\n• Gentle massage with circular motions\n• Magnesium supplement (300-400mg daily)\n• Anti-inflammatory foods (ginger, turmeric)\n\n**Prevention Strategies:**\n• Regular exercise (especially during follicular phase)\n• Reduce caffeine 1 week before period\n• Increase omega-3 fatty acids\n• Practice stress reduction techniques\n\n**When to see a doctor:**\n• Cramps interfere with daily activities\n• Pain is getting worse over time\n• Heavy bleeding with severe pain\n• Pain during non-period times\n\nGiven that you're ${userContext.age} and in the ${userContext.reproductiveStage} stage, these strategies should be particularly effective. Would you like specific exercise recommendations for your current cycle phase?`,
        category: 'symptom-management',
        quickActions: ['Exercise for my cycle phase', 'Natural pain relief recipes', 'When to see a doctor']
      },
      fertility: {
        content: `Great question about fertility! Based on your profile, you're currently in an excellent position to understand your fertility patterns.\n\n**Your Current Status (Day ${userContext.cycleDay}):**\n• You're in the ovulatory phase - peak fertility time!\n• This is when conception is most likely\n• Your body is releasing mature eggs\n\n**Key Fertility Signs to Track:**\n• Cervical mucus (egg-white consistency now)\n• Basal body temperature (should rise after ovulation)\n• Ovulation pain (mittelschmerz)\n• Increased libido\n\n**Optimizing Fertility:**\n• Folic acid supplementation\n• Maintain healthy BMI\n• Reduce stress levels\n• Limit alcohol and caffeine\n\n**For Your Age (${userContext.age}):**\nYou're in an optimal fertility window. Most women your age have a 20-25% chance of conception each cycle when timing is right.\n\nWould you like me to help you create a personalized fertility tracking plan?`,
        category: 'fertility',
        quickActions: ['Create fertility plan', 'Track ovulation signs', 'Preconception checklist']
      },
      mood: {
        content: `Hormonal mood changes are incredibly common and valid! Let me explain what's happening in your body right now.\n\n**During Ovulation (Your Current Phase):**\n• Estrogen is at its peak - often brings positive mood\n• Many women feel more confident and energetic\n• Social and communication skills often enhanced\n\n**What to Expect Next (Luteal Phase):**\n• Progesterone rises, which can cause mood dips\n• PMS symptoms may appear 7-10 days before period\n• Anxiety and irritability can increase\n\n**Natural Mood Support:**\n• B-complex vitamins (especially B6)\n• Regular exercise (releases endorphins)\n• Adequate sleep (7-9 hours)\n• Mindfulness and meditation\n• Social support and connection\n\n**Cycle-Synced Self-Care:**\n• Week 1-2: Take on new challenges, socialize\n• Week 3-4: Focus on rest, gentle activities\n\nSince you mentioned this is one of your health goals, I can help you create a personalized mood-tracking system. Would that be helpful?`,
        category: 'mental-health',
        quickActions: ['Mood tracking system', 'PMS management tips', 'Hormone-mood connection']
      },
      uti: {
        content: `I understand UTI symptoms can be really uncomfortable and concerning. Let me help you identify key signs and next steps.\n\n**Common UTI Symptoms:**\n• Burning sensation when urinating\n• Frequent urge to urinate (even when bladder is nearly empty)\n• Cloudy, dark, bloody, or strong-smelling urine\n• Pelvic pain (in women)\n• Feeling tired or shaky\n\n**Immediate Relief Tips:**\n• Drink plenty of water to help flush bacteria\n• Urinate frequently, don't hold it\n• Cranberry juice (unsweetened) may help\n• Heat pad on lower abdomen for pain relief\n\n**When to See a Doctor ASAP:**\n• Symptoms persist >24-48 hours\n• Fever, chills, or back pain\n• Blood in urine\n• Severe pain\n• Recurrent UTIs (3+ in a year)\n\n**Prevention for Future:**\n• Wipe front to back after bathroom use\n• Urinate after sexual activity\n• Stay well-hydrated\n• Avoid douches and harsh feminine products\n\nGiven your symptoms, I'd recommend seeing a healthcare provider for proper testing and treatment. UTIs need antibiotic treatment to fully clear.`,
        category: 'uti-health',
        quickActions: ['UTI prevention tips', 'Find nearest urgent care', 'Track symptoms', 'Natural pain relief']
      },
      vaginal: {
        content: `Vaginal health is such an important part of overall wellness! Let me share some key information about maintaining healthy vaginal balance.\n\n**Normal Vaginal Health:**\n• pH between 3.8-4.5 (slightly acidic)\n• Clear to white discharge that varies with cycle\n• Mild, non-offensive natural scent\n• No itching, burning, or unusual pain\n\n**Common Concerns & Solutions:**\n\n**Yeast Infections:**\n• Thick, cottage cheese-like discharge\n• Intense itching and burning\n• Often after antibiotics or hormonal changes\n\n**Bacterial Vaginosis:**\n• Thin, gray/white discharge with fishy odor\n• Most common vaginal infection\n• Needs medical treatment\n\n**Maintaining Vaginal Health:**\n• Wear breathable, cotton underwear\n• Avoid douching (disrupts natural balance)\n• Use gentle, unscented products\n• Probiotics can help maintain healthy bacteria\n• Change out of wet clothes quickly\n\n**When to See a Doctor:**\n• Unusual discharge, odor, or itching\n• Pain during urination or intercourse\n• Any symptoms that worry you\n\nYour vaginal health changes throughout your cycle (you're currently on day ${userContext.cycleDay}), so tracking patterns can be really helpful!`,
        category: 'vaginal-health',
        quickActions: ['Track vaginal changes', 'Yeast infection vs BV', 'pH balance tips', 'When to see doctor']
      },
      default: {
        content: `Thanks for your question! As your AI health companion, I'm here to help with any women's health concerns.\n\nBased on your current cycle phase (${userContext.phase}) and being on day ${userContext.cycleDay}, I can provide personalized guidance on:\n\n• Cycle tracking and predictions\n• UTI prevention and symptom guidance\n• Vaginal health and intimate wellness\n• Fertility and reproductive health\n• Mental wellness and mood\n• Lifestyle and nutrition\n• Sexual health concerns\n\nCould you tell me more specifically what you'd like to know about? I'm trained in women's health and can provide detailed, personalized insights based on your unique situation.`,
        category: 'general',
        quickActions: ['UTI questions', 'Vaginal health', 'Period questions', 'Fertility help']
      }
    };

    // Determine response based on keywords
    const lowerMessage = userMessage.toLowerCase();
    let response = responses.default;

    if (lowerMessage.includes('uti') || lowerMessage.includes('urinary tract') || 
        lowerMessage.includes('burning when urinating') || lowerMessage.includes('bladder infection') ||
        lowerMessage.includes('frequent urination') || lowerMessage.includes('painful urination')) {
      response = responses.uti;
    } else if (lowerMessage.includes('vaginal') || lowerMessage.includes('yeast infection') || 
               lowerMessage.includes('bacterial vaginosis') || lowerMessage.includes('bv') ||
               lowerMessage.includes('vaginal health') || lowerMessage.includes('ph balance') ||
               lowerMessage.includes('intimate health')) {
      response = responses.vaginal;
    } else if (lowerMessage.includes('discharge') || lowerMessage.includes('mucus')) {
      response = responses.discharge;
    } else if (lowerMessage.includes('cramp') || lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      response = responses.cramps;
    } else if (lowerMessage.includes('fertil') || lowerMessage.includes('conceiv') || lowerMessage.includes('ovulat')) {
      response = responses.fertility;
    } else if (lowerMessage.includes('mood') || lowerMessage.includes('emotional') || lowerMessage.includes('anxious') || lowerMessage.includes('pms')) {
      response = responses.mood;
    }

    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      category: response.category,
      quickActions: response.quickActions
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const aiResponse = generateAIResponse(inputValue, selectedCategory || undefined);
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentSuggestions = selectedCategory 
    ? smartSuggestions.find(s => s.category === selectedCategory)?.questions || []
    : smartSuggestions[0].questions;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header with Context */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 mb-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Luna AI Assistant</h2>
              <p className="text-purple-100 text-sm">Specialized in women's health</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Day {userContext.cycleDay}</div>
            <div className="text-purple-100 text-sm capitalize">{userContext.phase} Phase</div>
          </div>
        </div>
      </motion.div>

      {/* Health Categories */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              !selectedCategory ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Topics
          </button>
          {healthCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r ' + category.color + ' text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[85%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {message.type === 'user' ? (
                      <span className="text-sm font-bold">U</span>
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl relative ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                        : `bg-white border ${getCategoryColors(message.category).border} text-gray-900 shadow-sm`
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* AI Message Category */}
                      {message.type === 'ai' && message.category && (
                        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
                          <span className={`text-xs capitalize ${getCategoryColors(message.category).text}`}>
                            {message.category.replace('-', ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {message.quickActions && message.type === 'ai' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.quickActions.map((action, idx) => {
                          const colors = getCategoryColors(message.category);
                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuickAction(action)}
                              className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-xs ${colors.hover} transition-colors`}
                            >
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-xs text-gray-500 mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Smart Suggestions */}
      {messages.length <= 1 && !isTyping && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gray-600 mb-3 font-medium">
            {selectedCategory ? `Popular ${healthCategories.find(c => c.id === selectedCategory)?.name} questions:` : 'Popular questions to get started:'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {currentSuggestions.map((question, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickAction(question)}
                className="text-left p-3 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100 text-sm text-gray-700 hover:text-gray-900 hover:border-purple-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {question}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Input */}
      <motion.div 
        className="border-t border-gray-200 bg-white rounded-2xl p-4 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-end space-x-3">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-600 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
            title="Attach image for analysis"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Luna anything about your health..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isTyping}
            />
            
            {/* Input helpers */}
            <div className="absolute bottom-2 right-12 flex items-center space-x-1">
              {inputValue.length > 200 && (
                <span className="text-xs text-gray-400">{inputValue.length}/500</span>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-xl transition-all ${
              inputValue.trim() && !isTyping
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            {isTyping ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Input Tips */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div>Press Enter to send, Shift+Enter for new line</div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI-powered responses</span>
            </span>
            <span>Always consult healthcare professionals for medical concerns</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;