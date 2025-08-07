import { create } from 'zustand';

// Mock health store for demo
interface MockHealthStore {
  loadCurrentCycle: () => Promise<void>;
  loadInsights: () => Promise<void>;
  loadPredictions: () => Promise<void>;
}

const useHealthStore = create<MockHealthStore>((set) => ({
  loadCurrentCycle: async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  loadInsights: async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  loadPredictions: async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}));

export default useHealthStore;