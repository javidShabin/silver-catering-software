import { useState, useCallback, useMemo } from "react";
import { staffApi } from "../../../api/staffApi";
import { eventApi } from "../../../api/eventApi";
import { getCateringDesignation } from "../utils/cateringUtils";

export const useStaffManagement = (event, setEvent, eventId, setToast) => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffModalTab, setStaffModalTab] = useState("add"); // "add" | "selected"
  const [allStaff, setAllStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  const openStaffModal = useCallback(async () => {
    setSelectedStaff(event?.assignedStaff || []);
    setIsStaffModalOpen(true);
    try {
      const res = await staffApi.getAll({ limit: 100 });
      setAllStaff(res.data || []);
    } catch (err) {
      console.error("Failed to load staff list:", err);
      setToast({ message: "Failed to load staff members from bank.", type: "error" });
    }
  }, [event?.assignedStaff, setToast]);

  const handleToggleStaff = useCallback((member) => {
    setSelectedStaff((prev) => {
      const exists = prev.some((s) => (s.id) === (member.id));
      if (exists) {
        return prev.filter((s) => (s.id) !== (member.id));
      } else {
        return [...prev, member];
      }
    });
  }, []);

  const handleSaveStaffAssignments = useCallback(async () => {
    if (!event) return;
    try {
      setIsSavingStaff(true);
      const staffIds = selectedStaff.map((s) => s.id);
      
      await eventApi.update(event.id, { assignedStaff: staffIds });
      const updatedEventRes = await eventApi.getById(eventId);
      setEvent(updatedEventRes.data);

      setToast({ message: "Operational staff assignments updated successfully!", type: "success" });
      setIsStaffModalOpen(false);
    } catch (err) {
      console.error("Failed to update staff assignments:", err);
      setToast({ message: err.response?.data?.message || "Failed to assign operational staff.", type: "error" });
    } finally {
      setIsSavingStaff(false);
    }
  }, [event, selectedStaff, eventId, setEvent, setToast]);

  const handleToggleRosterDay = useCallback(async (staffId, dayNumber) => {
    if (!event) return;
    try {
      const currentRoster = [...(event.dutyRoster || [])];
      const staffEntryIdx = currentRoster.findIndex(r => {
        const idToCheck = r.staffId?.id || r.staffId;
        return idToCheck === staffId;
      });
      
      if (staffEntryIdx > -1) {
        const entry = { ...currentRoster[staffEntryIdx] };
        const days = [...(entry.days || [])];
        if (days.includes(dayNumber)) {
          entry.days = days.filter(d => d !== dayNumber);
        } else {
          entry.days = [...days, dayNumber].sort((a, b) => a - b);
        }
        currentRoster[staffEntryIdx] = entry;
      } else {
        currentRoster.push({
          staffId,
          days: [dayNumber]
        });
      }

      // Convert objects to pure string IDs for Mongoose validation compatibility
      const sanitizedRoster = currentRoster
        .filter(r => r.staffId)
        .map(r => ({
          staffId: r.staffId?.id || r.staffId,
          days: r.days || []
        }));

      await eventApi.update(event.id, { dutyRoster: sanitizedRoster });
      
      const updatedEventRes = await eventApi.getById(eventId);
      setEvent(updatedEventRes.data);
      setToast({ message: "Duty shift roster updated successfully!", type: "success" });
    } catch (err) {
      console.error("Failed to update duty roster:", err);
      setToast({ message: "Failed to update roster shift.", type: "error" });
    }
  }, [event, eventId, setEvent, setToast]);

  const filteredStaff = useMemo(() => {
    return allStaff
      .filter((member) => member.role !== "admin")
      .filter((member) =>
        member.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        (member.department || "").toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        getCateringDesignation(member).toLowerCase().includes(staffSearchQuery.toLowerCase())
      );
  }, [allStaff, staffSearchQuery]);

  return {
    isStaffModalOpen,
    setIsStaffModalOpen,
    staffModalTab,
    setStaffModalTab,
    allStaff,
    selectedStaff,
    staffSearchQuery,
    setStaffSearchQuery,
    isSavingStaff,
    openStaffModal,
    handleToggleStaff,
    handleSaveStaffAssignments,
    handleToggleRosterDay,
    filteredStaff
  };
};
