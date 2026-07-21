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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="e.g. john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Initial Password</label>
                <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full h-9 rounded-lg border border-slate-200 px-3 pr-9 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!initialData}
                      placeholder={initialData ? "Leave blank to keep current" : "••••••••"}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={formData.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Department</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    required
                    placeholder="e.g. Culinary, Logistics, Accounts"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">System Role</label>
                <div className="relative">
                  <select
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
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
                      <option key={role.id || role.value} value={role.name || role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
        </div>

      <div className="pt-2 border-t border-slate-100 space-y-4">
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

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
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
            disabled={isLoading}
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (initialData ? "Update Staff" : "Onboard Staff")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateStaffForm;
