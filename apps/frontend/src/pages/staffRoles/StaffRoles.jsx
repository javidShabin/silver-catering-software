import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { staffRoleApi } from "../../api/staffRoleApi";
import { CURRENCY } from "../../config/currency";
import { toast } from "react-hot-toast";

const StaffRoles = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    defaultRate: ""
  });

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await staffRoleApi.getAll();
      if (res.status === "success") {
        setRoles(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch staff roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditRole(role);
      setFormData({
        name: role.name,
        defaultRate: role.defaultRate !== undefined && role.defaultRate !== null ? role.defaultRate : ""
      });
    } else {
      setEditRole(null);
      setFormData({ name: "", defaultRate: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error("Name is required");
    }

    try {
      if (editRole) {
        await staffRoleApi.update(editRole.id, {
          name: formData.name,
          defaultRate: Number(formData.defaultRate || 0)
        });
        toast.success("Staff role updated successfully");
      } else {
        await staffRoleApi.create({
          name: formData.name,
          defaultRate: Number(formData.defaultRate || 0)
        });
        toast.success("Staff role created successfully");
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save role");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff role?")) {
      try {
        await staffRoleApi.delete(id);
        toast.success("Role deleted successfully");
        fetchRoles();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete role");
      }
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Staff Roles</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage staff roles and their default daily rates</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={16} />
          <span>Add Role</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading staff roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <p>No staff roles found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Default Rate (Per Day)</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-[13px] font-semibold text-slate-700">{role.name}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[13px] font-medium text-slate-600">{CURRENCY}{Number(role.defaultRate).toLocaleString("en-IN")}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(role)}
                          className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[1.25rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="px-8 pt-8 pb-4 bg-white">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {editRole ? "Edit Staff Role" : "Add New Role"}
              </h2>
              <p className="text-[15px] text-slate-500 mt-1.5 font-medium">
                {editRole ? "Update the details for this staff role." : "Register a new staff role to your network."}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-2">Role Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Waiter, Security"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 rounded-lg border border-slate-200 px-3.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white placeholder:text-slate-400 transition-shadow"
                  />
                </div>
                
                <div>
                  <label className="text-[13px] font-bold text-slate-700 block mb-2">Default Rate (Per Day)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{CURRENCY}</span>
                    <input 
                      type="number" min="0" required
                      placeholder="0.00"
                      value={formData.defaultRate}
                      onChange={(e) => setFormData({...formData, defaultRate: e.target.value})}
                      className="w-full h-11 rounded-lg border border-slate-200 pl-9 pr-3.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white placeholder:text-slate-400 transition-shadow"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-[13px] font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                >
                  {editRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRoles;
