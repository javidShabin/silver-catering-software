import React from "react";
import { BookOpen, Users, Package, ClipboardList, Truck } from "lucide-react";

const EventCulinarySetup = ({ event, openMenuModal, openStaffModal, openInventoryModal, openIngredientsModal, openLogisticsModal, hasLogisticsFeature }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">Culinary Setup</h3>
      <div className="space-y-3 max-h-[230px] overflow-y-auto custom-scrollbar pr-1.5 pb-1">
        {/* Menu Choices Section */}
        <div
          className="flex items-start gap-3 p-3.5 bg-slate-50/50 rounded-2xl text-xs text-slate-655 border border-slate-100/30 transition-all group/menu"
        >
          <BookOpen size={16} className="text-primary-500 shrink-0 mt-0.5 group-hover/menu:scale-105 transition-transform" />
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <p className="font-bold text-slate-800 group-hover/menu:text-primary-600 transition-colors">Menu Choices</p>
              <button
                onClick={(e) => { e.stopPropagation(); openMenuModal(); }}
                className="text-[9px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors"
              >
                Show
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {event.menuItems && event.menuItems.length > 0
                ? `${event.menuItems.length} items selected`
                : "No items selected"}
            </p>
          </div>
        </div>

        {/* Staff Assigned Section */}
        <div
          className="flex items-start gap-3 p-3.5 bg-slate-50/50 rounded-2xl text-xs text-slate-655 border border-slate-100/30 transition-all group/staff"
        >
          <Users size={16} className="text-primary-500 shrink-0 mt-0.5 group-hover/staff:scale-105 transition-transform" />
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <p className="font-bold text-slate-800 group-hover/staff:text-primary-600 transition-colors">Staff Roles</p>
              <button
                onClick={(e) => { e.stopPropagation(); openStaffModal(); }}
                className="text-[9px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors"
              >
                Manage
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {(() => {
                let parsed = [];
                if (event.staffAllocations) {
                  if (typeof event.staffAllocations === 'string') {
                    try {
                      parsed = JSON.parse(event.staffAllocations);
                    } catch (e) {
                      parsed = [];
                    }
                  } else {
                    parsed = event.staffAllocations;
                  }
                }
                return parsed && parsed.length > 0
                  ? `${parsed.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0)} staff across ${parsed.length} roles`
                  : "No staff roles allocated";
              })()}
            </p>
          </div>
        </div>

        {/* Inventory Assigned Section */}
        <div
          className="flex items-start gap-3 p-3.5 bg-slate-50/50 rounded-2xl text-xs text-slate-655 border border-slate-100/30 transition-all group/inventory"
        >
          <Package size={16} className="text-primary-500 shrink-0 mt-0.5 group-hover/inventory:scale-105 transition-transform" />
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <p className="font-bold text-slate-800 group-hover/inventory:text-primary-600 transition-colors">Inventory Items</p>
              <button
                onClick={(e) => { e.stopPropagation(); openInventoryModal(); }}
                className="text-[9px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors"
              >
                Show
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {event.inventoryItems && event.inventoryItems.length > 0
                ? `${event.inventoryItems.length} items assigned`
                : "No inventory items assigned"}
            </p>
          </div>
        </div>

        {/* Purchase List Section */}
        <div
          className="flex items-start gap-3 p-3.5 bg-slate-50/50 rounded-2xl text-xs text-slate-655 border border-slate-100/30 transition-all group/ingredients"
        >
          <ClipboardList size={16} className="text-primary-500 shrink-0 mt-0.5 group-hover/ingredients:scale-105 transition-transform" />
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <p className="font-bold text-slate-800 group-hover/ingredients:text-primary-600 transition-colors">Purchase List</p>
              <button
                onClick={(e) => { e.stopPropagation(); openIngredientsModal(); }}
                className="text-[9px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors"
              >
                View
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Manage items to purchase for {event?.guestCount || 0} guests
            </p>
          </div>
        </div>

        {/* Logistics & Returns Section */}
        {hasLogisticsFeature && (
          <div
            className="flex items-start gap-3 p-3.5 bg-slate-50/50 rounded-2xl text-xs text-slate-655 border border-slate-100/30 transition-all group/logistics"
          >
            <Truck size={16} className="text-primary-500 shrink-0 mt-0.5 group-hover/logistics:scale-105 transition-transform" />
            <div className="space-y-1.5 w-full">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800 group-hover/logistics:text-primary-600 transition-colors">Equipment Returns</p>
                <button
                  onClick={(e) => { e.stopPropagation(); openLogisticsModal(); }}
                  className="text-[9px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors"
                >
                  Track
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Track returned, damaged, and missing logistics
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EventCulinarySetup);
