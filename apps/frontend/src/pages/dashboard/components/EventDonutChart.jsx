import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100/60 p-2.5 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
        <span className="text-[11px] font-medium text-slate-600">{payload[0].name}</span>
        <span className="text-[12px] font-bold text-slate-800 ml-1">
          {payload[0].name === "No Events" ? 0 : payload[0].value}
        </span>
      </div>
    );
  }
  return null;
};

const EventDonutChart = ({ completed = 0, active = 0, pending = 0 }) => {
  const { t } = useTranslation();
  const total = completed + active + pending;
  
  const chartData = [
    { name: "Completed", value: completed, color: "#2dd4bf" },
    { name: "Active", value: active, color: "#8bb8f8" },
    { name: "Pending", value: pending, color: "#a78bfa" },
  ].filter(item => item.value > 0);

  // If no data, show empty state in chart
  const dataToRender = chartData.length > 0 ? chartData : [{ name: "No Events", value: 1, color: "var(--color-slate-100)" }];

  return (
    <div className="card-premium p-6 max-md:p-4 h-[320px] max-md:h-[260px] flex flex-col relative bg-white border border-slate-200/60 shadow-sm">
      <div className="mb-2">
        <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight">{t("dashboard.event_status", "Event Distribution")}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Status breakdown</p>
      </div>
      
      <div className="flex-1 w-full h-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataToRender}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {dataToRender.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
          <span className="text-[20px] font-bold text-slate-800 leading-none">{total}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Total</span>
        </div>
      </div>
      
      {/* Custom Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {(chartData.length > 0 ? chartData : [{ name: "No Data", color: "var(--color-slate-100)" }]).map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-[10px] font-medium text-slate-500">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDonutChart;
