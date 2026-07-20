import Skeleton from "./Skeleton";

const TableSkeleton = ({ rows = 5, columns = 5, className = "" }) => {
  return (
    <div className={`w-full bg-white rounded-3xl border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden ${className}`}>
      {/* Action Bar Skeleton */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl hidden sm:block" />
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden sm:flex px-6 py-3 border-b border-slate-100 bg-slate-50/50 items-center gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`th-${i}`} className="flex-1">
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100/80">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`tr-${rowIndex}`} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
            {Array.from({ length: columns }).map((_, colIndex) => {
              // Vary the widths to make it look organic
              const widthClasses = ["w-3/4", "w-1/2", "w-full", "w-2/3", "w-1/3"];
              const randomWidth = widthClasses[(rowIndex + colIndex) % widthClasses.length];
              
              return (
                <div key={`td-${rowIndex}-${colIndex}`} className={`flex-1 ${colIndex !== 0 && colIndex !== columns - 1 ? "hidden sm:block" : ""}`}>
                  {colIndex === columns - 1 ? (
                    // Last column usually actions, small circular skeletons
                    <div className="flex sm:justify-end gap-2 mt-3 sm:mt-0">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  ) : colIndex === 1 ? (
                    // Badges might be narrower
                    <Skeleton className={`h-6 ${randomWidth} max-w-[100px] rounded-full`} />
                  ) : (
                    // Standard text
                    <div className="space-y-2">
                      <Skeleton className={`h-4 ${randomWidth} rounded-md`} />
                      {rowIndex % 3 === 0 && colIndex === 0 && (
                        <Skeleton className="h-3 w-1/3 rounded-md" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Pagination Skeleton */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
        <Skeleton className="h-4 w-32 rounded-md hidden sm:block" />
        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
