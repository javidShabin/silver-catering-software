import { CURRENCY } from "../../config/currency";
import React, { useState, Suspense, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Info, ArrowLeft, Plus } from "lucide-react";
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { useAuthStore } from "../../store/authStore";
import { useTenantStore } from "../../store/useTenantStore";


import PremiumModal from "../../components/ui/PremiumModal";
import DashboardSkeleton from "../../components/ui/DashboardSkeleton";
import { eventApi } from "../../api/eventApi";

// Presentational Components
import EventDetailsHeader from "./components/EventDetailsHeader";
import EventCoreStats from "./components/EventCoreStats";
import EventFinancialsAndVenue from "./components/EventFinancialsAndVenue";
import EventDutyRoster from "./components/EventDutyRoster";
import EventClientProfile from "./components/EventClientProfile";
import EventCulinarySetup from "./components/EventCulinarySetup";

// Custom Hooks
import { useEventDetails } from "./hooks/useEventDetails";
import { useMenuManagement } from "./hooks/useMenuManagement";
import { useStaffManagement } from "./hooks/useStaffManagement";
import { useInventoryManagement } from "./hooks/useInventoryManagement";

// Lazy Loaded Modals
const EditEventModal = React.lazy(() => import("./components/EditEventModal"));
const MenuChoicesModal = React.lazy(() => import("./components/MenuChoicesModal"));
const StaffAssignmentModal = React.lazy(() => import("./components/StaffAssignmentModal"));
const InventoryAssignmentModal = React.lazy(() => import("./components/InventoryAssignmentModal"));
const EventMenuIngredientsModal = React.lazy(() => import("./components/EventMenuIngredientsModal"));
const LogisticsReturnModal = React.lazy(() => import("./components/LogisticsReturnModal"));

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const setToast = useCallback((toastData) => {
    if (!toastData) return;
    if (toastData.type === 'error') {
      hotToast.error(toastData.message);
    } else {
      hotToast.success(toastData.message);
    }
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Hooks mapping
  const { event, setEvent, isLoading, error } = useEventDetails(id);
  const tenant = useTenantStore((state) => state.tenant) || {};

  const menuMgmt = useMenuManagement(event, setEvent, id, setToast);
  const staffMgmt = useStaffManagement(event, setEvent, id, setToast);
  const inventoryMgmt = useInventoryManagement(event, setEvent, id, setToast);

  // Ingredient Planning Modal State
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);

  // Logistics Return Modal State
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);

  // Edit Event Details States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "", description: "", date: "", time: "", location: "",
    guestCount: 1, status: "pending", durationInDays: 1, eventFee: "", advanceAmount: "", taxRate: "", discountValue: ""
  });

  const openEditModal = useCallback(() => {
    if (!event) return;
    const invoice = event.invoices?.[0];
    setEditFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
      time: event.time || "12:00",
      location: event.location || "",
      guestCount: event.guestCount || 1,
      status: event.status || "pending",
      durationInDays: event.durationInDays || 1,
      eventFee: event.eventFee !== undefined && event.eventFee !== null ? event.eventFee : "",
      advanceAmount: event.advanceAmount !== undefined && event.advanceAmount !== null ? event.advanceAmount : "",
      taxRate: invoice?.taxRate !== undefined && invoice?.taxRate !== null ? invoice.taxRate : (tenant?.taxPercentage || ""),
      discountValue: invoice?.discountValue !== undefined && invoice?.discountValue !== null ? invoice.discountValue : ""
    });
    setIsEditModalOpen(true);
  }, [event, tenant]);

  const handleSaveEventDetails = useCallback(async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || editFormData.title.trim().length < 3) {
      setToast({ message: "Title must be at least 3 characters", type: "error" });
      return;
    }
    if (!editFormData.location.trim() || editFormData.location.trim().length < 5) {
      setToast({ message: "Location must be at least 5 characters", type: "error" });
      return;
    }
    if (Number(editFormData.guestCount) <= 0) {
      setToast({ message: "Guest count must be at least 1", type: "error" });
      return;
    }
    if (editFormData.eventFee !== "" && Number(editFormData.eventFee) < 0) {
      setToast({ message: "Event fee cannot be negative", type: "error" });
      return;
    }
    if (editFormData.advanceAmount !== "" && Number(editFormData.advanceAmount) < 0) {
      setToast({ message: "Advance payment cannot be negative", type: "error" });
      return;
    }
    if (editFormData.description && editFormData.description.trim().length > 0 && editFormData.description.trim().length < 10) {
      setToast({ message: "Description must be at least 10 characters", type: "error" });
      return;
    }

    try {
      setIsSaving(true);
      const submissionData = {
        title: editFormData.title.trim(),
        description: editFormData.description && editFormData.description.trim() ? editFormData.description.trim() : undefined,
        location: editFormData.location.trim(),
        guestCount: Number(editFormData.guestCount),
        durationInDays: Number(editFormData.durationInDays || 1),
        time: editFormData.time,
        status: editFormData.status,
        date: editFormData.date ? new Date(`${editFormData.date}T${editFormData.time || "12:00"}:00Z`).toISOString() : undefined,
        eventFee: editFormData.eventFee !== "" ? Number(editFormData.eventFee) : undefined,
        advanceAmount: editFormData.advanceAmount !== "" ? Number(editFormData.advanceAmount) : undefined,
        ...(editFormData.taxRate !== "" && { taxRate: Number(editFormData.taxRate) }),
        ...(editFormData.discountValue !== "" && { discountValue: Number(editFormData.discountValue) })
      };
      
      await eventApi.update(event.id, submissionData);
      const updatedEventRes = await eventApi.getById(id);
      setEvent(updatedEventRes.data);

      setToast({ message: "Event details updated successfully!", type: "success" });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update event details:", err);
      setToast({ message: err.response?.data?.message || "Failed to update event details.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [editFormData, event, id, setEvent]);

  // Extra Bills States
  const [isExtraBillModalOpen, setIsExtraBillModalOpen] = useState(false);
  const [newExtraBill, setNewExtraBill] = useState({ menuItemId: "", description: "", quantity: "", unit: "Plates", amount: "" });

  const handleSaveExtraBill = useCallback(async () => {
    if ((newExtraBill.menuItemId === "custom" && !newExtraBill.description) || (!newExtraBill.menuItemId && !newExtraBill.description)) {
      setToast({ message: "Please select a menu item or provide a description", type: "error" });
      return;
    }
    if (!newExtraBill.amount) {
      setToast({ message: "Please provide an amount", type: "error" });
      return;
    }
    try {
      setIsSaving(true);
      
      let finalDescription = newExtraBill.description;
      if (newExtraBill.menuItemId && newExtraBill.menuItemId !== "custom") {
        const selectedMenu = event.menuItems?.find(m => m.id === newExtraBill.menuItemId);
        if (selectedMenu) {
          finalDescription = `Extra Food: ${selectedMenu.name}`;
          if (newExtraBill.quantity) {
            finalDescription += ` (Qty: ${newExtraBill.quantity} ${newExtraBill.unit})`;
          }
        }
      } else if (newExtraBill.quantity) {
        finalDescription += ` (Qty: ${newExtraBill.quantity} ${newExtraBill.unit})`;
      }

      await eventApi.addExtraBill(event.id, {
        description: finalDescription,
        amount: Number(newExtraBill.amount)
      });
      const updatedEventRes = await eventApi.getById(id);
      setEvent(updatedEventRes.data);
      
      setToast({ message: "Extra charge added successfully", type: "success" });
      setIsExtraBillModalOpen(false);
      setNewExtraBill({ menuItemId: "", description: "", quantity: "", unit: "Plates", amount: "" });
    } catch (err) {
      setToast({ message: "Failed to add charge", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [newExtraBill, event, setEvent, setToast]);

  const handleDeleteExtraBill = useCallback(async (billId) => {
    try {
      setIsSaving(true);
      await eventApi.deleteExtraBill(event.id, billId);
      
      const updatedEventRes = await eventApi.getById(id);
      setEvent(updatedEventRes.data);
      
      setToast({ message: "Extra charge removed", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to remove charge", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [event, id, setEvent, setToast]);

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-100">
          <Info size={30} />
        </div>
        <h3 className="text-base font-bold text-slate-800">Event Not Found</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{error || "The event you are looking for does not exist."}</p>
        <button
          onClick={() => navigate("/events")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/10"
        >
          <ArrowLeft size={14} /> Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 relative">
      <EventDetailsHeader 
        event={event} 
        navigate={navigate} 
        openEditModal={openEditModal} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm flex flex-col flex-1 h-full">
            <EventCoreStats 
              event={event} 
              setEvent={setEvent} 
              isSaving={isSaving} 
              setIsSaving={setIsSaving} 
              setToast={setToast} 
            />
            <EventFinancialsAndVenue 
              event={event} 
              isSaving={isSaving}
              setIsExtraBillModalOpen={setIsExtraBillModalOpen}
              handleDeleteExtraBill={handleDeleteExtraBill}
            />
          </div>

          <EventDutyRoster 
            event={event} 
            handleToggleRosterDay={staffMgmt.handleToggleRosterDay} 
          />
        </div>

        <div className="space-y-6">
          <EventClientProfile event={event} />
          
          <EventCulinarySetup 
            event={event} 
            openMenuModal={menuMgmt.openMenuModal}
            openStaffModal={staffMgmt.openStaffModal}
            openInventoryModal={inventoryMgmt.openInventoryModal}
            openIngredientsModal={() => setIsIngredientsModalOpen(true)}
            openLogisticsModal={() => setIsLogisticsModalOpen(true)}
            hasLogisticsFeature={true}
          />
        </div>
      </div>

      <Suspense fallback={null}>
        <MenuChoicesModal {...menuMgmt} />
        <StaffAssignmentModal {...staffMgmt} />
        <InventoryAssignmentModal 
          isInventoryModalOpen={inventoryMgmt.isInventoryModalOpen}
          setIsInventoryModalOpen={inventoryMgmt.setIsInventoryModalOpen}
          event={event}
          setEvent={setEvent}
          eventId={id}
          setToast={setToast}
        />
        <EventMenuIngredientsModal 
          isOpen={isIngredientsModalOpen}
          onClose={() => setIsIngredientsModalOpen(false)}
          event={event}
        />
        <LogisticsReturnModal 
          isOpen={isLogisticsModalOpen}
          onClose={() => setIsLogisticsModalOpen(false)}
          event={event}
          setToast={setToast}
        />
        <EditEventModal 
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          handleSaveEventDetails={handleSaveEventDetails}
          isSaving={isSaving}
        />
      </Suspense>

      <Toaster position="top-right" />

      <PremiumModal
        isOpen={isExtraBillModalOpen}
        onClose={() => setIsExtraBillModalOpen(false)}
        title="Add Food Shortage / Extra Charge"
        description="Record an additional charge or extra food prepared during the event."
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Charge For</label>
            <select
              value={newExtraBill.menuItemId || ""}
              onChange={(e) => setNewExtraBill({ ...newExtraBill, menuItemId: e.target.value })}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            >
              <option value="" disabled className="text-slate-400">Select an item from the menu...</option>
              {event.menuItems?.map(menu => (
                <option key={menu.id} value={menu.id} className="text-slate-800">{menu.name}</option>
              ))}
              <option value="custom" className="text-slate-800">Other (Custom Description)</option>
            </select>
          </div>
          
          {newExtraBill.menuItemId === "custom" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Custom Details</label>
              <input 
                type="text" 
                placeholder="e.g. Extra Tables, Transport fee..." 
                value={newExtraBill.description}
                onChange={(e) => setNewExtraBill({ ...newExtraBill, description: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Quantity</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="e.g. 20" 
                  value={newExtraBill.quantity}
                  onChange={(e) => setNewExtraBill({ ...newExtraBill, quantity: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                />
                <select
                  value={newExtraBill.unit}
                  onChange={(e) => setNewExtraBill({ ...newExtraBill, unit: e.target.value })}
                  className="w-24 shrink-0 h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                >
                  <option value="Plates">Plates</option>
                  <option value="KG">KG</option>
                  <option value="Litre">Litre</option>
                  <option value="Nos">Nos</option>
                  <option value="Pax">Pax</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Extra Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-semibold text-xs">{CURRENCY}</span>
                </div>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={newExtraBill.amount}
                  onChange={(e) => setNewExtraBill({ ...newExtraBill, amount: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setIsExtraBillModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveExtraBill}
              disabled={isSaving}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer gap-2 disabled:opacity-50"
            >
              {isSaving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus size={14} strokeWidth={2.5} />}
              Save Charge
            </button>
          </div>
        </div>
      </PremiumModal>
    </div>
  );
};

export default EventDetailsPage;
