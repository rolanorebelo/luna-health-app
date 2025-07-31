import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock types - simplified for demo
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  id: string;
  userId: string;
  age: number;
  reproductiveStage: string;
  healthGoals: string[];
  onboardingCompleted: boolean;
  firstName?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStoreType = AuthState & AuthActions;

const useAuthStore = create<AuthStoreType>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call - replace with real API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'Sarah',
            lastName: 'Johnson',
            dateOfBirth: new Date('1995-06-15'),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const mockProfile: UserProfile = {
            id: '1',
            userId: '1',
            age: 28,
            reproductiveStage: 'sexually-active',
            healthGoals: ['maintaining-health'],
            onboardingCompleted: true,
            firstName: 'Sarah'
          };

          set({
            user: mockUser,
            profile: mockProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const mockProfile: UserProfile = {
            id: '1',
            userId: '1',
            age: new Date().getFullYear() - userData.dateOfBirth.getFullYear(),
            reproductiveStage: 'sexually-active',
            healthGoals: [],
            onboardingCompleted: false,
            firstName: userData.firstName
          };

          set({
            user: mockUser,
            profile: mockProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { profile } = get();
        if (!profile) throw new Error('No profile found');

        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedProfile = { ...profile, ...updates };
          
          set({
            profile: updatedProfile,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Profile update failed'
          });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          // Mock auth check - in real app, this would validate token
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // For demo, we'll just check if we have stored auth data
          const { user, profile } = get();
          
          set({
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'luna-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;