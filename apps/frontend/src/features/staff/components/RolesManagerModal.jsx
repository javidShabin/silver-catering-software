import React from "react";
import PremiumModal from "../../../components/ui/PremiumModal";

export const RolesManagerModal = ({
  isOpen,
  onClose,
  roles,
  isAddingRole,
  setIsAddingRole,
  editingRole,
  setEditingRole,
  roleForm,
  setRoleForm,
  isLoadingRoles,
  handleSaveRole,
  handleDeleteRole
}) => {
  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={() => { 
        onClose(); 
        setIsAddingRole(false); 
        setEditingRole(null); 
        setRoleForm({ name: "", label: "", description: "", permissions: [] }); 
      }}
      title="Manage Workforce Roles"
      description="Configure dynamic system roles and customize their default access privileges."
    >
      <div className="space-y-4">
        {/* Add / Edit Form */}
        {(isAddingRole || editingRole) ? (
          <form onSubmit={handleSaveRole} className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 animate-fadeIn">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              {editingRole ? `Edit Role: ${editingRole.label}` : "Create Custom Role"}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Role Identifier</label>
                <input
                  type="text"
                  required
                  disabled={!!editingRole}
                  placeholder="e.g. supervisor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500 bg-white"
                  value={roleForm.name}
                  onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Display Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations Supervisor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500 bg-white"
                  value={roleForm.label}
                  onChange={e => setRoleForm({ ...roleForm, label: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Supervises daily events and staff allocation."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary-500 bg-white"
                value={roleForm.description}
                onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Access Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {[
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
                ].map(perm => {
                  const isChecked = roleForm.permissions.includes(perm.id);
                  return (
                    <label 
                      key={perm.id} 
                      className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer select-none text-[10px] font-bold ${
                        isChecked ? 'bg-primary-50/50 border-primary-100 text-primary-700' : 'bg-white border-slate-100 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setRoleForm(prev => {
                            const perms = prev.permissions;
                            if (perms.includes(perm.id)) {
                              return { ...prev, permissions: perms.filter(p => p !== perm.id) };
                            } else {
                              return { ...prev, permissions: [...perms, perm.id] };
                            }
                          });
                        }}
                        className="w-3.5 h-3.5 text-primary-600 border-slate-200 rounded"
                      />
                      {perm.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => { setIsAddingRole(false); setEditingRole(null); setRoleForm({ name: "", label: "", description: "", permissions: [] }); }}
                className="w-full sm:w-auto px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoadingRoles}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-all shadow-md cursor-pointer"
              >
                {isLoadingRoles ? "Saving..." : "Save Role"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active System Roles</span>
              <button
                onClick={() => setIsAddingRole(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-all shadow-md active:scale-95"
              >
                + Add Custom Role
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
              {roles.map(role => (
                <div key={role.id || role.name} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{role.label}</span>
                      {role.isSystemDefault ? (
                        <span className="px-1.5 py-0.2 bg-slate-50 text-slate-400 border border-slate-100 rounded text-[8px] font-bold uppercase tracking-wider">Default</span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-purple-50 text-purple-500 border border-purple-100 rounded text-[8px] font-bold uppercase tracking-wider">Custom</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{role.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {role.permissions.map(p => (
                        <span key={p} className="px-1 py-0.2 bg-slate-50 text-slate-500 rounded text-[8px] font-bold uppercase border border-slate-100">{p}</span>
                      ))}
                    </div>
                  </div>
                  
                  {!role.isSystemDefault && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingRole(role);
                          setRoleForm({
                            name: role.name,
                            label: role.label,
                            description: role.description,
                            permissions: role.permissions
                          });
                        }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors text-[10px] font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PremiumModal>
  );
};
