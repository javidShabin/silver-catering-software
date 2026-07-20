import React, { useState } from "react";

const CreateVendorForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    category: initialData?.category || "Wholesaler",
    status: initialData?.status || "Active"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default rating to 5 since it's removed from UI but might be needed by backend
    onSubmit({ ...formData, rating: initialData?.rating || 5 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Vendor Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Vendor Name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Fresh Farms Co."
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Category</label>
          <select 
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            {["Wholesaler", "Manufacturer", "Distributor", "Retailer"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Contact Person */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Contact Person</label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.contactPerson}
            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Phone Number</label>
          <input
            type="tel"
            placeholder="e.g. 9876543210"
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
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Email Address (Optional)</label>
          <input
            type="email"
            placeholder="contact@freshfarms.com"
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Physical Address (Optional)</label>
          <input
            type="text"
            placeholder="Full business address..."
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      {/* Status Toggle */}
      <div 
        onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.status === 'Active' ? 'bg-primary-50 border-primary-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
      >
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs font-bold text-slate-700">Vendor Status</p>
            <p className="text-[10px] text-slate-500">
              {formData.status === 'Active' ? 'Vendor is currently active.' : 'Vendor is inactive.'}
            </p>
          </div>
        </div>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.status === 'Active' ? 'bg-primary-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.status === 'Active' ? 'left-4.5' : 'left-0.5'}`} style={{ left: formData.status === 'Active' ? '18px' : '2px' }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer gap-2"
        >
          {initialData ? "Update Vendor" : "Create Vendor"}
        </button>
      </div>
    </form>
  );
};

export default CreateVendorForm;
