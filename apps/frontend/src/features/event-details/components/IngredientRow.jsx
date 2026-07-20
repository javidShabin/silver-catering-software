import React, { useState } from "react";
import { Check, X, Trash2, Edit2, Loader2 } from "lucide-react";
import { eventApi } from "../../../api/eventApi";
import { toast } from "react-hot-toast";

const IngredientRow = ({ eventId, ingredient, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    price: ingredient.price || "",
    isPurchased: ingredient.isPurchased
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated = await eventApi.updateIngredient(eventId, ingredient.id, {
        quantity: Number(editData.quantity),
        unit: editData.unit,
        price: editData.price ? Number(editData.price) : null,
        isPurchased: editData.isPurchased
      });
      onUpdate(updated.data);
      setIsEditing(false);
      toast.success("Ingredient updated");
    } catch (error) {
      toast.error("Failed to update ingredient");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePurchased = async () => {
    try {
      setIsSaving(true);
      const updated = await eventApi.updateIngredient(eventId, ingredient.id, {
        isPurchased: !ingredient.isPurchased
      });
      onUpdate(updated.data);
      setEditData({ ...editData, isPurchased: updated.data.isPurchased });
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to remove this ingredient?")) return;
    try {
      setIsSaving(true);
      await eventApi.deleteIngredient(eventId, ingredient.id);
      onDelete(ingredient.id);
      toast.success("Ingredient removed");
    } catch (error) {
      toast.error("Failed to remove ingredient");
      console.error(error);
      setIsSaving(false);
    }
  };

  const name = ingredient.menu ? ingredient.menu.name : (ingredient.inventory ? ingredient.inventory.name : ingredient.customName);
  const category = ingredient.category || "Other";

  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-xs text-slate-800 truncate">{name}</span>
          {!ingredient.inventory && (
            <span className="text-[8px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded-sm font-bold uppercase tracking-wide">Custom</span>
          )}
        </div>
        <span className="text-[10px] text-slate-500">{category}</span>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5 flex-1">
          <input 
            type="number"
            value={editData.quantity}
            onChange={(e) => setEditData({...editData, quantity: e.target.value})}
            className="w-14 px-1.5 py-0.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-primary-500"
          />
          <input 
            type="text"
            value={editData.unit}
            onChange={(e) => setEditData({...editData, unit: e.target.value})}
            className="w-12 px-1.5 py-0.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-primary-500"
          />
          <input 
            type="number"
            step="any"
            placeholder="₹"
            value={editData.price}
            onChange={(e) => setEditData({...editData, price: e.target.value})}
            className="w-16 px-1.5 py-0.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-primary-500 text-right"
          />
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button 
            onClick={() => setIsEditing(false)} 
            disabled={isSaving}
            className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3 flex-1">
          <div className="text-xs font-semibold text-slate-700 w-20 text-right">
            {ingredient.quantity} <span className="text-slate-500 text-[10px] font-normal">{ingredient.unit}</span>
          </div>
          
          <div className="text-xs font-bold text-slate-800 w-16 text-right">
            {ingredient.price ? `₹${ingredient.price}` : <span className="text-slate-300 font-normal">-</span>}
          </div>
          
          <button
            onClick={handleTogglePurchased}
            disabled={isSaving}
            className={`px-2 py-0.5 text-[9px] font-bold rounded-full transition-all flex items-center gap-1 min-w-[70px] justify-center ${
              ingredient.isPurchased 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
            }`}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : (ingredient.isPurchased ? <><Check size={10}/> Purchased</> : "Pending")}
          </button>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
              title="Edit"
            >
              <Edit2 size={12} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Remove"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(IngredientRow);
