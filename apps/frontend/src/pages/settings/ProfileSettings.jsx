import { useState, useRef } from "react";
import SettingsModule, { ModuleRow } from "../../components/ui/SettingsModule";
import Input from "../../components/ui/Input";
import FileUpload from "../../components/ui/FileUpload";
import FloatingSaveBar from "../../components/ui/FloatingSaveBar";
import { useAuthStore } from "../../store/authStore";
import { motion } from "framer-motion";
import { User, Mail, ShieldCheck, Calendar, Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ProfileSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const user = useAuthStore(state => state.user);
  const uploadProfilePic = useAuthStore(state => state.uploadProfilePic);
  const updateProfile = useAuthStore(state => state.updateProfile);
  
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });
  
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfilePicUpload = async (e) => {
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
      
      const result = await uploadProfilePic(formData);
      
      if (result.success) {
        toast.success("Profile picture updated");
      } else {
        toast.error(result.message || "Failed to update profile picture");
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    const result = await updateProfile({ name: form.name, phone: form.phone });
    setIsLoading(false);
    if (result.success) {
      toast.success("Profile updated");
      setIsDirty(false);
    } else {
      toast.error(result.message || "Failed to update profile");
    }
  };

  const handleReset = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    });
    setIsDirty(false);
  };
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-full">
        {/* Profile Hero - Large Bento Module */}
        <SettingsModule 
          span="md:col-span-6" 
          title="Profile Identity" 
          description="Manage your personal brand and public profile."
          icon={User}
          className="h-full"
        >
          <div className="flex flex-col sm:flex-row gap-5 items-center pt-1">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 1.5 }}
              className="shrink-0 relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-[84px] h-[84px] rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex flex-col items-center justify-center text-white text-3xl font-bold shadow-md shadow-orange-500/20 relative overflow-hidden">
                {user?.profilePic ? (
                  <img 
                    src={user.profilePic.startsWith('http') ? user.profilePic : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${user.profilePic}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="uppercase">{user?.name?.charAt(0) || 'U'}</span>
                )}
                <div className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30 z-10">
                  <Camera size={12} className="text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-widest z-20">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : "Update"}
              </div>
            </motion.div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleProfilePicUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Full Name</label>
                  <input 
                    name="name"
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Email Address (Read-only)</label>
                  <input 
                    name="email"
                    value={form.email} 
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-500 focus:outline-none transition-all opacity-70" 
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Phone Number</label>
                  <input 
                    name="phone"
                    value={form.phone} 
                    onChange={handleChange} 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>
        </SettingsModule>

      </div>

      <FloatingSaveBar 
        show={isDirty} 
        onSave={handleSave} 
        onReset={handleReset}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProfileSettings;
