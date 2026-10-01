import { CURRENCY } from "../../../config/currency";
import React from "react";
import { motion } from "framer-motion";
import { X, Search, Info, Plus, Check, ChevronDown, Trash2 } from "lucide-react";

const MenuChoicesModal = ({
  isMenuModalOpen,
  setIsMenuModalOpen,
  menuModalTab,
  setMenuModalTab,
  selectedMenus,
  searchQuery,
  setSearchQuery,
  filteredMenus,
  packages,
  handleToggleMenu,
  handleApplyPackage,
  customName,
  setCustomName,
  customPrice,
  setCustomPrice,
  customCategory,
  setCustomCategory,
  customDescription,
  setCustomDescription,
  handleAddCustomDish,
  handleSaveMenuChoices,
  isSaving,
  customSelections,
  setCustomSelections
}) => {
  const [configuringItem, setConfiguringItem] = React.useState(null);
  const [tempConfig, setTempConfig] = React.useState({
    type: "PER_UNIT",
    price: "",
    quantity: 1,
    unit: "plate"
  });

  const openConfigPopup = (item) => {
    const existing = customSelections[item.id] || {
      type: "PER_UNIT",
      price: item.minPrice !== undefined && item.minPrice !== null ? item.minPrice : 0,
      quantity: 1,
      unit: "plate"
    };
    setTempConfig({
      type: existing.type || "PER_UNIT",
      price: (existing.price !== undefined && existing.price !== null) ? existing.price : (item.minPrice || 0),
      quantity: existing.quantity !== undefined ? existing.quantity : 1,
      unit: existing.unit || "plate"
    });
    setConfiguringItem(item);
  };

  const handleConfirmConfig = () => {
    const isSelected = selectedMenus.some((m) => m.id === configuringItem.id);
    if (!isSelected) {
      handleToggleMenu(configuringItem);
    }
    setCustomSelections(curr => ({
      ...curr,
      [configuringItem.id]: {
        type: tempConfig.type,
        price: tempConfig.price,
        quantity: tempConfig.type === "PER_UNIT" ? tempConfig.quantity : 1,
        unit: tempConfig.unit
      }
    }));
    setConfiguringItem(null);
  };

  const handleRemoveFromPopup = () => {
    const isSelected = selectedMenus.some((m) => m.id === configuringItem.id);
    if (isSelected) {
      handleToggleMenu(configuringItem);
    }
    setConfiguringItem(null);
  };

  if (!isMenuModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsMenuModalOpen(false)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-5xl bg-white rounded-[28px] border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in"
      >
        <div className="px-5 py-3.5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="space-y-0.5">
            <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">Configure Catering Menu</h3>
            <p className="text-[12px] text-slate-400 font-medium">Link catalog dishes or create specialty custom options instantly.</p>
          </div>
          <button
            onClick={() => setIsMenuModalOpen(false)}
            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Section: Menu Selection Bank */}
          <div className="space-y-5 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl w-full sm:w-auto flex-nowrap overflow-x-auto scrollbar-none border border-slate-100">
                <button 
                  onClick={() => setMenuModalTab("add")}
                  className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap shrink-0 ${menuModalTab === 'add' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Add Menu
                </button>
                <button 
                  onClick={() => setMenuModalTab("selected")}
                  className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${menuModalTab === 'selected' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Selected Menu
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px]">{selectedMenus.length}</span>
                </button>
                <button 
                  onClick={() => setMenuModalTab("custom")}
                  className={`md:hidden flex-1 text-center px-4 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap shrink-0 ${menuModalTab === 'custom' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Custom Dish
                </button>
              </div>
            </div>

            {menuModalTab === "custom" ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 pb-1">
                  <Plus size={16} className="text-[#ff6b00]" />
                  ADD CUSTOM DISH
                </h4>

                <form onSubmit={handleAddCustomDish} className="space-y-3 p-3.5 bg-slate-50/50 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Dish Name</label>
                    <input
                      type="text"
                      placeholder="E.g., Special Malabari Biriyani"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 placeholder:text-slate-400"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Category</label>
                      <div className="relative">
                        <select
                          className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 appearance-none cursor-pointer"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                        >
                          <option value="Starters">Starter</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Desserts">Dessert</option>
                          <option value="Beverages">Beverage</option>
                          <option value="Snacks">Snacks</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Price / Head</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">{CURRENCY}</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0.00"
                          className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 placeholder:text-slate-400"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="Specify key ingredients..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 placeholder:text-slate-400"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Plus size={15} /> Add Custom Dish
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search available dishes by name or category..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-100 rounded-xl text-[13px] focus:outline-none focus:border-slate-300 focus:bg-white transition-all text-slate-700"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {packages && packages.length > 0 && (
                    <select 
                      className="flex-1 max-w-[140px] py-1.5 rounded-lg border border-primary-200 bg-primary-50/50 px-2.5 text-xs outline-none focus:border-primary-500 font-semibold text-primary-700 cursor-pointer"
                      onChange={(e) => { 
                        if (e.target.value) handleApplyPackage(e.target.value); 
                        e.target.value = ""; 
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Apply Package...</option>
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.menuItems?.length || 0} items)</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {(() => {
                    const listToRender = menuModalTab === "add" ? filteredMenus : selectedMenus.filter((item) =>
                      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.category.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    return listToRender.length > 0 ? (
                      listToRender.map((item) => {
                        const isSelected = selectedMenus.some((m) => (m.id) === (item.id));
                      
                      const categoryColors = {
                        "Starters": "bg-emerald-50 text-emerald-700",
                        "Main Course": "bg-primary-50 text-primary-700",
                        "Desserts": "bg-rose-50 text-rose-700",
                        "Beverages": "bg-sky-50 text-sky-700",
                        "Snacks": "bg-amber-50 text-amber-700"
                      };
                      const catColor = categoryColors[item.category] || "bg-slate-50 text-slate-700";

                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col p-3.5 rounded-xl border transition-all ${
                            isSelected
                              ? "bg-white border-[#ff6b00] shadow-sm"
                              : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                          }`}
                        >
                          <div 
                            className="flex items-start justify-between cursor-pointer w-full"
                            onClick={() => openConfigPopup(item)}
                          >
                            <div className="space-y-1 pr-2 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-[14px] font-bold text-slate-800 leading-tight">{item.name}</p>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${catColor}`}>
                                  {item.category}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-[12px] text-slate-400 line-clamp-1">{item.description}</p>
                              )}
                              {isSelected && customSelections[item.id] && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold">
                                    {customSelections[item.id].type === "PER_HEAD" ? "Per Head" : "Custom Qty"}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-orange-50 text-[#ff6b00] text-[9px] font-extrabold border border-orange-100">
                                    {CURRENCY}{Number(customSelections[item.id].price || item.minPrice).toFixed(2)}
                                  </span>
                                  {customSelections[item.id].type === "PER_UNIT" && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 text-[9px] font-extrabold border border-slate-200">
                                      {customSelections[item.id].quantity} {customSelections[item.id].unit || "plate"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                              {isSelected && (
                                <span className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer" onClick={(e) => { e.stopPropagation(); openConfigPopup(item); }}>
                                  Edit Details
                                </span>
                              )}
                              {isSelected ? (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleMenu(item);
                                  }}
                                  className="w-5 h-5 rounded-full bg-[#ff6b00] flex items-center justify-center shadow-sm cursor-pointer hover:bg-rose-600 transition-colors"
                                  title="Remove selection"
                                >
                                  <Check size={12} strokeWidth={3} className="text-white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-10 text-center space-y-2">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Info size={20} className="text-slate-400" />
                      </div>
                      <p className="text-[13px] font-bold text-slate-600">No dishes found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
                    </div>
                  );
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Right Section: Add Custom Dish */}
          <div className="hidden md:block space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 pb-1">
              <Plus size={16} className="text-[#ff6b00]" />
              ADD CUSTOM DISH
            </h4>

            <form onSubmit={handleAddCustomDish} className="space-y-3 p-3.5 bg-slate-50/50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Dish Name</label>
                <input
                  type="text"
                  placeholder="E.g., Special Malabari Biriyani"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 placeholder:text-slate-400"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Category</label>
                  <div className="relative">
                    <select
                      className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 appearance-none cursor-pointer"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    >
                      <option value="Starters">Starter</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Desserts">Dessert</option>
                      <option value="Beverages">Beverage</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Price / Head</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">{CURRENCY}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 placeholder:text-slate-400"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Specify key ingredients..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] focus:outline-none focus:border-slate-500 transition-all text-slate-800 placeholder:text-slate-400"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 mt-1"
              >
                <Plus size={15} /> Add Custom Dish
              </button>
            </form>
          </div>

        </div>

        <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-3 sticky bottom-0 z-10">
          <button
            onClick={() => setIsMenuModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMenuChoices}
            disabled={isSaving}
            className="w-full sm:w-auto px-7 py-2 bg-[#0f172a] hover:bg-slate-800 text-white text-[13px] font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Menu Choices"
            )}
          </button>
        </div>

      </motion.div>

      {/* Configuration Popup Overlay */}
      {configuringItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setConfiguringItem(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-6 w-full max-w-sm space-y-4 z-10"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-slate-800 tracking-tight">{configuringItem.name}</h4>
                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{configuringItem.category}</p>
              </div>
              <button 
                onClick={() => setConfiguringItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Billing Type Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Type</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTempConfig(prev => ({ ...prev, type: "PER_HEAD" }))}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${tempConfig.type === 'PER_HEAD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Per Head
                </button>
                <button
                  type="button"
                  onClick={() => setTempConfig(prev => ({ ...prev, type: "PER_UNIT" }))}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${tempConfig.type === 'PER_UNIT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Custom Qty
                </button>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {tempConfig.type === "PER_UNIT" ? "Total Price" : "Price per Head"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{CURRENCY}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={tempConfig.price}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Qty & Unit Input (for Custom Qty) */}
            {tempConfig.type === "PER_UNIT" && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={tempConfig.quantity !== undefined && tempConfig.quantity !== null ? tempConfig.quantity : ""}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unit</label>
                  <select
                    value={tempConfig.unit}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value="plate">plate</option>
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="unit">unit</option>
                    <option value="unlimited">unlimited</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {selectedMenus.some((m) => m.id === configuringItem.id) && (
                <button
                  type="button"
                  onClick={handleRemoveFromPopup}
                  className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                  title="Remove from selection"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfiguringItem(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConfig}
                className="flex-1 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-md shadow-primary-500/25 transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default React.memo(MenuChoicesModal);
