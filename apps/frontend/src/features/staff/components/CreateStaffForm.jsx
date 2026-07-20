import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, Briefcase, Phone, AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "../../../api/staffApi";

const CreateStaffForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => staffApi.getRoles()
  });

  const roles = rolesData?.data || [];

  // Exclude 'admin' role unless editing the admin user
  const filteredRoles = roles.filter(role => {
    const roleName = role.name || role.value;
    if (roleName === 'admin') {
      return initialData?.role === 'admin';
    }
    return true;
  });

  const [formData, setFormData] = useState(() => {
    let perms = initialData?.permissions || [];
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch(e) { perms = []; }
    }
    return {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      role: initialData?.role || "admin",
      department: initialData?.department || "Catering",
      phone: initialData?.phone || initialData?.phoneNumber || "",
      permissions: Array.isArray(perms) ? perms : [],
      status: initialData?.status || "active"
    };
  });

  // Set default role for new staff to the first available non-admin role once loaded
  useEffect(() => {
    if (!initialData && filteredRoles.length > 0 && formData.role === "admin") {
      const firstNonAdminRole = filteredRoles[0]?.name || filteredRoles[0]?.value;
      if (firstNonAdminRole) {
        setFormData(prev => ({ ...prev, role: firstNonAdminRole }));
      }
    }
  }, [filteredRoles, initialData, formData.role]);

  // Sync initialData if it changes while component is mounted
  useEffect(() => {
    if (initialData) {
      let perms = initialData.permissions || [];
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms); } catch(e) { perms = []; }
      }
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "admin",
        department: initialData.department || "Catering",
        phone: initialData.phone || initialData.phoneNumber || "",
        permissions: Array.isArray(perms) ? perms : [],
        status: initialData.status || "active"
      });
    } else {
      setFormData({
        name: "", email: "", password: "", role: "admin", department: "Catering", phone: "", permissions: [], status: "active"
      });
    }
  }, [initialData]);

  const [activeField, setActiveField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [addAnother, setAddAnother] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const allPermissions = [
    { id: "dashboard", label: "View Dashboard" },
    { id: "events", label: "Manage Events" },
    { id: "menu", label: "Manage Menu" },
    { id: "inventory", label: "Manage Inventory" },
    { id: "billing", label: "Manage Billing & Invoices" },
    { id: "quotations", label: "Manage Quotations" },
    { id: "customers", label: "Manage Customers" },
    { id: "reports", label: "View Reports & Analytics" },
    { id: "staff", label: "Manage Staff" },
    { id: "settings", label: "Manage Settings" }
  ];

  const handlePermissionToggle = (permId) => {
    if (formData.role === 'admin') return;
    
    setFormData(prev => {
      const perms = prev.permissions;
      if (perms.includes(permId)) {
        return { ...prev, permissions: perms.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...perms, permId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = { ...formData };
    if (submitData.role === 'admin') {
      submitData.permissions = ["all"];
    }
    
    if (initialData && !submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData, addAnother);
    if (addAnother && !initialData) {
      setFormData(prev => ({
        ...prev,
        name: "",
        email: "",
        password: "",
        phone: ""
      }));
    }
  };

  const inputClasses = (fieldName) => `
    w-full pl-11 pr-4 py-2 bg-slate-50/50 border transition-all duration-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400
    ${activeField === fieldName 
      ? 'border-primary-500 ring-4 ring-primary-500/10 bg-white shadow-sm' 
      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
      <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-full md:w-fit">
        <button 
          type="button" 
          onClick={() => setActiveTab('details')} 
          className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'}`}
        >
          Staff Details
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('permissions')} 
          className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'permissions' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'}`}
        >
          Permissions
        </button>
      </div>

      <div className="h-[220px] shrink-0 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 'details' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'name' ? 'text-primary-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    autoFocus
                    className={inputClasses('name')}
                    onFocus={() => setActiveField('name')}
                    onBlur={() => setActiveField(null)}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'email' ? 'text-primary-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    className={inputClasses('email')}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Initial Password</label>
                <div className="relative">
                    <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'password' ? 'text-primary-500' : 'text-slate-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={inputClasses('password') + " pr-11"}
                      onFocus={() => setActiveField('password')}
                      onBlur={() => setActiveField(null)}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!initialData}
                      placeholder={initialData ? "Leave blank to keep current" : "••••••••"}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'phone' ? 'text-primary-500' : 'text-slate-400'}`} />
                  <input
                    type="tel"
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
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Department</label>
                <div className="relative">
                  <Briefcase size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'dept' ? 'text-primary-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    className={inputClasses('dept')}
                    onFocus={() => setActiveField('dept')}
                    onBlur={() => setActiveField(null)}
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    required
                    placeholder="e.g. Culinary, Logistics, Accounts"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">System Role</label>
                <div className="relative">
                  <Shield size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'role' ? 'text-primary-500' : 'text-slate-400'}`} />
                  <select
                    className={`${inputClasses('role')} appearance-none`}
                    onFocus={() => setActiveField('role')}
                    onBlur={() => setActiveField(null)}
                    value={formData.role}
                    onChange={e => {
                      const selectedRole = roles.find(r => (r.name || r.value) === e.target.value);
                      setFormData({ 
                        ...formData, 
                        role: e.target.value,
                        // Only reset permissions to role defaults if it's a new user, or if changing to admin
                        permissions: e.target.value === 'admin' 
                          ? ["all"] 
                          : (!initialData ? (selectedRole?.permissions || []) : formData.permissions)
                      });
                    }}
                    required
                    disabled={isLoadingRoles}
                  >
                    {filteredRoles.map((role) => (
                      <option key={role.id || role.value} value={role.name || role.value} className="text-slate-900 font-medium">
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="px-5 py-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary-100/50 text-primary-600 mt-0.5">
                  <Shield size={16} />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Access Permissions</span>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                    {roles.find(r => (r.name || r.value) === formData.role)?.description || "Access privileges assigned to this system role."}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/60">
                {allPermissions.map(perm => {
                  const isAdmin = formData.role === 'admin';
                  const isChecked = isAdmin || formData.permissions.includes(perm.id);
                  
                  return (
                    <label 
                      key={perm.id} 
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked 
                          ? (isAdmin ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-primary-50/80 border-primary-200')
                          : 'bg-white border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-bold ${isChecked ? 'text-primary-800' : 'text-slate-600'}`}>
                        {perm.label}
                      </span>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={isChecked}
                        onChange={() => handlePermissionToggle(perm.id)}
                        disabled={isAdmin}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 mt-2 border-t border-slate-200/60 space-y-4">
        <div className="flex items-center gap-3 px-1 py-1">
          <input
            id="add-multiple"
            type="checkbox"
            checked={addAnother}
            onChange={(e) => setAddAnother(e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500 transition-colors cursor-pointer shrink-0"
          />
          <label htmlFor="add-multiple" className="text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer select-none leading-snug">
            Add multiple staff members (keep form open)
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:flex-1 px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:flex-[2] px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (initialData ? "Save Changes" : "Complete Onboarding")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateStaffForm;
