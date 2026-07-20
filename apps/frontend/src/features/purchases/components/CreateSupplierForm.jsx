import React, { useState } from "react";
import { Building2, User, Mail, Phone, MapPin, Star, Sparkles } from "lucide-react";

const CreateSupplierForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    category: initialData?.category || "Wholesaler",
    rating: initialData?.rating || 5,
    status: initialData?.status || "Active"
  });

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
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Company Name */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
          Company Name
        </label>
        <div className="relative">
          <Building2 size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'name' ? 'text-primary-500' : 'text-slate-400'}`} />
          <input
            autoFocus
            type="text"
            placeholder="e.g. Global Foods Ltd."
            className={inputClasses('name')}
            onFocus={() => setActiveField('name')}
            onBlur={() => setActiveField(null)}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Contact Info Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
            Contact Person
          </label>
          <div className="relative">
            <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'contact' ? 'text-primary-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Full Name"
              className={inputClasses('contact')}
              onFocus={() => setActiveField('contact')}
              onBlur={() => setActiveField(null)}
              value={formData.contactPerson}
              onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'phone' ? 'text-primary-500' : 'text-slate-400'}`} />
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={inputClasses('phone')}
              onFocus={() => setActiveField('phone')}
              onBlur={() => setActiveField(null)}
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
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
          Email Address
        </label>
        <div className="relative">
          <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'email' ? 'text-primary-500' : 'text-slate-400'}`} />
          <input
            type="email"
            placeholder="supplier@example.com"
            className={inputClasses('email')}
            onFocus={() => setActiveField('email')}
            onBlur={() => setActiveField(null)}
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
            Category
          </label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-all appearance-none"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            {["Wholesaler", "Manufacturer", "Distributor", "Retailer"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
            Reliability Rating
          </label>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star 
                key={s} 
                size={16} 
                className={`cursor-pointer transition-colors ${s <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                onClick={() => setFormData({ ...formData, rating: s })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-[2] px-6 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : initialData ? "Update Supplier" : "Register Supplier"}
        </button>
      </div>
    </form>
  );
};

export default CreateSupplierForm;
