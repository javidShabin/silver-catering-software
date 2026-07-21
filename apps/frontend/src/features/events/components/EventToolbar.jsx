import React from "react";
import { Plus, LayoutGrid, List, RotateCcw } from "lucide-react";
import DebouncedSearchInput from "../../../components/ui/DebouncedSearchInput";
import CustomDatePicker from "../../../components/ui/CustomDatePicker";
import { useTranslation } from "react-i18next";

const EventToolbar = ({
  params,
  viewMode,
  setViewMode,
  setFilter,
  handleSearch,
  openModal,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Premium Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{t("events.events_management", "Events Management")}</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-md mx-auto lg:mx-0">{t("events.events_subtitle", "Plan, track, and manage your catering operations.")}</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          {/* View Toggler */}
          <div className="flex bg-slate-100/80 backdrop-blur p-0.5 rounded-lg border border-slate-200/50 shadow-sm">
            <button 
              onClick={() => setViewMode('events', 'grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={12} /> Grid
            </button>
            <button 
              onClick={() => setViewMode('events', 'table')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all ${viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={12} /> Table
            </button>
          </div>

          <div className="w-full flex justify-center sm:w-auto">
            <button 
              onClick={() => openModal('events', false, null)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50"
            >
              <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("events.create_event", "Create Event")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Toolbar */}
      <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/50 dark:bg-white/[0.02] p-2.5 rounded-2xl border border-slate-100 dark:border-white/5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 w-full">
          <div className="relative w-full sm:max-w-xs group">
            <DebouncedSearchInput 
              placeholder={t("events.search_events", "Search events...")}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto -mx-1 px-1 sm:mx-0 sm:px-0">
            {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter('events', { status, page: 1 })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border shrink-0 ${
                  params.status === status 
                  ? 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm' 
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t(`events.status_${status}`, status)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <CustomDatePicker 
            label={t("events.from_date", "From")}
            value={params.startDate}
            onChange={(dateStr) => setFilter('events', { startDate: dateStr, page: 1 })}
          />
          <CustomDatePicker 
            label={t("events.to_date", "To")}
            value={params.endDate}
            onChange={(dateStr) => setFilter('events', { endDate: dateStr, page: 1 })}
          />
          <button 
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all shadow-sm w-full sm:w-auto justify-center cursor-pointer active:scale-98"
            onClick={() => setFilter('events', { startDate: "", endDate: "", page: 1 })}
          >
            <RotateCcw size={14} className="shrink-0" />
            {t("events.reset_dates", "Reset Dates")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventToolbar;
