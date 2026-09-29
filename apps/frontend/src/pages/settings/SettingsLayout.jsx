import { Settings as SettingsIcon } from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import AppearanceSettings from "./AppearanceSettings";
import SecuritySettings from "./SecuritySettings";
import WorkspaceSettings from "./WorkspaceSettings";
import BackupSettings from "./BackupSettings";
import { useAuthStore } from "../../store/authStore";
import { useTranslation } from "react-i18next";

const SettingsLayout = () => {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="relative w-full min-h-screen pt-0 pb-20 overflow-x-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full mx-auto relative z-10">
        
        <div className="mb-6">
          <h1 className="text-[22px] font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <SettingsIcon size={22} className="text-primary-600" />
            {t("settings.settings", "Settings")}
          </h1>
          <p className="text-[12px] font-medium text-slate-500 mt-1 pl-[32px]">{t("settings.settings_subtitle", "Manage your account configurations and system preferences.")}</p>
        </div>

        {/* Masonry/Grid Layout matching the screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Workspace Settings (Admin Only) */}
          {isAdmin && (
            <div className="lg:col-span-2 mb-2">
              <WorkspaceSettings />
            </div>
          )}
          
          {/* Backup Settings (Admin Only) */}
          {isAdmin && (
            <div className="lg:col-span-2">
              <BackupSettings />
            </div>
          )}

          {/* Left Column: Profile */}
          <div className="flex flex-col gap-6 h-full">
            <ProfileSettings />
          </div>

          {/* Right Column: Appearance */}
          <div className="flex flex-col gap-6 h-full">
            <AppearanceSettings />
          </div>


          
        </div>
        
        {/* Footer Text matching screenshot */}
        <div className="mt-12 text-center">
           <p className="text-[11px] font-medium text-slate-400">© 2026 Docateos. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
};

export default SettingsLayout;
