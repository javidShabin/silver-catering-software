import { useState, useEffect, useRef } from "react";
import SettingsModule from "../../components/ui/SettingsModule";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { Cloud, HardDrive, RefreshCcw, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { useTenantStore } from "../../store/useTenantStore";
import { useShallow } from "zustand/react/shallow";

const BackupSettings = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const backupConnectedParam = searchParams.get("backup_connected");
  const errorParam = searchParams.get("error");
  const [backupStatus, setBackupStatus] = useState({ isConnected: false, email: null });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isTaxDirty, setIsTaxDirty] = useState(false);
  const [isTaxSaving, setIsTaxSaving] = useState(false);

  const { tenant, fetchSettings, updateSettings } = useTenantStore(
    useShallow((state) => ({
      tenant: state.tenant,
      fetchSettings: state.fetchSettings,
      updateSettings: state.updateSettings,
    }))
  );

  const [taxForm, setTaxForm] = useState({
    taxNumber: "",
    taxPercentage: "",
    taxDetails: ""
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (tenant) {
      setTaxForm({
        taxNumber: tenant.taxNumber || "",
        taxPercentage: tenant.taxPercentage || "",
        taxDetails: tenant.taxDetails || ""
      });
    }
  }, [tenant]);

  const handleTaxChange = (e) => {
    setTaxForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsTaxDirty(true);
  };

  const handleTaxSave = async () => {
    setIsTaxSaving(true);
    const result = await updateSettings({
      name: tenant?.name, // name is required by the backend
      taxNumber: taxForm.taxNumber,
      taxPercentage: taxForm.taxPercentage,
      taxDetails: taxForm.taxDetails
    });
    setIsTaxSaving(false);
    if (result.success) {
      toast.success("Tax settings updated!");
      setIsTaxDirty(false);
    } else {
      toast.error(result.message);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/backup/status');
        if (res.data.status === 'success') {
          setBackupStatus(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch backup status", err);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (backupConnectedParam === "true") {
      toast.success("Google Drive connected successfully!");
      searchParams.delete("backup_connected");
      searchParams.delete("error");
      setSearchParams(searchParams);
      // Re-fetch status
      api.get('/backup/status').then(res => setBackupStatus(res.data.data));
    } else if (backupConnectedParam === "false") {
      toast.error(`Failed to connect Google Drive: ${errorParam || "Unknown error"}`);
      searchParams.delete("backup_connected");
      searchParams.delete("error");
      setSearchParams(searchParams);
    }
  }, [backupConnectedParam, errorParam, searchParams, setSearchParams]);

  const handleConnectGoogleDrive = async () => {
    try {
      const response = await api.get('/backup/google/auth');
      
      if (response.data.status === 'success') {
        window.location.href = response.data.url; 
      }
    } catch (error) {
      console.error("Error connecting to Google Drive:", error);
      toast.error("Failed to connect to Google Drive.");
    }
  };



  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.enc')) {
      toast.error("Invalid file format. Please upload a .json.enc backup file.");
      return;
    }

    setPendingFile(file);
    setShowConfirmModal(true);
  };

  const handleConfirmRestore = async () => {
    if (!pendingFile) return;
    
    setIsRestoring(true);
    const formData = new FormData();
    formData.append("backupFile", pendingFile);

    try {
      const response = await api.post('/backup/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        toast.success("Backup restored successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error(error.response?.data?.message || "Failed to restore backup.");
      setIsRestoring(false);
      setShowConfirmModal(false);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
    <SettingsModule 
      title="Data Backup" 
      description="Configure Google Drive backup for your workspace data."
      icon={HardDrive}
      className="w-full md:w-1/2"
      action={
        !isLoadingStatus && (
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${backupStatus.isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {backupStatus.isConnected ? "Connected" : "Disconnected"}
          </div>
        )
      }
    >
      <div className="space-y-3 mt-2">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[12px] font-bold text-slate-800 truncate">Google Drive Integration</h4>
              {isLoadingStatus ? (
                <p className="text-[10px] text-slate-400 font-medium">Checking status...</p>
              ) : backupStatus.isConnected ? (
                <p className="text-[10px] text-emerald-600 font-bold truncate">Connected: <span className="text-slate-700 font-medium">{backupStatus.email || "Google Drive"}</span></p>
              ) : (
                <p className="text-[10px] text-slate-500 font-medium truncate">Connect Drive for backups.</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleConnectGoogleDrive}
              disabled={isLoadingStatus}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              {backupStatus.isConnected ? "Sync Now" : "Sync Now"}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".enc" 
              className="hidden" 
            />
            <button
              onClick={handleRestoreClick}
              disabled={isRestoring}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isRestoring ? (
                <><RefreshCcw size={12} className="animate-spin" /> ...</>
              ) : (
                <><HardDrive size={12} /> Restore</>
              )}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium px-1">
          Note: Automated backups run every night. Restore via .enc file.
        </p>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        onConfirm={handleConfirmRestore}
        title="Restore Data Backup"
        message={
          <span>
            <b>WARNING:</b> Restoring will <b>PERMANENTLY REPLACE</b> all current customers, events, and invoices in this workspace with the data from this backup file.
            <br/><br/>
            This action cannot be undone. Are you absolutely sure you want to proceed?
          </span>
        }
        confirmText="Yes, Restore Data"
        cancelText="Cancel"
        type="danger"
        isLoading={isRestoring}
      />
    </SettingsModule>
    <SettingsModule 
      title="Tax Settings" 
      description="Manage workspace tax details."
      className="w-full md:w-1/2"
      action={
        isTaxDirty && (
          <button 
            onClick={handleTaxSave}
            disabled={isTaxSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50"
          >
            {isTaxSaving ? (
              <><Loader2 size={12} className="animate-spin" /> Saving...</>
            ) : (
              <><CheckCircle2 size={12} /> Save</>
            )}
          </button>
        )
      }
    >
      <div className="mt-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Tax Number</label>
            <input name="taxNumber" value={taxForm.taxNumber} onChange={handleTaxChange} type="text" className="w-full px-3 py-1.5 text-[12px] text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all shadow-sm" placeholder="e.g. GSTIN" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Tax (%)</label>
            <input name="taxPercentage" value={taxForm.taxPercentage} onChange={handleTaxChange} type="number" className="w-full px-3 py-1.5 text-[12px] text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all shadow-sm" placeholder="18" />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Additional Details</label>
            <input name="taxDetails" value={taxForm.taxDetails} onChange={handleTaxChange} type="text" className="w-full px-3 py-1.5 text-[12px] text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-all shadow-sm" placeholder="Other tax info" />
          </div>
        </div>
      </div>
    </SettingsModule>
    </div>
  );
};

export default BackupSettings;
