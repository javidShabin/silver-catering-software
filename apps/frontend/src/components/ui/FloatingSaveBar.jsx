import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw } from "lucide-react";
import Button from "./Button";

const FloatingSaveBar = ({ show, onSave, onReset, isLoading }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg px-4"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-full p-2.5 pl-6 border border-slate-700/50 shadow-2xl shadow-slate-900/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
              </span>
              <span className="text-[13px] font-medium text-slate-100">
                You have unsaved changes
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full px-4 h-9 font-medium"
              >
                <RotateCcw size={14} className="mr-2" />
                Reset
              </Button>
              
              <Button
                size="sm"
                onClick={onSave}
                isLoading={isLoading}
                className="bg-primary-500 hover:bg-primary-400 text-white border-0 rounded-full px-5 h-9 font-medium shadow-lg shadow-primary-500/20"
              >
                <Save size={14} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingSaveBar;
