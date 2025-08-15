import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Camera, Sparkles, RefreshCw, Heart, Brain, Baby, Stethoscope, Moon, Apple, Shield } from 'lucide-react';

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
    { id: 'symptoms', name: 'UTI & Symptoms', icon: <Stethoscope className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'mental', name: 'Mental Wellness', icon: <Brain className="w-5 h-5" />, color: 'from-purple-500 to-indigo-500' },
    { id: 'lifestyle', name: 'Lifestyle & Nutrition', icon: <Apple className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
    { id: 'sexual', name: 'Vaginal Health', icon: <Shield className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' }
  ];

  const smartSuggestions = [
    { category: 'periods', questions: [
      "Is my discharge normal for my cycle phase?",
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
      "Could these be UTI symptoms?",
      "How to prevent urinary tract infections?",
      "Why do I have breast pain?",
      "Is this headache hormone-related?"
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
      "Normal vs abnormal vaginal discharge",
      "Maintaining vaginal pH balance",
      "UTI prevention after sex",
      "Vaginal dryness solutions"
    ]}
  ];

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
        content: `Hi there! 👋 I'm WIHHMS, your AI women's health companion. I'm here to help you with any questions about your cycle, fertility, symptoms, or overall wellness.\n\nI can see you're currently on day ${userContext.cycleDay} of your cycle in the ${userContext.phase} phase. I'm specially trained on women's health topics and can provide personalized insights based on your unique situation.\n\nWhat would you like to talk about today?`,
        timestamp: new Date(),
        quickActions: ['Ask about my cycle phase', 'Symptom checker', 'Fertility questions', 'General health tips']
      };
      setMessages([welcomeMessage]);
    }
  }, [userContext.cycleDay, userContext.phase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessageToRAG = async (message: string): Promise<ChatMessage> => {
    try {
      const response = await fetch('/api/v1/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          user_context: userContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat service');
      }

      const data = await response.json();
      
      return {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date(data.timestamp),
        category: data.category,
        quickActions: data.quick_actions
      };
    } catch (error) {
      console.error('Chat service error:', error);
      // Fallback to enhanced local responses
      return generateFallbackResponse(message);
    }
  };

  const generateFallbackResponse = (userMessage: string): ChatMessage => {
    // Enhanced fallback responses with better medical accuracy and empathy
    const lowerMessage = userMessage.toLowerCase();
    
    let content = '';
    let category = 'general-health';
    let quickActions: string[] = [];

    if (lowerMessage.includes('uti') || lowerMessage.includes('urinary') || lowerMessage.includes('burning')) {
      content = `I understand you're concerned about UTI symptoms. This is very common in women's health.\n\n**Common UTI Signs:**\n• Burning when urinating\n• Frequent, urgent need to urinate\n• Cloudy or strong-smelling urine\n• Pelvic pain\n\n**Immediate Steps:**\n• Drink plenty of water\n• Urinate frequently\n• Avoid irritating products\n\n**When to See a Doctor:**\n• Symptoms persist over 24-48 hours\n• Fever, chills, or back pain\n• Blood in urine\n\nUTIs are very treatable with proper medical care. Please see a healthcare provider for diagnosis and treatment.`;
      category = 'uti-health';
      quickActions = ['UTI prevention tips', 'When to see a doctor', 'Home comfort measures', 'Hydration guide'];
    } else if (lowerMessage.includes('discharge') || lowerMessage.includes('vaginal') || lowerMessage.includes('mucus')) {
      content = `Let me help you understand vaginal discharge, which varies throughout your cycle.\n\n**During your current ${userContext.phase} phase (Day ${userContext.cycleDay}):**\n• Normal discharge changes with hormones\n• Clear, stretchy discharge during ovulation is healthy\n• Color and consistency shifts are usually normal\n\n**Healthy Discharge:**\n• Clear to milky white\n• Mild or no odor\n• No itching or burning\n\n**When to Seek Care:**\n• Green, gray, or bright yellow color\n• Strong fishy or foul odor\n• Itching, burning, or pain\n\nYour body's natural self-cleaning system works well. Trust your instincts about changes.`;
      category = 'vaginal-health';
      quickActions = ['Normal vs abnormal discharge', 'Vaginal health tips', 'When to see a provider', 'pH balance info'];
    } else if (lowerMessage.includes('period') || lowerMessage.includes('menstrual') || lowerMessage.includes('cycle')) {
      content = `Understanding your menstrual cycle is key to overall health awareness.\n\n**Your Current Status:**\n• Day ${userContext.cycleDay} of your cycle\n• In the ${userContext.phase} phase\n• This is normal for someone your age (${userContext.age})\n\n**Cycle Basics:**\n• Normal cycles: 21-35 days\n• Flow duration: 3-7 days\n• Changes throughout life are normal\n\n**Track Important Signs:**\n• Flow patterns and changes\n• Associated symptoms\n• Cycle length variations\n\nEvery person's cycle is unique. Focus on what's normal for you.`;
      category = 'menstrual-health';
      quickActions = ['Cycle tracking tips', 'Understanding phases', 'Managing symptoms', 'When to worry'];
    } else if (lowerMessage.includes('mood') || lowerMessage.includes('emotional') || lowerMessage.includes('pms') || lowerMessage.includes('anxiety')) {
      content = `Hormonal changes throughout your cycle significantly affect mood and emotions.\n\n**In your current ${userContext.phase} phase:**\n• Hormonal fluctuations are normal\n• Mood changes are valid and common\n• Your body is working as designed\n\n**Supporting Your Mental Wellness:**\n• Recognize patterns in your cycle\n• Practice self-compassion\n• Maintain consistent sleep schedule\n• Stay connected with supportive people\n\n**When to Seek Support:**\n• Mood severely impacts daily life\n• Persistent sadness or anxiety\n• Difficulty coping with activities\n\nYour mental health is as important as your physical health.`;
      category = 'mental-wellness';
      quickActions = ['Mood tracking ideas', 'Cycle-mood connection', 'Self-care strategies', 'Support resources'];
    } else {
      content = `Thank you for reaching out! I'm here to provide supportive, evidence-based information about women's health.\n\n**Based on your current status:**\n• Day ${userContext.cycleDay} (${userContext.phase} phase)\n• Age ${userContext.age}\n• Recent symptoms: ${userContext.recentSymptoms.join(', ')}\n\n**I can help with:**\n• Menstrual cycle questions\n• UTI and vaginal health concerns\n• Fertility and reproductive health\n• Symptom understanding\n• When to seek medical care\n\n**Remember:**\n• This is educational information\n• Always consult healthcare providers for concerning symptoms\n• Trust your instincts about your body\n\nWhat specific area would you like to explore?`;
      category = 'general-health';
      quickActions = ['UTI questions', 'Vaginal health', 'Cycle concerns', 'Symptom checker'];
    }

    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content,
      timestamp: new Date(),
      category,
      quickActions
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

    try {
      // Try to use RAG-powered chat service
      const aiResponse = await sendMessageToRAG(inputValue);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback handled in sendMessageToRAG
    } finally {
      setIsTyping(false);
    }
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
              <h2 className="text-xl font-bold">WIHHMS AI Assistant</h2>
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
                        : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* AI Message Category */}
                      {message.type === 'ai' && message.category && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500 capitalize">
                            {message.category.replace('-', ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {message.quickActions && message.type === 'ai' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action)}
                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs hover:bg-purple-100 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
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
              placeholder="Ask WIHHMS anything about your health..."
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