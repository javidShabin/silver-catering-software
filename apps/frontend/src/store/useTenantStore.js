import { create } from 'zustand';

export const useTenantStore = create((set) => ({
  tenant: {
    name: "Event Catering Co",
    contactEmail: "info@example.com",
    contactPhone: "+1 234 567 8900",
    address: "123 Catering St, Food City",
    taxNumber: "",
    currency: "INR",
    pdfSettings: {
      showCustomerContact: true,
      showCustomerAddress: true,
      showEventDetails: true,
      showTax: true,
      showDiscount: true,
      showItemQuantity: true,
      showItemUnitPrice: true,
      showItemTotalPrice: true
    }
  },
  isLoading: false,
  error: null,
  
  fetchMyTenant: async () => {
    set({ isLoading: false });
  },
  
  updateTenant: async (data) => {
    set((state) => ({
      tenant: { ...state.tenant, ...data }
    }));
  },

  fetchSettings: async () => {
    set({ isLoading: false });
  },

  updateSettings: async (data) => {
    set((state) => ({
      tenant: { ...state.tenant, ...data }
    }));
    return { success: true };
  },

  uploadLogo: async (data) => {
    return { success: true, logoUrl: "" };
  }
}));
