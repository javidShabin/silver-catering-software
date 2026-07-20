import { create } from 'zustand';

// Creates a centralized store for page-level filters (search, pagination, category)
// This decouples the URL/UI state from the component logic and prevents prop drilling.
export const useFilterStore = create((set) => ({
  filters: {
    menu: { search: '', category: 'All', cursor: null, cursorsStack: [] },
    inventory: { search: '', category: 'All', cursor: null, cursorsStack: [] },
    customers: { search: '', cursor: null, cursorsStack: [] },
    events: { search: '', status: 'all', startDate: '', endDate: '', cursor: null, cursorsStack: [] },
    staff: { search: '', roleFilter: 'all', cursor: null, cursorsStack: [] },
  },
  
  setFilter: (page, filterUpdates) => 
    set((state) => ({
      filters: {
        ...state.filters,
        [page]: { ...state.filters[page], ...filterUpdates }
      }
    })),
    
  resetFilter: (page) => 
    set((state) => {
      const defaults = {
        menu: { search: '', category: 'All', cursor: null, cursorsStack: [] },
        inventory: { search: '', category: 'All', cursor: null, cursorsStack: [] },
        customers: { search: '', cursor: null, cursorsStack: [] },
        events: { search: '', status: 'all', startDate: '', endDate: '', cursor: null, cursorsStack: [] },
        staff: { search: '', roleFilter: 'all', cursor: null, cursorsStack: [] },
      };
      return {
        filters: {
          ...state.filters,
          [page]: defaults[page]
        }
      };
    })
}));
