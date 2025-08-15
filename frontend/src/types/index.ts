// User and Profile Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  race?: string;
  reproductiveStage: ReproductiveStage;
  healthGoals: HealthGoal[];
  medicalHistory: MedicalCondition[];
  preferences: UserPreferences;
  onboardingCompleted: boolean;
}

export type ReproductiveStage = 
  | 'puberty'
  | 'sexually-active'
  | 'trying-to-conceive'
  | 'pregnant'
  | 'postpartum'
  | 'breastfeeding'
  | 'premenopausal'
  | 'menopausal'
  | 'postmenopausal';

export type HealthGoal = 
  | 'maintaining-health'
  | 'achieving-conception'
  | 'preventing-pregnancy'
  | 'managing-symptoms'
  | 'tracking-fertility'
  | 'hormone-balance'
  | 'weight-management'
  | 'mental-health'
  | 'sexual-wellness';

export type MedicalCondition = 
  | 'pcos'
  | 'endometriosis'
  | 'fibroids'
  | 'thyroid-disorder'
  | 'diabetes'
  | 'anxiety'
  | 'depression'
  | 'eating-disorder'
  | 'autoimmune-condition'
  | 'other';

export interface UserPreferences {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  tracking: TrackingPreferences;
  language: string;
  timezone: string;
}

// Cycle and Health Tracking Types
export interface CycleData {
  id: string;
  userId: string;
  cycleNumber: number;
  startDate: Date;
  endDate?: Date;
  length?: number;
  ovulationDate?: Date;
  periodLength: number;
  flow: FlowIntensity[];
  symptoms: Symptom[];
  notes?: string;
  isActive: boolean;
}

export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

export interface Symptom {
  id: string;
  type: SymptomType;
  intensity: number; // 1-5 scale
  date: Date;
  notes?: string;
}

export type SymptomType = 
  | 'cramps'
  | 'bloating'
  | 'mood-swings'
  | 'fatigue'
  | 'headache'
  | 'breast-tenderness'
  | 'acne'
  | 'nausea'
  | 'back-pain'
  | 'food-cravings'
  | 'sleep-disturbance'
  | 'anxiety'
  | 'irritability'
  | 'depression'
  | 'discharge'
  | 'cervical-mucus'
  | 'basal-body-temperature'
  | 'ovulation-pain'
  | 'spotting';

// AI Analysis Types
export interface PhotoAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  analysisType: PhotoAnalysisType;
  results: AnalysisResult;
  confidence: number;
  timestamp: Date;
  notes?: string;
}

export type PhotoAnalysisType = 
  | 'skin-analysis'
  | 'discharge-check'
  | 'symptom-visual'
  | 'rash-detection'
  | 'general-health';

export interface AnalysisResult {
  summary: string;
  findings: Finding[];
  recommendations: string[];
  needsAttention: boolean;
  suggestDoctorVisit: boolean;
}

export interface Finding {
  type: string;
  description: string;
  severity: 'normal' | 'mild' | 'moderate' | 'concerning';
  confidence: number;
}

// Chat and AI Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context?: ChatContext;
  attachments?: ChatAttachment[];
}

export interface ChatContext {
  topic: string;
  relatedSymptoms?: string[];
  cycleDay?: number;
  userConcern?: string;
}

export interface ChatAttachment {
  type: 'image' | 'document';
  url: string;
  name: string;
}

// Health Insights and Predictions
export interface HealthInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  actionItems: string[];
  category: HealthCategory;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export type InsightType = 
  | 'pattern-recognition'
  | 'cycle-prediction'
  | 'fertility-window'
  | 'symptom-correlation'
  | 'lifestyle-impact'
  | 'nutrition-recommendation'
  | 'sleep-analysis'
  | 'mood-pattern'
  | 'hormone-fluctuation';

export type HealthCategory = 
  | 'reproductive'
  | 'mental-health'
  | 'nutrition'
  | 'sleep'
  | 'fitness'
  | 'skincare'
  | 'sexual-wellness'
  | 'gut-health'
  | 'hormonal'
  | 'general';

export interface PredictionModel {
  nextPeriod: Date;
  nextOvulation: Date;
  cycleLength: number;
  fertilityWindow: DateRange;
  accuracy: number;
  factors: PredictionFactor[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PredictionFactor {
  factor: string;
  impact: number;
  description: string;
}

// Notifications and Settings
export interface NotificationSettings {
  periodReminders: boolean;
  ovulationAlerts: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  insightNotifications: boolean;
  dailyCheckIns: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface PrivacySettings {
  dataSharing: boolean;
  anonymousAnalytics: boolean;
  researchParticipation: boolean;
  thirdPartyIntegrations: boolean;
}

export interface TrackingPreferences {
  autoDetectPeriod: boolean;
  symptomReminders: boolean;
  photoAnalysisEnabled: boolean;
  sleepTracking: boolean;
  moodTracking: boolean;
  detailedLogging: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Form Types
export interface OnboardingFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email: string;
  };
  healthProfile: {
    reproductiveStage: ReproductiveStage;
    healthGoals: HealthGoal[];
    medicalHistory: MedicalCondition[];
    lastPeriodDate?: Date;
    averageCycleLength?: number;
  };
  preferences: UserPreferences;
}

export interface SymptomLogForm {
  symptoms: SymptomType[];
  intensity: Record<SymptomType, number>;
  notes: string;
  date: Date;
}

// Store Types (for Zustand)
export interface AuthStore {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export interface HealthStore {
  currentCycle: CycleData | null;
  recentInsights: HealthInsight[];
  photoAnalyses: PhotoAnalysis[];
  predictions: PredictionModel | null;
  isLoading: boolean;
  error: string | null;
  loadCurrentCycle: () => Promise<void>;
  logSymptom: (symptom: Symptom) => Promise<void>;
  uploadPhoto: (file: File, type: PhotoAnalysisType) => Promise<PhotoAnalysis>;
}

export interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  clearChat: () => void;
}

// Nail Hemoglobin Analysis Types
export interface NailHemoglobinPrediction {
  nail_id: number;
  bounding_box: number[];
  confidence: number;
  hemoglobin_g_per_L: number;
  nail_size: number[];
}

export interface NailAnalysisResult {
  num_nails_detected: number;
  individual_predictions: NailHemoglobinPrediction[];
  average_hemoglobin_g_per_L: number;
}

export interface HemoglobinHealthAssessment {
  condition_overview: string;
  severity: 'low' | 'moderate' | 'high';
  possible_causes: string[];
  self_care: string[];
  seek_care_if: string[];
  follow_up: string[];
  additional_notes: string;
  disclaimers: string[];
}

export interface NailHemoglobinResponse {
  status: 'success' | 'error';
  nail_analysis: NailAnalysisResult;
  health_assessment: HemoglobinHealthAssessment;
  medical_context: {
    normal_range: string;
    interpretation: string;
  };
  timestamp: string;
}

// Pattern Detection Types
export interface PatternDetection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: 'bipolar-circle' | 'radial-cross' | 'uncertain' | 'error';
  confidence: number;
}

export interface PatternAnalysisResult {
  total_patterns_detected: number;
  pattern_counts: {
    'bipolar-circle': number;
    'radial-cross': number;
    uncertain: number;
    error: number;
  };
  circular_patterns: number;
  cross_patterns: number;
  uncertain_patterns: number;
  confidence_threshold: number;
  detection_parameters: {
    min_area: number;
    max_area: number;
  };
  individual_detections: PatternDetection[];
}

export interface PatternDetectionResponse {
  status: 'success' | 'error';
  pattern_analysis: PatternAnalysisResult;
  summary: {
    total_patterns: number;
    circular_patterns: number;
    cross_patterns: number;
    uncertain_patterns: number;
    analysis_quality: 'high' | 'no_patterns' | 'low';
  };
  timestamp: string;
}