import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  PartyPopper,
  Users,
  Package,
  ShoppingCart,
  ChefHat,
  X,
  Utensils,
  CreditCard,
  FileText,
  Building2,
  DollarSign,
  LineChart,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  WifiOff,
  LifeBuoy,
  Layers,
  Briefcase,
  ClipboardList,
  ShieldCheck
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useTenantStore } from "../../store/useTenantStore";
import { useTranslation } from "react-i18next";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { billingApi } from "../../api/billingApi";
import { eventApi } from "../../api/eventApi";

const navigationGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin"], feature: "dashboard" },
      { name: "Quotations", path: "/quotations", icon: FileText, roles: ["admin", "manager"], feature: "quotations" },
      { name: "Calendar", path: "/calendar", icon: CalendarDays, roles: ["admin", "manager", "kitchen-staff", "accountant"], feature: "calendar" },
      { name: "Events", path: "/events", icon: PartyPopper, roles: ["admin", "manager"], feature: "events" },
      { name: "Customers", path: "/customers", icon: Users, roles: ["admin", "manager", "accountant"], feature: "customers" },
      { name: "Staff Roles", path: "/staff-roles", icon: ClipboardList, roles: ["admin", "manager"] },
      { name: "Feedback", path: "/feedback", icon: MessageSquare, roles: ["admin", "manager"], feature: "POST_EVENT_FEEDBACK" },
    ]
  },
  {
    label: "Operations",
    items: [
      { name: "Vendors", path: "/vendors", icon: Building2, roles: ["admin", "manager", "accountant"], feature: "purchases" },
      { name: "Inventory", path: "/inventory", icon: Package, roles: ["admin", "manager", "kitchen-staff", "accountant"], feature: "inventory" },
      { name: "Purchases", path: "/purchases", icon: ShoppingCart, roles: ["admin", "manager", "accountant"], feature: "purchases" },
      { name: "Menu Management", path: "/menu", icon: Utensils, roles: ["admin", "manager", "kitchen-staff"], feature: "menu" },
      { name: "Packages", path: "/packages", icon: Layers, roles: ["admin", "manager"], feature: "packages" },
      { name: "Agencies", path: "/agencies", icon: Briefcase, roles: ["admin", "manager"], feature: "manpower_agencies" },
      { name: "Agency Assignments", path: "/agency-assignments", icon: ClipboardList, roles: ["admin", "manager"], feature: "manpower_agencies" },
    ]
  },
  {
    label: "Finance",
    items: [
      { name: "Billing & Expenses", path: "/billing", icon: CreditCard, roles: ["admin"], feature: "billing" },
      { name: "Expenses Tracker", path: "/expenses", icon: DollarSign, roles: ["admin", "accountant"], feature: "expenses" },
      { name: "Reports & Analytics", path: "/reports", icon: LineChart, roles: ["admin"], feature: "dashboard" },
    ]
  },
  {
    label: "System",
    items: [
      { name: "Staff Management", path: "/staff", icon: Users, roles: ["admin", "manager"], feature: "staff" },
      { name: "Settings", path: "/settings", icon: SettingsIcon, roles: ["admin", "manager"], feature: "settings" },
      { name: "Privacy Policy", path: "/privacy-policy", icon: ShieldCheck, roles: ["admin", "manager"] },

    ]
  }
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const user = useAuthStore(state => state.user);
  const tenant = useTenantStore(state => state.tenant);
  const location = useLocation();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [overdueCount, setOverdueCount] = useState(0);
  const [overdueEventCount, setOverdueEventCount] = useState(0);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (user && ["admin", "manager", "accountant"].includes(user.role)) {
      const fetchOverdue = async () => {
        try {
          const res = await billingApi.getOverdueCount();
          if (res.status === "success") {
            setOverdueCount(res.data.count);
          }
        } catch (error) {
          console.error("Error fetching overdue count:", error);
        }
        
        try {
          const resEvent = await eventApi.getOverdueCount();
          if (resEvent.status === "success") {
            setOverdueEventCount(resEvent.data.count);
          }
        } catch (error) {
          console.error("Error fetching overdue event count:", error);
        }
      };
      fetchOverdue();
      // Optionally refresh every 5 minutes
      const interval = setInterval(fetchOverdue, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close mobile sidebar automatically on route (page) change
  useEffect(() => {
    if (isOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col transform bg-white border-r border-slate-100 transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-[260px]"}
        `}
      >
        {/* Header */}
        <div className={`flex items-center h-16 shrink-0 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "justify-between px-6"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl.startsWith('http') ? tenant.logoUrl : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${tenant.logoUrl}`} alt="Logo" className="w-8 h-8 rounded-xl object-cover shrink-0" />
            ) : user?.tenantLogoUrl ? (
              <img src={user.tenantLogoUrl.startsWith('http') ? user.tenantLogoUrl : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${user.tenantLogoUrl}`} alt="Logo" className="w-8 h-8 rounded-xl object-cover shrink-0" />
            ) : (
              <img src="/logo.png" alt="Docateos" className="w-8 h-8 object-contain shrink-0" />
            )}
            <span className={`text-[15px] font-bold tracking-tight text-slate-900 transition-opacity duration-300 whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
              {tenant?.name || user?.tenantName || "Docateos"}
            </span>
          </div>
          
          <button onClick={toggleSidebar} className="lg:hidden p-1.5 max-md:p-3 text-slate-400 hover:text-slate-600 hover:bg-base-100 rounded-lg max-md:rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="flex-1">
            {navigationGroups.map((group, groupIndex) => {
              const filteredItems = group.items.filter(item => {
                if (!user) return false;
                if (user.role === "admin") {
                  // Check plan feature restriction for admins
                  if (item.feature && user.planFeatures && !true) {
                    return false;
                  }
                  return true;
                }

                const permissionMap = {
                  "/events": "events",
                  "/customers": "customers",
                  "/inventory": "inventory",
                  "/purchases": "billing",
                  "/menu": "menu",
                  "/packages": "menu",
                  "/billing": "billing",
                  "/reports": "billing",
                  "/quotations": "billing",
                  "/expenses": "billing",
                  "/feedback": "events",
                  "/agencies": "staff",
                  "/agency-assignments": "staff",
                  "/staff": "staff",
                  "/crew": "staff",
                  "/settings": "staff"
                };

                const requiredPerm = permissionMap[item.path];
                if (requiredPerm && user.permissions && user.permissions.includes(requiredPerm)) {
                  // Also check plan features for non-admin roles
                  if (item.feature && user.planFeatures && !true) {
                    return false;
                  }
                  return true;
                }

                if (!item.roles || item.roles.includes(user.role)) {
                  // Also check plan features
                  if (item.feature && user.planFeatures && !true) {
                    return false;
                  }
                  return true;
                }

                return false;
              });
              
              if (filteredItems.length === 0) return null;

              return (
                <div key={group.label} className={`mb-6 ${isCollapsed ? "px-3" : "px-4"}`}>
                  {!isCollapsed && (
                    <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                      {group.label}
                    </p>
                  )}
                  {isCollapsed && groupIndex > 0 && (
                    <div className="w-6 h-px bg-base-100 mx-auto mb-4" />
                  )}
                  
                  <nav className="space-y-0.5">
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                      
                      return (
                        <NavLink
                          key={item.name}
                          to={item.path}
                          className="group relative flex items-center w-full outline-none"
                        >
                          <div className={`
                            flex items-center w-full py-[7px] max-md:py-3 transition-all duration-200 rounded-lg relative overflow-hidden
                            ${isCollapsed ? "justify-center px-0" : "px-3"}
                            ${isActive 
                              ? "bg-primary-50 text-primary-600 font-bold" 
                              : "text-slate-500 hover:bg-base-50 hover:text-slate-900"
                            }
                          `}>
                            {isActive && (
                               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-500 rounded-r-full" />
                            )}
                            <div className="relative flex items-center justify-center">
                              <Icon 
                                className={`shrink-0 transition-colors duration-200 ${isCollapsed ? "w-[20px] h-[20px]" : "w-[18px] h-[18px]"} ${isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"}`} 
                                strokeWidth={isActive ? 2.5 : 2} 
                              />
                              {isCollapsed && item.name === "Customers" && overdueCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                              {isCollapsed && item.name === "Events" && overdueEventCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                            </div>
                            
                            <span className={`
                              ml-3 text-[13px] whitespace-nowrap transition-all duration-300 flex items-center gap-2
                              ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}
                            `}>
                              {t(`sidebar.${item.name.toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_')}`, item.name)}
                              
                              {item.name === "Customers" && overdueCount > 0 && (
                                <span className="relative flex h-2 w-2 ml-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                              {item.name === "Events" && overdueEventCount > 0 && (
                                <span className="relative flex h-2 w-2 ml-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Tooltip for collapsed mode */}
                          {isCollapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[12px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl whitespace-nowrap z-50 flex items-center gap-2">
                              {t(`sidebar.${item.name.toLowerCase().replace(/ & /g, '_').replace(/\s+/g, '_')}`, item.name)}
                              {item.name === "Customers" && overdueCount > 0 && (
                                <span className="h-2 w-2 bg-red-500 rounded-full" />
                              )}
                              {item.name === "Events" && overdueEventCount > 0 && (
                                <span className="h-2 w-2 bg-red-500 rounded-full" />
                              )}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 -mt-px border-[5px] border-transparent border-r-slate-800" />
                            </div>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Collapse Button */}
        <div className={`mt-auto border-t border-slate-200/60`}>
          <div className={`hidden lg:flex p-4 ${isCollapsed ? "justify-center" : "justify-end"}`}>
            <button
              onClick={toggleCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {isCollapsed ? <ChevronRight size={18} strokeWidth={2} /> : <ChevronLeft size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
