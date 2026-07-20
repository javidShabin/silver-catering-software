import Skeleton from "./Skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`metric-${i}`} className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg mb-2" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-5 w-32 rounded-md mb-2" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
          <Skeleton className="flex-1 w-full rounded-2xl" />
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-[400px] flex flex-col">
          <div className="mb-8">
            <Skeleton className="h-5 w-32 rounded-md mb-2" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
          <div className="flex-1 flex items-center justify-center relative">
             <Skeleton className="h-48 w-48 rounded-full" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-white h-24 w-24 rounded-full" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
