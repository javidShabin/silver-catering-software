import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppearanceStore = create(
  persist(
    (set) => ({
      theme: 'system', // 'system' | 'light' | 'dark'
      primaryColor: 'orange', // 'orange' | 'blue' | 'purple' | 'green' | 'red'
      animations: true,
      highContrast: false,
      setTheme: (theme) => set({ theme }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      setAnimations: (animations) => set({ animations }),
      setHighContrast: (highContrast) => set({ highContrast }),
    }),
    {
      name: 'appearance-settings',
    }
  )
);
