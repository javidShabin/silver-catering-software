import { useState } from "react";
import { Plus, Trash2, Edit2, TrendingDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import PremiumModal from "../../components/ui/PremiumModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Input from "../../components/ui/Input";
import DatePicker from "../../components/ui/DatePicker";
import api from "../../utils/axios";
import { useTranslation } from "react-i18next";
import { eventApi } from "../../api/eventApi";
import { CURRENCY } from "../../config/currency";

const ExpensesPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  
  const [cursor, setCursor] = useState(null);
  const [cursorsStack, setCursorsStack] = useState([]);
  const hasPreviousPage = cursorsStack.length > 0;
  
  const [formData, setFormData] = useState({
    id: null,
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "wage",
    eventId: ""
  });

  const categories = [
    { value: "wage", label: "Salary / Wages" },
    { value: "fuel", label: "Transport & Logistics" },
    { value: "marketing", label: "Marketing" },
    { value: "maintenance", label: "Maintenance & Repairs" },
    { value: "utilities", label: "Utilities" },
    { value: "vendor", label: "Vendor" },
    { value: "other", label: "Other" }
  ];

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', { category: filterCategory, cursor }],
    queryFn: async () => {
      const params = {};
      if (cursor) params.cursor = cursor;
      if (filterCategory !== "all") params.category = filterCategory;
      const res = await api.get("/expenses", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events-lookup'],
    queryFn: () => eventApi.getLookup()
  });

  const expenses = expensesData?.status === "success" ? expensesData.data.expenses : [];
  const nextCursor = expensesData?.nextCursor || null;
  const hasNextPage = !!nextCursor;
  const loading = expensesLoading;
  const events = eventsData?.status === "success" ? (Array.isArray(eventsData.data) ? eventsData.data : []) : [];

  const handleNextPage = () => {
    if (hasNextPage) {
      setCursorsStack([...cursorsStack, cursor]);
      setCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      const newStack = [...cursorsStack];
      const previousCursor = newStack.pop();
      setCursorsStack(newStack);
      setCursor(previousCursor);
    }
  };

  const handleOpenNew = () => {
    setFormData({
      id: null,
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      category: "wage",
      eventId: ""
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setFormData({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category,
      eventId: expense.eventId || ""
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        await api.patch(`/expenses/${payload.id}`, payload);
      } else {
        await api.post("/expenses", payload);
      }
    },
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const handleDeleteClick = (id) => {
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete);
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleSave = () => {
    const payload = { 
      ...formData, 
      amount: parseFloat(formData.amount),
      date: formData.date ? new Date(formData.date).toISOString() : undefined
    };
    if (!payload.eventId) delete payload.eventId;
    saveMutation.mutate(payload);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 space-y-4 pb-24 pt-4">
      {/* Header section with integrated controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:px-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{t("expenses.operational_expenses", "Operational Expenses")}</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{t("expenses.expenses_subtitle", "Track salaries, transport, and other business expenses.")}</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            value={filterCategory}
            onChange={e => {
              setFilterCategory(e.target.value);
              setCursor(null);
              setCursorsStack([]);
            }}
            className="w-full sm:w-40 h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all cursor-pointer"
          >
            <option value="all">{t("expenses.all_categories", "All Categories")}</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button 
            onClick={handleOpenNew}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center px-4 py-2 rounded-lg font-bold text-xs transition-colors shrink-0 cursor-pointer max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:z-50"
          >
            <Plus className="max-md:mr-0 mr-1.5 max-md:w-6 max-md:h-6" size={14} />
            <span className="max-md:hidden">{t("expenses.log_expense", "Log Expense")}</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Event (Optional)</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-500 text-sm">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-500 flex flex-col items-center justify-center gap-1 w-full">
                     <p className="text-sm font-bold text-slate-700">No expenses found</p>
                     <p className="text-xs font-medium">Adjust your filters or add a new expense.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-600">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900 text-sm">{expense.description}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {categories.find(c => c.value === expense.category)?.label || expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {expense.event ? (
                        <span className="text-primary-600 font-bold text-xs hover:underline cursor-pointer">{expense.event.title}</span>
                      ) : (
                        <span className="text-slate-300 font-bold">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1 text-sm">
                        {CURRENCY}{Number(expense.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(expense)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(expense.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">No expenses found.</div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{expense.description}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div className="font-bold text-slate-900 flex items-center text-sm shrink-0">
                    {CURRENCY}{Number(expense.amount).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                      {categories.find(c => c.value === expense.category)?.label || expense.category}
                    </span>
                    {expense.event && (
                      <span className="text-[10px] text-primary-600 font-bold truncate max-w-[120px]">{expense.event.title}</span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button 
                      onClick={() => handleOpenEdit(expense)}
                      className="p-1.5 text-slate-500 hover:text-primary-700 bg-slate-50 rounded-md transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 bg-slate-50 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-500">
            Showing latest expenses
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm ${
                hasPreviousPage 
                  ? 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300' 
                  : 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-70 border border-transparent'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm ${
                hasNextPage 
                  ? 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300' 
                  : 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-70 border border-transparent'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Expense" : "Log Expense"}
        description="Record an operational expense."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 mt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <input 
                type="text"
                placeholder="e.g., Monthly Rent"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Amount</label>
              <input 
                type="number"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all cursor-pointer bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Link to Event (Optional)</label>
            <select 
              value={formData.eventId}
              onChange={(e) => setFormData({...formData, eventId: e.target.value})}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all cursor-pointer bg-white"
            >
              <option value="">-- No Event --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">If this expense was incurred specifically for a catering event, link it here.</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer"
            >
              {isEditing ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </div>
      </PremiumModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setExpenseToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default ExpensesPage;
