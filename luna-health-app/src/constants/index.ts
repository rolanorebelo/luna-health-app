import { ReproductiveStage, HealthGoal, MedicalCondition, SymptomType } from '../types';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_VERSION = 'v1';
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  CYCLES: '/cycles',
  SYMPTOMS: '/symptoms',
  PHOTOS: '/photos',
  CHAT: '/chat',
  INSIGHTS: '/insights',
  PREDICTIONS: '/predictions',
} as const;

// App Configuration
export const APP_NAME = 'Luna';
export const APP_DESCRIPTION = 'Ultimate Women\'s Health AI Companion';
export const SUPPORT_EMAIL = 'support@lunahealth.app';

// Reproductive Stages with Metadata
export const REPRODUCTIVE_STAGES: Record<ReproductiveStage, {
  label: string;
  description: string;
  icon: string;
  ageRange?: string;
  features: string[];
}> = {
  'puberty': {
    label: 'Puberty',
    description: 'Beginning of reproductive years',
    icon: '🌱',
    ageRange: '9-16 years',
    features: ['Cycle establishment', 'Body changes tracking', 'Education resources']
  },
  'sexually-active': {
    label: 'Sexually Active',
    description: 'Active reproductive years',
    icon: '💕',
    ageRange: '16-35 years',
    features: ['Contraception tracking', 'STI awareness', 'Cycle optimization']
  },
  'trying-to-conceive': {
    label: 'Trying to Conceive',
    description: 'Actively planning pregnancy',
    icon: '🤱',
    features: ['Fertility tracking', 'Ovulation prediction', 'Conception tips']
  },
  'pregnant': {
    label: 'Pregnant',
    description: 'Currently pregnant',
    icon: '🤰',
    features: ['Pregnancy tracking', 'Symptom monitoring', 'Health guidance']
  },
  'postpartum': {
    label: 'Postpartum',
    description: 'After childbirth recovery',
    icon: '👶',
    features: ['Recovery tracking', 'Breastfeeding support', 'Mental health']
  },
  'breastfeeding': {
    label: 'Breastfeeding',
    description: 'Currently breastfeeding',
    icon: '🤱',
    features: ['Lactation support', 'Nutrition guidance', 'Sleep tracking']
  },
  'premenopausal': {
    label: 'Premenopausal',
    description: 'Approaching menopause',
    icon: '🌅',
    ageRange: '40-50 years',
    features: ['Hormone tracking', 'Symptom management', 'Transition support']
  },
  'menopausal': {
    label: 'Menopausal',
    description: 'Going through menopause',
    icon: '🌄',
    ageRange: '45-55 years',
    features: ['Hot flash tracking', 'Hormone therapy', 'Bone health']
  },
  'postmenopausal': {
    label: 'Postmenopausal',
    description: 'After menopause',
    icon: '🌆',
    ageRange: '55+ years',
    features: ['Long-term health', 'Bone density', 'Heart health']
  }
};

// Health Goals with Metadata
export const HEALTH_GOALS: Record<HealthGoal, {
  label: string;
  description: string;
  icon: string;
  category: string;
}> = {
  'maintaining-health': {
    label: 'Maintaining Overall Health',
    description: 'General wellness and preventive care',
    icon: '💪',
    category: 'General'
  },
  'achieving-conception': {
    label: 'Achieving Conception',
    description: 'Optimizing fertility and getting pregnant',
    icon: '🍼',
    category: 'Fertility'
  },
  'preventing-pregnancy': {
    label: 'Preventing Pregnancy',
    description: 'Effective contraception and family planning',
    icon: '🛡️',
    category: 'Contraception'
  },
  'managing-symptoms': {
    label: 'Managing Symptoms',
    description: 'Addressing specific health concerns',
    icon: '🩺',
    category: 'Symptom Management'
  },
  'tracking-fertility': {
    label: 'Tracking Fertility',
    description: 'Understanding your fertile window',
    icon: '📊',
    category: 'Fertility'
  },
  'hormone-balance': {
    label: 'Hormone Balance',
    description: 'Optimizing hormonal health',
    icon: '⚖️',
    category: 'Hormonal'
  },
  'weight-management': {
    label: 'Weight Management',
    description: 'Healthy weight and body composition',
    icon: '🏃‍♀️',
    category: 'Fitness'
  },
  'mental-health': {
    label: 'Mental Health',
    description: 'Emotional wellbeing and stress management',
    icon: '🧠',
    category: 'Mental Health'
  },
  'sexual-wellness': {
    label: 'Sexual Wellness',
    description: 'Healthy intimate relationships',
    icon: '💋',
    category: 'Sexual Health'
  }
};

// Medical Conditions
export const MEDICAL_CONDITIONS: Record<MedicalCondition, {
  label: string;
  description: string;
  prevalence: string;
  category: string;
}> = {
  'pcos': {
    label: 'PCOS',
    description: 'Polycystic Ovary Syndrome',
    prevalence: '5-10% of women',
    category: 'Reproductive'
  },
  'endometriosis': {
    label: 'Endometriosis',
    description: 'Endometrial tissue outside uterus',
    prevalence: '10% of reproductive-age women',
    category: 'Reproductive'
  },
  'fibroids': {
    label: 'Uterine Fibroids',
    description: 'Non-cancerous growths in uterus',
    prevalence: '20-50% of women',
    category: 'Reproductive'
  },
  'thyroid-disorder': {
    label: 'Thyroid Disorder',
    description: 'Hyper or hypothyroidism',
    prevalence: '12% of women',
    category: 'Endocrine'
  },
  'diabetes': {
    label: 'Diabetes',
    description: 'Type 1 or Type 2 diabetes',
    prevalence: '11% of adults',
    category: 'Metabolic'
  },
  'anxiety': {
    label: 'Anxiety Disorder',
    description: 'Generalized or specific anxiety',
    prevalence: '23% of women',
    category: 'Mental Health'
  },
  'depression': {
    label: 'Depression',
    description: 'Major depressive disorder',
    prevalence: '12% of women',
    category: 'Mental Health'
  },
  'eating-disorder': {
    label: 'Eating Disorder',
    description: 'Anorexia, bulimia, or binge eating',
    prevalence: '1-3% of women',
    category: 'Mental Health'
  },
  'autoimmune-condition': {
    label: 'Autoimmune Condition',
    description: 'Various autoimmune disorders',
    prevalence: '5-8% of population',
    category: 'Autoimmune'
  },
  'other': {
    label: 'Other Condition',
    description: 'Other medical conditions',
    prevalence: 'Variable',
    category: 'Other'
  }
};

// Symptoms with Metadata - CLEAN VERSION WITH NO DUPLICATES
export const SYMPTOMS: Record<SymptomType, {
  label: string;
  category: string;
  icon: string;
  description: string;
  cyclePhases: string[];
}> = {
  'cramps': {
    label: 'Menstrual Cramps',
    category: 'Pain',
    icon: '⚡',
    description: 'Painful muscle contractions in uterus',
    cyclePhases: ['menstrual', 'pre-menstrual']
  },
  'bloating': {
    label: 'Bloating',
    category: 'Digestive',
    icon: '🎈',
    description: 'Feeling of fullness or swelling',
    cyclePhases: ['pre-menstrual', 'menstrual']
  },
  'mood-swings': {
    label: 'Mood Swings',
    category: 'Emotional',
    icon: '🎭',
    description: 'Rapid changes in emotional state',
    cyclePhases: ['pre-menstrual', 'menstrual']
  },
  'fatigue': {
    label: 'Fatigue',
    category: 'Energy',
    icon: '😴',
    description: 'Extreme tiredness or exhaustion',
    cyclePhases: ['menstrual', 'pre-menstrual']
  },
  'headache': {
    label: 'Headache',
    category: 'Pain',
    icon: '🤕',
    description: 'Head or neck pain',
    cyclePhases: ['pre-menstrual', 'menstrual']
  },
  'breast-tenderness': {
    label: 'Breast Tenderness',
    category: 'Physical',
    icon: '🤱',
    description: 'Sensitive or sore breasts',
    cyclePhases: ['pre-menstrual', 'ovulatory']
  },
  'acne': {
    label: 'Acne Breakouts',
    category: 'Skin',
    icon: '🔴',
    description: 'Skin breakouts or blemishes',
    cyclePhases: ['pre-menstrual', 'menstrual']
  },
  'nausea': {
    label: 'Nausea',
    category: 'Digestive',
    icon: '🤢',
    description: 'Feeling sick to stomach',
    cyclePhases: ['menstrual', 'pre-menstrual']
  },
  'back-pain': {
    label: 'Back Pain',
    category: 'Pain',
    icon: '🗿',
    description: 'Lower back discomfort',
    cyclePhases: ['menstrual', 'pre-menstrual']
  },
  'food-cravings': {
    label: 'Food Cravings',
    category: 'Appetite',
    icon: '🍫',
    description: 'Strong desire for specific foods',
    cyclePhases: ['pre-menstrual']
  },
  'sleep-disturbance': {
    label: 'Sleep Issues',
    category: 'Sleep',
    icon: '🌙',
    description: 'Difficulty sleeping or staying asleep',
    cyclePhases: ['pre-menstrual', 'menstrual']
  },
  'anxiety': {
    label: 'Anxiety',
    category: 'Emotional',
    icon: '😰',
    description: 'Feelings of worry or unease',
    cyclePhases: ['pre-menstrual']
  },
  'irritability': {
    label: 'Irritability',
    category: 'Emotional',
    icon: '😤',
    description: 'Easily annoyed or frustrated',
    cyclePhases: ['pre-menstrual']
  },
  'depression': {
    label: 'Depression',
    category: 'Emotional',
    icon: '😢',
    description: 'Feelings of sadness or hopelessness',
    cyclePhases: ['pre-menstrual', 'menstrual']
  },
  'discharge': {
    label: 'Vaginal Discharge',
    category: 'Reproductive',
    icon: '💧',
    description: 'Changes in vaginal discharge',
    cyclePhases: ['ovulatory', 'follicular']
  },
  'cervical-mucus': {
    label: 'Cervical Mucus',
    category: 'Reproductive',
    icon: '🔍',
    description: 'Cervical mucus consistency changes',
    cyclePhases: ['ovulatory', 'follicular']
  },
  'basal-body-temperature': {
    label: 'Temperature Changes',
    category: 'Physical',
    icon: '🌡️',
    description: 'Basal body temperature fluctuations',
    cyclePhases: ['ovulatory', 'luteal']
  },
  'ovulation-pain': {
    label: 'Ovulation Pain',
    category: 'Pain',
    icon: '🎯',
    description: 'Mid-cycle pain during ovulation',
    cyclePhases: ['ovulatory']
  },
  'spotting': {
    label: 'Spotting',
    category: 'Reproductive',
    icon: '🩸',
    description: 'Light bleeding between periods',
    cyclePhases: ['ovulatory', 'luteal']
  }
};

// Rest of constants remain the same...
export const CYCLE_PHASES = {
  MENSTRUAL: {
    name: 'Menstrual',
    days: [1, 2, 3, 4, 5],
    color: '#ef4444',
    description: 'Period days - menstrual flow',
    characteristics: ['Low energy', 'Cramping', 'Heavy flow']
  },
  FOLLICULAR: {
    name: 'Follicular',
    days: [6, 7, 8, 9, 10, 11, 12, 13],
    color: '#22c55e',
    description: 'Post-period recovery and energy building',
    characteristics: ['Increasing energy', 'Clearer skin', 'Better mood']
  },
  OVULATORY: {
    name: 'Ovulatory',
    days: [14, 15, 16],
    color: '#f59e0b',
    description: 'Peak fertility window',
    characteristics: ['Highest energy', 'Peak fertility', 'Increased libido']
  },
  LUTEAL: {
    name: 'Luteal',
    days: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
    color: '#8b5cf6',
    description: 'Pre-menstrual phase',
    characteristics: ['Decreasing energy', 'PMS symptoms', 'Mood changes']
  }
};

// Default User Preferences
export const DEFAULT_PREFERENCES = {
  notifications: {
    periodReminders: true,
    ovulationAlerts: true,
    medicationReminders: true,
    appointmentReminders: true,
    insightNotifications: true,
    dailyCheckIns: false,
    emailNotifications: true,
    pushNotifications: true
  },
  privacy: {
    dataSharing: false,
    anonymousAnalytics: true,
    researchParticipation: false,
    thirdPartyIntegrations: false
  },
  tracking: {
    autoDetectPeriod: true,
    symptomReminders: true,
    photoAnalysisEnabled: true,
    sleepTracking: true,
    moodTracking: true,
    detailedLogging: false
  },
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'Email already exists.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  ANALYSIS_FAILED: 'Photo analysis failed. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SYMPTOM_LOGGED: 'Symptom logged successfully!',
  PHOTO_UPLOADED: 'Photo uploaded and analyzed successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
};