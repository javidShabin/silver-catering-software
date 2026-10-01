import React, { useState, useEffect } from "react";
import { Package, Hash, Tag, Info, Check, Plus, ChevronDown, Settings, IndianRupee, Layers, Scale } from "lucide-react";
import { categoryApi } from "../../../api/inventoryCategoryApi";
import ManageInventoryCategoriesModal from "./ManageInventoryCategoriesModal";

const CreateInventoryForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    quantity: initialData?.quantity !== undefined && initialData?.quantity !== null ? initialData.quantity : "",
    unit: initialData?.unit || "piece",
    minStockLevel: initialData?.minStockLevel !== undefined && initialData?.minStockLevel !== null ? initialData.minStockLevel : 10,
    rentPerDay: initialData?.rentPerDay !== undefined && initialData?.rentPerDay !== null ? initialData.rentPerDay : "",
    notes: initialData?.notes || ""
  });

  const [activeField, setActiveField] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [isCategoryModalOpen]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data);
      if (res.data.data.length > 0 && !formData.category && !initialData) {
        setFormData(prev => ({ ...prev, category: res.data.data[0].name }));
      }
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity || 0),
      minStockLevel: Number(formData.minStockLevel || 0),
      rentPerDay: Number(formData.rentPerDay || 0)
    });
  };

  const inputClasses = (fieldName) => `
    w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 transition-all duration-200 rounded-lg text-[13px] font-medium text-slate-800 placeholder:text-slate-400 shadow-sm
    ${activeField === fieldName 
      ? 'border-primary-500 ring-2 ring-primary-500/10 outline-none' 
      : 'hover:border-slate-300 focus:outline-none'
    }
  `;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {/* Left Column: Basic Details */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 tracking-wide ml-0.5">
                Item Name
              </label>
              <div className="relative group">
                <Package size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${activeField === 'name' ? 'text-primary-600' : 'text-slate-400'}`} />
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Table, Chair, Tent"
                  className={inputClasses('name')}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField(null)}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-0.5">
                <label className="text-[11px] font-bold text-slate-600 tracking-wide">
                  Category
                </label>
                <button 
                  type="button" 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-[10px] font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-1.5 py-0.5 rounded transition-colors flex items-center gap-1"
                >
                  <Settings size={10} /> Manage
                </button>
              </div>
              <div className="relative group">
                <Layers size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${activeField === 'category' ? 'text-primary-600' : 'text-slate-400'}`} />
                <select 
                  className={inputClasses('category') + " appearance-none cursor-pointer"}
                  onFocus={() => setActiveField('category')}
                  onBlur={() => setActiveField(null)}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.length === 0 && <option value="" disabled>No categories available</option>}
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 tracking-wide ml-0.5">
                Unit of Measurement
              </label>
              <div className="relative group">
                <Scale size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${activeField === 'unit' ? 'text-primary-600' : 'text-slate-400'}`} />
                <select 
                  className={inputClasses('unit') + " appearance-none cursor-pointer"}
                  onFocus={() => setActiveField('unit')}
                  onBlur={() => setActiveField(null)}
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                >
                  {["piece", "kg", "g", "l", "ml", "packet", "box", "dozen", "set"].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Column: Stock & Financial */}
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 tracking-wide ml-0.5">
                    Quantity
                  </label>
                  <div className="relative group">
                    <Hash size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${activeField === 'qty' ? 'text-primary-600' : 'text-slate-400'}`} />
                    <input
                      type="number"
                      className={inputClasses('qty')}
                      onFocus={() => setActiveField('qty')}
                      onBlur={() => setActiveField(null)}
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 tracking-wide ml-0.5">
                    Min Alert
                  </label>
                  <div className="relative group">
                    <Tag size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${activeField === 'min' ? 'text-primary-600' : 'text-slate-400'}`} />
                    <input
                      type="number"
                      className={inputClasses('min')}
                      onFocus={() => setActiveField('min')}
                      onBlur={() => setActiveField(null)}
                      value={formData.minStockLevel}
                      onChange={e => setFormData({ ...formData, minStockLevel: e.target.value })}
                      required
                    />
                  </div>
                </div>
             </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 tracking-wide ml-0.5">
                Rent Per Day (₹)
              </label>
              <div className="relative group">
                <IndianRupee size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${activeField === 'rent' ? 'text-primary-600' : 'text-slate-400'}`} />
                <input
                  type="number"
                  className={inputClasses('rent')}
                  onFocus={() => setActiveField('rent')}
                  onBlur={() => setActiveField(null)}
                  value={formData.rentPerDay}
                  onChange={e => setFormData({ ...formData, rentPerDay: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 tracking-wide ml-0.5">
                Internal Notes
              </label>
              <div className="relative group">
                <Info size={14} className={`absolute left-3 top-2.5 transition-colors duration-200 ${activeField === 'notes' ? 'text-primary-600' : 'text-slate-400'}`} />
                <textarea
                  rows="2"
                  placeholder="Storage instructions..."
                  className={`${inputClasses('notes')} py-1.5 resize-none`}
                  onFocus={() => setActiveField('notes')}
                  onBlur={() => setActiveField(null)}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-2 pt-3 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 text-[13px] font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {initialData ? <Check size={14} /> : <Plus size={14} />}
                <span>{initialData ? "Update Item" : "Add Item"}</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      <ManageInventoryCategoriesModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />
    </>
  );
};

export default CreateInventoryForm;
