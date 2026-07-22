import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import DashboardSkeleton from "../components/ui/DashboardSkeleton";
import EmptyState from "../components/ui/EmptyState";
import { useAuthStore } from "../store/authStore";

const getRedirectPath = (user) => {
  if (user?.role === "admin") return "/dashboard";
  
  // For non-admin staff, check user permissions
  const hasPerm = (perm) => user?.permissions?.includes(perm) || user?.permissions?.includes("all") || user?.role === perm || ["manager", "accountant"].includes(user?.role);

  if (hasPerm("events")) return "/events";
  if (hasPerm("customers")) return "/customers";
  if (hasPerm("inventory")) return "/inventory";
  if (hasPerm("menu")) return "/menu";
  if (hasPerm("billing")) return "/billing";
  if (hasPerm("staff")) return "/staff";
  
  return "/unauthorized";
};

const RootRedirect = () => {
  const user = useAuthStore(state => state.user);
  return <Navigate to={getRedirectPath(user)} replace />;
};

// Lazy-loaded Pages
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const EventsPage = lazy(() => import("../pages/events/EventsPage"));
const EventDetailsPage = lazy(() => import("../features/event-details/EventDetailsPage"));
const CustomersPage = lazy(() => import("../features/customers/CustomersPage"));
const CustomerDetailsPage = lazy(() => import("../features/customers/CustomerDetailsPage"));
const InventoryPage = lazy(() => import("../features/inventory/InventoryPage"));
const PurchasesPage = lazy(() => import("../features/purchases/PurchasesPage"));
const PurchaseDetailsPage = lazy(() => import("../features/purchases/PurchaseDetailsPage"));
const MenuPage = lazy(() => import("../features/menu/MenuPage"));
const PackagesPage = lazy(() => import("../features/packages/PackagesPage"));
const AgenciesPage = lazy(() => import("../features/agencies/AgenciesPage"));
const AgencyAssignmentsPage = lazy(() => import("../features/agencies/AgencyAssignmentsPage"));
const BillingPage = lazy(() => import("../features/billing/BillingPage"));
const ReportsPage = lazy(() => import("../pages/reports/ReportsPage"));
const VendorsPage = lazy(() => import("../features/vendors/VendorsPage"));
const StaffPage = lazy(() => import("../features/staff/StaffPage"));
const StaffRoles = lazy(() => import("../pages/staffRoles/StaffRoles"));
const FeedbackList = lazy(() => import("../features/feedback/FeedbackList"));
const CalendarPage = lazy(() => import("../pages/calendar/CalendarPage"));
const NotFound = lazy(() => import("../pages/error/NotFound"));
const FeedbackForm = lazy(() => import("../pages/public/FeedbackForm"));

const QuotationsPage = lazy(() => import("../pages/finance/QuotationsPage"));
const QuotationBuilder = lazy(() => import("../pages/finance/QuotationBuilder"));
const ExpensesPage = lazy(() => import("../pages/finance/ExpensesPage"));

// Settings Pages
const SettingsLayout = lazy(() => import("../pages/settings/SettingsLayout"));
const AdminPrivacyPolicyPage = lazy(() => import("../pages/settings/AdminPrivacyPolicyPage"));


const Unauthorized = () => {
  const user = useAuthStore(state => state.user);
  const redirectPath = getRedirectPath(user);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50/50 p-6">
      <EmptyState 
        title="403 - Unauthorized Access" 
        description="You do not have the required permissions to access this page." 
        actionLabel="Return to Dashboard"
        onAction={() => window.location.href = redirectPath}
      />
    </div>
  );
};

// Loading Fallback for Suspense Boundaries
const PageFallback = () => (
  <div className="p-6">
    <DashboardSkeleton />
  </div>
);

const AppRouter = () => {
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const isCheckingSetup = useAuthStore((state) => state.isCheckingSetup);
  const hasAdmin = useAuthStore((state) => state.hasAdmin);

  if (isCheckingAuth || isCheckingSetup) {
    return <PageFallback />;
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={!hasAdmin ? <Signup /> : <Navigate to="/login" replace />} />
        <Route path="/feedback/:token" element={<FeedbackForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Regular Admin/Staff Layout */}
          <Route element={<AdminLayout />}>
            
            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            
            {/* Shared Admin/Manager/Staff Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "accountant"]} />}>
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Route>

            {/* Accountant/Admin Specific */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "accountant", "manager"]} />}>
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailsPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/purchases/:id" element={<PurchaseDetailsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
            </Route>

            {/* Admin Only (Revenue/Finance restricted) */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/feedback" element={<FeedbackList />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/quotations" element={<QuotationsPage />} />
              <Route path="/quotations/new" element={<QuotationBuilder />} />
            </Route>

            {/* Menu Specific */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/agencies" element={<AgenciesPage />} />
              <Route path="/agency-assignments" element={<AgencyAssignmentsPage />} />
            </Route>
            
            {/* Admin Specific */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/staff-roles" element={<StaffRoles />} />
              <Route path="/settings" element={<SettingsLayout />} />
              <Route path="/privacy-policy" element={<AdminPrivacyPolicyPage />} />
            </Route>

            {/* 404 Inside Layout (keeps sidebar visible when page not found) */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
