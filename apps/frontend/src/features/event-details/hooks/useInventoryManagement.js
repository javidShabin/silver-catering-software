import { useState, useCallback } from "react";

export const useInventoryManagement = (event, setEvent, eventId, setToast) => {
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const openInventoryModal = useCallback(() => {
    setIsInventoryModalOpen(true);
  }, []);

  return {
    isInventoryModalOpen,
    setIsInventoryModalOpen,
    openInventoryModal
  };
};
