import { CURRENCY } from "../../../config/currency";
import React, { useState, useEffect } from "react";
import { Utensils, IndianRupee, Tag, Info, Check, Plus, AlertCircle, Trash2, Box, ChevronDown, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../../../api/inventoryApi";
import { menuCategoryApi } from "../../../api/menuCategoryApi";
import toast from "react-hot-toast";
const CreateMenuForm = ({ onSubmit, onCancel, isLoading, initialData, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    minPrice: initialData?.minPrice ? Number(initialData.minPrice) : 0,
    maxPrice: initialData?.maxPrice ? Number(initialData.maxPrice) : 0,
    isAvailable: initialData?.isAvailable !== undefined ? initialData.isAvailable : true,
    dietaryTags: initialData?.dietaryTags || ["None"],
    recipeIngredients: initialData?.recipeIngredients || []
  });

  const [activeField, setActiveField] = useState(null);
  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => inventoryApi.getLookup()
  });
  
  const inventoryItems = inventoryData?.data || [];

  const queryClient = useQueryClient();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const createCategoryMutation = useMutation({
    mutationFn: menuCategoryApi.create,
    onSuccess: (res) => {
      const newCategory = res.data.name;
      queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      setFormData(prev => ({ ...prev, category: newCategory }));
      setIsAddingCategory(false);
      setNewCategoryName("");
      toast.success("Category created successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create category")
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({ name: newCategoryName.trim(), description: "" });
    }
  };
  useEffect(() => {
    if (!initialData?.category && categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, initialData, formData.category]);

  const addIngredient = () => {
    setFormData({
      ...formData,
      recipeIngredients: [
        ...formData.recipeIngredients,
        { inventoryId: "", quantityPerPortion: 0.1, unit: "kg" }
      ]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = [...formData.recipeIngredients];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, recipeIngredients: newIngredients });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = formData.recipeIngredients.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, [field]: value };
      }
      return ingredient;
    });
    setFormData({ ...formData, recipeIngredients: newIngredients });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleTag = (tag) => {
    let newTags = [...formData.dietaryTags];
    if (tag === "None") {
      newTags = ["None"];
    } else {
      newTags = newTags.filter(t => t !== "None");
      if (newTags.includes(tag)) {
        newTags = newTags.filter(t => t !== tag);
        if (newTags.length === 0) newTags = ["None"];
      } else {
        newTags.push(tag);
      }
    }
    setFormData({ ...formData, dietaryTags: newTags });
  };

  const inputClasses = (fieldName) => `
    w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 transition-all duration-300 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400
    ${activeField === fieldName 
      ? 'border-primary-500 focus:outline-none' 
      : 'hover:border-slate-400'
    }
  `;

  const dietaryOptions = ["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Dairy-Free", "Nut-Free", "None"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* General Info */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1">
              Dish Name
            </label>
            <div className="relative">
              <Utensils size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'name' ? 'text-primary-500' : 'text-slate-400'}`} />
              <input
                autoFocus
                type="text"
                placeholder="e.g. Grilled Salmon with Asparagus"
                className={inputClasses('name')}
                onFocus={() => setActiveField('name')}
                onBlur={() => setActiveField(null)}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1">
                  Category
                </label>
                {!isAddingCategory && (
                  <button type="button" onClick={() => setIsAddingCategory(true)} className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-0.5 transition-colors">
                    <Plus size={12} /> New Category
                  </button>
                )}
              </div>
              
              {isAddingCategory ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-primary-300 hover:border-primary-400 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-primary-500 transition-all shadow-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                    className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {createCategoryMutation.isPending ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingCategory(false); setNewCategoryName(""); }}
                    className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select 
                    className="w-full px-3 pr-8 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer shadow-sm"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>


          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1">
                Description
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Optional</span>
            </div>
            <div className="relative">
              <Info size={14} className={`absolute left-3 top-2.5 transition-colors ${activeField === 'desc' ? 'text-primary-500' : 'text-slate-400'}`} />
              <textarea
                rows="3"
                placeholder="Describe the dish ingredients (Optional)..."
                className={`${inputClasses('desc')} pl-9 pt-2 pb-2`}
                onFocus={() => setActiveField('desc')}
                onBlur={() => setActiveField(null)}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-lg border border-slate-200 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg shadow-sm ${formData.isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                <AlertCircle size={16} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-700">Currently Available</p>
                <p className="text-[11px] text-slate-400">Toggle visibility in the menu</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-sm ${formData.isAvailable ? 'bg-primary-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>



      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 text-[13px] font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {initialData ? <Check size={16} /> : <Plus size={16} />}
              <span>{initialData ? "Save Changes" : "Add to Menu"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateMenuForm;
