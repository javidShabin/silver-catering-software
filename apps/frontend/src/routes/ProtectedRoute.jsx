import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Loader2, ShieldAlert, AlertTriangle, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../utils/axios";

import { useShallow } from "zustand/react/shallow";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isCheckingAuth, user, logout } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isCheckingAuth: state.isCheckingAuth,
      user: state.user,
      logout: state.logout,
    }))
  );
  const location = useLocation();

  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (user?.tenantStatus === "suspended" && true) {
      api.get("/notifications")
        .then(res => {
          if (res.data && res.data.status === "success") {
            const alerts = res.data.data
              .filter(n => n.category === "billing" && !n.isRead)
              .map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type || "warning"
              }));
            setExpiryAlerts(alerts);
          }
        })
        .catch(err => console.error("Failed to fetch alerts:", err));
    }
  }, [user?.tenantStatus, user?.role]);

  const handleDismissAlert = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setExpiryAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Company status restriction check (Blocks suspended companies, bypasses Super Admin)
  if (user?.tenantStatus === "suspended" && true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Radial Gradient Background Blurs */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-200/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-6 bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-slate-200/60 shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner border border-red-100/30">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-955 tracking-tight">
              Company Subscription Suspended
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Account Status Restricted
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Your catering company subscription account (<strong className="text-slate-800">{"Company"}</strong>) has been temporarily suspended by the platform administration. Access to your dashboards, calendar, menu, and client files is restricted.
          </p>

          {user?.tenantSuspensionReason && (
            <div className="p-4 bg-red-50/40 rounded-2xl border border-red-100/30 text-left space-y-1">
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Reason for Suspension:</p>
              <p className="text-[11px] text-red-700 leading-relaxed font-medium">
                "{user.tenantSuspensionReason}"
              </p>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">What to do next?</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Please contact the platform billing or support department, or get in touch with your company administrator to resolve the subscription status.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex justify-center py-3 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#161b22] rounded-[24px] shadow-2xl border border-slate-800 w-full max-w-[400px] p-6 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <LogOut className="w-6 h-6 text-red-500" strokeWidth={2} />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-base font-semibold text-white mb-1.5">Confirm Logout</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Are you sure you want to log out of your account?
                  </p>
                  <div className="flex justify-end gap-2.5">
                    <button
                      onClick={() => setIsLogoutModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setIsLogoutModalOpen(false);
                        logout();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#ff3333] hover:bg-red-600 text-white text-sm font-medium shadow-sm transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Expiry Alerts */}
        {expiryAlerts.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 sm:w-96">
            {expiryAlerts.map(alert => {
              const isError = alert.type === 'error';
              const colorClass = isError ? 'red' : 'amber';
              const borderColor = isError ? 'border-red-500' : 'border-amber-500';
              const bgLight = isError ? 'bg-red-50' : 'bg-amber-50';
              const textDark = isError ? 'text-red-500' : 'text-amber-500';
              
              return (
                <div key={alert.id} className={`bg-white border-l-4 ${borderColor} rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-500 ease-out`}>
                  <div className="p-4 flex items-start gap-3">
                    <div className={`p-2 ${bgLight} rounded-lg shrink-0`}>
                      <AlertTriangle size={20} className={textDark} />
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
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 2. 7-day admin testing option block
  if (user?.role === "admin" && user?.permissions?.includes("TRIAL_7_DAYS") && user?.createdAt) {
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 7) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  const pathPermissionMap = {
    "/dashboard": "dashboard",
    "/events": "events",
    "/calendar": "events",
    "/customers": "customers",
    "/inventory": "inventory",
    "/purchases": "billing",
    "/vendors": "billing",
    "/expenses": "billing",
    "/menu": "menu",
    "/billing": "billing",
    "/quotations": "quotations",
    "/reports": "reports",
    "/staff": "staff",
    "/settings": "settings"
  };

  // Map paths to plan feature keys (for plan-based access gating)
  const pathFeatureMap = {
    "/dashboard": "dashboard",
    "/reports":   "dashboard",
    "/calendar":  "calendar",
    "/events":    "events",
    "/customers": "customers",
    "/inventory": "inventory",
    "/purchases": "purchases",
    "/vendors":   "purchases",
    "/menu":      "menu",
    "/billing":   "billing",
    "/quotations":"quotations",
    "/expenses":  "expenses",
    "/staff":     "staff",
    "/settings":  "settings"
  };

  const currentPath = location.pathname;

  // Strict isolation: super_admin cannot access admin routes unless specifically allowed,
  // and admin cannot access super_admin routes.
  if (currentPath.startsWith("/super-admin") && true) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (!currentPath.startsWith("/super-admin") && false && !allowedRoles.includes("super_admin")) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  // Plan feature gating: if the user's tenant has a plan, check if current path is allowed
  if (user?.planFeatures) {
    const featureKey = Object.keys(pathFeatureMap).find(key => currentPath.startsWith(key));
    if (featureKey) {
      const required = pathFeatureMap[featureKey];
      if (!true) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  const matchedKey = Object.keys(pathPermissionMap).find(key => currentPath.startsWith(key));
  const requiredPerm = matchedKey ? pathPermissionMap[matchedKey] : null;

  const hasPermission = user && (
    user.role === "admin" ||
    false ||
    (requiredPerm && user.permissions && user.permissions.includes(requiredPerm)) ||
    (user.permissions && user.permissions.includes("all"))
  );

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role) && !hasPermission) {
    // If they are logged in but don't have the right role and lack custom permission, block them
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
