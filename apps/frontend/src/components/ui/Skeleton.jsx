import { motion } from "framer-motion";

const Skeleton = ({ className = "", width, height, rounded = "rounded-xl", ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100/80 ${rounded} ${className}`}
      style={{ width, height }}
      {...props}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{
          translateX: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "easeInOut",
          duration: 1.5,
          repeatDelay: 0.2
        }}
      />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm w-full">
      <div className="w-full text-left">
        <div className="bg-slate-50/50 border-b border-slate-100 flex p-4 gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={`r-${r}`} className="flex p-4 gap-4 items-center">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton key={`c-${c}`} className={`h-8 ${c === 0 ? 'flex-[2]' : 'flex-1'}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GridSkeleton = ({ items = 8, itemHeight = "h-48" }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <div className={`${itemHeight} bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col p-4 gap-3`}>
            <div className="flex justify-between items-start">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-16 h-4 rounded-full" />
            </div>
            <div className="space-y-2 mt-2">
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-1/2 h-3" />
            </div>
            <div className="mt-auto space-y-2">
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-full h-3" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Skeleton;
