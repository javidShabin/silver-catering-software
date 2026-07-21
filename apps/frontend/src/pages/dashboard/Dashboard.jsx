import { CURRENCY } from "../../config/currency";
import React, { useState, useEffect } from "react";
import { Users, CalendarDays, IndianRupee, Clock, PlusCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { reportsApi } from "../../api/reportsApi";
import StatCard from "./components/StatCard";
import QuickActions from "./components/QuickActions";
import RecentEvents from "./components/RecentEvents";
import RevenueChart from "./components/RevenueChart";
import EventDonutChart from "./components/EventDonutChart";
import { useTranslation } from "react-i18next";
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const [summaryRes, financialRes] = await Promise.all([
        reportsApi.getDashboardSummary(),
        reportsApi.getFinancialAnalytics({ year: new Date().getFullYear() })
      ]);

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const fullYearData = monthNames.map(name => ({ name, revenue: 0 }));

      if (financialRes.data && financialRes.data.revenueByMonth) {
        financialRes.data.revenueByMonth.forEach(item => {
          const monthIdx = item._id - 1;
          if (monthIdx >= 0 && monthIdx < 12) {
            fullYearData[monthIdx].revenue = item.monthlyRevenue;
          }
        });
      }

      return {
        summary: summaryRes.data,
        financial: fullYearData
      };
    }
  });

  const data = dashboardData?.summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    completedEvents: 0,
    activeEvents: 0,
    pendingTasks: 0,
    totalCustomers: 0,
    recentEvents: [],
  };
  
  const financialData = dashboardData?.financial || [];

  return (
    <div className="space-y-4 pb-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-[18px] font-semibold text-slate-800 tracking-tight leading-tight">
            {t("dashboard.welcome_back", "Welcome back")}, {user?.name?.split(' ')[0] || 'Admin'}
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5">{t("dashboard.overview_text", "Here's a quick overview of your catering operations today.")}</p>
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/quotations/new')} 
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-semibold rounded-lg shadow-sm transition-all shadow-primary-200"
          >
            <PlusCircle size={14} />
            {t("dashboard.create_quotation", "Create Quotation")}
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/60 backdrop-blur-sm rounded-[20px] border border-slate-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {user?.role === 'admin' && (
            <StatCard 
              title={t("dashboard.total_revenue", "Total Revenue")} 
              value={`${CURRENCY}${data.totalRevenue.toLocaleString()}`} 
              icon={IndianRupee} 
              type="cyan"
            />
          )}
          <StatCard 
            title={t("dashboard.upcoming_events", "Upcoming Events")} 
            value={data.activeEvents.toString()} 
            icon={CalendarDays} 
            type="orange"
          />
          <StatCard 
            title={t("dashboard.active_customers", "Active Customers")} 
            value={data.totalCustomers.toString()} 
            icon={Users} 
            type="lavender"
          />
          <StatCard 
            title={t("dashboard.pending_tasks", "Pending Tasks")} 
            value={data.pendingTasks.toString()} 
            icon={Clock} 
            type="rose"
          />
        </div>
      )}

      {/* Middle Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {user?.role === 'admin' && (
          <div className="lg:col-span-2 flex flex-col">
            {isLoading ? (
              <div className="h-[320px] bg-white/60 backdrop-blur-sm rounded-[20px] border border-slate-100 animate-pulse"></div>
            ) : (
              <RevenueChart data={financialData} />
            )}
          </div>
        )}
        <div className={`flex flex-col ${user?.role === 'admin' ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {isLoading ? (
            <div className="h-[320px] bg-white/60 backdrop-blur-sm rounded-[20px] border border-slate-100 animate-pulse"></div>
          ) : (
            <EventDonutChart 
              completed={data.completedEvents} 
              active={data.activeEvents} 
              pending={data.pendingTasks} 
            />
          )}
        </div>
      </div>

      {/* Bottom Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Recent Events (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2 flex flex-col h-[340px] max-md:h-auto max-md:min-h-[300px]">
          <RecentEvents events={data.recentEvents} isLoading={isLoading} />
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-1 flex flex-col h-[340px] max-md:h-auto max-md:min-h-[240px]">
          {isLoading ? (
            <div className="h-[280px] bg-white/60 backdrop-blur-sm rounded-[20px] border border-slate-100 animate-pulse"></div>
          ) : (
            <QuickActions />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
