import { useState } from "react";
import SettingsModule from "../../components/ui/SettingsModule";
import Input from "../../components/ui/Input";
import FloatingSaveBar from "../../components/ui/FloatingSaveBar";
import { Shield, Lock } from "lucide-react";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleSaveRequest = async () => {
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("New password and confirmation are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post("/auth/change-password/request", { currentPassword });
      if (response.data.success) {
        toast.success("Current password verified. OTP sent to your email.");
        setShowOtpModal(true);
      }
    } catch (error) {
      console.error("Password change request error:", error);
      toast.error(error.response?.data?.message || "Failed to verify current password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPasswordChange = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsConfirming(true);
    try {
      const response = await api.post("/auth/change-password/confirm", { otp, newPassword });
      if (response.data.success) {
        toast.success("Password updated successfully.");
        setShowOtpModal(false);
        // Clear all inputs
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setIsDirty(false);
      }
    } catch (error) {
      console.error("Password change confirm error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsDirty(false);
  };

  const handleChange = (key, value) => {
    if (key === "current") {
      setCurrentPassword(value);
      setIsDirty(!!value || !!newPassword || !!confirmPassword);
    } else if (key === "new") {
      setNewPassword(value);
      setIsDirty(!!currentPassword || !!value || !!confirmPassword);
    } else if (key === "confirm") {
      setConfirmPassword(value);
      setIsDirty(!!currentPassword || !!newPassword || !!value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        
        {/* Password Update Module */}
        <SettingsModule 
          span="col-span-1" 
          title="Password & Auth" 
          description="Manage your authentication credentials and security keys."
          icon={Lock}
        >
          <div className="flex flex-col gap-3 mt-2">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={currentPassword}
                onChange={(e) => handleChange("current", e.target.value)} 
                inputClassName="bg-slate-50 border-slate-200 focus:bg-white !px-3 !py-2 !text-[11px] !rounded-md" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <Input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => handleChange("new", e.target.value)} 
                inputClassName="bg-slate-50 border-slate-200 focus:bg-white !px-3 !py-2 !text-[11px] !rounded-md" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <Input 
                type="password" 
                placeholder="Repeat new password" 
                value={confirmPassword}
                onChange={(e) => handleChange("confirm", e.target.value)} 
                inputClassName="bg-slate-50 border-slate-200 focus:bg-white !px-3 !py-2 !text-[11px] !rounded-md" 
              />
            </div>
          </div>
        </SettingsModule>

      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <Shield size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Verify Email OTP</h3>
                <p className="text-xs text-slate-500">A 6-digit code was sent to your email</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              To complete the password change, please enter the One-Time Password (OTP) sent to your registered email address.
            </p>

            <div className="space-y-1.5 mb-6">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">One-Time Password (OTP)</label>
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputClassName="bg-slate-50 border-slate-200 focus:bg-white !px-3.5 !py-2.5 !text-sm !rounded-xl text-center font-bold tracking-[6px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowOtpModal(false); setOtp(""); }}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPasswordChange}
                disabled={otp.length !== 6 || isConfirming}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {isConfirming ? "Verifying..." : "Verify & Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingSaveBar 
        show={isDirty} 
        onSave={handleSaveRequest} 
        onReset={handleReset}
        isLoading={isSaving}
      />
    </div>
  );
};

export default SecuritySettings;
