import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { packagesApi } from "../../../api/packagesApi";
import { toast } from "react-hot-toast";

const PackageFormModal = ({ isOpen, onClose, onSuccess, initialData, menuItems }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHead: 0,
    minGuests: 50,
    isActive: true,
    menuItemIds: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        pricePerHead: Number(initialData.pricePerHead) || 0,
        minGuests: Number(initialData.minGuests) || 50,
        isActive: initialData.isActive !== false,
        menuItemIds: initialData.menuItems?.map(item => item.id) || []
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const toggleMenuItem = (id) => {
    setFormData(prev => {
      const isSelected = prev.menuItemIds.includes(id);
      return {
        ...prev,
        menuItemIds: isSelected
          ? prev.menuItemIds.filter(itemId => itemId !== id)
          : [...prev.menuItemIds, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error("Package name is required");
    }

    try {
      setIsSubmitting(true);
      if (initialData) {
        await packagesApi.update(initialData.id, formData);
        toast.success("Package updated successfully");
      } else {
        await packagesApi.create(formData);
        toast.success("Package created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? "Edit Package" : "Create New Package"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="package-form" onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Package Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-primary-500 transition-colors text-sm"
                  placeholder="e.g. Premium Wedding Package"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-1">
                <label className="text-xs font-semibold text-slate-700">Price Per Pax (₹) *</label>
                <input
                  type="number"
                  name="pricePerHead"
                  value={formData.pricePerHead}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-primary-500 transition-colors text-sm"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-1">
                <label className="text-xs font-semibold text-slate-700">Minimum Pax *</label>
                <input
                  type="number"
                  name="minGuests"
                  value={formData.minGuests}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-primary-500 transition-colors text-sm"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-primary-500 transition-colors text-sm"
                  placeholder="Briefly describe what this package includes..."
                />
              </div>

              <div className="md:col-span-1 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500" />
                  <span className="text-xs font-semibold text-slate-700">Active Package</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Select Menu Items</h3>
                <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                  {formData.menuItemIds.length} Selected
                </span>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-primary-500 transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 max-h-[175px] overflow-y-auto custom-scrollbar scroll-smooth p-1">
                {filteredMenu.map(item => {
                  const isSelected = formData.menuItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleMenuItem(item.id)}
                      className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="mt-0.5 w-3.5 h-3.5 text-primary-600 rounded border-slate-300 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{item.name}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.category}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded border border-transparent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="package-form"
            disabled={isSubmitting}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Package"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageFormModal;
