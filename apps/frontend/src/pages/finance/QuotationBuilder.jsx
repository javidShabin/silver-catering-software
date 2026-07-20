import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Save, Users, CalendarDays, Utensils, Box, UserPlus, FileText, ChevronDown, Check } from "lucide-react";
import api from "../../utils/axios";
import { menuApi } from "../../api/menuApi";
import { inventoryApi } from "../../api/inventoryApi";
import { customerApi } from "../../api/customerApi";
import { packagesApi } from "../../api/packagesApi";
import { CURRENCY } from "../../config/currency";
import SummarySection from "../../features/quotation-builder/components/SummarySection";
import PricingSection from "../../features/quotation-builder/components/PricingSection";
import { toast } from "react-hot-toast";
import DatePicker from "../../components/ui/DatePicker";
import { useTenantStore } from "../../store/useTenantStore";

const QuotationBuilder = ({ onSuccess, onClose, initialData, isViewMode, onOpenPDF }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [menus, setMenus] = useState([]);
  const [packages, setPackages] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [activeTab, setActiveTab] = useState("menus");
  const tenant = useTenantStore(state => state.tenant);

  // Custom Dish Creation State
  const [showCustomDishForm, setShowCustomDishForm] = useState(false);
  const [customDishName, setCustomDishName] = useState("");
  const [customDishCategory, setCustomDishCategory] = useState("Main Course");
  const [customDishDescription, setCustomDishDescription] = useState("");
  const [isCreatingDish, setIsCreatingDish] = useState(false);

  // Custom Customer Creation State
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", address: "", notes: "", isFrequent: false });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const safeJSON = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data === "string") {
      try { return JSON.parse(data); } catch (e) { return fallback; }
    }
    return data;
  };

  const initCustomItems = safeJSON(initialData?.customItems, []);
  
  const [formData, setFormData] = useState({
    customerId: initialData?.customerId || "",
    validUntil: initialData?.validUntil || new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    status: initialData?.status || "draft",
    notes: initialData?.notes || "",
    
    guestCount: initialData?.guestCount !== undefined ? Number(initialData.guestCount) : 50,
    durationInDays: initialData?.durationInDays !== undefined ? Number(initialData.durationInDays) : 1,
    cateringBoysCount: initialData?.cateringBoysCount !== undefined ? Number(initialData.cateringBoysCount) : 0,
    cateringBoyRate: initialData?.cateringBoyRate !== undefined ? Number(initialData.cateringBoyRate) : 0,
    
    menuItems: initialData?.menuItems?.map(m => m.id) || [],
    packageId: initialData?.packageId || "",
    customMenuPrices: safeJSON(initialData?.customMenuPrices, {}),
    customMenuSelections: safeJSON(initialData?.customMenuSelections, {}),
    inventoryAllocations: safeJSON(initialData?.inventoryAllocations, []),
    customItems: initCustomItems.map(item => ({
      ...item,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0
    })),
    
    taxPercent: initialData?.taxPercent !== undefined ? Number(initialData.taxPercent) : (tenant?.taxPercentage ? Number(tenant.taxPercentage) : 0),
    discountAmount: initialData?.discountAmount !== undefined ? Number(initialData.discountAmount) : 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, menuRes, invRes, pkgRes] = await Promise.all([
          customerApi.getLookup(),
          menuApi.getLookup(),
          inventoryApi.getLookup(),
          packagesApi.getAll().catch(() => ({ status: 'error', data: [] }))
        ]);
        
        if (custRes.status === "success") setCustomers(custRes.data || []);
        if (menuRes.status === "success") setMenus(menuRes.data || []);
        if (invRes.status === "success") setInventoryList(invRes.data || []);
        if (pkgRes.status === "success") setPackages(pkgRes.data || []);
      } catch (error) {
        console.error("Error fetching dependencies", error);
      }
    };
    fetchData();
  }, []);

  // ─── Auto Calculation using useMemo (Zero unwanted re-renders) ───────────
  const totals = useMemo(() => {
    let sub = 0;
    const selectedPackage = packages.find(pkg => pkg.id === formData.packageId);
    if (selectedPackage) {
      sub += Number(selectedPackage.pricePerHead || 0) * formData.guestCount * formData.durationInDays;
    }
    
    // 1. Menus
    formData.menuItems.forEach(menuId => {
       const menu = menus.find(m => m.id === menuId);
       if (menu) {
         let price = Number(menu.minPrice);
         let qty = formData.guestCount * formData.durationInDays;
         
         const sel = formData.customMenuSelections?.[menuId];
         if (sel) {
          price = Number(sel.price !== undefined && sel.price !== "" ? sel.price : menu.minPrice);
          if (sel.type === "PER_UNIT") {
             qty = 1;
          }
          if (sel.packageId) {
            price = 0;
            qty = 1;
          }
        } else if (formData.customMenuPrices?.[menuId] !== undefined && formData.customMenuPrices?.[menuId] !== "") {
          price = Number(formData.customMenuPrices[menuId]);
        }
         
         sub += price * qty;
       }
    });
    
    // 2. Inventory
    formData.inventoryAllocations.forEach(alloc => {
       const inv = inventoryList.find(i => i.id === alloc.inventoryId);
       if (inv && inv.rentPerDay) {
          sub += Number(inv.rentPerDay) * Number(alloc.quantity) * formData.durationInDays;
       }
    });
    
    // 3. Staffing
    if (formData.cateringBoysCount > 0 && formData.cateringBoyRate > 0) {
       sub += Number(formData.cateringBoysCount) * Number(formData.cateringBoyRate) * formData.durationInDays;
    }
    
    // 4. Custom Items
    formData.customItems.forEach(item => {
       sub += Number(item.total) || 0;
    });
    
    const tax = sub * (formData.taxPercent / 100);
    const totalAmount = sub + tax - (Number(formData.discountAmount) || 0);
    
    return { subtotal: sub, tax, totalAmount };
  }, [formData, menus, inventoryList, packages]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) return;
    
    setIsCreatingCustomer(true);
    try {
      const res = await customerApi.create({
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        phone: newCustomer.phone.trim(),
        address: newCustomer.address.trim() || undefined,
        notes: newCustomer.notes || "",
        isFrequent: newCustomer.isFrequent
      });

      const createdCustomer = res.data;
      setCustomers(prev => [createdCustomer, ...prev]);
      
      // Auto-select the newly created customer
      setFormData(prev => ({
        ...prev,
        customerId: createdCustomer.id
      }));



      // Reset form
      setNewCustomer({ name: "", email: "", phone: "", address: "", notes: "", isFrequent: false });
      setShowCustomerForm(false);
    } catch (err) {
      console.error("Failed to create customer", err);
      alert("Error creating customer: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingCustomer(false);
    }
  };
  
  const handleCreateCustomDish = async (e) => {
    e.preventDefault();
    if (!customDishName.trim()) return;
    
    setIsCreatingDish(true);
    try {
      const defaultDesc = customDishDescription.trim() || `Custom dish created for quotation.`;
      const res = await menuApi.create({
        name: customDishName.trim(),
        description: defaultDesc,
        category: customDishCategory,
        minPrice: 0,
        maxPrice: 0,
        isAvailable: true
      });

      const newDish = res.data;
      setMenus(prev => [newDish, ...prev]);
      
      // Auto-select the newly created dish
      setFormData(prev => {
        const selectedPkg = prev.packageId ? packages.find(p => p.id === prev.packageId) : null;
        return {
          ...prev,
          menuItems: [...prev.menuItems, newDish.id],
          customMenuSelections: {
            ...prev.customMenuSelections,
            [newDish.id]: { 
              type: "PER_UNIT", 
              price: 0, 
              quantity: 1, 
              unit: "plate",
              ...(selectedPkg ? {
                packageId: selectedPkg.id,
                packageName: selectedPkg.name,
                packagePricePerHead: Number(selectedPkg.pricePerHead || 0)
              } : {})
            }
          }
        };
      });

      // Reset form
      setCustomDishName("");
      setCustomDishDescription("");
      setShowCustomDishForm(false);
    } catch (err) {
      console.error("Failed to create custom dish", err);
      alert("Error creating custom dish: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingDish(false);
    }
  };

  const handleMenuToggle = (menuId) => {
    setFormData(prev => {
      const isSelected = prev.menuItems.includes(menuId);
      if (isSelected) {
        return {
          ...prev,
          menuItems: prev.menuItems.filter(id => id !== menuId)
        };
      }
      
      const selectedPkg = prev.packageId ? packages.find(p => p.id === prev.packageId) : null;
      return {
        ...prev,
        menuItems: [...prev.menuItems, menuId],
        customMenuSelections: {
          ...prev.customMenuSelections,
          ...(selectedPkg ? {
            [menuId]: {
              type: "PER_UNIT", 
              price: 0, 
              quantity: 1, 
              unit: "plate",
              packageId: selectedPkg.id,
              packageName: selectedPkg.name,
              packagePricePerHead: Number(selectedPkg.pricePerHead || 0)
            }
          } : {})
        }
      };
    });
  };

  const handleApplyPackage = (pkgId) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    
    // Add all menu items from the package that aren't already selected
    setFormData(prev => {
      const newCustomPrices = { ...prev.customMenuPrices };
      const newCustomSelections = { ...prev.customMenuSelections };
      const packagePricePerHead = Number(pkg.pricePerHead || 0);
      const packageMenuIds = new Set(pkg.menuItems.map(item => item.id));
      const newMenuIds = prev.menuItems.filter(menuId => {
        const selection = prev.customMenuSelections?.[menuId];
        return !selection?.packageId || packageMenuIds.has(menuId);
      });
      const currentMenuIds = new Set(newMenuIds);

      Object.keys(newCustomSelections).forEach(menuId => {
        if (newCustomSelections[menuId]?.packageId && !packageMenuIds.has(menuId)) {
          delete newCustomSelections[menuId];
          delete newCustomPrices[menuId];
        }
      });

      pkg.menuItems.forEach(item => {
        if (!currentMenuIds.has(item.id)) {
          newMenuIds.push(item.id);
        }
        delete newCustomPrices[item.id];
        newCustomSelections[item.id] = {
          type: "PER_UNIT",
          price: 0,
          quantity: 1,
          unit: "plate",
          packageId: pkg.id,
          packageName: pkg.name,
          packagePricePerHead
        };
      });

      return {
        ...prev,
        packageId: pkg.id,
        menuItems: newMenuIds,
        customMenuPrices: newCustomPrices,
        customMenuSelections: newCustomSelections
      };
    });
  };

  const handleMenuPriceChange = (menuId, price) => {
    setFormData(prev => ({
      ...prev,
      customMenuPrices: { ...prev.customMenuPrices, [menuId]: price }
    }));
  };

  const handleMenuSelectionChange = (menuId, field, value) => {
    setFormData(prev => {
      const current = prev.customMenuSelections?.[menuId] || { type: "PER_UNIT", price: "", quantity: 1, unit: "plate" };
      if (current.packageId) return prev;
      return {
        ...prev,
        customMenuSelections: {
          ...prev.customMenuSelections,
          [menuId]: { ...current, [field]: value }
        }
      };
    });
  };

  const addInventoryAllocation = (inventoryId) => {
    if (!inventoryId) return;
    const inv = inventoryList.find(i => i.id === inventoryId);
    if (!inv) return;
    
    if (formData.inventoryAllocations.some(a => a.inventoryId === inventoryId)) return;

    setFormData(prev => ({
      ...prev,
      inventoryAllocations: [...prev.inventoryAllocations, {
        inventoryId: inv.id,
        name: inv.name,
        quantity: 1,
        unit: inv.unit || 'unit'
      }]
    }));
  };

  const updateInventoryAllocation = (index, qty) => {
    setFormData(prev => {
      const newAllocs = [...prev.inventoryAllocations];
      newAllocs[index].quantity = qty;
      return { ...prev, inventoryAllocations: newAllocs };
    });
  };

  const removeInventoryAllocation = (index) => {
    setFormData(prev => ({
      ...prev,
      inventoryAllocations: prev.inventoryAllocations.filter((_, i) => i !== index)
    }));
  };

  const addCustomItem = () => {
    setFormData(prev => ({
      ...prev,
      customItems: [...prev.customItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const updateCustomItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.customItems];
      const updatedItem = { ...newItems[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
      }
      newItems[index] = updatedItem;
      return { ...prev, customItems: newItems };
    });
  };

  const removeCustomItem = (index) => {
    setFormData(prev => ({
      ...prev,
      customItems: prev.customItems.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }
    setLoading(true);
    try {
      // Append calculated totals to payload before saving
      const payload = {
        ...formData,
        packageId: formData.packageId || null,
        subtotal: totals.subtotal,
        tax: totals.tax,
        totalAmount: totals.totalAmount,
      };

      let response;
      if (initialData?.id) {
        response = await api.patch(`/quotations/${initialData.id}`, payload);
      } else {
        response = await api.post("/quotations", payload);
      }
      if (response.status === 200 || response.status === 201) {
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error saving quotation", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save quotation");
    } finally {
      setLoading(false);
    }
  };

  const selectedPackage = packages.find(pkg => pkg.id === formData.packageId);
  const selectedPackageTotal = selectedPackage
    ? Number(selectedPackage.pricePerHead || 0) * formData.guestCount * formData.durationInDays
    : 0;

  return (
    <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar">
      {/* 1. Header Details (Customer, Dates, Scope) */}
      <fieldset disabled={isViewMode} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Customer</label>
              {!isViewMode && (
                <button 
                  type="button"
                  onClick={() => setShowCustomerForm(true)}
                  className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Plus size={10} strokeWidth={3} /> New
                </button>
              )}
            </div>
            <select 
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              className="w-full h-8 rounded border border-slate-200 px-2 text-xs focus:border-primary-500 focus:ring-1 outline-none bg-white"
            >
              <option value="" disabled>Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Valid Until</label>
            <DatePicker 
              value={formData.validUntil.split('T')[0]}
              onChange={(e) => setFormData({...formData, validUntil: new Date(e.target.value).toISOString()})}
              inputClassName="h-8 py-0 min-h-0 !text-xs !font-normal !rounded !bg-white !border-slate-200 !shadow-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Duration (Days)</label>
            <div className="relative">
              <CalendarDays size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="number" min="1"
                value={formData.durationInDays}
                onChange={(e) => setFormData({...formData, durationInDays: Number(e.target.value) || 1})}
                className="w-full h-8 rounded border border-slate-200 pl-7 pr-2 text-xs focus:border-primary-500 focus:ring-1 outline-none bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Guest Count</label>
            <div className="relative">
              <Users size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="number" min="1"
                value={formData.guestCount}
                onChange={(e) => setFormData({...formData, guestCount: Number(e.target.value) || 1})}
                className="w-full h-8 rounded border border-slate-200 pl-7 pr-2 text-xs focus:border-primary-500 focus:ring-1 outline-none bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Package</label>
            <select 
              className="w-full h-8 rounded border border-indigo-200 bg-indigo-50/50 px-2 text-xs outline-none focus:border-indigo-500 font-semibold text-indigo-700"
              onChange={(e) => { 
                if (e.target.value) handleApplyPackage(e.target.value); 
              }}
              value={formData.packageId || ""}
              disabled={packages.length === 0}
            >
              <option value="" disabled>Select Package</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.menuItems.length} items)</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Custom Customer Form Modal */}
      {showCustomerForm && !isViewMode && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserPlus size={14} className="text-primary-600" />
                Create New Customer
              </h3>
              <button 
                type="button"
                onClick={() => setShowCustomerForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. John Doe"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={newCustomer.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewCustomer({...newCustomer, phone: val});
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Physical Address</label>
                  <input
                    type="text"
                    placeholder="123 Business Ave, Suite 100"
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-primary-500 focus:ring-1 outline-none transition-all bg-white"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  />
                </div>
              </div>

              <div 
                onClick={() => setNewCustomer({...newCustomer, isFrequent: !newCustomer.isFrequent})}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${newCustomer.isFrequent ? 'bg-primary-50 border-primary-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-700">Frequent Customer</p>
                  <p className="text-[10px] text-slate-500">Mark as a VIP for special priority.</p>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${newCustomer.isFrequent ? 'bg-primary-500' : 'bg-slate-300'}`}>
                  <div className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all" style={{ left: newCustomer.isFrequent ? '18px' : '2px' }} />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="h-9 px-4 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCustomer}
                  className="h-9 px-5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isCreatingCustomer ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Check size={14} strokeWidth={3} /> Create Customer</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Builder Tabs */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab("menus")}
            className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${activeTab === "menus" ? "border-primary-500 text-primary-700 bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}
          >
            <Utensils size={13} /> Menus
          </button>
          <button 
            onClick={() => setActiveTab("inventory")}
            className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${activeTab === "inventory" ? "border-primary-500 text-primary-700 bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}
          >
            <Box size={13} /> Inventory & Rentals
          </button>
          <button 
            onClick={() => setActiveTab("staffing")}
            className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${activeTab === "staffing" ? "border-primary-500 text-primary-700 bg-white" : "border-transparent text-slate-500 hover:bg-slate-100"}`}
          >
            <UserPlus size={13} /> Staffing
          </button>
        </div>

        <div className="p-3 bg-white h-[180px] overflow-y-auto custom-scrollbar">
          {/* MENUS TAB */}
          {activeTab === "menus" && (
            <fieldset disabled={isViewMode} className="space-y-3">
              {!isViewMode && (
                <div className="flex gap-2 items-center flex-wrap">
                  <select 
                    className="flex-1 min-w-[150px] h-8 rounded border border-slate-200 px-2 text-xs outline-none focus:border-primary-500"
                    onChange={(e) => { 
                      if (e.target.value) handleMenuToggle(e.target.value); 
                      e.target.value = ""; 
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select menu item...</option>
                    {menus.filter(m => !formData.menuItems.includes(m.id)).map(menu => (
                      <option key={menu.id} value={menu.id}>{menu.name} - {menu.category} ({CURRENCY}{Number(menu.minPrice).toFixed(2)})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCustomDishForm(!showCustomDishForm)}
                    className={`shrink-0 whitespace-nowrap h-8 px-3 text-[10px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors border ${showCustomDishForm ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-primary-50 text-primary-600 border-primary-100 hover:bg-primary-100'}`}
                  >
                    {showCustomDishForm ? "Cancel" : <><Plus size={12} /> New Dish</>}
                  </button>
                </div>
              )}

              {selectedPackage && (
                <div className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-100 rounded text-xs">
                  <div>
                    <p className="font-bold text-indigo-900">{selectedPackage.name}</p>
                    <p className="text-[10px] text-indigo-600">
                      Package: {CURRENCY}{Number(selectedPackage.pricePerHead || 0).toFixed(2)} / pax
                    </p>
                  </div>
                  <div className="text-right font-black text-indigo-900">
                    {CURRENCY}{selectedPackageTotal.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Custom Dish Form Modal */}
              {showCustomDishForm && !isViewMode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Utensils size={14} className="text-primary-600" />
                        Create New Dish
                      </h3>
                      <button 
                        type="button"
                        onClick={() => setShowCustomDishForm(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
                      >
                        &times;
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateCustomDish} className="p-4 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dish Name</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. Special Malabari Biriyani"
                          className="w-full h-9 rounded border border-slate-200 px-3 text-xs outline-none focus:border-primary-500 bg-white"
                          value={customDishName}
                          onChange={(e) => setCustomDishName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                        <div className="relative">
                          <select
                            className="w-full h-9 rounded border border-slate-200 pl-3 pr-8 text-xs outline-none focus:border-primary-500 bg-white appearance-none"
                            value={customDishCategory}
                            onChange={(e) => setCustomDishCategory(e.target.value)}
                          >
                            <option value="Starters">Starter</option>
                            <option value="Main Course">Main Course</option>
                            <option value="Desserts">Dessert</option>
                            <option value="Beverages">Beverage</option>
                            <option value="Snacks">Snacks</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="Brief details or ingredients..."
                          className="w-full h-9 rounded border border-slate-200 px-3 text-xs outline-none focus:border-primary-500 bg-white"
                          value={customDishDescription}
                          onChange={(e) => setCustomDishDescription(e.target.value)}
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCustomDishForm(false)}
                          className="h-9 px-4 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded transition-colors border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingDish}
                          className="h-9 px-5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isCreatingDish ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <><Check size={14} strokeWidth={3} /> Create Dish</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {formData.menuItems.length > 0 ? (
                <div className="space-y-2 max-h-[165px] overflow-y-auto pr-1 custom-scrollbar">
                  {formData.menuItems.map((menuId) => {
                    const menu = menus.find(m => m.id === menuId);
                    if (!menu) return null;
                    
                    const sel = formData.customMenuSelections?.[menuId];
                    const selType = sel?.type || "PER_UNIT";
                    const isPerUnit = selType === "PER_UNIT";
                    const isPackageItem = Boolean(sel?.packageId);
                    
                    let price = menu.minPrice;
                    if (sel && sel.price !== undefined && sel.price !== "") price = sel.price;
                    else if (formData.customMenuPrices?.[menuId] !== undefined && formData.customMenuPrices?.[menuId] !== "") price = formData.customMenuPrices[menuId];
                    if (isPackageItem) price = 0;
                    
                    const qty = isPackageItem || isPerUnit ? 1 : (formData.guestCount * formData.durationInDays);
                    const totalCost = Number(price) * Number(qty);

                    return (
                      <div key={menuId} className="flex flex-col gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{menu.name}</p>
                            <p className="text-[10px] text-slate-500">{menu.category}</p>
                          </div>
                          {isPackageItem ? (
                            <div className="px-2 py-1 text-[9px] font-bold rounded bg-indigo-100 text-indigo-700">
                              Package
                            </div>
                          ) : (
                            <div className="flex items-center bg-slate-200/50 rounded p-0.5">
                              <button
                                onClick={() => handleMenuSelectionChange(menuId, "type", "PER_HEAD")}
                                className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${!isPerUnit ? "bg-white shadow-sm text-primary-700" : "text-slate-500 hover:text-slate-700"}`}
                              >
                                Per Head
                              </button>
                              <button
                                onClick={() => handleMenuSelectionChange(menuId, "type", "PER_UNIT")}
                                className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${isPerUnit ? "bg-white shadow-sm text-primary-700" : "text-slate-500 hover:text-slate-700"}`}
                              >
                                Custom Qty
                              </button>
                            </div>
                          )}
                          {!isViewMode && (
                            <button onClick={() => handleMenuToggle(menuId)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-2">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        
                        {!isPackageItem && (
                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400">{isPerUnit ? "TOTAL PRICE:" : "PRICE:"}</label>
                                <div className="relative flex items-center">
                                  <span className="absolute left-2 text-slate-400 font-bold text-[10px]">{CURRENCY}</span>
                                  <input 
                                    type="number" min="0"
                                    value={sel?.price !== undefined ? sel.price : (formData.customMenuPrices?.[menuId] !== undefined ? formData.customMenuPrices[menuId] : menu.minPrice)}
                                    onChange={(e) => handleMenuSelectionChange(menuId, "price", e.target.value)}
                                    className="w-16 h-6 rounded border border-slate-200 pl-5 pr-1 text-right text-xs outline-none focus:border-primary-500 bg-white"
                                  />
                                </div>
                              </div>
                              
                              {isPerUnit && (
                                <>
                                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                                    <label className="text-[9px] font-bold text-slate-400">QTY:</label>
                                    <input 
                                      type="number" min="1"
                                      value={sel?.quantity || 1}
                                      onChange={(e) => handleMenuSelectionChange(menuId, "quantity", e.target.value)}
                                      className="w-12 h-6 rounded border border-slate-200 px-1 text-center text-xs outline-none focus:border-primary-500 bg-white"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                                    <label className="text-[9px] font-bold text-slate-400">UNIT:</label>
                                    <select
                                      value={sel?.unit || "plate"}
                                      onChange={(e) => handleMenuSelectionChange(menuId, "unit", e.target.value)}
                                      className="h-6 rounded border border-slate-200 px-1 text-xs outline-none focus:border-primary-500 bg-white font-semibold"
                                    >
                                      <option value="plate">plate</option>
                                      <option value="pcs">pcs</option>
                                      <option value="kg">kg</option>
                                      <option value="liter">liter</option>
                                      <option value="unit">unit</option>
                                    </select>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="text-right font-bold text-slate-800">
                              {CURRENCY}{totalCost.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-4">No menus selected.</p>
              )}
            </fieldset>
          )}

          {/* INVENTORY TAB */}
          {activeTab === "inventory" && (
            <fieldset disabled={isViewMode} className="space-y-3">
              {!isViewMode && (
                <div className="flex gap-2">
                  <select 
                    className="flex-1 h-8 rounded border border-slate-200 px-2 text-xs outline-none focus:border-primary-500"
                    onChange={(e) => { addInventoryAllocation(e.target.value); e.target.value = ""; }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select inventory to allocate...</option>
                    {inventoryList.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} {Number(inv.rentPerDay) > 0 ? `(${CURRENCY}${Number(inv.rentPerDay).toFixed(2)}/day)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.inventoryAllocations.length > 0 ? (
                <div className="space-y-2">
                  {formData.inventoryAllocations.map((alloc, idx) => {
                    const inv = inventoryList.find(i => i.id === alloc.inventoryId);
                    const costPerDay = Number(inv?.rentPerDay || 0);
                    const totalCost = costPerDay * Number(alloc.quantity) * formData.durationInDays;

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{alloc.name}</p>
                          <p className="text-[10px] text-slate-500">{CURRENCY}{costPerDay.toFixed(2)} / day</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[9px] font-bold text-slate-400">QTY:</label>
                          <input 
                            type="number" min="1"
                            value={alloc.quantity}
                            onChange={(e) => updateInventoryAllocation(idx, Number(e.target.value) || 1)}
                            className="w-12 h-6 rounded border border-slate-200 text-center text-xs outline-none focus:border-primary-500"
                          />
                        </div>
                        <div className="w-16 text-right font-bold text-slate-800">
                          {CURRENCY}{totalCost.toFixed(2)}
                        </div>
                        {!isViewMode && (
                          <button onClick={() => removeInventoryAllocation(idx)} className="p-1 text-slate-400 hover:text-rose-500">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic text-center py-4">No inventory/rentals added.</p>
              )}
            </fieldset>
          )}

          {/* STAFFING TAB */}
          {activeTab === "staffing" && (
            <fieldset disabled={isViewMode} className="max-w-md space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Number of Catering Boys</label>
                  <input 
                    type="number" min="0"
                    value={formData.cateringBoysCount}
                    onChange={(e) => setFormData({...formData, cateringBoysCount: Number(e.target.value) || 0})}
                    className="w-full h-8 rounded border border-slate-200 px-2 text-xs outline-none focus:border-primary-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Rate per Boy (Per Day)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{CURRENCY}</span>
                    <input 
                      type="number" min="0"
                      value={formData.cateringBoyRate}
                      onChange={(e) => setFormData({...formData, cateringBoyRate: Number(e.target.value) || 0})}
                      className="w-full h-8 rounded border border-slate-200 pl-7 pr-2 text-xs outline-none focus:border-primary-500 bg-white"
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-600">Total Staffing Cost:</span>
                  <span className="text-sm font-black text-slate-900">
                    {CURRENCY}{(formData.cateringBoysCount * formData.cateringBoyRate * formData.durationInDays).toFixed(2)}
                  </span>
                </div>
              </div>
            </fieldset>
          )}

        </div>
      </div>

      {/* 3. Bottom Totals Section */}
      <div className="flex flex-col lg:flex-row justify-between gap-3">
        <SummarySection 
          isViewMode={isViewMode}
          notes={formData.notes}
          onNotesChange={(notes) => setFormData({...formData, notes})}
        />
        <PricingSection
          isViewMode={isViewMode}
          taxPercent={formData.taxPercent}
          discountAmount={formData.discountAmount}
          totals={totals}
          onTaxPercentChange={(taxPercent) => setFormData({...formData, taxPercent})}
          onDiscountAmountChange={(discountAmount) => setFormData({...formData, discountAmount})}
        />
      </div>

      {/* 4. Form Actions */}
      <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 pb-2">
        {isViewMode ? (
          <>
            <button onClick={onOpenPDF} className="px-4 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors border border-primary-600 flex items-center">
              <FileText size={14} className="mr-1.5" /> Generate PDF
            </button>
            <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors border border-slate-200">
              Close
            </button>
          </>
        ) : (
          <>
            {onClose && (
              <button onClick={onClose} disabled={loading} className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors border border-slate-200">
                Cancel
              </button>
            )}
            <button onClick={handleSave} disabled={loading} className="px-5 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors shadow-lg shadow-primary-500/20 flex items-center">
              {loading ? "Saving..." : <><Save size={14} className="mr-1.5" />Save Quotation</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuotationBuilder;
