import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - move to backend in production
});

export interface ChatContext {
  cycleDay?: number;
  phase?: string;
  age?: number;
  reproductiveStage?: string;
  recentSymptoms?: string[];
  healthGoals?: string[];
}

export interface ChatRequest {
  message: string;
  context?: ChatContext;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export class OpenAIService {
  private systemPrompt = `You are Luna, an AI health companion specializing in women's health. You are knowledgeable, empathetic, and supportive.

IMPORTANT GUIDELINES:
- Provide helpful, accurate information about women's health topics
- Always recommend consulting healthcare providers for serious concerns
- Be supportive and non-judgmental
- Use warm, friendly language
- Give practical, actionable advice when appropriate
- If you're unsure about something, say so and suggest professional consultation

AREAS OF EXPERTISE:
- Menstrual cycles and period health
- Fertility and ovulation
- Hormonal changes and symptoms
- Pregnancy and reproductive health
- Sexual wellness
- Mental health related to hormonal changes
- Nutrition for women's health
- Exercise and lifestyle recommendations

LIMITATIONS:
- Cannot diagnose medical conditions
- Cannot prescribe medications
- Cannot replace professional medical advice
- Always encourage users to seek medical help for concerning symptoms

Keep responses conversational, helpful, and appropriately detailed. Ask follow-up questions when helpful.`;

  async sendMessage(request: ChatRequest): Promise<string> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt }
      ];

      // Add context if available
      if (request.context) {
        const contextInfo = this.buildContextPrompt(request.context);
        if (contextInfo) {
          messages.push({ role: 'system', content: contextInfo });
        }
      }

      // Add conversation history
      if (request.conversationHistory) {
        request.conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      // Add current message
      messages.push({ role: 'user', content: request.message });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response. Could you please try rephrasing your question?';

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback to keyword-based responses
      return this.getFallbackResponse(request.message);
    }
  }

  private buildContextPrompt(context: ChatContext): string {
    const contextParts: string[] = [];

    if (context.age) {
      contextParts.push(`User is ${context.age} years old`);
    }

    if (context.reproductiveStage) {
      contextParts.push(`Currently in ${context.reproductiveStage.replace('-', ' ')} stage`);
    }

    if (context.cycleDay && context.phase) {
      contextParts.push(`Currently on cycle day ${context.cycleDay} in ${context.phase} phase`);
    }

    if (context.recentSymptoms && context.recentSymptoms.length > 0) {
      contextParts.push(`Recent symptoms: ${context.recentSymptoms.join(', ')}`);
    }

    if (context.healthGoals && context.healthGoals.length > 0) {
      contextParts.push(`Health goals: ${context.healthGoals.join(', ')}`);
    }

    if (contextParts.length === 0) return '';

    return `CURRENT USER CONTEXT: ${contextParts.join('. ')}.`;
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced fallback responses for when API fails
    if (lowerMessage.includes('discharge')) {
      return "I'd love to help with your question about discharge! Normal vaginal discharge varies throughout your cycle - it's usually clear or white and changes in consistency. During ovulation, it becomes more stretchy and clear. However, since I'm having trouble accessing my full knowledge base right now, I'd recommend speaking with a healthcare provider if you have specific concerns about changes in color, smell, or if you're experiencing discomfort.";
    }
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
      return "Fatigue before your period is incredibly common! It's often related to hormonal changes - progesterone levels rise after ovulation, which can make you feel sleepy. I'm currently having some technical difficulties, but I'd recommend focusing on good sleep hygiene, gentle exercise, and iron-rich foods. If fatigue is severe or persistent, it's worth discussing with your healthcare provider.";
    }

    return "I'm experiencing some technical difficulties right now, but I'm still here to help! Could you try rephrasing your question, or would you like me to connect you with some general resources about women's health topics?";
  }

  // Method to analyze user message for health topics
  analyzeHealthTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    const topicKeywords = {
      'menstrual-cycle': ['period', 'menstrual', 'cycle', 'bleeding'],
      'fertility': ['fertile', 'ovulation', 'conceive', 'pregnancy'],
      'symptoms': ['pain', 'cramp', 'headache', 'bloating', 'mood'],
      'discharge': ['discharge', 'mucus', 'fluid'],
      'hormones': ['hormone', 'estrogen', 'progesterone', 'testosterone'],
      'nutrition': ['food', 'diet', 'nutrition', 'vitamin', 'supplement'],
      'mental-health': ['mood', 'anxiety', 'depression', 'stress', 'emotional']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
export default openaiService;