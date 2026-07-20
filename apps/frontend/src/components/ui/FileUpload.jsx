import { forwardRef, useState } from "react";
import { UploadCloud, File, X, AlertCircle } from "lucide-react";

const FileUpload = forwardRef(({
  label,
  id,
  error,
  className = "",
  accept,
  onFileChange,
  ...props
}, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (newFile) => {
    setFile(newFile);
    if (onFileChange) onFileChange(newFile);
  };

  const removeFile = (e) => {
    e.preventDefault();
    setFile(null);
    if (onFileChange) onFileChange(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[13px] font-semibold text-slate-700 mb-2 pl-1">
          {label}
        </label>
      )}
      
      {!file ? (
        <div
          className={`
            relative flex flex-col items-center justify-center w-full py-8 px-4 
            border-2 border-dashed rounded-2xl transition-all duration-200 ease-out cursor-pointer
            ${dragActive 
              ? "border-primary-400 bg-primary-50/50" 
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-slate-50/30"
            }
            ${error ? "border-red-300 bg-red-50/30 hover:border-red-400" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={ref}
            id={id}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...props}
          />
          <div className={`p-3 rounded-full mb-3 transition-colors ${dragActive ? 'bg-primary-100 text-primary-600' : 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-100 text-slate-400 group-hover:text-slate-500'}`}>
            <UploadCloud size={24} strokeWidth={2} />
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">
            <span className="text-primary-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-[12px] text-slate-500">
            SVG, PNG, JPG or PDF (max. 10MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.01)] transition-all duration-200 hover:border-slate-300">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl shrink-0">
              <File size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-slate-900 truncate">
                {file.name}
              </p>
              <p className="text-[12px] text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
            title="Remove file"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-1.5 mt-2 ml-1 text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={14} strokeWidth={2.5} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = "FileUpload";
export default FileUpload;
