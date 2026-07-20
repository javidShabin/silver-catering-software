import { create } from 'zustand';

// Centralizes all Modal states (open/close and selected data) across the application.
// This removes `isModalOpen`, `isDeleteModalOpen`, and `selectedItem` from local component state,
// reducing re-renders and deeply nested prop drilling.
export const useModalStore = create((set) => ({
  modals: {
    menu: { isOpen: false, isDeleteOpen: false, isCategoryOpen: false, selectedItem: null },
    inventory: { isOpen: false, isDeleteOpen: false, selectedItem: null },
    customers: { isOpen: false, isDeleteOpen: false, selectedItem: null },
    events: { isOpen: false, isDeleteOpen: false, selectedItem: null },
    staff: { isOpen: false, isDeleteOpen: false, selectedItem: null },
  },

  openModal: (page, isDelete = false, data = null, isCategory = false) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [page]: { 
          isOpen: !isDelete && !isCategory, 
          isDeleteOpen: isDelete, 
          isCategoryOpen: isCategory,
          selectedItem: data 
        }
      }
    })),

  closeModal: (page) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [page]: { isOpen: false, isDeleteOpen: false, isCategoryOpen: false, selectedItem: null }
      }
    })),
}));
