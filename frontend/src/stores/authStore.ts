import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  reproductiveStage?: 'puberty' | 'sexually-active' | 'trying-to-conceive' | 'pregnant' | 'postpartum' | 'breastfeeding' | 'premenopausal' | 'menopausal' | 'postmenopausal';
  healthGoals?: ('maintaining-health' | 'achieving-conception' | 'preventing-pregnancy' | 'managing-symptoms' | 'tracking-fertility' | 'hormone-balance' | 'weight-management' | 'mental-health' | 'sexual-wellness')[];
  onboardingCompleted?: boolean;
  race?: string;
  location?: string;
  medicalConditions?: string[];
  medications?: string[];
  allergies?: string[];
  surgeries?: string[];
  lifestyle?: {
    exerciseFrequency?: string;
    sleepHours?: number;
    stressLevel?: number;
    smokingStatus?: string;
    alcoholConsumption?: string;
    dietType?: string;
  };
  preferences?: {
    notifications?: {
      periodReminders?: boolean;
      ovulationAlerts?: boolean;
      healthTips?: boolean;
      appointmentReminders?: boolean;
    };
    privacy?: {
      dataSharing?: boolean;
      researchParticipation?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      profile: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              if (email === 'demo@luna.com' && password === 'password123') {
                resolve(true);
              } else {
                reject(new Error('Invalid email or password'));
              }
            }, 1500);
          });

          // Mock user profile - existing user with completed onboarding
          const profile: UserProfile = {
            id: 'existing-user-123',
            email,
            firstName: 'Sarah',
            lastName: 'Johnson',
            age: 28,
            reproductiveStage: 'sexually-active',
            healthGoals: ['maintaining-health', 'tracking-fertility'],
            onboardingCompleted: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date()
          };

          set({
            isAuthenticated: true,
            profile,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (email: string, password: string, firstName: string, lastName: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              if (email === 'existing@example.com') {
                reject(new Error('User already exists'));
              } else {
                resolve(true);
              }
            }, 1500);
          });

          // Create new user profile - onboarding NOT completed
          const newProfile: UserProfile = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            firstName,
            lastName,
            onboardingCompleted: false, // Key: starts as false
            createdAt: new Date(),
            updatedAt: new Date()
          };

          set({
            isAuthenticated: true,
            profile: newProfile,
            isLoading: false,
            error: null
          });

          console.log('Registration successful:', newProfile);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { profile } = get();
        if (!profile) throw new Error('No profile found');

        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const updatedProfile: UserProfile = { 
            ...profile, 
            ...updates,
            updatedAt: new Date()
          };
          
          set({
            profile: updatedProfile,
            isLoading: false,
            error: null
          });

          console.log('Profile updated successfully:', updatedProfile);
          console.log('Updates received:', updates);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Profile update failed'
          });
          throw error;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          profile: null,
          isLoading: false,
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'luna-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        profile: state.profile
      })
    }
  )
);

export default useAuthStore;