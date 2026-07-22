import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChefHat, User, Mail, Lock, ArrowRight } from "lucide-react";
import Input from "../../components/ui/Input";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

const Signup = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const { register, requestSignupOtp, googleLogin, isLoading, error, clearError } = useAuthStore(
    useShallow((state) => ({
      register: state.register,
      requestSignupOtp: state.requestSignupOtp,
      googleLogin: state.googleLogin,
      isLoading: state.isLoading,
      error: state.error,
      clearError: state.clearError,
    }))
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (step === 1) {
      if (password !== confirmPassword) {
        return setValidationError("Passwords do not match");
      }
      const res = await requestSignupOtp(name, email, password);
      if (res.success) {
        setStep(2);
      }
    } else {
      if (otp.length !== 6) {
        return setValidationError("OTP must be 6 digits");
      }
      const success = await register(name, email, password, otp);
      if (success) {
        navigate(from, { replace: true });
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const success = await googleLogin(idToken);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Google signup failed", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-5 sm:px-6 sm:py-5 space-y-2">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <img src="/software_logo.PNG" alt="Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col text-left leading-none">
              <span className="font-black text-base tracking-tight text-slate-900">SILVER</span>
              <span className="font-bold text-[8px] tracking-[0.2em] text-slate-500 uppercase">Catering</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Create <span className="text-primary-600">Account</span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">Join Silver Catering today</p>
        </div>

          <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
                {validationError || error}
              </div>
            )}

            <div className="space-y-2">
              {step === 1 ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 ml-1">Full Name</label>
                    <Input
                      id="name"
                      type="text"
                      leftIcon={User}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="rounded-xl" inputClassName="!py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 ml-1">Email Address</label>
                    <Input
                      id="email"
                      type="email"
                      leftIcon={Mail}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="rounded-xl" inputClassName="!py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 ml-1">Password</label>
                    <Input
                      id="password"
                      type="password"
                      leftIcon={Lock}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="rounded-xl" inputClassName="!py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 ml-1">Confirm Password</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      leftIcon={Lock}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="rounded-xl" inputClassName="!py-2 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <p className="text-sm text-gray-600 text-center">
                    We've sent a 6-digit OTP to <strong className="text-gray-900">{email}</strong>. Please enter it below.
                  </p>
                  <Input
                    id="otp"
                    type="text"
                    label="Verification Code (OTP)"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="rounded-xl text-center tracking-[0.5em] text-base font-bold"
                    maxLength={6}
                  />
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline w-full text-center mt-2">
                    Back to edit details
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center items-center w-full px-4 py-2.5 text-sm font-semibold text-white transition-all bg-primary-600 rounded-xl hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (step === 1 ? "Sending OTP..." : "Verifying...") : (step === 1 ? "Sign Up" : "Verify & Create Account")}
              {step === 1 && !isLoading && <ArrowRight className="absolute right-4 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-500 bg-white">{t("auth.or_continue_with", "or continue with")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-gray-700 transition-all bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-70"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("auth.sign_up_google", "Sign up with Google")}
            </button>

            <div className="pt-4 text-sm text-center">
              <span className="text-gray-500">{t("auth.already_have_account", "Already have an account?")} </span>
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                {t("auth.sign_in_link", "Sign in")}
              </Link>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Signup;
