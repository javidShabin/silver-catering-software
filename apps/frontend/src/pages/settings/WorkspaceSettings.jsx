import { useState, useEffect, useRef } from "react";
import SettingsModule from "../../components/ui/SettingsModule";
import Input from "../../components/ui/Input";
import FloatingSaveBar from "../../components/ui/FloatingSaveBar";
import { Globe, Users, Building, MapPin, Mail, Phone, Image as ImageIcon, Loader2, Upload, Trash2, Edit2, CheckCircle2, FileText } from "lucide-react";
import { useTenantStore } from "../../store/useTenantStore";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import SubscriptionPackageCard from "../../components/super-admin/SubscriptionPackageCard";
import SecuritySettings from "./SecuritySettings";

const WorkspaceSettings = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { tenant, fetchSettings, updateSettings, uploadLogo, isLoading: isFetching } = useTenantStore(
    useShallow((state) => ({
      tenant: state.tenant,
      fetchSettings: state.fetchSettings,
      updateSettings: state.updateSettings,
      uploadLogo: state.uploadLogo,
      isLoading: state.isLoading,
    }))
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    website: "",
    logoUrl: "",
    pdfFromAddress: "",
    pdfSettings: {
      showCustomerContact: true,
      showCustomerAddress: true,
      showEventDetails: true,
      showTax: true,
      showDiscount: true,
      showItemQuantity: true,
      showItemUnitPrice: true,
      showItemTotalPrice: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name || "",
        contactEmail: tenant.contactEmail || "",
        contactPhone: tenant.contactPhone || "",
        address: tenant.address || "",
        website: tenant.website || "",
        logoUrl: tenant.logoUrl || "",
        pdfFromAddress: tenant.pdfFromAddress || "",
        pdfSettings: tenant.pdfSettings || {
          showCustomerContact: true,
          showCustomerAddress: true,
          showEventDetails: true,
          showTax: true,
          showDiscount: true,
          showItemQuantity: true,
          showItemUnitPrice: true,
          showItemTotalPrice: true
        }
      });
      setIsDirty(false);
      if (tenant.name) setIsEditing(false);
      else setIsEditing(true);
    }
  }, [tenant]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSettings(form);
    setIsSaving(false);

    if (result.success) {
      toast.success("Workspace settings updated!");
      setIsDirty(false);
      setIsEditing(false);
      checkAuth(); // Update sidebar immediately with new logo/name
    } else {
      toast.error(result.message);
    }
  };

  const handleReset = () => {
    if (tenant) {
      setForm({
        name: tenant.name || "",
        contactEmail: tenant.contactEmail || "",
        contactPhone: tenant.contactPhone || "",
        address: tenant.address || "",
        website: tenant.website || "",
        logoUrl: tenant.logoUrl || "",
        pdfFromAddress: tenant.pdfFromAddress || "",
        pdfSettings: tenant.pdfSettings || {
          showCustomerContact: true,
          showCustomerAddress: true,
          showEventDetails: true,
          showTax: true,
          showDiscount: true,
          showItemQuantity: true,
          showItemUnitPrice: true,
          showItemTotalPrice: true
        }
      });
      setIsDirty(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsDirty(true);
  };

  const handleToggle = (key) => {
    setForm(prev => ({
      ...prev,
      pdfSettings: {
        ...prev.pdfSettings,
        [key]: !prev.pdfSettings[key]
      }
    }));
    setIsDirty(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadLogo(formData);

      if (result.success) {
        setForm(prev => ({ ...prev, logoUrl: result.logoUrl }));
        setIsDirty(true);
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(result.message || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setForm(prev => ({ ...prev, logoUrl: "" }));
    setIsDirty(true);
  };

  if (isFetching && !tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

        {/* Workspace Identity */}
        <SettingsModule
          span="md:col-span-4"
          title="Workspace Identity"
          description="General settings for your catering business."
          icon={Building}
          action={
            !isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <Edit2 size={12} /> Edit Details
              </button>
            ) : (
              <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                <CheckCircle2 size={12} /> Editing Mode
              </div>
            )
          }
        >
          <div className="space-y-3 mt-1">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace Name</label>
              <Input
                name="name"
                leftIcon={Building}
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. DoCaterPro Events"
                inputClassName="!py-2 !h-9 !text-xs font-semibold"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                <Input
                  name="contactEmail"
                  leftIcon={Mail}
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="billing@example.com"
                  inputClassName="!py-2 !h-9 !text-xs"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <Input
                  name="contactPhone"
                  leftIcon={Phone}
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  inputClassName="!py-2 !h-9 !text-xs"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                <Input
                  name="website"
                  leftIcon={Globe}
                  value={form.website}
                  onChange={handleChange}
                  placeholder="www.yourdomain.com"
                  inputClassName="!py-2 !h-9 !text-xs"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Billing Address</label>
                <Input
                  name="address"
                  leftIcon={MapPin}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Street Name, City"
                  inputClassName="!py-2 !h-9 !text-xs"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Catering Company Address (From Address)</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  name="pdfFromAddress"
                  value={form.pdfFromAddress}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={`Company Name\n123 Street, City\nPhone: +1 234 567 8900`}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs min-h-[60px] h-[60px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50 transition-all resize-y"
                />
              </div>
              <p className="text-[10px] text-slate-400 ml-1">This address will be printed on all generated Invoices, Quotations, and Ingredients lists exactly as formatted here.</p>
            </div>

            <div className="pt-2 mt-0 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Workspace Logo</label>
                <div className="flex items-center gap-3 mt-0.5">
                  <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {form.logoUrl ? (
                      <img src={form.logoUrl.startsWith('http') ? form.logoUrl : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${form.logoUrl}`} alt="Workspace Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building size={20} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !isEditing}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        {isUploading ? "Uploading..." : "Upload New"}
                      </button>
                      {form.logoUrl && isEditing && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-rose-200 rounded-md text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400">Recommended: 512x512px (JPG, PNG).</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingsModule>

        {/* Workspace Stats & Subscription & Security */}
        <div className="md:col-span-2 space-y-4">
          <SecuritySettings />
          
          {/* Invoice PDF Settings */}
          <SettingsModule
            title="Invoice PDF Settings"
            description="Select which details should be visible on your generated invoice PDFs."
            icon={FileText}
          >
            <div className="space-y-3 mt-1">
              <div className="grid grid-cols-1 gap-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { key: 'showCustomerContact', label: 'Customer Phone & Email' },
                  { key: 'showCustomerAddress', label: 'Customer Address' },
                  { key: 'showEventDetails', label: 'Event Details' },
                  { key: 'showTax', label: 'Tax Breakdown' },
                  { key: 'showDiscount', label: 'Discount Amount' },
                  { key: 'showItemQuantity', label: 'Item Quantity (Qty)' },
                  { key: 'showItemUnitPrice', label: 'Item Unit Price' },
                  { key: 'showItemTotalPrice', label: 'Item Total Price' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${form.pdfSettings?.[item.key] ? 'bg-primary-500' : 'bg-slate-200'}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.pdfSettings?.[item.key] ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 ml-1">
                Note: Unchecking these options will hide the respective sections from your printed bills.
              </p>
            </div>
          </SettingsModule>

          {tenant?.plan && (
            <SubscriptionPackageCard tenant={tenant} />
          )}
        </div>

      </div>

      <FloatingSaveBar
        show={isDirty}
        onSave={handleSave}
        onReset={handleReset}
        isLoading={isSaving}
      />
    </div>
  );
};

export default WorkspaceSettings;
