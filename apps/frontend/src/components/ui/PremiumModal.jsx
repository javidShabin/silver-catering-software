import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PremiumModal = ({ isOpen, onClose, children, title, description, maxWidth = "max-w-md", compactHeader = false }) => {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-white rounded-2xl border border-slate-200/60 shadow-2xl shadow-slate-900/5 overflow-hidden max-h-[90vh] max-md:max-h-[85vh] flex flex-col`}
          >
            {/* Header */}
            <div className={`px-6 ${compactHeader ? 'pt-4 pb-1' : 'pt-6 pb-2'} flex justify-between items-start shrink-0`}>
              <div className={compactHeader ? "space-y-0.5" : "space-y-1"}>
                <h3 className={`${compactHeader ? 'text-base' : 'text-xl'} font-bold text-slate-900 tracking-tight`}>
                  {title}
                </h3>
                {description && (
                  <p className={`${compactHeader ? 'text-[11px]' : 'text-sm'} text-slate-500`}>
                    {description}
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className={`${compactHeader ? 'p-1.5' : 'p-2'} rounded-full bg-slate-100/50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300`}
              >
                <X size={compactHeader ? 16 : 20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 overflow-y-auto custom-scrollbar relative z-10">
              {children}
            </div>

            {/* Decorative Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModal;
