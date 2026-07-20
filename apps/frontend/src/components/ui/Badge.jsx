import React from "react";

const statusStyles = {
  pending: "bg-alert-50 text-alert-500 border-alert-100/50",
  confirmed: "bg-primary-50 text-primary-600 border-primary-100/50",
  "in-progress": "bg-calendar-50 text-calendar-500 border-calendar-100/50",
  completed: "bg-success-50 text-success-500 border-success-100/50",
  cancelled: "bg-slate-50 text-slate-400 border-slate-200/50",
};

const Badge = React.memo(({ status }) => {
  const normalizedStatus = status?.toLowerCase() || "pending";
  const style = statusStyles[normalizedStatus] || statusStyles.pending;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${style}`}
    >
      {normalizedStatus.replace("-", " ")}
    </span>
  );
});

export default Badge;
