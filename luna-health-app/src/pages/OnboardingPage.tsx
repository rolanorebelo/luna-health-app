import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Heart, User, Calendar, Target, Stethoscope, Settings, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

interface OnboardingData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    race: string;
    location: string;
  };
  reproductiveHealth: {
    stage: string;
    lastPeriodDate: string;
    averageCycleLength: number;
    periodLength: number;
    currentlyPregnant: boolean;
    breastfeeding: boolean;
    contraception: string;
  };
  healthGoals: string[];
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
  };
  lifestyle: {
    exerciseFrequency: string;
    sleepHours: number;
    stressLevel: number;
    smokingStatus: string;
    alcoholConsumption: string;
    dietType: string;
  };
  preferences: {
    notifications: {
      periodReminders: boolean;
      ovulationAlerts: boolean;
      healthTips: boolean;
      appointmentReminders: boolean;
    };
    privacy: {
      dataSharing: boolean;
      researchParticipation: boolean;
    };
  };
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      race: '',
      location: ''
    },
    reproductiveHealth: {
      stage: '',
      lastPeriodDate: '',
      averageCycleLength: 28,
      periodLength: 5,
      currentlyPregnant: false,
      breastfeeding: false,
      contraception: ''
    },
    healthGoals: [],
    medicalHistory: {
      conditions: [],
      medications: [],
      allergies: [],
      surgeries: []
    },
    lifestyle: {
      exerciseFrequency: '',
      sleepHours: 7,
      stressLevel: 5,
      smokingStatus: '',
      alcoholConsumption: '',
      dietType: ''
    },
    preferences: {
      notifications: {
        periodReminders: true,
        ovulationAlerts: true,
        healthTips: true,
        appointmentReminders: true
      },
      privacy: {
        dataSharing: false,
        researchParticipation: false
      }
    }
  });

  const reproductiveStages = [
    { id: 'puberty', label: 'Puberty (9-16 years)', description: 'Beginning of reproductive years' },
    { id: 'sexually-active', label: 'Sexually Active', description: 'Active reproductive years' },
    { id: 'trying-to-conceive', label: 'Trying to Conceive', description: 'Planning for pregnancy' },
    { id: 'pregnant', label: 'Currently Pregnant', description: 'Expecting a baby' },
    { id: 'postpartum', label: 'Postpartum', description: 'After childbirth recovery' },
    { id: 'breastfeeding', label: 'Breastfeeding', description: 'Currently nursing' },
    { id: 'premenopausal', label: 'Premenopausal', description: 'Approaching menopause' },
    { id: 'menopausal', label: 'Menopausal', description: 'Going through menopause' },
    { id: 'postmenopausal', label: 'Postmenopausal', description: 'After menopause' }
  ];

  const healthGoalsOptions = [
    { id: 'maintaining-health', label: 'Maintaining Overall Health', icon: '💪', description: 'General wellness and preventive care' },
    { id: 'achieving-conception', label: 'Achieving Conception', icon: '🍼', description: 'Optimizing fertility and getting pregnant' },
    { id: 'preventing-pregnancy', label: 'Preventing Pregnancy', icon: '🛡️', description: 'Effective contraception and family planning' },
    { id: 'managing-symptoms', label: 'Managing Symptoms', icon: '🩺', description: 'Addressing specific health concerns' },
    { id: 'tracking-fertility', label: 'Tracking Fertility', icon: '📊', description: 'Understanding your fertile window' },
    { id: 'hormone-balance', label: 'Hormone Balance', icon: '⚖️', description: 'Optimizing hormonal health' },
    { id: 'weight-management', label: 'Weight Management', icon: '🏃‍♀️', description: 'Healthy weight and body composition' },
    { id: 'mental-health', label: 'Mental Health', icon: '🧠', description: 'Emotional wellbeing and stress management' },
    { id: 'sexual-wellness', label: 'Sexual Wellness', icon: '💋', description: 'Healthy intimate relationships' }
  ];

  const medicalConditions = [
    'PCOS (Polycystic Ovary Syndrome)',
    'Endometriosis',
    'Uterine Fibroids',
    'Thyroid Disorder',
    'Diabetes (Type 1 or 2)',
    'Anxiety Disorder',
    'Depression',
    'Eating Disorder',
    'Autoimmune Condition',
    'Hypertension',
    'Heart Disease',
    'Migraine/Headaches',
    'Other'
  ];

  const steps = [
    { id: 'welcome', title: 'Welcome to Luna', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'personal', title: 'Personal Information', icon: <User className="w-6 h-6" /> },
    { id: 'reproductive', title: 'Reproductive Health', icon: <Heart className="w-6 h-6" /> },
    { id: 'goals', title: 'Health Goals', icon: <Target className="w-6 h-6" /> },
    { id: 'medical', title: 'Medical History', icon: <Stethoscope className="w-6 h-6" /> },
    { id: 'lifestyle', title: 'Lifestyle Factors', icon: <Calendar className="w-6 h-6" /> },
    { id: 'preferences', title: 'Preferences', icon: <Settings className="w-6 h-6" /> },
    { id: 'complete', title: 'Setup Complete', icon: <CheckCircle className="w-6 h-6" /> }
  ];

  const updateFormData = (section: keyof OnboardingData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrayField = (section: keyof OnboardingData, field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[section] as any)[field] || [];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: checked 
            ? [...currentArray, value]
            : currentArray.filter((item: string) => item !== value)
        }
      };
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const completeOnboarding = async () => {
    try {
      // Update profile with onboarding data
      await updateProfile({
        onboardingCompleted: true,
        age: calculateAge(formData.personalInfo.dateOfBirth),
        reproductiveStage: formData.reproductiveHealth.stage as any,
        healthGoals: formData.healthGoals as any,
        firstName: formData.personalInfo.firstName
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <motion.div className="text-center space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Luna</h2>
              <p className="text-xl text-gray-600 mb-6">Your Ultimate AI-Powered Women's Health Companion</p>
              <div className="text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Smart cycle tracking with 95% accuracy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">AI photo analysis for instant health insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">24/7 AI health companion specialized in women's health</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Personalized recommendations based on your unique profile</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Privacy First:</strong> Your data is encrypted and secure. We never share personal information without your explicit consent.
              </p>
            </div>
          </motion.div>
        );

      case 'personal':
        return (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">This helps us personalize your Luna experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => updateFormData('personalInfo', 'firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => updateFormData('personalInfo', 'lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.personalInfo.dateOfBirth}
                onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Race/Ethnicity (Optional)</label>
              <select
                value={formData.personalInfo.race}
                onChange={(e) => updateFormData('personalInfo', 'race', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select your race/ethnicity</option>
                <option value="asian">Asian</option>
                <option value="black">Black or African American</option>
                <option value="hispanic">Hispanic or Latino</option>
                <option value="native">Native American</option>
                <option value="pacific">Pacific Islander</option>
                <option value="white">White</option>
                <option value="mixed">Mixed Race</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This helps us provide more accurate health insights and recommendations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
              <input
                type="text"
                value={formData.personalInfo.location}
                onChange={(e) => updateFormData('personalInfo', 'location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="City, State/Country"
              />
            </div>
          </motion.div>
        );

      case 'reproductive':
        return (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reproductive Health</h2>
              <p className="text-gray-600">Help us understand your current reproductive stage</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Current Reproductive Stage</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reproductiveStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => updateFormData('reproductiveHealth', 'stage', stage.id)}
                    className={`p-4 text-left border-2 rounded-xl transition-all ${
                      formData.reproductiveHealth.stage === stage.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{stage.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {!['pregnant', 'postmenopausal'].includes(formData.reproductiveHealth.stage) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Period Start Date</label>
                  <input
                    type="date"
                    value={formData.reproductiveHealth.lastPeriodDate}
                    onChange={(e) => updateFormData('reproductiveHealth', 'lastPeriodDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Cycle Length: {formData.reproductiveHealth.averageCycleLength} days
                    </label>
                    <input
                      type="range"
                      min="21"
                      max="40"
                      value={formData.reproductiveHealth.averageCycleLength}
                      onChange={(e) => updateFormData('reproductiveHealth', 'averageCycleLength', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>21 days</span>
                      <span>40 days</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period Length: {formData.reproductiveHealth.periodLength} days
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={formData.reproductiveHealth.periodLength}
                      onChange={(e) => updateFormData('reproductiveHealth', 'periodLength', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>2 days</span>
                      <span>10 days</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="pregnant"
                  checked={formData.reproductiveHealth.currentlyPregnant}
                  onChange={(e) => updateFormData('reproductiveHealth', 'currentlyPregnant', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="pregnant" className="text-sm text-gray-700">Currently pregnant</label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="breastfeeding"
                  checked={formData.reproductiveHealth.breastfeeding}
                  onChange={(e) => updateFormData('reproductiveHealth', 'breastfeeding', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="breastfeeding" className="text-sm text-gray-700">Currently breastfeeding</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Contraception (Optional)</label>
              <select
                value={formData.reproductiveHealth.contraception}
                onChange={(e) => updateFormData('reproductiveHealth', 'contraception', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select contraception method</option>
                <option value="none">None</option>
                <option value="birth-control-pill">Birth Control Pill</option>
                <option value="iud">IUD</option>
                <option value="implant">Implant</option>
                <option value="injection">Injection (Depo)</option>
                <option value="patch">Patch</option>
                <option value="ring">Vaginal Ring</option>
                <option value="condoms">Condoms</option>
                <option value="diaphragm">Diaphragm</option>
                <option value="natural">Natural Family Planning</option>
                <option value="other">Other</option>
              </select>
            </div>
          </motion.div>
        );

      case 'goals':
        return (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Health Goals</h2>
              <p className="text-gray-600">Select all that apply to personalize your Luna experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthGoalsOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => {
                    const isSelected = formData.healthGoals.includes(goal.id);
                    updateArrayField('healthGoals', '', goal.id, !isSelected);
                  }}
                  className={`p-4 text-left border-2 rounded-xl transition-all ${
                    formData.healthGoals.includes(goal.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{goal.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    {formData.healthGoals.includes(goal.id) && (
                      <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'medical':
        return (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical History</h2>
              <p className="text-gray-600">This information helps us provide better health insights</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Medical Conditions (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {medicalConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={condition}
                      checked={formData.medicalHistory.conditions.includes(condition)}
                      onChange={(e) => updateArrayField('medicalHistory', 'conditions', condition, e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor={condition} className="text-sm text-gray-700">{condition}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications (Optional)
              </label>
              <textarea
                value={formData.medicalHistory.medications.join('\n')}
                onChange={(e) => updateFormData('medicalHistory', 'medications', e.target.value.split('\n').filter(m => m.trim()))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="List each medication on a new line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies (Optional)
              </label>
              <textarea
                value={formData.medicalHistory.allergies.join('\n')}
                onChange={(e) => updateFormData('medicalHistory', 'allergies', e.target.value.split('\n').filter(a => a.trim()))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="List any known allergies"
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This information is for personalization only. Always consult healthcare professionals for medical advice and never stop medications without professional guidance.
              </p>
            </div>
          </motion.div>
        );

      case 'lifestyle':
        return (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Factors</h2>
              <p className="text-gray-600">Help us understand your daily habits</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Frequency</label>
                <select
                  value={formData.lifestyle.exerciseFrequency}
                  onChange={(e) => updateFormData('lifestyle', 'exerciseFrequency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  <option value="none">No regular exercise</option>
                  <option value="1-2">1-2 times per week</option>
                  <option value="3-4">3-4 times per week</option>
                  <option value="5-6">5-6 times per week</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Sleep Hours: {formData.lifestyle.sleepHours} hours
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={formData.lifestyle.sleepHours}
                  onChange={(e) => updateFormData('lifestyle', 'sleepHours', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4 hours</span>
                  <span>12 hours</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stress Level: {formData.lifestyle.stressLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.lifestyle.stressLevel}
                onChange={(e) => updateFormData('lifestyle', 'stressLevel', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low (1)</span>
                <span>Very High (10)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
                <select
                  value={formData.lifestyle.smokingStatus}
                  onChange={(e) => updateFormData('lifestyle', 'smokingStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                  <option value="social">Social smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol Consumption</label>
                <select
                  value={formData.lifestyle.alcoholConsumption}
                  onChange={(e) => updateFormData('lifestyle', 'alcoholConsumption', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  <option value="none">Don't drink</option>
                  <option value="rarely">Rarely (few times a year)</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
              <select
                value={formData.lifestyle.dietType}
                onChange={(e) => updateFormData('lifestyle', 'dietType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select diet type</option>
                <option value="standard">Standard/Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="keto">Ketogenic</option>
                <option value="paleo">Paleo</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="gluten-free">Gluten-free</option>
                <option value="other">Other</option>
              </select>
            </div>
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Preferences</h2>
              <p className="text-gray-600">Customize your Luna experience</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Period Reminders</h4>
                    <p className="text-sm text-gray-600">Get notified before your period starts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications.periodReminders}
                    onChange={(e) => updateFormData('preferences', 'notifications', {
                      ...formData.preferences.notifications,
                      periodReminders: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Ovulation Alerts</h4>
                    <p className="text-sm text-gray-600">Fertility window notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications.ovulationAlerts}
                    onChange={(e) => updateFormData('preferences', 'notifications', {
                      ...formData.preferences.notifications,
                      ovulationAlerts: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Health Tips</h4>
                    <p className="text-sm text-gray-600">Personalized health recommendations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications.healthTips}
                    onChange={(e) => updateFormData('preferences', 'notifications', {
                      ...formData.preferences.notifications,
                      healthTips: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-600">Healthcare appointment notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications.appointmentReminders}
                    onChange={(e) => updateFormData('preferences', 'notifications', {
                      ...formData.preferences.notifications,
                      appointmentReminders: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Anonymous Data Sharing</h4>
                    <p className="text-sm text-gray-600">Help improve Luna for all users (fully anonymized)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.privacy.dataSharing}
                    onChange={(e) => updateFormData('preferences', 'privacy', {
                      ...formData.preferences.privacy,
                      dataSharing: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Research Participation</h4>
                    <p className="text-sm text-gray-600">Contribute to women's health research studies</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.privacy.researchParticipation}
                    onChange={(e) => updateFormData('preferences', 'privacy', {
                      ...formData.preferences.privacy,
                      researchParticipation: e.target.checked
                    })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div className="text-center space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Luna, {formData.personalInfo.firstName}!</h2>
              <p className="text-xl text-gray-600 mb-6">Your personalized health companion is ready</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Personalized Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">AI-powered cycle predictions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Instant photo analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">24/7 health chat companion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Personalized health insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Smart symptom tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Goal-oriented recommendations</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Luna will now begin learning your unique patterns and providing personalized insights. The more you use Luna, the smarter it becomes!
              </p>
            </div>

            <button
              onClick={completeOnboarding}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-lg"
            >
              Start Using Luna
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Setup Your Luna Profile</h1>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index <= currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs text-gray-600 mt-1 hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentStep === steps.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;