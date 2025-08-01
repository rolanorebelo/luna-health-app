

import { create } from 'zustand';
import { persist } from 'zustand/middleware';


import type { UserProfile as CanonicalUserProfile } from '../types/index';
import { registerUser, loginUser, fetchProfile } from '../services/authApi';

// Helper to map backend snake_case to camelCase
function mapProfileFromBackend(profile: any): CanonicalUserProfile {
  return {
    id: profile.id,
    userId: profile.user_id,
    age: profile.age,
    race: profile.race,
    reproductiveStage: profile.reproductive_stage,
    healthGoals: profile.health_goals || [],
    medicalHistory: profile.medical_history || {},
    preferences: profile.preferences || {},
    onboardingCompleted: Boolean(profile.onboarding_completed),
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    createdAt: profile.created_at,
    location: profile.location,
  };
}


interface AuthState {
  token: string | null;
  profile: CanonicalUserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  error: string | null;
}


interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}


type AuthStore = AuthState & AuthActions;


const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      profile: null,
      isLoading: false,
      isProfileLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await loginUser(email, password);
          set({
            token: result.access_token,
            isLoading: false,
            error: null
          });
          // Fetch profile after login
          await get().fetchProfile();
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await registerUser(email, password);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      fetchProfile: async () => {
        const { token, logout } = get();
        if (!token) throw new Error('No token found');
        set({ isProfileLoading: true, error: null });
        try {
          const profileRaw = await fetchProfile(token);
          const profile = mapProfileFromBackend(profileRaw);
          set({ profile, isProfileLoading: false, error: null });
        } catch (error: any) {
          set({ isProfileLoading: false, error: error.message || 'Failed to fetch profile' });
          // Auto-logout if unauthorized or forbidden
          if (error?.message?.toLowerCase().includes('unauthorized') || error?.message?.toLowerCase().includes('forbidden')) {
            logout();
          }
          throw error;
        }
      },

      logout: () => {
        set({
          token: null,
          profile: null,
          isLoading: false,
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // (isAuthenticated getter will be attached below)
    }),
    {
      name: 'luna-auth-storage',
      partialize: (state) => ({
        token: state.token
      })
    }
  )
);

// Attach isAuthenticated as a derived getter on the store
Object.defineProperty(useAuthStore, 'isAuthenticated', {
  get() {
    return !!useAuthStore.getState().token;
  },
});

export default useAuthStore;