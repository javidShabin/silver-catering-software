import React from "react";
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import TableActions from "../../../components/ui/table/TableActions";
import EventManagementCard from "./EventManagementCard";
import EventGridSkeleton from "./EventGridSkeleton";
import EmptyState from "../../../components/ui/EmptyState";
import { TableSkeleton } from "../../../components/ui/Skeleton";

const EventList = ({
  events,
  isLoading,
  viewMode,
  hasNextPage,
  hasPreviousPage,
  handleNextPage,
  handlePreviousPage,
  clearFilters,
  handleViewEvent,
  handleEditEvent,
  handleDeleteEvent,
  handleStatusUpdateEvent
}) => {
  return (
    <>
      <div className="min-h-[400px]">
        {isLoading ? (
          viewMode === 'grid' ? <EventGridSkeleton /> : <TableSkeleton rows={8} />
        ) : events.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title="No events found" 
            description="We couldn't find any events matching your current filters. Try adjusting your search."
            actionLabel="Clear all filters"
            onAction={clearFilters}
          />
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventManagementCard 
                  key={event.id} 
                  event={event} 
                  onEdit={handleEditEvent} 
                  onDelete={handleDeleteEvent} 
                  onView={handleViewEvent} 
                  onStatusUpdate={handleStatusUpdateEvent}
                />
              ))}
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 overflow-x-auto shadow-sm max-md:hidden">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Detail</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{event.title}</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin size={10} /> {event.location}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {event.customer?.name || "No Customer"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={event.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <TableActions 
                            onView={() => handleViewEvent(event)} 
                            onEdit={() => handleEditEvent(event)} 
                            onDelete={() => handleDeleteEvent(event)} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="hidden max-md:grid grid-cols-1 gap-6">
                {events.map((event) => (
                  <EventManagementCard 
                    key={event.id} 
                    event={event} 
                    onEdit={handleEditEvent} 
                    onDelete={handleDeleteEvent} 
                    onView={handleViewEvent} 
                    onStatusUpdate={handleStatusUpdateEvent}
                  />
                ))}
              </div>
            </>
          )
        )}
      </div>

      {/* Cursor Pagination */}
      {(hasNextPage || hasPreviousPage) && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 dark:text-white">{events.length}</span> events
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={!hasPreviousPage}
              onClick={handlePreviousPage}
              className="px-4 py-2 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200/60 transition-all font-semibold text-xs"
            >
              Previous
            </button>
            <button 
              disabled={!hasNextPage}
              onClick={handleNextPage}
              className="px-4 py-2 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200/60 transition-all font-semibold text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EventList;
