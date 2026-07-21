import { CURRENCY } from "../../../config/currency";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supplierApi } from "../../../api/supplierApi";
import DatePicker from "../../../components/ui/DatePicker";

const CreatePurchaseForm = ({ onSubmit, onCancel, isLoading }) => {
  // Meta State
  const [supplier, setSupplier] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  // Queries
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-lookup'],
    queryFn: () => supplierApi.getLookup()
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events-lookup'],
    queryFn: () => import("../../../utils/axios").then(m => m.default.get('/events?status=all'))
  });

  const suppliers = suppliersData?.data || [];
  const events = eventsData?.data?.data || [];
  const [eventId, setEventId] = useState("");

  // Items State
  const [purchaseItems, setPurchaseItems] = useState([
    { id: Date.now(), itemName: "", quantityPurchased: "", unit: "kg", unitCost: "", totalAmount: 0 }
  ]);

  const handleItemChange = (id, field, value) => {
    setPurchaseItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };

      if (field === 'quantityPurchased' || field === 'unitCost') {
        const total = (parseFloat(updated.quantityPurchased) || 0) * (parseFloat(updated.unitCost) || 0);
        updated.totalAmount = parseFloat(total.toFixed(2));
      }
      return updated;
    }));
  };

  const addItem = () => {
    setPurchaseItems(prev => [...prev, { id: Date.now(), itemName: "", quantityPurchased: "", unit: "kg", unitCost: "", totalAmount: 0 }]);
  };

  const removeItem = (id) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const totalInvestment = purchaseItems.reduce((sum, item) => sum + item.totalAmount, 0);
  
  // Validation
  const isValid = supplier !== "" && purchaseItems.every(i => i.itemName && parseFloat(i.quantityPurchased) > 0 && parseFloat(i.unitCost) >= 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    const payload = purchaseItems.map(item => ({
      itemName: `${item.itemName.trim()} (${item.unit})`,
      supplier,
      quantityPurchased: Number(item.quantityPurchased),
      unitCost: Number(item.unitCost),
      totalAmount: Number(item.quantityPurchased) * Number(item.unitCost),
      paymentStatus,
      eventId: eventId || undefined,
      purchaseDate: purchaseDate && purchaseDate.trim() !== "" ? new Date(purchaseDate).toISOString() : undefined
    }));

    onSubmit(payload);
  };

  const inputClasses = "w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white";
  const labelClasses = "text-xs font-semibold text-slate-700 block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-2">
      
      {/* Purchase Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Supplier */}
        <div>
          <label className={labelClasses}>Select Vendor</label>
          <select
            className={inputClasses}
            value={supplier}
            onChange={e => setSupplier(e.target.value)}
            required
          >
            <option value="" disabled>-- Select Vendor --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Event Selection */}
        <div>
          <label className={labelClasses}>Select Event (Optional)</label>
          <select
            className={inputClasses}
            value={eventId}
            onChange={e => setEventId(e.target.value)}
          >
            <option value="">-- No Event / General --</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className={labelClasses}>Purchase Date</label>
          <input
            type="date"
            className={inputClasses}
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
            required
          />
        </div>

        {/* Payment Status */}
        <div>
          <label className={labelClasses}>Payment Status</label>
          <select
            className={inputClasses}
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value)}
            required
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100 my-2"></div>

      {/* Items Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Purchase Items</h3>
          {totalInvestment > 0 && (
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
              Total: {CURRENCY}{totalInvestment.toFixed(2)}
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-[105px] overflow-y-auto custom-scrollbar pr-1">
          {purchaseItems.map((item, index) => (
            <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg relative group">
              {purchaseItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-rose-200 text-slate-400 hover:text-rose-500 hover:border-rose-300 rounded-full flex items-center justify-center transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                >
                  <Trash2 size={12} />
                </button>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className={labelClasses}>Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rice"
                    className={inputClasses}
                    value={item.itemName}
                    onChange={e => handleItemChange(item.id, 'itemName', e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClasses}>Quantity</label>
                  <div className="flex">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="flex-1 min-w-0 h-9 rounded-l-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                      value={item.quantityPurchased}
                      onChange={e => handleItemChange(item.id, 'quantityPurchased', e.target.value)}
                      required
                    />
                    <select
                      className="w-[60px] flex-shrink-0 h-9 rounded-r-lg border border-l-0 border-slate-200 px-1 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-slate-50 cursor-pointer"
                      value={item.unit}
                      onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
                    >
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                      <option value="ltr">ltr</option>
                      <option value="box">box</option>
                      <option value="pkt">pkt</option>
                      <option value="gm">gm</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-4">
                  <label className={labelClasses}>Unit Cost ({CURRENCY})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={inputClasses}
                    value={item.unitCost}
                    onChange={e => handleItemChange(item.id, 'unitCost', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="w-full h-9 border-2 border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 flex items-center justify-center gap-1 transition-all"
        >
          <Plus size={14} /> Add Another Item
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Save Purchase"
          )}
        </button>
      </div>
    </form>
  );
};

export default CreatePurchaseForm;
