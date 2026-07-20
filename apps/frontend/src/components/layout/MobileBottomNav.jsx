import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PartyPopper,
  CalendarDays,
  Utensils,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  AlignJustify,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

// Role-based primary navigation items for bottom bar
const roleNavItems = {
  admin: [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Events", path: "/events", icon: PartyPopper },
    { name: "Calendar", path: "/calendar", icon: CalendarDays },
    { name: "Menu", path: "/menu", icon: Utensils },
  ],
  manager: [
    { name: "Events", path: "/events", icon: PartyPopper },
    { name: "Calendar", path: "/calendar", icon: CalendarDays },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Inventory", path: "/inventory", icon: Package },
  ],
  "kitchen-staff": [
    { name: "Calendar", path: "/calendar", icon: CalendarDays },
    { name: "Menu", path: "/menu", icon: Utensils },
    { name: "Inventory", path: "/inventory", icon: Package },
  ],
  accountant: [
    { name: "Expenses", path: "/expenses", icon: DollarSign },
    { name: "Purchases", path: "/purchases", icon: ShoppingCart },
    { name: "Customers", path: "/customers", icon: Users },
  ],
};

const MobileBottomNav = ({ toggleSidebar, isHidden }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Hide when sidebar is open to avoid z-index conflicts
  if (isHidden) return null;

  const navItems = roleNavItems[user?.role] || [];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] relative transition-colors active:bg-slate-100/80"
            >
              {/* Active indicator line at top */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-500 rounded-full" />
              )}

              <Icon
                className={`w-[22px] h-[22px] transition-colors ${
                  isActive ? "text-primary-600" : "text-slate-400"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-bold tracking-wide leading-none transition-colors ${
                  isActive ? "text-primary-600" : "text-slate-400"
                }`}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}

        {/* More — opens the full sidebar for all other pages */}
        <button
          onClick={toggleSidebar}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors active:bg-slate-100/80 text-slate-400"
        >
          <AlignJustify className="w-[22px] h-[22px]" strokeWidth={2} />
          <span className="text-[10px] font-bold tracking-wide leading-none">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
