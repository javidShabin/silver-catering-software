import React from "react";
import { motion } from "framer-motion";
import { X, Search, Package, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../../../api/inventoryApi";
import { eventApi } from "../../../api/eventApi";
import { CURRENCY } from "../../../config/currency";

const InventoryAssignmentModal = ({
  isInventoryModalOpen,
  setIsInventoryModalOpen,
  event,
  setEvent,
  eventId,
  setToast
}) => {
  const [inventoryModalTab, setInventoryModalTab] = React.useState("add"); // "add" | "selected"
  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => inventoryApi.getLookup(),
    enabled: isInventoryModalOpen
  });

  const allInventory = inventoryData?.data || [];

  const [selectedInventory, setSelectedInventory] = React.useState([]);
  const [inventorySearchQuery, setInventorySearchQuery] = React.useState("");
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = React.useState("All");
  const [isSavingInventory, setIsSavingInventory] = React.useState(false);
  const [inventoryQuantities, setInventoryQuantities] = React.useState({});
  const [inventoryUnits, setInventoryUnits] = React.useState({});
  const [itemToRemove, setItemToRemove] = React.useState(null);

  // Initialize and load inventory on modal open
  React.useEffect(() => {
    if (!isInventoryModalOpen) return;

    setSelectedInventory(event?.inventoryItems || []);
    
    const initialQuantities = {};
    const initialUnits = {};
    if (event?.inventoryAllocations && Array.isArray(event.inventoryAllocations)) {
      event.inventoryAllocations.forEach(alloc => {
        initialQuantities[alloc.inventoryId] = alloc.quantity || "";
        initialUnits[alloc.inventoryId] = alloc.unit || "unit";
      });
    }
    setInventoryQuantities(initialQuantities);
    setInventoryUnits(initialUnits);
  }, [isInventoryModalOpen, event?.inventoryItems, event?.inventoryAllocations]);

  const handleToggleInventory = React.useCallback((item) => {
    setSelectedInventory((prev) => {
      const exists = prev.some((i) => (i.id) === (item.id));
      if (exists) {
        return prev.filter((i) => (i.id) !== (item.id));
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const handleRemoveInventoryAndSave = React.useCallback(async (itemToRemove) => {
    if (!event) return;
    try {
      setIsSavingInventory(true);
      
      const newSelected = selectedInventory.filter(i => (i.id) !== (itemToRemove.id));
      setSelectedInventory(newSelected);
      
      const inventoryIds = newSelected.map((i) => i.id);
      
      const inventoryAllocations = newSelected.map((i) => {
        const id = i.id;
        const previousAlloc = (event?.inventoryAllocations || []).find(a => a.inventoryId === id);
        return {
          inventoryId: id,
          name: i.name,
          quantity: inventoryQuantities[id] || "",
          unit: inventoryUnits[id] || i.unit || "kg",
          isDeducted: previousAlloc ? previousAlloc.isDeducted : false
        };
      });
      
      await eventApi.update(event.id, { 
        inventoryItems: inventoryIds,
        inventoryAllocations 
      });
      
      const updatedEventRes = await eventApi.getById(eventId);
      setEvent(updatedEventRes.data);

      setToast({ message: "Item removed and saved successfully!", type: "success" });
    } catch (err) {
      console.error("Failed to remove item:", err);
      setToast({ message: err.response?.data?.message || "Failed to remove item.", type: "error" });
    } finally {
      setIsSavingInventory(false);
    }
  }, [event, selectedInventory, inventoryQuantities, inventoryUnits, eventId, setEvent, setToast]);

  const handleSaveInventoryAssignments = React.useCallback(async () => {
    if (!event) return;
    try {
      setIsSavingInventory(true);
      const inventoryIds = selectedInventory.map((i) => i.id);
      
      const inventoryAllocations = selectedInventory.map((i) => {
        const id = i.id;
        const previousAlloc = (event?.inventoryAllocations || []).find(a => a.inventoryId === id);
        return {
          inventoryId: id,
          name: i.name,
          quantity: inventoryQuantities[id] || "",
          unit: inventoryUnits[id] || i.unit || "kg",
          isDeducted: previousAlloc ? previousAlloc.isDeducted : false
        };
      });
      
      await eventApi.update(event.id, { 
        inventoryItems: inventoryIds,
        inventoryAllocations 
      });
      
      const updatedEventRes = await eventApi.getById(eventId);
      setEvent(updatedEventRes.data);

      setToast({ message: "Inventory assignments updated successfully!", type: "success" });
      setIsInventoryModalOpen(false);
    } catch (err) {
      console.error("Failed to update inventory assignments:", err);
      setToast({ message: err.response?.data?.message || "Failed to assign inventory items.", type: "error" });
    } finally {
      setIsSavingInventory(false);
    }
  }, [event, selectedInventory, inventoryQuantities, inventoryUnits, eventId, setEvent, setToast, setIsInventoryModalOpen]);

  const filteredInventory = React.useMemo(() => {
    return allInventory.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(inventorySearchQuery.toLowerCase());
      const matchesCategory = inventoryCategoryFilter === "All" || item.category === inventoryCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allInventory, inventorySearchQuery, inventoryCategoryFilter]);

  const onToggleClick = (item, isAssigned) => {
    if (isAssigned) {
      setItemToRemove(item);
    } else {
      handleToggleInventory(item);
    }
  };

  if (!isInventoryModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsInventoryModalOpen(false)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-[28px] border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in"
      >
        <div className="px-4 py-2.5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Assign Inventory Items</h3>
            <p className="text-[11px] text-slate-400 font-medium">Select materials and equipment needed for this event.</p>
          </div>
          <button
            onClick={() => setIsInventoryModalOpen(false)}
            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
            <div className="flex items-center gap-2 p-1 bg-slate-100/70 rounded-lg w-full sm:w-auto flex-nowrap overflow-x-auto scrollbar-none">
              <button 
                onClick={() => setInventoryModalTab("add")}
                className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${inventoryModalTab === 'add' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Add Item
              </button>
              <button 
                onClick={() => setInventoryModalTab("selected")}
                className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${inventoryModalTab === 'selected' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Selected Items
                <span className="bg-slate-200 text-slate-600 px-1.5 rounded-sm">{selectedInventory.length}</span>
              </button>
            </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all"
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
              />
            </div>
            <select
              className="w-32 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all text-slate-600 font-medium"
              value={inventoryCategoryFilter}
              onChange={(e) => setInventoryCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Beverages">Beverages</option>
              <option value="Spices">Spices</option>
              <option value="Dairy">Dairy</option>
              <option value="Grains">Grains</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="border border-slate-100 rounded-2xl bg-slate-50/20 max-h-[190px] overflow-y-auto p-1.5 space-y-1.5">
            {(() => {
              const listToRender = inventoryModalTab === "add" ? filteredInventory : selectedInventory.filter((item) => {
                const matchesSearch = item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
                                      item.category.toLowerCase().includes(inventorySearchQuery.toLowerCase());
                const matchesCategory = inventoryCategoryFilter === "All" || item.category === inventoryCategoryFilter;
                return matchesSearch && matchesCategory;
              });

              return listToRender.length > 0 ? (
                listToRender.map((item) => {
                const isAssigned = selectedInventory.some((s) => (s.id) === (item.id));
                
                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleClick(item, isAssigned)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isAssigned
                        ? "bg-white border-primary-500 shadow-sm"
                        : "bg-white/40 border-slate-150 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shrink-0">
                        <Package size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase border bg-slate-100 text-slate-600 border-slate-200">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Current Stock: {item.quantity} {item.unit} • Rent/Day: {CURRENCY}{item.rentPerDay || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      {inventoryModalTab === 'selected' && (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            placeholder="Qty"
                            min="0"
                            step="any"
                            value={inventoryQuantities[item.id] || ""}
                            onChange={(e) => setInventoryQuantities({...inventoryQuantities, [item.id]: e.target.value})}
                            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-primary-500 text-center"
                          />
                          <span className="text-[10px] text-slate-500 font-bold">{item.unit}</span>
                        </div>
                      )}
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isAssigned 
                          ? "bg-primary-500 border-primary-500 text-white" 
                          : "border-slate-200"
                      }`}>
                        {isAssigned && <Check size={10} strokeWidth={4} />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <Package size={18} className="mx-auto text-slate-300" />
                <p>No inventory items matched your search query.</p>
              </div>
            );
            })()}
          </div>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={() => setIsInventoryModalOpen(false)}
            className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveInventoryAssignments}
            disabled={isSavingInventory}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            {isSavingInventory ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Inventory Items"
            )}
          </button>
        </div>

        <div className="absolute -top-20 -right-20 w-44 h-44 bg-primary-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
      </motion.div>

      {itemToRemove && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setItemToRemove(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
          >
            <h4 className="text-sm font-bold text-slate-900">Remove Item?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <strong>{itemToRemove.name}</strong> from this event?
              <br/><br/>
              When you save, its allocated quantity will be restored back to the main inventory.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveInventoryAndSave(itemToRemove);
                  setItemToRemove(null);
                }}
                disabled={isSavingInventory}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center min-w-[100px]"
              >
                {isSavingInventory ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Yes, Remove"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InventoryAssignmentModal);
