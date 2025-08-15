// Frontend service to interact with LLM health insights
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface CycleInsightRequest {
  current_cycle_day: number;
  cycle_length: number;
  period_length: number;
  last_period_date: string;
  health_goals?: string[];
  reproductive_stage?: string;
}

export interface CycleInsight {
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
  action: string;
}

export interface CycleInsightResponse {
  status: 'success' | 'error';
  insight: CycleInsight;
  error?: string;
}

class LLMHealthService {
  async generateCycleInsight(data: CycleInsightRequest): Promise<CycleInsight> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/generate-cycle-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate cycle insight');
      }

      const result: CycleInsightResponse = await response.json();
      
      if (result.status === 'success') {
        return result.insight;
      } else {
        throw new Error(result.error || 'Failed to generate insight');
      }
    } catch (error) {
      console.error('Error generating cycle insight:', error);
      
      // Return fallback insight based on cycle day
      return this.getFallbackInsight(data.current_cycle_day, data.cycle_length, data.period_length);
    }
  }

  private getFallbackInsight(cycleDay: number, cycleLength: number, periodLength: number): CycleInsight {
    // Calculate phase
    const follicularEnd = Math.floor(cycleLength / 2) - 2;
    const ovulatoryStart = follicularEnd + 1;
    const ovulatoryEnd = ovulatoryStart + 2;

    if (cycleDay <= periodLength) {
      return {
        title: "Rest & Recharge",
        description: "Your body is working hard during menstruation. Focus on gentle movement, hydration, and iron-rich foods to support your energy.",
        type: "info",
        action: "Track Symptoms"
      };
    } else if (cycleDay <= follicularEnd) {
      return {
        title: "Energy Rising",
        description: "Your energy levels are building! This is a great time to start new projects and engage in more intense workouts.",
        type: "info",
        action: "Plan Activities"
      };
    } else if (cycleDay <= ovulatoryEnd) {
      return {
        title: "Peak Fertility",
        description: "You're in your fertile window! If trying to conceive, this is optimal timing. Your energy and mood are likely at their peak.",
        type: "success",
        action: "Track Fertility"
      };
    } else {
      return {
        title: "Focus Within",
        description: "As your cycle progresses, focus on self-care and stress management. Consider gentle yoga and nutritious comfort foods.",
        type: "info",
        action: "Practice Self-Care"
      };
    }
  }
}

export const llmHealthService = new LLMHealthService();
