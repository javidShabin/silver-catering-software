import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Drawer = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = "max-w-md", // Tailwind max-w class
  className = "",
  showCloseButton = true
}) => {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 280,
              mass: 0.8
            }}
            className={`relative w-full ${width} max-md:max-w-full h-full bg-white shadow-[-8px_0_30px_rgb(0,0,0,0.04)] border-l border-slate-200/80 flex flex-col ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || description || showCloseButton) && (
              <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
                <div>
                  {title && <h2 className="text-[16px] font-semibold text-slate-900 tracking-tight">{title}</h2>}
                  {description && <p className="mt-1 text-[13px] text-slate-500">{description}</p>}
                </div>
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0 ml-4"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
