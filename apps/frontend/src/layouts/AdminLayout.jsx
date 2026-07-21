import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import CommandPalette from "../components/command-palette/CommandPalette";
import api from "../utils/axios";
import { X, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import PrivacyPolicyModal from "../components/ui/PrivacyPolicyModal";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, notificationsRes] = await Promise.all([
          api.get("/notifications/announcements"),
          api.get("/notifications")
        ]);
        
        if (announcementsRes.data && announcementsRes.data.status === "success") {
          setAnnouncements(announcementsRes.data.data);
        }
        
        if (notificationsRes.data && notificationsRes.data.status === "success") {
          const alerts = notificationsRes.data.data
            .filter(n => n.category === "billing" && !n.isRead)
            .map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type || "warning",
              isNotification: true
            }));
          setExpiryAlerts(alerts);
        }
      } catch (err) {
        console.error("Failed to fetch layout data:", err);
      }
    };
    fetchData();
  }, []);

  const handleDismiss = (id) => {
    const dismissed = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
    localStorage.setItem("dismissedAnnouncements", JSON.stringify([...dismissed, id]));
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleDismissAlert = (id) => {
    // Only dismiss locally so it comes back on refresh until they actually renew
    setExpiryAlerts(prev => prev.filter(a => a.id !== id));
  };

  const dismissedIds = JSON.parse(localStorage.getItem("dismissedAnnouncements") || "[]");
  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));
  
  const isCalendar = location.pathname.includes('/calendar');

  return (
    <>
      <div className="flex h-screen bg-base-50 overflow-hidden font-sans">
      <CommandPalette />
      {/* Sidebar acts as navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Global Announcements Banner */}
        {visibleAnnouncements.length > 0 && (
          <div className="flex flex-col gap-2 px-4 pt-4 sm:px-8 lg:px-10 max-w-7xl mx-auto shrink-0 w-full animate-in slide-in-from-top duration-300">
            {visibleAnnouncements.map((ann) => {
              const alertStyles = {
                info: {
                  bg: "bg-blue-50/90 border-blue-200/60 text-blue-800",
                  icon: Info,
                  iconColor: "text-blue-500"
                },
                success: {
                  bg: "bg-emerald-50/90 border-emerald-200/60 text-emerald-800",
                  icon: CheckCircle2,
                  iconColor: "text-emerald-500"
                },
                warning: {
                  bg: "bg-amber-50/90 border-amber-200/60 text-amber-800",
                  icon: AlertTriangle,
                  iconColor: "text-amber-500"
                },
                danger: {
                  bg: "bg-red-50/90 border-red-200/60 text-red-800",
                  icon: AlertCircle,
                  iconColor: "text-red-500"
                }
              };

              const style = alertStyles[ann.type] || alertStyles.info;
              const AlertIcon = style.icon;

              return (
                <div
                  key={ann.id}
                  className={`flex items-start justify-between p-3.5 border rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-300 ${style.bg} animate-pulse`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-xl bg-white shadow-sm shrink-0 border border-slate-100/60 ${style.iconColor}`}>
                      <AlertIcon size={14} />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-extrabold uppercase tracking-wider">{ann.title}</span>
                      <p className="text-xs mt-0.5 font-medium leading-relaxed opacity-90">{ann.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(ann.id)}
                    className="p-1 rounded-lg hover:bg-white/40 transition-colors shrink-0 text-slate-500 hover:text-slate-800 cursor-pointer ml-4"
                    title="Dismiss Announcement"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none custom-scrollbar">
          <div className={`px-2 py-6 sm:px-8 lg:px-10 ${isCalendar ? "max-w-full" : "max-w-7xl"} mx-auto max-md:pb-20`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation — only visible on mobile (md:hidden inside component) */}
      <MobileBottomNav toggleSidebar={toggleSidebar} isHidden={isSidebarOpen} />
    </div>
      
      {/* Floating Expiry Alerts */}
      {expiryAlerts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 sm:w-96">
          {expiryAlerts.map(alert => (
            <div key={alert.id} className="bg-white border-l-4 border-amber-500 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-500 ease-out">
              <div className="p-4 flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                  <AlertTriangle size={20} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{alert.title}</h4>
                  <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                </div>
                <button 
                  onClick={() => handleDismissAlert(alert.id)}
                  className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {user?.role === "admin" && user?.privacyPolicyAccepted === false && (
        <PrivacyPolicyModal isOpen={true} />
      )}
    </>
  );
};

export default AdminLayout;
