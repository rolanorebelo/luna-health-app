import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '../types';
import { openaiService, type ChatContext } from '../services/openaiService';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  context: ChatContext | null;
}

interface ChatActions {
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  setContext: (context: ChatContext) => void;
  clearChat: () => void;
  clearError: () => void;
}

type ChatStoreType = ChatState & ChatActions;

const useChatStore = create<ChatStoreType>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isTyping: false,
      isLoading: false,
      error: null,
      context: null,

      // Actions
      sendMessage: async (content: string, attachments?: File[]) => {
        const { messages, context } = get();
        
        // Create user message
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          type: 'user',
          content,
          timestamp: new Date(),
          attachments: attachments?.map(file => ({
            type: file.type.startsWith('image/') ? 'image' : 'document',
            url: URL.createObjectURL(file),
            name: file.name
          }))
        };

        // Add user message immediately
        set(state => ({
          messages: [...state.messages, userMessage],
          isTyping: true,
          error: null
        }));

        try {
          // Prepare conversation history for OpenAI
          const conversationHistory = messages.slice(-6).map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          }));

          // Send to OpenAI
           const response = await openaiService.sendMessage({
            message: content,
            context: context || undefined,
            conversationHistory
          });

          // Create AI response message
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: response,
            timestamp: new Date()
          };

          set(state => ({
            messages: [...state.messages, aiMessage],
            isTyping: false
          }));

        } catch (error: any) {
          // Add error message
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            type: 'ai',
            content: 'I apologize, but I\'m having trouble connecting right now. Please try again, or feel free to ask your question in a different way.',
            timestamp: new Date()
          };

          set(state => ({
            messages: [...state.messages, errorMessage],
            isTyping: false,
            error: error.message || 'Failed to send message'
          }));
        }
      },

      setContext: (context: ChatContext) => {
        set({ context });
      },

      clearChat: () => {
        set({
          messages: [],
          context: null,
          error: null,
          isTyping: false
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'luna-chat',
      partialize: (state) => ({
        messages: state.messages.slice(-20), // Keep last 20 messages
        context: state.context
      })
    }
  )
);

export default useChatStore;