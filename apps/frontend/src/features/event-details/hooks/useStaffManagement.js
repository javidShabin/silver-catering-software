import { useState, useCallback, useMemo } from "react";
import { staffRoleApi } from "../../../api/staffRoleApi";
import { eventApi } from "../../../api/eventApi";

export const useStaffManagement = (event, setEvent, eventId, setToast) => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [staffAllocations, setStaffAllocations] = useState([]);
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  const openStaffModal = useCallback(async () => {
    let parsedAllocations = [];
    if (event?.staffAllocations) {
      if (typeof event.staffAllocations === 'string') {
        try { parsedAllocations = JSON.parse(event.staffAllocations); } catch(e) {}
      } else {
        parsedAllocations = event.staffAllocations;
      }
    }
    setStaffAllocations(parsedAllocations);
    setIsStaffModalOpen(true);
    try {
      const res = await staffRoleApi.getAll();
      if (res.status === "success") {
        setAllRoles(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load staff roles:", err);
      setToast({ message: "Failed to load staff roles.", type: "error" });
    }
  }, [event?.staffAllocations, setToast]);

  const updateStaffAllocation = useCallback((index, field, value) => {
    setStaffAllocations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removeStaffAllocation = useCallback((index) => {
    setStaffAllocations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addStaffAllocation = useCallback((roleName = "", rate = 0, count = 1) => {
    setStaffAllocations((prev) => [...prev, { role: roleName, rate: Number(rate), count: Number(count) }]);
  }, []);

  const handleSaveStaffAssignments = useCallback(async () => {
    if (!event) return;
    try {
      setIsSavingStaff(true);
      
      const cleanAllocations = staffAllocations.map(s => ({
        ...s,
        rate: Number(s.rate || 0),
        count: Number(s.count || 0)
      }));
      await eventApi.update(event.id, { staffAllocations: cleanAllocations });
      const updatedEventRes = await eventApi.getById(eventId);
      setEvent(updatedEventRes.data);

      setToast({ message: "Staff allocations updated successfully!", type: "success" });
      setIsStaffModalOpen(false);
    } catch (err) {
      console.error("Failed to update staff allocations:", err);
      setToast({ message: err.response?.data?.message || "Failed to assign staff roles.", type: "error" });
    } finally {
      setIsSavingStaff(false);
    }
  }, [event, staffAllocations, eventId, setEvent, setToast]);

  return {
    isStaffModalOpen,
    setIsStaffModalOpen,
    allRoles,
    staffAllocations,
    setStaffAllocations,
    updateStaffAllocation,
    removeStaffAllocation,
    addStaffAllocation,
    isSavingStaff,
    openStaffModal,
    handleSaveStaffAssignments
  };
};
