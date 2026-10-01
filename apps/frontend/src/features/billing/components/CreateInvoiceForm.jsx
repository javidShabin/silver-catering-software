import { CURRENCY } from "../../../config/currency";
import React, { useState, useEffect } from "react";
import { FileText, Calendar, User, IndianRupee, Plus, Trash2, Tag, Info, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventApi } from "../../../api/eventApi";
import DatePicker from "../../../components/ui/DatePicker";

const CreateInvoiceForm = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    event: "",
    customer: "",
    items: [{ description: "", quantity: 1, unitPrice: "", total: 0 }],
    tax: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ""
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events-lookup'],
    queryFn: () => eventApi.getLookup()
  });

  const events = eventsData?.data || [];

  const handleEventChange = (eventId) => {
    const selectedEvent = events.find(e => e.id === eventId);
    if (selectedEvent) {
      setFormData({
        ...formData,
        event: eventId,
        customer: selectedEvent.customer?.id || "",
        // Pre-fill item with event title if empty
        items: formData.items[0].description === ""
          ? [{ ...formData.items[0], description: `Catering Service for ${selectedEvent.title}` }]
          : formData.items
      });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = Number(updatedItem.quantity || 0) * Number(updatedItem.unitPrice || 0);
        }
        return updatedItem;
      }
      return item;
    });
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: "", total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const subtotal = formData.items.reduce((acc, item) => acc + item.total, 0);
  const totalAmount = subtotal + Number(formData.tax || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      items: formData.items.map(it => ({
        ...it,
        quantity: Number(it.quantity || 0),
        unitPrice: Number(it.unitPrice || 0),
        total: Number(it.quantity || 0) * Number(it.unitPrice || 0)
      })),
      tax: Number(formData.tax || 0),
      subtotal,
      totalAmount,
      balanceAmount: totalAmount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Linked Event</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all appearance-none"
              value={formData.event}
              onChange={e => handleEventChange(e.target.value)}
              required
            >
              <option value="">Select Event...</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title} ({new Date(e.date).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Due Date</label>
          <div className="relative">
            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Line Items</label>
          <button type="button" onClick={addItem} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <Plus size={12} /> ADD ITEM
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
              <div className="flex-[3] relative">
                <input
                  type="text"
                  placeholder="Item description..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all"
                  value={item.description}
                  onChange={e => updateItem(index, 'description', e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Qty"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all text-center"
                  value={item.quantity}
                  onChange={e => updateItem(index, 'quantity', e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">{CURRENCY}</span>
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all"
                  value={item.unitPrice}
                  onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                disabled={formData.items.length === 1}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 pt-4 border-t border-slate-50">
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Notes / Terms</label>
            <textarea
              rows="3"
              placeholder="Bank details or special terms..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-all"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Subtotal</span>
            <span className="font-bold text-slate-700">{CURRENCY}{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Tax Amount</span>
            <input
              type="number"
              className="w-20 px-2 py-1 bg-white border border-slate-100 rounded text-right font-bold text-slate-700 focus:outline-none focus:border-primary-500"
              value={formData.tax}
              onChange={e => setFormData({ ...formData, tax: e.target.value })}
            />
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-900 uppercase">Grand Total</span>
            <span className="text-lg font-black text-slate-900">{CURRENCY}{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-[2] px-6 py-3 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Generate Invoice"}
        </button>
      </div>
    </form>
  );
};

export default CreateInvoiceForm;
