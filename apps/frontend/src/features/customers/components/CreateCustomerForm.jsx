import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, FileText, Sparkles } from "lucide-react";

const CreateCustomerForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    notes: initialData?.notes || "",
    isFrequent: initialData?.isFrequent || false
  });

  // Sync initialData if it changes while component is mounted
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        notes: initialData.notes || "",
        isFrequent: initialData.isFrequent || false
      });
    } else {
      setFormData({
        name: "", email: "", phone: "", address: "", notes: "", isFrequent: false
      });
    }
  }, [initialData]);

  const [activeField, setActiveField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = (fieldName) => `
    w-full pl-12 pr-4 py-3 bg-slate-50 border transition-all duration-300 rounded-xl text-sm
    ${activeField === fieldName 
      ? 'border-primary-500 ring-4 ring-primary-500/5 bg-white shadow-sm' 
      : 'border-slate-100 hover:border-slate-200'
    }
    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Full Name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. John Doe"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Email Address (Optional)</label>
          <input
            type="email"
            placeholder="john@example.com"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Phone Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Phone Number</label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.phone}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData({ ...formData, phone: val });
            }}
            minLength={10}
            maxLength={10}
            pattern="[0-9]{10}"
            required
            disabled={isLoading}
          />
        </div>

        {/* Address Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Physical Address</label>
          <input
            type="text"
            placeholder="123 Business Ave, Suite 100"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Frequent Customer Toggle */}
      <div 
        onClick={() => !isLoading && setFormData({ ...formData, isFrequent: !formData.isFrequent })}
        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.isFrequent ? 'bg-primary-50 border-primary-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
      >
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs font-bold text-slate-700">Frequent Customer</p>
            <p className="text-[10px] text-slate-500">Mark as a VIP for special priority.</p>
          </div>
        </div>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.isFrequent ? 'bg-primary-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.isFrequent ? 'left-4.5' : 'left-0.5'}`} style={{ left: formData.isFrequent ? '18px' : '2px' }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Customer' : 'Create Customer'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateCustomerForm;
