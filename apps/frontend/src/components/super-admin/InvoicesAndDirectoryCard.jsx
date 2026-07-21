import React from "react";
import { Receipt, Users, XCircle, Key } from "lucide-react";

const InvoicesAndDirectoryCard = ({
  tenant,
  tenantInvoices,
  rightActiveTab,
  setRightActiveTab,
  isTrial,
  onGenerateInvoiceClick,
  onViewInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col h-full">
      
      {/* Header with Switcher tabs */}
      <div className="px-4.5 py-3 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        
        {/* Tab options selectors */}
        <div className="flex bg-slate-200/60 p-0.5 rounded-lg w-fit">
          <button
            onClick={() => setRightActiveTab("invoices")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              rightActiveTab === "invoices"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt size={12} /> Invoices & Billing
          </button>
          <button
            onClick={() => setRightActiveTab("users")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              rightActiveTab === "users"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users size={12} /> Team Directory ({tenant.users?.length || 0})
          </button>
        </div>

        {/* Extra header actions contextually */}
        {rightActiveTab === "invoices" && !isTrial && (
          <button
            onClick={onGenerateInvoiceClick}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm self-end sm:self-center cursor-pointer"
          >
            + Generate Invoice
          </button>
        )}
      </div>

      {/* Tab Body Contents */}
      <div className="flex-1 overflow-x-auto">
        
        {/* INVOICES TAB */}
        {rightActiveTab === "invoices" && (
          <>
            {isTrial ? (
              <div className="p-10 text-center bg-amber-50/10 flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
                  <XCircle className="h-5 w-5 text-amber-600 animate-pulse" />
                </div>
                <p className="font-bold text-slate-800 text-xs">Subscription Blocked</p>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Subscription invoice generation is completely disabled during the company's active 7-day trial period.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider bg-slate-50/20">
                    <th className="px-4.5 py-3">Invoice No</th>
                    <th className="px-4.5 py-3">Billing Period</th>
                    <th className="px-4.5 py-3">Due Date</th>
                    <th className="px-4.5 py-3">Total Due</th>
                    <th className="px-4.5 py-3">Status</th>
                    <th className="px-4.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {tenantInvoices?.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4.5 py-2.5 font-bold text-slate-900">
                        {inv.invoiceNumber}
                        <span className="block text-[9px] text-slate-400 font-medium mt-0.5">
                          Billed: {new Date(inv.billingDate).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4.5 py-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold bg-primary-50 text-primary-755 uppercase border border-primary-100">
                          {inv.period}
                        </span>
                      </td>
                      <td className="px-4.5 py-2.5 font-semibold text-slate-650">
                        {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4.5 py-2.5 font-extrabold text-slate-900">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4.5 py-2.5">
                        <select
                          value={inv.status}
                          onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value)}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer ${
                            inv.status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
                            inv.status === "overdue" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="px-4.5 py-2.5 text-right space-x-2.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="text-xs text-primary-650 hover:text-primary-800 font-bold hover:underline cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="text-xs text-red-650 hover:text-red-800 font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!tenantInvoices || tenantInvoices.length === 0) && (
                    <tr>
                      <td colSpan={6}>
                        <div className="p-12 text-center text-slate-400 font-medium italic">
                          <Receipt size={28} className="mx-auto text-slate-300 mb-1.5" />
                          No subscription invoices generated yet.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* TEAM DIRECTORY TAB */}
        {rightActiveTab === "users" && (
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wider bg-slate-50/20">
                <th className="px-4.5 py-3">User Details</th>
                <th className="px-4.5 py-3">Security Role</th>
                <th className="px-4.5 py-3">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenant.users?.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4.5 py-2.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-655 flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4.5 py-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider border border-slate-200">
                      <Key size={9} className="text-slate-400" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4.5 py-2.5">
                    {user.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/50">
                        Offline
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!tenant.users || tenant.users.length === 0) && (
                <tr>
                  <td colSpan={3}>
                    <div className="p-12 text-center text-slate-400 font-medium italic">
                      <Users size={28} className="mx-auto text-slate-300 mb-1.5" />
                      No users found for this company.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
};

export default InvoicesAndDirectoryCard;
