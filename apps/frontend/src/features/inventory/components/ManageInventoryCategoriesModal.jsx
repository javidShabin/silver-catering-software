import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Loader2, Save } from "lucide-react";
import { categoryApi } from "../../../api/inventoryCategoryApi";

const ManageInventoryCategoriesModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getAll();
      setCategories(res.data.data);
    } catch (err) {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setIsAdding(true);
      await categoryApi.create({ name: newCategoryName, description: newCategoryDesc });
      setNewCategoryName("");
      setNewCategoryDesc("");
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add category");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryApi.delete(id);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || "");
  };

  const handleSaveEdit = async () => {
    try {
      await categoryApi.update(editingId, { name: editName, description: editDesc });
      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-[0_10px_40px_-10px_rgba(249,115,22,0.15)] border border-orange-100/50 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-orange-50 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Manage Categories</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar bg-white">
          {error && (
            <div className="p-3 mb-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[13px] font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              {error}
            </div>
          )}

          {/* Add New Category Form */}
          <div className="bg-white p-4 rounded-xl mb-6 border border-orange-100 shadow-sm shadow-orange-50/50">
            <h3 className="text-[12px] font-bold text-orange-600 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Plus size={14} className="stroke-[2.5]" /> Create Category
            </h3>
            <div className="flex flex-col gap-2.5">
              <input 
                type="text" 
                placeholder="Category Name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
              />
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input 
                  type="text" 
                  placeholder="Short Description (Optional)" 
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
                />
                <button 
                  onClick={handleAddCategory}
                  disabled={isAdding || !newCategoryName.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center min-w-[90px] active:scale-95"
                >
                  {isAdding ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                </button>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Active Categories
            </h3>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-orange-500 gap-2">
                <Loader2 className="animate-spin" size={24} />
                <p className="text-[11px] font-semibold text-orange-600/70">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[13px] font-semibold text-slate-500">No categories found.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/10 transition-all group bg-white">
                    {editingId === cat.id ? (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-sm border border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 rounded-lg bg-white font-medium text-slate-800 outline-none transition-all"
                        />
                        <div className="flex gap-1.5">
                          <button onClick={handleSaveEdit} className="p-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-all active:scale-95">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all active:scale-95">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <p className="font-semibold text-slate-800 text-[14px]">{cat.name}</p>
                          {cat.description && <p className="text-[11px] font-medium text-slate-500 mt-0.5">{cat.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditing(cat)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-all active:scale-95">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-95">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageInventoryCategoriesModal;

