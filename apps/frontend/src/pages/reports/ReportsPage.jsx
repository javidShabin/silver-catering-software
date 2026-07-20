import { CURRENCY } from "../../config/currency";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { reportsApi } from "../../api/reportsApi";
import { 
  TrendingUp, 
  IndianRupee, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Briefcase
} from "lucide-react";
import { useTranslation } from "react-i18next";

const KPIWidget = ({ title, value, subtitle, icon: Icon, color, trend, trendType }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
    <div className="flex justify-between items-center relative z-10">
      <div className={`p-1.5 sm:p-2 rounded-lg ${color} bg-opacity-10 transition-transform group-hover:scale-105`}>
        <Icon size={14} className={`${color.replace('bg-', 'text-')} sm:w-[16px] sm:h-[16px]`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
          trendType === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-100/50' : 'text-rose-600 bg-rose-50 border-rose-100/50'
        }`}>
          {trendType === 'up' ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />} {trend}
        </div>
      )}
    </div>
    <div className="mt-2 sm:mt-2.5 relative z-10">
      <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-0.5">{title}</p>
      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <div className={`absolute -right-3 -bottom-3 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500`}>
      <Icon size={48} className={`${color.replace('bg-', 'text-')} sm:w-[60px] sm:h-[60px]`} />
    </div>
  </div>
);

const formatYAxis = (value) => {
  if (value >= 10000000) return `${CURRENCY}${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${CURRENCY}${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${CURRENCY}${(value / 1000).toFixed(0)}K`;
  return `${CURRENCY}${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 bg-opacity-95 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl text-white">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] text-slate-300 capitalize">{entry.name}</span>
              </div>
              <span className="text-[11px] font-extrabold text-white">
                {CURRENCY}{Number(entry.value).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ReportsPage = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [timeRange, setTimeRange] = useState('allTime');

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();
    
    switch(range) {
      case 'today':
        start.setHours(0,0,0,0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0,0,0,0);
        end.setDate(end.getDate() - 1);
        end.setHours(23,59,59,999);
        break;
      case 'last1Month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'last6Months':
        start.setMonth(start.getMonth() - 6);
        break;
      case 'thisYear':
        start.setMonth(0, 1);
        start.setHours(0,0,0,0);
        break;
      case 'allTime':
        // Extremely wide range to capture everything
        start.setFullYear(2000);
        end.setFullYear(2100);
        break;
      default:
        start.setFullYear(2000);
        end.setFullYear(2100);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = getDateRange(timeRange);
      const [sumRes, trendRes, topRes] = await Promise.all([
        reportsApi.getSummary(params),
        reportsApi.getTrends(params),
        reportsApi.getTopItems(params)
      ]);
      setSummary(sumRes.data);
      setTrends(trendRes.data);
      setTopItems(topRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Generate the last 6 months dynamically so that Recharts always has 6 points to draw a beautiful line/curve
  const last6Months = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
    last6Months.push({
      month: monthNames[targetDate.getMonth()],
      revenue: 0,
      expenses: 0
    });
  }

  // Merge actual trend data from database
  let activeTrends = [];
  const hasRealData = trends && trends.length > 0;

  if (hasRealData) {
    activeTrends = last6Months.map(m => {
      const match = trends.find(t => t.month && t.month.substring(0, 3).toLowerCase() === m.month.toLowerCase());
      return {
        month: m.month,
        revenue: match ? (match.revenue || 0) : 0,
        expenses: match ? (match.expenses || 0) : 0
      };
    });
  } else {
    // Zero state instead of fake data
    activeTrends = last6Months.map(m => ({
      month: m.month,
      revenue: 0,
      expenses: 0
    }));
  }

  const hasSummaryData = summary && (summary.revenue > 0 || summary.expenses > 0 || summary.eventCount > 0);
  
  // Prepare data for Expense Breakdown Pie Chart
  const expenseData = [
    { name: 'Material & Purchases', value: Number(summary?.purchases || 0) },
    { name: 'Operational & Labor', value: Number(summary?.operationalExpenses || 0) }
  ].filter(d => d.value > 0);

  if (isLoading) return (
    <div className="space-y-6 animate-pulse pb-10">
      <div className="h-20 bg-white rounded-2xl border border-slate-100" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100" />)}
      </div>
      <div className="h-96 bg-white rounded-2xl border border-slate-100" />
    </div>
  );

  const handleExport = () => {
    if (!summary) return;
    
    let csv = `Business Intelligence Report - ${timeRange}\n\n`;
    csv += `Summary KPIs\n`;
    csv += `Total Revenue,Net Profit,Total Expenses,Events Completed,Pending Collection\n`;
    csv += `${summary.revenue || 0},${summary.profit || 0},${summary.expenses || 0},${summary.eventCount || 0},${summary.pendingCollection || 0}\n\n`;
    
    csv += `Expense Breakdown\n`;
    csv += `Category,Amount (INR)\n`;
    csv += `Material & Purchases,${summary.purchases || 0}\n`;
    csv += `Operational & Labor,${summary.operationalExpenses || 0}\n\n`;

    csv += `Popular Dishes\n`;
    csv += `Item Name,Total Sales (INR),Orders Count\n`;
    if (topItems && topItems.length > 0) {
      topItems.forEach(item => {
        csv += `"${item._id || item.id}",${item.totalSales},${item.count}\n`;
      });
    } else {
      csv += `No data available\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `catering_report_${timeRange}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-0.5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{t("reports.business_intelligence", "Business Intelligence")}</h1>
          <p className="text-xs text-slate-500">{t("reports.reports_subtitle", "Real-time catering performance analytics and financial reports.")}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-9 pr-8 py-2 text-xs font-bold text-slate-650 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl transition-all shadow-sm outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last1Month">Last 1 Month</option>
              <option value="last6Months">Last 6 Months</option>
              <option value="thisYear">This Year</option>
              <option value="allTime">All Time</option>
            </select>
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-lg shadow-primary-500/25 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50 max-md:bg-primary-600 max-md:hover:bg-primary-500 max-md:shadow-primary-500/25"
          >
            <Download className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("reports.export_report", "Export Report")}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPIWidget 
          title={t("reports.total_revenue", "Total Revenue")} 
          value={`${CURRENCY}${(summary?.revenue ?? 0).toLocaleString()}`} 
          subtitle="Lifetime invoiced value" 
          icon={IndianRupee} 
          color="bg-primary-500" 
          trend="14.2%" 
          trendType="up" 
        />
        <KPIWidget 
          title={t("reports.net_profit", "Net Profit")} 
          value={`${CURRENCY}${(summary?.profit ?? 0).toLocaleString()}`} 
          subtitle="Revenue after expenses" 
          icon={TrendingUp} 
          color="bg-emerald-500" 
          trend="8.1%" 
          trendType="up" 
        />
        <KPIWidget 
          title="Events Completed" 
          value={summary?.eventCount ?? 0} 
          subtitle="Total catering contracts" 
          icon={Briefcase} 
          color="bg-amber-500" 
        />
        <KPIWidget 
          title="Pending Collection" 
          value={`${CURRENCY}${(summary?.pendingCollection ?? 0).toLocaleString()}`} 
          subtitle="Balance from invoices" 
          icon={Activity} 
          color="bg-rose-500" 
          trend="2.4%" 
          trendType="down" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue vs Expenses</h3>
              <p className="text-[10px] text-slate-400">Monthly financial performance tracking</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Expenses</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={activeTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-100)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900">Expense Breakdown</h3>
            <p className="text-[10px] text-slate-400">Material purchases vs Operations</p>
          </div>
          
          <div className="h-[200px] w-full relative">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#f59e0b', '#ef4444'][index % 2]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <PieChartIcon size={24} className="text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-400">No expenses recorded</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            {expenseData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#f59e0b', '#ef4444'][index % 2] }} />
                  <span className="text-[11px] font-bold text-slate-600">{entry.name}</span>
                </div>
                <span className="text-[11px] font-black text-slate-900">{CURRENCY}{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900">Popular Dishes</h3>
          <p className="text-[10px] text-slate-400">Top selling items by quantity</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
          {topItems && topItems.length > 0 ? (
            topItems.map((item, index) => (
              <div key={`${item._id || item.id}-${index}`} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 truncate pr-4">{item._id || item.id}</span>
                  <span className="text-[10px] font-black text-slate-900">{CURRENCY}{item.totalSales.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / topItems[0].count) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>{item.count} Orders</span>
                  <span>{Math.round((item.count / topItems[0].count) * 100)}% Pop</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 flex flex-col items-center justify-center">
              <Briefcase size={32} className="text-slate-200 mb-2" />
              <p className="text-sm font-bold text-slate-400">No popular dishes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
