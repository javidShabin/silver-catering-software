import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Users, IndianRupee, Plus, Trash2, Box } from "lucide-react";
import { agenciesApi } from "../../../api/agenciesApi";
import { eventApi } from "../../../api/eventApi";
import toast from "react-hot-toast";

const AssignmentFormModal = ({ isOpen, onClose, assignment, onSuccess }) => {
  const [agencies, setAgencies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentType, setAssignmentType] = useState("manpower");

  const [formData, setFormData] = useState({
    agencyId: "",
    eventId: "",
    numberOfStaff: 1,
    rentalItems: [],
    numberOfDays: 1,
    totalAmount: "",
    advancePaid: "",
    status: "pending",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchLookups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (assignment) {
      const isRental = assignment.rentalItems && Array.isArray(assignment.rentalItems) && assignment.rentalItems.length > 0;
      setAssignmentType(isRental ? "rental" : "manpower");
      setFormData({
        agencyId: assignment.agencyId || "",
        eventId: assignment.eventId || "",
        numberOfStaff: assignment.numberOfStaff ?? (isRental ? 0 : 1),
        rentalItems: isRental ? assignment.rentalItems : [],
        numberOfDays: assignment.numberOfDays || 1,
        totalAmount: assignment.totalAmount ?? "",
        advancePaid: assignment.advancePaid ?? "",
        status: assignment.status || "pending",
        notes: assignment.notes || ""
      });
    } else {
      setAssignmentType("manpower");
      setFormData({
        agencyId: "",
        eventId: "",
        numberOfStaff: 1,
        rentalItems: [],
        numberOfDays: 1,
        totalAmount: "",
        advancePaid: "",
        status: "pending",
        notes: ""
      });
    }
  }, [assignment, isOpen]);

  const fetchLookups = async () => {
    try {
      setLoadingLookups(true);
      // Fetch active agencies
      const agenciesRes = await agenciesApi.getAll();
      if (agenciesRes.status === "success") {
        setAgencies(agenciesRes.data.filter(a => a.isActive));
      }
      
      // Fetch upcoming/active events for the dropdown
      const eventsRes = await eventApi.getAll({ status: "all" });
      if (eventsRes.status === "success") {
        // filter out cancelled/completed maybe? Or show all.
        setEvents(eventsRes.data.filter(e => e.status !== "cancelled"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load agencies and events");
    } finally {
      setLoadingLookups(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agencyId || !formData.eventId) {
      toast.error("Please select an agency and an event.");
      return;
    }

    try {
      setIsSubmitting(true);
      const dataToSubmit = {
        ...formData,
        numberOfStaff: parseInt(formData.numberOfStaff) || 0,
        rentalItems: formData.rentalItems,
        numberOfDays: parseInt(formData.numberOfDays) || 1,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        advancePaid: parseFloat(formData.advancePaid) || 0
      };

      if (assignment) {
        await agenciesApi.updateAssignment(assignment.id, dataToSubmit);
        toast.success("Assignment updated successfully");
      } else {
        await agenciesApi.assignToEvent(dataToSubmit);
        toast.success("Assignment created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error(error.response?.data?.message || "Failed to save assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-3 py-1.5 bg-white border border-slate-200/80 rounded-lg text-slate-700 text-[13px] font-medium hover:border-slate-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all shadow-sm";
  const labelClasses = "block text-[12px] font-bold text-slate-700 mb-1 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/20 ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              {assignment ? <Edit2 size={16} /> : <Plus size={16} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {assignment ? "Edit Assignment" : "New Assignment"}
              </h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50/50">
          {loadingLookups ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner text-primary loading-md"></span>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Left Column: General & Financials */}
              <div className="w-full lg:w-1/2 flex flex-col gap-4">
                
                {/* General Details */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="text-[13px] font-bold text-slate-800 border-b border-slate-100 pb-1.5">Primary Details</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className={labelClasses}>Select Event <span className="text-red-500">*</span></label>
                      <select
                        required
                        className={inputClasses}
                        value={formData.eventId}
                        onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                      >
                        <option value="" disabled>Select an event</option>
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClasses}>Select Agency <span className="text-red-500">*</span></label>
                      <select
                        required
                        className={inputClasses}
                        value={formData.agencyId}
                        onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                      >
                        <option value="" disabled>Select an agency</option>
                        {agencies.map(ag => (
                          <option key={ag.id} value={ag.id}>{ag.name} {ag.serviceType ? `(${ag.serviceType})` : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financials & Status */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3 flex-1">
                  <h3 className="text-[13px] font-bold text-slate-800 border-b border-slate-100 pb-1.5">Financials & Status</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClasses}>
                        <IndianRupee size={12} className="text-primary-500" /> Total Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        className={inputClasses}
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>
                        <IndianRupee size={12} className="text-primary-500" /> Advance Paid
                      </label>
                      <input
                        type="number"
                        min="0"
                        className={inputClasses}
                        value={formData.advancePaid}
                        onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClasses}>Status</label>
                      <select
                        className={inputClasses}
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClasses}>Notes (Optional)</label>
                      <input
                        type="text"
                        className={inputClasses}
                        placeholder="Instructions..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Work Details */}
              <div className="w-full lg:w-1/2 flex flex-col gap-4">
                
                {/* Type Toggle */}
                <div className="flex bg-slate-200/50 p-1 rounded-lg w-full shadow-inner">
                  <button
                    type="button"
                    onClick={() => { setAssignmentType("manpower"); setFormData({...formData, rentalItems: [], numberOfStaff: formData.numberOfStaff || 1}); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-bold rounded-md transition-all duration-300 ${
                      assignmentType === "manpower" 
                        ? "bg-white text-primary-600 shadow-sm ring-1 ring-slate-900/5" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    <Users size={14} /> Manpower
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAssignmentType("rental"); setFormData({...formData, numberOfStaff: 0}); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-bold rounded-md transition-all duration-300 ${
                      assignmentType === "rental" 
                        ? "bg-white text-primary-600 shadow-sm ring-1 ring-slate-900/5" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    <Box size={14} /> Rentals
                  </button>
                </div>

                {/* Assignment Details */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3 flex-1 flex flex-col">
                  <h3 className="text-[13px] font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                    {assignmentType === 'manpower' ? 'Staffing Details' : 'Rental Details'}
                  </h3>
                  
                  {assignmentType === 'manpower' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClasses}>
                          <Users size={12} className="text-primary-500" /> Number of Staff
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          className={inputClasses}
                          value={formData.numberOfStaff}
                          onChange={(e) => setFormData({ ...formData, numberOfStaff: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className={labelClasses}>
                          <CalendarIcon size={12} className="text-primary-500" /> Total Days
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          className={inputClasses}
                          value={formData.numberOfDays}
                          onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {assignmentType === 'rental' && (
                    <div className="space-y-3 flex-1 flex flex-col max-h-[300px]">
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelClasses}>
                            <Box size={12} className="text-primary-500" /> Equipment & Items
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, rentalItems: [...formData.rentalItems, { name: "", quantity: 1 }] })}
                            className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md hover:bg-primary-100 flex items-center gap-1 transition-colors"
                          >
                            <Plus size={12} /> Add Item
                          </button>
                        </div>
                        
                        {formData.rentalItems.length === 0 ? (
                          <div className="text-center py-4 bg-slate-50 border border-slate-200/80 border-dashed rounded-lg">
                            <Box size={20} className="mx-auto text-slate-300 mb-1" />
                            <p className="text-[12px] font-medium text-slate-500">No items added yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {formData.rentalItems.map((item, index) => (
                              <div key={index} className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
                                <input
                                  type="text"
                                  placeholder="Item Name (e.g. Chairs)"
                                  required
                                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200/80 rounded-md text-[13px] font-medium focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 shadow-sm"
                                  value={item.name}
                                  onChange={(e) => {
                                    const newItems = [...formData.rentalItems];
                                    newItems[index].name = e.target.value;
                                    setFormData({ ...formData, rentalItems: newItems });
                                  }}
                                />
                                <div className="flex items-center bg-white border border-slate-200/80 rounded-md shadow-sm">
                                  <span className="px-2 text-[11px] font-bold text-slate-400 border-r border-slate-200/80 bg-slate-50 rounded-l-md h-full flex items-center">Qty</span>
                                  <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-16 px-2 py-1.5 bg-transparent text-[13px] font-bold text-center focus:outline-none"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newItems = [...formData.rentalItems];
                                      newItems[index].quantity = e.target.value === "" ? "" : (parseInt(e.target.value) || 1);
                                      setFormData({ ...formData, rentalItems: newItems });
                                    }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = formData.rentalItems.filter((_, i) => i !== index);
                                    setFormData({ ...formData, rentalItems: newItems });
                                  }}
                                  className="p-1.5 text-red-500 bg-white border border-slate-200/80 hover:bg-red-50 hover:border-red-200 rounded-md shadow-sm transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full pt-3 border-t border-slate-100 mt-2">
                        <label className={labelClasses}>
                          <CalendarIcon size={12} className="text-primary-500" /> Total Rental Days
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          className={inputClasses}
                          value={formData.numberOfDays}
                          onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || loadingLookups}
            className="px-6 py-2 text-[13px] font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-lg shadow-sm shadow-primary-600/20 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isSubmitting && <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
            Save Assignment
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignmentFormModal;
