// AI-powered cycle prediction service
interface CyclePredictionData {
  lastPeriodDate: string;
  averageCycleLength: number;
  periodLength: number;
  historicalData?: Array<{
    date: string;
    cycleDay: number;
    symptoms: string[];
    mood: number;
    flow?: string;
  }>;
  age?: number;
  lifestyle?: {
    stressLevel?: number;
    exerciseFrequency?: string;
    sleepHours?: number;
  };
}

interface PredictionResult {
  nextPeriodDate: Date;
  nextOvulationDate: Date;
  fertilityWindow: {
    start: Date;
    end: Date;
  };
  cyclePhases: Array<{
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
    startDate: Date;
    endDate: Date;
    symptoms: string[];
    moodTrend: number;
  }>;
  confidence: number;
  recommendations: string[];
}

class CyclePredictionAI {
  private calculateBasePredictions(data: CyclePredictionData): PredictionResult {
    const currentCycleStart = new Date(data.lastPeriodDate); // This is now the aligned cycle start
    const cycleLength = data.averageCycleLength || 28;
    const periodLength = data.periodLength || 5;

    // Calculate next period start (one full cycle from current cycle start)
    const nextPeriodDate = new Date(currentCycleStart);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    console.log(`🧠 AI CALCULATION: Cycle start ${currentCycleStart.toDateString()} + ${cycleLength} days = ${nextPeriodDate.toDateString()}`);

    // Calculate ovulation based on cycle length (not fixed 14 days)
    // For shorter cycles, luteal phase is typically 10-14 days
    const lutealPhaseLength = Math.max(10, Math.min(14, Math.floor(cycleLength * 0.5))); // ~50% of cycle, but 10-14 days
    const nextOvulationDate = new Date(nextPeriodDate);
    nextOvulationDate.setDate(nextOvulationDate.getDate() - lutealPhaseLength);
    
    console.log(`🥚 OVULATION CALCULATION: ${lutealPhaseLength} days before next period = ${nextOvulationDate.toDateString()}`);

    // Calculate fertility window (5 days before ovulation + ovulation day)
    const fertilityStart = new Date(nextOvulationDate);
    fertilityStart.setDate(fertilityStart.getDate() - 5);
    const fertilityEnd = new Date(nextOvulationDate);
    fertilityEnd.setDate(fertilityEnd.getDate() + 1);

    return {
      nextPeriodDate,
      nextOvulationDate,
      fertilityWindow: {
        start: fertilityStart,
        end: fertilityEnd
      },
      cyclePhases: this.calculateCyclePhases(nextPeriodDate, cycleLength, periodLength),
      confidence: 0.85, // Base confidence
      recommendations: this.generateRecommendations(data)
    };
  }

  private calculateCyclePhases(nextPeriodDate: Date, cycleLength: number, periodLength: number) {
    const phases = [];
    const currentPeriodStart = new Date(nextPeriodDate);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - cycleLength);

    // Menstrual phase (Days 1-5: Bleeding period)
    const menstrualEnd = new Date(currentPeriodStart);
    menstrualEnd.setDate(menstrualEnd.getDate() + periodLength - 1);
    phases.push({
      phase: 'menstrual' as const,
      startDate: new Date(currentPeriodStart),
      endDate: menstrualEnd,
      symptoms: ['Cramps', 'Fatigue', 'Mood swings', 'Bleeding'],
      moodTrend: 6
    });

    // Follicular phase (Post-menstrual: follicle development continues)
    const follicularStart = new Date(menstrualEnd);
    follicularStart.setDate(follicularStart.getDate() + 1);
    const follicularEnd = new Date(currentPeriodStart);
    follicularEnd.setDate(follicularEnd.getDate() + Math.floor(cycleLength * 0.45));
    phases.push({
      phase: 'follicular' as const,
      startDate: follicularStart,
      endDate: follicularEnd,
      symptoms: ['Increased energy', 'Rising estrogen', 'Clearer skin'],
      moodTrend: 8
    });

    // Ovulatory phase
    const ovulatoryStart = new Date(follicularEnd);
    ovulatoryStart.setDate(ovulatoryStart.getDate() + 1);
    const ovulatoryEnd = new Date(ovulatoryStart);
    ovulatoryEnd.setDate(ovulatoryEnd.getDate() + 3);
    phases.push({
      phase: 'ovulatory' as const,
      startDate: ovulatoryStart,
      endDate: ovulatoryEnd,
      symptoms: ['Increased libido', 'Cervical changes'],
      moodTrend: 9
    });

    // Luteal phase
    const lutealStart = new Date(ovulatoryEnd);
    lutealStart.setDate(lutealStart.getDate() + 1);
    phases.push({
      phase: 'luteal' as const,
      startDate: lutealStart,
      endDate: new Date(nextPeriodDate),
      symptoms: ['Bloating', 'Breast tenderness', 'Irritability'],
      moodTrend: 6
    });

    return phases;
  }

  private adjustPredictionsWithHistoricalData(
    basePredictions: PredictionResult,
    data: CyclePredictionData
  ): PredictionResult {
    if (!data.historicalData || data.historicalData.length < 3) {
      return basePredictions;
    }

    // Analyze historical patterns
    const cycleLengths = this.extractCycleLengths(data.historicalData);
    const avgHistoricalLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    
    // Adjust cycle length based on recent trends
    const adjustedCycleLength = (data.averageCycleLength + avgHistoricalLength) / 2;
    
    // Recalculate with adjusted length
    const adjustedData = { ...data, averageCycleLength: adjustedCycleLength };
    const adjustedPredictions = this.calculateBasePredictions(adjustedData);

    // Increase confidence based on data availability
    adjustedPredictions.confidence = Math.min(0.95, basePredictions.confidence + (data.historicalData.length * 0.02));

    return adjustedPredictions;
  }

  private extractCycleLengths(historicalData: CyclePredictionData['historicalData']): number[] {
    if (!historicalData) return [];
    
    const cycleLengths: number[] = [];
    let lastCycleStart: Date | null = null;

    for (const entry of historicalData) {
      if (entry.cycleDay === 1) {
        if (lastCycleStart) {
          const currentStart = new Date(entry.date);
          const lengthInDays = Math.floor((currentStart.getTime() - lastCycleStart.getTime()) / (1000 * 60 * 60 * 24));
          if (lengthInDays > 20 && lengthInDays < 40) { // Reasonable cycle length
            cycleLengths.push(lengthInDays);
          }
        }
        lastCycleStart = new Date(entry.date);
      }
    }

    return cycleLengths;
  }

  private adjustForLifestyleFactors(
    predictions: PredictionResult,
    data: CyclePredictionData
  ): PredictionResult {
    if (!data.lifestyle) return predictions;

    let adjustmentDays = 0;
    const recommendations = [...predictions.recommendations];

    // Stress level adjustments
    if (data.lifestyle.stressLevel && data.lifestyle.stressLevel > 7) {
      adjustmentDays += Math.floor(Math.random() * 3); // High stress can delay ovulation
      recommendations.push("High stress levels detected. Consider stress management techniques like meditation or yoga.");
      predictions.confidence *= 0.9; // Reduce confidence
    }

    // Sleep adjustments
    if (data.lifestyle.sleepHours && data.lifestyle.sleepHours < 6) {
      adjustmentDays += 1;
      recommendations.push("Insufficient sleep may affect hormone regulation. Aim for 7-9 hours of sleep.");
      predictions.confidence *= 0.95;
    }

    // Exercise frequency adjustments
    if (data.lifestyle.exerciseFrequency === 'very-high') {
      adjustmentDays += Math.floor(Math.random() * 2);
      recommendations.push("Intense exercise may affect cycle regularity. Monitor for any changes.");
      predictions.confidence *= 0.92;
    }

    // Apply adjustments
    if (adjustmentDays > 0) {
      console.log(`⚠️ LIFESTYLE ADJUSTMENT: Adding ${adjustmentDays} days to predictions`);
      predictions.nextPeriodDate.setDate(predictions.nextPeriodDate.getDate() + adjustmentDays);
      predictions.nextOvulationDate.setDate(predictions.nextOvulationDate.getDate() + adjustmentDays);
    }

    predictions.recommendations = recommendations;
    return predictions;
  }

  private generateRecommendations(data: CyclePredictionData): string[] {
    const recommendations: string[] = [];

    // Age-based recommendations
    if (data.age) {
      if (data.age < 25) {
        recommendations.push("Track your cycles to understand your unique patterns as your hormones stabilize.");
      } else if (data.age > 35) {
        recommendations.push("Consider discussing cycle changes with your healthcare provider as you age.");
      }
    }

    // Cycle length recommendations
    if (data.averageCycleLength < 21 || data.averageCycleLength > 35) {
      recommendations.push("Your cycle length is outside the typical range. Consider consulting a healthcare provider.");
    }

    // General recommendations
    recommendations.push("Maintain a healthy diet rich in iron and vitamins during your cycle.");
    recommendations.push("Stay hydrated and consider light exercise during your period.");

    return recommendations;
  }

  public async predictCycle(data: CyclePredictionData): Promise<PredictionResult> {
    try {
      // Start with base predictions
      let predictions = this.calculateBasePredictions(data);

      // Enhance with historical data if available
      predictions = this.adjustPredictionsWithHistoricalData(predictions, data);

      // Adjust for lifestyle factors
      predictions = this.adjustForLifestyleFactors(predictions, data);

      return predictions;
    } catch (error) {
      console.error('Cycle prediction error:', error);
      throw new Error('Failed to generate cycle predictions');
    }
  }

  public async analyzeCyclePattern(historicalData: CyclePredictionData['historicalData']): Promise<{
    averageCycleLength: number;
    cycleVariability: number;
    commonSymptoms: string[];
    moodPatterns: { phase: string; averageMood: number }[];
    insights: string[];
  }> {
    if (!historicalData || historicalData.length === 0) {
      throw new Error('Insufficient data for pattern analysis');
    }

    const cycleLengths = this.extractCycleLengths(historicalData);
    const averageCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    
    // Calculate variability
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - averageCycleLength, 2), 0) / cycleLengths.length;
    const cycleVariability = Math.sqrt(variance);

    // Analyze symptoms
    const symptomCounts = new Map<string, number>();
    historicalData.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);
      });
    });

    const commonSymptoms = Array.from(symptomCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom]) => symptom);

    // Analyze mood patterns by cycle phase
    const moodByPhase = new Map<string, number[]>();
    historicalData.forEach(entry => {
      const phase = this.getCyclePhase(entry.cycleDay);
      if (!moodByPhase.has(phase)) {
        moodByPhase.set(phase, []);
      }
      moodByPhase.get(phase)!.push(entry.mood);
    });

    const moodPatterns = Array.from(moodByPhase.entries()).map(([phase, moods]) => ({
      phase,
      averageMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length
    }));

    // Generate insights
    const insights: string[] = [];
    if (cycleVariability < 2) {
      insights.push("Your cycles are very regular, which indicates good hormonal balance.");
    } else if (cycleVariability > 5) {
      insights.push("Your cycles show significant variability. Consider tracking potential triggers.");
    }

    if (commonSymptoms.includes('Mood swings') || commonSymptoms.includes('Irritability')) {
      insights.push("You frequently experience mood-related symptoms. Consider stress management techniques.");
    }

    return {
      averageCycleLength,
      cycleVariability,
      commonSymptoms,
      moodPatterns,
      insights
    };
  }

  private getCyclePhase(cycleDay: number): string {
    if (cycleDay <= 5) return 'menstrual';
    if (cycleDay <= 12) return 'follicular';
    if (cycleDay <= 16) return 'ovulatory';
    return 'luteal';
  }
}

export const cyclePredictionAI = new CyclePredictionAI();
export type { CyclePredictionData, PredictionResult };
