import React from "react";
import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import { ChevronRight, Calendar, Users as UsersIcon } from "lucide-react";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/table/Table";
import { useTranslation } from "react-i18next";

const RecentEvents = ({ events = [], isLoading = false }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="card-premium flex flex-col h-full overflow-hidden !p-0">
      <div className="px-5 py-3 border-b border-slate-100/60 flex justify-between items-center bg-white/40">
        <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">
          {t("dashboard.recent_events", "Upcoming Events")}
        </h3>
        <Link 
          to="/events" 
          className="text-[11px] font-medium text-primary-600 hover:text-primary-500 transition-colors flex items-center uppercase tracking-wider"
        >
          {t("common.view_all", "View all")} <ChevronRight size={12} className="ml-0.5" />
        </Link>
      </div>
      
      <div className="flex-1 max-md:hidden overflow-y-auto">
        <TableContainer className="border-0 shadow-none bg-transparent rounded-none">
          <Table>
            <TableHeader className="bg-transparent border-slate-100/60">
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("common.event", "Event")}</TableHead>
                <TableHead>{t("common.date", "Date")}</TableHead>
                <TableHead>{t("common.guests", "Guests")}</TableHead>
                <TableHead>{t("common.status", "Status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-slate-100 rounded-lg animate-pulse w-3/4"></div></TableCell>
                    <TableCell><div className="h-4 bg-slate-100 rounded-lg animate-pulse w-1/2"></div></TableCell>
                    <TableCell><div className="h-4 bg-slate-100 rounded-lg animate-pulse w-1/2"></div></TableCell>
                    <TableCell><div className="h-4 bg-slate-100 rounded-lg animate-pulse w-3/4"></div></TableCell>
                  </TableRow>
                ))
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-[12px] text-slate-500">
                    No upcoming events
                  </TableCell>
                </TableRow>
              ) : (
                events.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="text-[12px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        {row.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] text-slate-500">{formatDate(row.date)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] text-slate-500">{row.guestCount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
                  <UsersIcon size={12} className="text-primary-500" />
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
