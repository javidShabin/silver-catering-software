import { Menu, LogOut, User, Globe, Wifi, WifiOff } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import NotificationCenter from "./NotificationCenter";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      logout: state.logout,
    }))
  );

  const { t, i18n } = useTranslation();
  const hasMultiLanguage = true;

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("doOs_lang", lang);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sm:px-8 lg:px-10 transition-all">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-slate-400 rounded-xl lg:hidden hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
          {t("navbar.overview", "Overview")}
        </h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">


        {hasMultiLanguage && (
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <Globe size={16} className="text-slate-400" />
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2 rounded-lg outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
            >
              <option value="en">English</option>
              <option value="ml">മലയാളം</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
        )}

        <NotificationCenter />

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900">{user?.name || "Admin User"}</span>
            <span className="text-[10px] font-bold tracking-wider text-primary-600 uppercase">{user?.role || "Admin"}</span>
          </div>

          <div className="flex items-center justify-center w-9 h-9 bg-primary-50 rounded-xl text-primary-600 shadow-sm border border-primary-100/30 overflow-hidden">
            {user?.profilePic ? (
              <img src={user.profilePic.startsWith('http') ? user.profilePic : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${user.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} strokeWidth={2.5} />
            )}
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center p-2 text-slate-400 transition-colors rounded-xl hover:bg-red-50 hover:text-red-500 ml-1"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] rounded-[24px] shadow-2xl border border-slate-800 w-full max-w-[400px] p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <LogOut className="w-6 h-6 text-red-500" strokeWidth={2} />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-base font-semibold text-white mb-1.5">{t("logoutModal.title", "Confirm Logout")}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  {t("logoutModal.message", "Are you sure you want to log out of your account? You will need to log back in to access your dashboard.")}
                </p>
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    {t("logoutModal.cancel", "Cancel")}
                  </button>
                  <button
                    onClick={() => {
                      setIsLogoutModalOpen(false);
                      logout();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#ff3333] hover:bg-red-600 text-white text-sm font-medium shadow-sm transition-colors"
                  >
                    {t("logoutModal.confirm", "Logout")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
