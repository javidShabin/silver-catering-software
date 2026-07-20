import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // 'warning', 'danger', 'info', 'success'
  isLoading = false,
  extraOption = null // { label: "Log to expenses", checked: false, onChange: (val) => {} }
}) => {
  const iconMap = {
    warning: <AlertTriangle size={24} className="text-amber-500" strokeWidth={2} />,
    danger: <AlertTriangle size={24} className="text-red-500" strokeWidth={2} />,
    info: <Info size={24} className="text-primary-500" strokeWidth={2} />,
    success: <CheckCircle2 size={24} className="text-emerald-500" strokeWidth={2} />
  };

  const buttonVariantMap = {
    warning: "primary", // Or 'danger' depending on severity
    danger: "danger",
    info: "primary",
    success: "primary"
  };

  const bgMap = {
    warning: "bg-amber-50",
    danger: "bg-red-50",
    info: "bg-primary-50",
    success: "bg-emerald-50"
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[400px]"
      showCloseButton={false}
      className="text-center sm:text-left"
    >
      <div className="sm:flex sm:items-start gap-4 pt-2">
        <div className={`mx-auto sm:mx-0 flex items-center justify-center shrink-0 w-12 h-12 rounded-2xl ${bgMap[type]} mb-4 sm:mb-0`}>
          {iconMap[type]}
        </div>
        
        <div className="mt-1 sm:mt-0 text-center sm:text-left">
          <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">
            {title}
          </h3>
          <div className="mt-2 text-[14px] text-slate-500 leading-relaxed">
            {message}
          </div>
          {extraOption && (
            <div className="mt-4 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="extraOptionCheckbox"
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                checked={extraOption.checked}
                onChange={(e) => extraOption.onChange(e.target.checked)}
              />
              <label htmlFor="extraOptionCheckbox" className="text-sm text-slate-700 cursor-pointer select-none font-medium">
                {extraOption.label}
              </label>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {cancelText}
        </Button>
        <Button
          variant={buttonVariantMap[type]}
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
