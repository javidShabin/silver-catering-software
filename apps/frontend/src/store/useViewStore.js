import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useViewStore = create(
  persist(
    (set) => ({
      // Global view mode preference
      customersViewMode: 'grid',
      inventoryViewMode: 'grid',
      menuViewMode: 'grid',
      eventsViewMode: 'grid',
      staffViewMode: 'grid',

      setViewMode: (page, mode) => 
        set((state) => ({ ...state, [`${page}ViewMode`]: mode })),
    }),
    {
      name: 'catering-view-preferences', // Persists to localStorage
    }
  )
);
