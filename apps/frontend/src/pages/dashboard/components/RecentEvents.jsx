import React from "react";
import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import { ChevronRight, Calendar, Users as UsersIcon } from "lucide-react";
import DataTable from "../../../components/ui/table/DataTable";
import { useTranslation } from "react-i18next";

const RecentEvents = ({ events = [], isLoading = false }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: t("common.event", "Event"),
      accessor: "title",
      cell: (row) => (
        <div className="text-[12px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
          {row.title}
        </div>
      ),
    },
    {
      header: t("common.date", "Date"),
      accessor: "date",
      cell: (row) => (
        <div className="text-[11px] text-slate-500">
          {new Date(row.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      header: t("common.guests", "Guests"),
      accessor: "guestCount",
      cell: (row) => (
        <div className="text-[11px] text-slate-500">{row.guestCount}</div>
      ),
    },
    {
      header: t("common.status", "Status"),
      accessor: "status",
      cell: (row) => <Badge status={row.status} />,
    },
  ];

  return (
    <div className="card-premium flex flex-col h-full overflow-hidden !p-0">
      <div className="px-5 py-3 border-b border-slate-100/60 flex justify-between items-center bg-white/40">
        <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">
          {t("dashboard.recent_events", "Upcoming Events")}
        </h3>
        <Link 
          to="/events" 
          className="text-[11px] font-medium text-cyan-600 hover:text-cyan-500 transition-colors flex items-center uppercase tracking-wider"
        >
          {t("common.view_all", "View all")} <ChevronRight size={12} className="ml-0.5" />
        </Link>
      </div>
      
      <div className="flex-1 max-md:hidden">
        <DataTable
          columns={columns}
          data={events}
          isLoading={isLoading}
          emptyMessage="No upcoming events"
        />
      </div>
      
      <div className="hidden max-md:flex flex-col gap-3 p-4 bg-slate-50/50 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-100"></div>)}
          </div>
        ) : events.length === 0 ? (
          <div className="p-4 text-center text-[12px] text-slate-500">No upcoming events</div>
        ) : (
          events.map((row, index) => (
            <div key={index} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2 relative transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start">
                <div className="font-medium text-slate-800 text-[13px] pr-20 leading-tight">
                  {row.title}
                </div>
                <div className="absolute right-3 top-3.5 scale-90 origin-top-right">
                   <Badge status={row.status} />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                  <Calendar size={12} className="text-primary-500" />
                  <span>{new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                  <UsersIcon size={12} className="text-indigo-500" />
                  <span>{row.guestCount} guests</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentEvents;
