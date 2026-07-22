import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { ChefHat, ArrowLeft } from "lucide-react";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify and Reset

  const { forgotPassword, resetPassword, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    clearError();
    const result = await forgotPassword(email);
    if (result.success) {
      toast.success("Password reset OTP sent to your email!");
      setStep(2);
    } else {
      toast.error(result.message || "Failed to request OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be exactly 6 digits.");
      return;
    }

    clearError();
    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2050);
    } else {
      toast.error(result.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-5 sm:px-6 sm:py-5 space-y-2 animate-in fade-in duration-300">
        
        {/* Back button */}
        <div>
          <Link 
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} /> {t("auth.back_to_login", "Back to Login")}
          </Link>
        </div>

        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <img src="/software_logo.PNG" alt="Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col text-left leading-none">
              <span className="font-black text-base tracking-tight text-slate-900">SILVER</span>
              <span className="font-bold text-[8px] tracking-[0.2em] text-slate-500 uppercase">Catering</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {step === 1 ? t("auth.forgot_password_title", "Forgot Password") : t("auth.reset_password", "Reset Password")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {step === 1 
              ? t("auth.enter_email_for_otp", "Enter your email address to receive a 6-digit verification code.") 
              : `${t("auth.we_sent_otp", "We sent a verification code to")} ${email}`}
          </p>
        </div>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
              {error}
            </div>
          )}

          {step === 1 ? (
            /* Step 1: Request OTP Form */
            <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
              <div>
                <Input
                  id="email"
                  type="email"
                  label={t("auth.email", "Email Address")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@elitecatering.com"
                  className="rounded-xl" inputClassName="!py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="relative flex justify-center w-full px-4 py-2 text-sm font-semibold text-white transition-all bg-primary-600 rounded-xl hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? t("auth.sending_otp", "Sending OTP...") : t("auth.send_otp", "Send Verification OTP")}
              </button>
            </form>
          ) : (
            <form className="mt-4 space-y-2" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <Input
                  id="otp"
                  type="text"
                  label={t("auth.otp_code", "6-Digit OTP Code")}
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="rounded-xl tracking-widest text-center font-bold"
                />
                
                <Input
                  id="newPassword"
                  type="password"
                  label={t("auth.new_password", "New Password")}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl" inputClassName="!py-2 text-sm"
                />

                <Input
                  id="confirmPassword"
                  type="password"
                  label={t("auth.confirm_new_password", "Confirm New Password")}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl" inputClassName="!py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">{t("auth.did_not_receive_code", "Didn't receive the code?")}</span>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="text-primary-600 hover:text-primary-800 transition-colors cursor-pointer"
                >
                  {t("auth.resend_otp", "Resend OTP")}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !otp || !newPassword || !confirmPassword}
                className="relative flex justify-center w-full px-4 py-2 text-sm font-semibold text-white transition-all bg-primary-600 rounded-xl hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? t("auth.resetting_password", "Resetting Password...") : t("auth.reset_password", "Reset Password")}
              </button>
            </form>
          )}
      </div>
    </div>
  );
};

export default ForgotPassword;
