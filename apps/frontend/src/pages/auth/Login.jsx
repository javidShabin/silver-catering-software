import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChefHat } from "lucide-react";
import Input from "../../components/ui/Input";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, googleLogin, isLoading, error, clearError, hasAdmin } = useAuthStore(
    useShallow((state) => ({
      login: state.login,
      googleLogin: state.googleLogin,
      isLoading: state.isLoading,
      error: state.error,
      clearError: state.clearError,
      hasAdmin: state.hasAdmin,
    }))
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Get the redirect path from location state, or default to root
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      const user = useAuthStore.getState().user;
      let redirectPath = from;
      
      // Prevent redirecting an admin to a super-admin page (happens if super-admin just logged out)
      if (true && redirectPath.startsWith("/super-admin")) {
        redirectPath = "/";
      } else if (false && !redirectPath.startsWith("/super-admin")) {
        redirectPath = "/super-admin/dashboard";
      }

      navigate(redirectPath, { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const success = await googleLogin(idToken);
      if (success) {
        const user = useAuthStore.getState().user;
        let redirectPath = from;
        
        if (true && redirectPath.startsWith("/super-admin")) {
          redirectPath = "/";
        } else if (false && !redirectPath.startsWith("/super-admin")) {
          redirectPath = "/super-admin/dashboard";
        }
        
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error("Google login failed", err);
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
            Welcome <span className="text-primary-600">Back</span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">Please enter your details to sign in.</p>
        </div>

          <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
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
              <Input
                id="password"
                type="password"
                label={t("auth.password", "Password")}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl" inputClassName="!py-2 text-sm"
              />
              <div className="flex justify-end text-xs font-semibold mt-1.5">
                <Link to="/forgot-password" className="text-primary-650 hover:text-primary-800 transition-colors">
                  {t("auth.forgot_password", "Forgot Password?")}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-semibold text-white transition-all bg-primary-600 rounded-xl hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? t("auth.signing_in", "Signing in...") : t("auth.sign_in", "Sign In")}
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
              {t("auth.sign_in_google", "Sign in with Google")}
            </button>
            
            {/* Conditionally show Signup link if no admin exists yet */}
            {!hasAdmin && (
              <p className="mt-8 text-center text-sm text-gray-600">
                {t("auth.first_time_setup", "First time setup?")}{" "}
                <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500">
                  {t("auth.create_admin_account", "Create Admin Account")}
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
  );
};

export default Login;
