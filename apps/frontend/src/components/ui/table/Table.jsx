import React from "react";

export const TableContainer = ({ children, className = "" }) => (
  <div className={`w-full overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm ${className}`}>
    <div className="overflow-x-auto">
      {children}
    </div>
  </div>
);

export const Table = ({ children, className = "" }) => (
  <table className={`w-full text-left border-collapse text-sm text-slate-600 ${className}`}>
    {children}
  </table>
);

export const TableHeader = ({ children, className = "" }) => (
  <thead className={`bg-slate-50/50 border-b border-slate-200/60 text-xs uppercase tracking-wider text-slate-500 font-medium ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = "" }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = "", onClick }) => (
  <tr 
    onClick={onClick}
    className={`group transition-colors duration-200 hover:bg-slate-50/80 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = "" }) => (
  <th className={`px-5 py-3.5 whitespace-nowrap ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = "" }) => (
  <td className={`px-5 py-3 whitespace-nowrap align-middle ${className}`}>
    {children}
  </td>
);
