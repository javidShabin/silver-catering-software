import { CURRENCY } from "../../../config/currency";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 rounded-xl shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-[14px] font-black text-slate-900">
          <span className="text-primary-500 mr-1 font-bold">{CURRENCY}</span>
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data = [] }) => {
  const { t } = useTranslation();
  const chartData = data.length > 0 ? data : [
    { name: "Jan", revenue: 0 },
    { name: "Feb", revenue: 0 },
    { name: "Mar", revenue: 0 },
    { name: "Apr", revenue: 0 },
    { name: "May", revenue: 0 },
    { name: "Jun", revenue: 0 },
  ];

  return (
    <div className="card-premium p-6 max-md:p-4 h-[320px] max-md:h-[260px] flex flex-col bg-white border border-slate-200/60 shadow-sm">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{t("dashboard.monthly_revenue", "Monthly Revenue")}</h3>
        <p className="text-[11px] text-slate-500 mt-1">Monthly performance overview</p>
      </div>
      
      <div className="flex-1 w-full h-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-100)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--color-slate-500)", fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--color-slate-500)", fontWeight: 500 }}
              tickFormatter={(value) => `${CURRENCY}${value / 1000}k`}
              dx={-10}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'var(--color-slate-200)', strokeWidth: 1, strokeDasharray: '4 4' }} 
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f97316" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: "#ea580c" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
