import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Camera, Sparkles, RefreshCw, Copy } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useChatStore from '../stores/chatStore';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: { type: 'image'; url: string; name: string }[];
}

const ChatPage: React.FC = () => {
  const { profile } = useAuthStore();
  const { messages, isTyping, sendMessage, setContext, clearChat } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Set user context when component mounts
  useEffect(() => {
    if (profile) {
      setContext({
        age: profile.age,
        reproductiveStage: profile.reproductiveStage,
        healthGoals: profile.healthGoals,
        cycleDay: 14, // This would come from actual health data
        phase: 'ovulation' // This would come from actual health data
      });
    }
  }, [profile, setContext]);

  const quickResponses = [
    "Is this discharge normal?",
    "Why am I so tired before my period?",
    "Best foods for hormone balance?",
    "How to reduce period cramps naturally?",
    "Signs of ovulation to watch for?",
    "UTI prevention tips?",
    "Birth control options?",
    "Pregnancy symptoms to know about?",
    "How to track my cycle better?",
    "Natural ways to boost fertility?"
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    try {
      await sendMessage(inputValue, attachments);
      setInputValue('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleQuickResponse = (response: string) => {
    setInputValue(response);
  };

  const handleFileAttach = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div 
        className="text-center mb-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chat with Luna</h2>
            <p className="text-gray-600">Your AI health companion powered by OpenAI</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600">AI-Powered • Available 24/7</span>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-1 space-y-4 pb-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3 max-w-[85%]">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl">
                  <p className="text-sm">
                    Hi {profile?.firstName || 'there'}! 👋 I'm Luna, your AI health companion. I'm here to help you with any questions about your cycle, symptoms, fertility, or general women's health. 
                    
                    I can also analyze photos if you'd like to share them. What would you like to know?
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`flex items-start space-x-3 max-w-[85%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {message.type === 'user' ? (
                      <span className="text-sm font-bold">
                        {profile?.firstName?.charAt(0) || 'U'}
                      </span>
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="relative">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                              {attachment.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`px-4 py-3 rounded-2xl relative ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      
                      {/* Message Actions (visible on hover) */}
                      <div className={`absolute ${message.type === 'user' ? 'left-0' : 'right-0'} top-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full ${message.type === 'user' ? '' : 'translate-x-full'} flex space-x-1 mt-1`}>
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Responses */}
      {messages.length <= 1 && !isTyping && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gray-600 mb-3 text-center font-medium">Popular questions to get started:</p>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {quickResponses.map((response, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickResponse(response)}
                className="text-left p-3 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100 text-sm text-gray-700 hover:text-gray-900 hover:border-primary-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {response}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* File Attachments Preview */}
      {attachments.length > 0 && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-gray-600 mb-2">Attachments ({attachments.length}):</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {attachments.map((file, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Input */}
      <motion.div 
        className="border-t border-gray-200 pt-4 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-end space-x-3">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-600 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
            title="Attach image"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileAttach(e.target.files)}
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Luna anything about your health..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isTyping}
            />
            {/* Character counter for long messages */}
            {inputValue.length > 200 && (
              <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                {inputValue.length}/500
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
            className={`p-3 rounded-xl transition-all ${
              (inputValue.trim() || attachments.length > 0) && !isTyping
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 shadow-lg hover:shadow-xl'
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-gray-500 hover:text-red-600 underline transition-colors"
            >
              Clear conversation
            </button>
          )}
        </div>
      </motion.div>

      {/* OpenAI Attribution */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-400">
          Powered by OpenAI • Remember to consult healthcare professionals for medical concerns
        </p>
      </div>
    </div>
  );
};

export default ChatPage;