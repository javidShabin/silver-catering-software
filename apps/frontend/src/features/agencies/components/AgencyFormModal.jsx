import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { agenciesApi } from "../../../api/agenciesApi";
import toast from "react-hot-toast";

const AgencyFormModal = ({ isOpen, onClose, agency, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceType: "",
    address: "",
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || "",
        phone: agency.phone || "",
        serviceType: agency.serviceType || "",
        address: agency.address || "",
        isActive: agency.isActive ?? true
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        serviceType: "",
        address: "",
        isActive: true
      });
    }
  }, [agency, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Agency name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (agency) {
        await agenciesApi.update(agency.id, formData);
        toast.success("Agency updated successfully");
      } else {
        await agenciesApi.create(formData);
        toast.success("Agency added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving agency:", error);
      toast.error(error.response?.data?.message || "Failed to save agency");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[15px] font-bold text-slate-800">
            {agency ? "Edit Agency" : "Add New Agency"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1">Agency Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-primary-500 transition-all text-slate-800 placeholder:text-slate-400"
                placeholder="e.g. Kerala Serving Boys"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1">Phone Number</label>
              <input
                type="tel" maxLength="10"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-primary-500 transition-all text-slate-800 placeholder:text-slate-400"
                placeholder="Contact number"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: val });
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1">Service Type</label>
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-primary-500 transition-all text-slate-800 placeholder:text-slate-400"
                placeholder="e.g. Kitchen Staff, Serving Boys, Decorators"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1">Address / Location</label>
              <input
                type="text"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-primary-500 transition-all text-slate-800 placeholder:text-slate-400"
                placeholder="Agency address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-1 ml-0.5">
              <input
                type="checkbox"
                id="isActive"
                className="w-3.5 h-3.5 text-primary rounded border-slate-300 focus:ring-primary"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-[12px] font-medium text-slate-700 cursor-pointer">
                Active (Available for events)
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Saving..." : "Save Agency"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AgencyFormModal;
