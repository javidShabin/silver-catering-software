import React, { useState, useEffect } from "react";
import { Truck, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import PremiumModal from "../../../components/ui/PremiumModal";
import { eventApi } from "../../../api/eventApi";
import { CURRENCY } from "../../../config/currency";

const LogisticsReturnModal = ({ isOpen, onClose, event, setToast }) => {
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [returnsData, setReturnsData] = useState({});
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    if (isOpen && event?.id) {
      fetchLogistics();
    }
  }, [isOpen, event?.id]);

  const fetchLogistics = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getLogistics(event.id);
      setLogistics(res.data || []);
      
      // Initialize returns data
      const initial = {};
      (res.data || []).forEach(item => {
        initial[item.id] = {
          returnedQuantity: Number(item.returnedQuantity) || 0,
          damagedQuantity: Number(item.damagedQuantity) || 0,
          lostQuantity: Number(item.lostQuantity) || 0,
          notes: item.returnNotes || "",
          addDamageToBill: false,
          damageCost: item.inventory.rentPerDay || 0
        };
      });
      setReturnsData(initial);
    } catch (err) {
      setToast({ message: "Failed to fetch logistics data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id, field, value) => {
    setReturnsData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleProcessAllReturns = async () => {
    const returnsToProcess = [];
    
    Object.keys(returnsData).forEach(id => {
      const data = returnsData[id];
      const retQty = Number(data.returnedQuantity) || 0;
      const damQty = Number(data.damagedQuantity) || 0;
      const lostQty = Number(data.lostQuantity) || 0;
      
      if (retQty > 0 || damQty > 0 || lostQty > 0) {
        returnsToProcess.push({
          allocationId: id,
          returnedQuantity: retQty,
          damagedQuantity: damQty,
          lostQuantity: lostQty,
          notes: data.notes,
          addDamageToBill: data.addDamageToBill,
          damageCost: Number(data.damageCost) || 0
        });
      }
    });

    if (returnsToProcess.length === 0) {
      setToast({ message: "Please enter return quantities for at least one item", type: "error" });
      return;
    }

    try {
      setSaving(true);
      await eventApi.processLogisticsReturn(event.id, { returns: returnsToProcess });
      setToast({ message: "Returns processed successfully", type: "success" });
      setEditingItemId(null);
      fetchLogistics(); // Refresh
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to process returns", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      title="Equipment & Logistics Returns"
      description="Track and manage the return of equipment taken to the event."
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : logistics.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No equipment assigned to this event.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logistics.map((item) => {
              const returnedSoFar = Number(item.returnedQuantity || 0) + Number(item.damagedQuantity || 0) + Number(item.lostQuantity || 0);
              const remaining = Number(item.quantity) - returnedSoFar;
              const isFullyReturned = item.status === "Returned" || remaining <= 0;
              const formData = returnsData[item.id];

              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        {item.inventory.name}
                        {isFullyReturned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Total Taken: {item.quantity} {item.unit} | Returned: {returnedSoFar}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isFullyReturned ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        item.status === 'Partially Returned' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {item.status}
                      </span>
                      {isFullyReturned && editingItemId !== item.id && (
                        <button 
                          onClick={() => setEditingItemId(item.id)}
                          className="text-[9px] px-2 py-0.5 rounded-md font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Return Form (Visible if not fully returned or if currently editing) */}
                  {(!isFullyReturned || editingItemId === item.id) && formData && (
                    <div className="p-2.5 space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-bold text-slate-700 ml-1">Good</label>
                          <input 
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={formData.returnedQuantity}
                            onChange={(e) => handleInputChange(item.id, 'returnedQuantity', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-bold text-slate-700 ml-1 text-amber-600">Damaged</label>
                          <input 
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={formData.damagedQuantity}
                            onChange={(e) => handleInputChange(item.id, 'damagedQuantity', e.target.value)}
                            className="w-full px-2 py-1 bg-amber-50/30 border border-amber-200/50 rounded-md text-[11px]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] uppercase font-bold text-slate-700 ml-1 text-rose-600">Lost</label>
                          <input 
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={formData.lostQuantity}
                            onChange={(e) => handleInputChange(item.id, 'lostQuantity', e.target.value)}
                            className="w-full px-2 py-1 bg-rose-50/30 border border-rose-200/50 rounded-md text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2 mt-1">
                        <input 
                          type="text"
                          placeholder="Notes (Optional)"
                          value={formData.notes}
                          onChange={(e) => handleInputChange(item.id, 'notes', e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px]"
                        />
                        
                        {/* Damage/Loss billing options */}
                        {(Number(formData.damagedQuantity) > 0 || Number(formData.lostQuantity) > 0) && (
                          <div className="bg-orange-50 px-2 py-1 rounded-md border border-orange-100 flex items-center gap-1.5 shrink-0">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={formData.addDamageToBill}
                                onChange={(e) => handleInputChange(item.id, 'addDamageToBill', e.target.checked)}
                                className="w-3 h-3 rounded text-orange-600 border-orange-300 focus:ring-orange-500"
                              />
                              <span className="text-[10px] font-bold text-orange-800">Bill Customer</span>
                            </label>
                            {formData.addDamageToBill && (
                              <div className="flex items-center gap-1 ml-1 border-l border-orange-200 pl-1.5">
                                <span className="text-[9px] font-medium text-orange-700">Amt:</span>
                                <input 
                                  type="number"
                                  value={formData.damageCost}
                                  onChange={(e) => handleInputChange(item.id, 'damageCost', e.target.value)}
                                  className="w-14 px-1 py-0.5 bg-white border border-orange-200 rounded text-[10px] font-bold text-orange-900"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {logistics.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleProcessAllReturns}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            Save All Returns
          </button>
        </div>
      )}
    </PremiumModal>
  );
};

export default LogisticsReturnModal;
