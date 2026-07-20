import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuCategoryApi } from "../../../api/menuCategoryApi";
import { Trash2, Edit, Plus, Loader2, Tag, FileText } from "lucide-react";
import toast from "react-hot-toast";

const ManageCategoriesModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ['menuCategories'],
    queryFn: menuCategoryApi.getAll
  });

  const categories = data?.data || [];

  const createMutation = useMutation({
    mutationFn: menuCategoryApi.create,
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      setFormData({ name: "", description: "" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create category")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuCategoryApi.update(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] }); // Also invalidate menu items since their category might have changed
      setEditingId(null);
      setFormData({ name: "", description: "" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update category")
  });

  const deleteMutation = useMutation({
    mutationFn: menuCategoryApi.delete,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete category")
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Left Column: Form Section */}
      <div className="md:col-span-2 space-y-4">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm h-full">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-500 shadow-sm">
              {editingId ? <Edit size={16} /> : <Plus size={16} />}
            </div>
            {editingId ? "Edit Category" : "Add Category"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
                Category Name
              </label>
              <div className="relative">
                <Tag size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors focus-within:text-primary-500 text-slate-400`} />
                <input
                  type="text"
                  placeholder="e.g. Starters, Main Course"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Description
                </label>
                <span className="text-[9px] text-slate-400 font-medium">Optional</span>
              </div>
              <div className="relative">
                <FileText size={16} className={`absolute left-4 top-3 transition-colors focus-within:text-primary-500 text-slate-400`} />
                <textarea
                  rows="3"
                  placeholder="Short description for this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isPending || !formData.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md shadow-primary-500/25 active:scale-[0.98]"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
                {editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: List Section */}
      <div className="md:col-span-3 flex flex-col h-[400px]">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Existing Categories</h4>
        <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-2 shadow-sm overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
          ) : categories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Tag size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600 mb-1">No categories yet</p>
              <p className="text-xs text-slate-400">Create your first category to start organizing your menu.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 p-1">
              {categories.map((cat) => (
                <div key={cat.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${editingId === cat.id ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-500/20' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                  <div>
                    <p className={`text-sm font-bold ${editingId === cat.id ? 'text-primary-700' : 'text-slate-800'}`}>{cat.name}</p>
                    {cat.description && <p className="text-[10px] text-slate-500 mt-0.5">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm bg-white border border-slate-100"
                      title="Edit Category"
                    >
                      <Edit size={14} />
                    </button>
                    {cat.name !== "Uncategorized" && (
                      <button
                        onClick={() => {
                          if(window.confirm(`Are you sure you want to delete "${cat.name}"? Items in this category will be moved to "Uncategorized".`)) {
                            deleteMutation.mutate(cat.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white border border-slate-100"
                        disabled={deleteMutation.isPending}
                        title="Delete Category"
                      >
                        {deleteMutation.isPending && cat.id === editingId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
