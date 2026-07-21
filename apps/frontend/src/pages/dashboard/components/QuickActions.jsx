import React from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  UserPlus, 
  BarChart3, 
  UtensilsCrossed, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  ArrowRight 
} from "lucide-react";
import { useTranslation } from "react-i18next";

const QuickActions = () => {
  const { t } = useTranslation();
  const actions = [
    { name: t("dashboard.action_create_event", "Create Event"), desc: t("dashboard.action_create_event_desc", "Plan new event"), icon: Plus, path: "/events", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    { name: t("dashboard.action_add_client", "Add Client"), desc: t("dashboard.action_add_client_desc", "New customer"), icon: Users, path: "/customers", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    { name: t("dashboard.action_inventory", "Inventory"), desc: t("dashboard.action_inventory_desc", "Stock update"), icon: Package, path: "/inventory", bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100" },
    { name: t("dashboard.action_invoice", "Invoice"), desc: t("dashboard.action_invoice_desc", "Billing & payments"), icon: FileText, path: "/reports", bg: "bg-primary-50", text: "text-primary-600", border: "border-primary-100" },
    { name: t("dashboard.action_purchase", "Purchase"), desc: t("dashboard.action_purchase_desc", "Log expenses"), icon: ShoppingCart, path: "/purchases", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
    { name: t("dashboard.action_staffing", "Staffing"), desc: t("dashboard.action_staffing_desc", "Assign duties"), icon: UserPlus, path: "/dashboard", bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-100" },
    { name: t("dashboard.action_analytics", "Analytics"), desc: t("dashboard.action_analytics_desc", "Performance reports"), icon: BarChart3, path: "/reports", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    { name: t("dashboard.action_menu", "Menu"), desc: t("dashboard.action_menu_desc", "Edit items"), icon: UtensilsCrossed, path: "/dashboard", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    { name: t("dashboard.action_payments", "Payments"), desc: t("dashboard.action_payments_desc", "Pending dues"), icon: CreditCard, path: "/reports", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" },
    { name: t("dashboard.action_schedule", "Schedule"), desc: t("dashboard.action_schedule_desc", "Upcoming events"), icon: Calendar, path: "/events", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
    { name: t("dashboard.action_revenue", "Revenue"), desc: t("dashboard.action_revenue_desc", "Earnings report"), icon: TrendingUp, path: "/reports", bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
  ];

  return (
    <div className="card-premium p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">{t("dashboard.quick_actions", "Quick Actions")}</h3>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t("dashboard.scroll_for_more", "Scroll for more")}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 max-md:grid max-md:grid-cols-2 max-md:gap-2 max-md:space-y-0">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              to={action.path}
              className={`group flex items-center p-2.5 rounded-xl border border-transparent hover:${action.border} hover:${action.bg} transition-all duration-300`}
            >
              <div className={`p-2 rounded-lg ${action.bg} ${action.text} mr-3 transition-transform group-hover:scale-105 flex-shrink-0`}>
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-medium text-slate-800 truncate">{action.name}</h4>
                <p className="text-[11px] text-slate-400 mt-[1px] truncate">{action.desc}</p>
              </div>
              <ArrowRight size={14} className="text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
