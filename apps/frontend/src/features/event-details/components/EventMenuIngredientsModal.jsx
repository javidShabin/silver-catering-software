import React, { useState, useEffect } from "react";
import PremiumModal from "../../../components/ui/PremiumModal";
import { Loader2, Plus, Download, Filter, ChefHat } from "lucide-react";
import { eventApi } from "../../../api/eventApi";
import { inventoryApi } from "../../../api/inventoryApi";
import IngredientRow from "./IngredientRow";
import { useReactToPrint } from "react-to-print";
import IngredientPrintTemplate from "./IngredientPrintTemplate";
import { toast } from "react-hot-toast";


const CATEGORIES = ["Raw Materials", "Beverages", "Spices", "Dairy", "Grains", "Vegetables", "Meat", "Equipment", "Other"];

const EventMenuIngredientsModal = ({ isOpen, onClose, event }) => {
  const [ingredients, setIngredients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filter state (no longer using menuFilter)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const printRef = React.useRef();

  const handleExportPdf = async () => {
    let clone = null;
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });
      
      // Wait a moment for React to finish rendering the hidden template if needed
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = document.getElementById("ingredient-printable");
      if (!element) throw new Error("Ingredient list element not found");

      // Clone the element and append it to body to avoid overflow:hidden clipping from modal
      clone = element.cloneNode(true);
      
      // Wrap it in a container that is positioned off-screen but strictly visible
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0px";
      container.style.width = "800px"; // Force fixed width to match template max-w
      container.style.backgroundColor = "white"; // Ensure white background
      container.appendChild(clone);
      
      document.body.appendChild(container);

      // Force clone to display fully since original was hidden by parent
      clone.style.display = "block";
      
      // WAIT for browser to calculate layout and render fonts/SVGs
      await new Promise(resolve => setTimeout(resolve, 300));

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);

      const canvas = await html2canvas(container, { 
        scale: 2, 
        useCORS: true,
        logging: true, // Enable logging for debugging
        backgroundColor: "#ffffff"
      });
      
      document.body.removeChild(container);
      clone = null;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      
      const scaleFactor = 0.85; // Shrink by 15% to fit more content per page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const finalWidth = pdfWidth * scaleFactor;
      const finalImgHeight = (canvas.height * finalWidth) / canvas.width;
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas rendered with 0 width or height");
      }
      
      let heightLeft = finalImgHeight;
      let position = 0; // Add top margin if needed, currently 0
      
      pdf.addImage(imgData, "PNG", xOffset, position, finalWidth, finalImgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", xOffset, position, finalWidth, finalImgHeight);
        heightLeft -= pdfHeight;
      }
      
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event?.title?.replace(/\s+/g, '_').toLowerCase() || 'event'}_purchase_list.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("PDF exported successfully!", { id: "pdf-download" });
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export: ${error.message || "Unknown error"}`, { id: "pdf-download", duration: 5000 });
      if (clone && clone.parentElement) {
        document.body.removeChild(clone.parentElement);
      }
    }
  };

  // New Ingredient State
  const [newIngredient, setNewIngredient] = useState({
    customName: "",
    category: "Other",
    quantity: "",
    unit: "kg",
    price: ""
  });

  useEffect(() => {
    if (isOpen && event?.id) {
      fetchData();
    }
  }, [isOpen, event?.id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ingRes, invRes] = await Promise.all([
        eventApi.getIngredients(event.id),
        inventoryApi.getLookup()
      ]);
      const extractedIngredients = Array.isArray(ingRes?.data) ? ingRes.data : Array.isArray(ingRes) ? ingRes : [];
      setIngredients(extractedIngredients);

      let extractedInventory = [];
      if (Array.isArray(invRes?.data)) extractedInventory = invRes.data;
      else if (Array.isArray(invRes?.data?.data)) extractedInventory = invRes.data.data;
      else if (Array.isArray(invRes)) extractedInventory = invRes;
      else if (Array.isArray(invRes?.items)) extractedInventory = invRes.items;
      
      console.log("Extracted Inventory:", extractedInventory, "from raw:", invRes);
      setInventoryItems(extractedInventory);
    } catch (error) {
      toast.error("Failed to load ingredients data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.quantity || !newIngredient.unit) {
      toast.error("Quantity and Unit are required");
      return;
    }
    if (!newIngredient.customName.trim()) {
      toast.error("Item name is required");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        customName: newIngredient.customName.trim(),
        quantity: Number(newIngredient.quantity),
        unit: newIngredient.unit,
        category: newIngredient.category,
        price: newIngredient.price ? Number(newIngredient.price) : null
      };

      const res = await eventApi.addIngredient(event.id, payload);
      setIngredients([res.data, ...ingredients]);
      setNewIngredient({
        ...newIngredient,
        customName: "",
        quantity: "",
        price: ""
      });
      toast.success("Item added successfully");
    } catch (error) {
      toast.error("Failed to add ingredient");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };



  const filteredIngredients = selectedCategoryFilter === "all" 
    ? ingredients 
    : ingredients.filter(i => i.category === selectedCategoryFilter);

  const categories = [...new Set(ingredients.map(i => i.category || "Other"))];
  const menuOptions = event?.menuItems || [];

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase List"
      description={`Manage and download the purchase list for ${event?.guestCount || 0} guests.`}
      maxWidth="max-w-4xl"
      compactHeader={true}
    >
      <div className="flex flex-col md:flex-row h-[70vh] gap-4 md:gap-6">
        
        {/* Left Side: Event Menu List */}
        {menuOptions.length > 0 && (
          <div className="hidden md:flex w-1/4 border-r border-slate-100 pr-2 flex-col min-h-0 shrink-0">
            <h4 className="text-[10px] font-bold text-primary-700 uppercase tracking-wider flex items-center gap-1.5 mb-4 shrink-0 bg-primary-50/50 p-2 rounded-lg border border-primary-100/50">
              <ChefHat size={14} /> Event Menu Reference
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {menuOptions.map(m => (
                <div key={m.id} className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200/60 p-2.5 rounded-lg shadow-sm">
                  {m.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Side: Purchase List Items & Add Form */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Top Controls */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-primary-500 font-medium text-slate-700 text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            <Download size={14} /> Export PDF
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 min-h-0 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-sm font-medium">Loading planner...</p>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-3">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <Filter size={24} className="text-slate-300" />
              </div>
              <h4 className="text-slate-800 font-bold">No items found</h4>
              <p className="text-xs text-slate-500">You haven't added any items to the purchase list yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              {filteredIngredients.map(ing => (
                <IngredientRow 
                  key={ing.id} 
                  eventId={event.id}
                  ingredient={ing} 
                  onUpdate={(updated) => setIngredients(ingredients.map(i => i.id === updated.id ? updated : i))}
                  onDelete={(id) => setIngredients(ingredients.filter(i => i.id !== id))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add New Section */}
        <div className="pt-4 border-t border-slate-100 shrink-0 bg-white">
          <form onSubmit={handleAddIngredient} className="bg-slate-50 rounded-2xl p-3 sm:p-3.5 border border-slate-200/60 shadow-sm relative overflow-visible">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-2xl"></div>
            
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <div className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                  <Plus size={12} strokeWidth={3} />
                </div>
                Add Item
              </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-2.5 items-end">
              {/* Step 1: Item Name */}
              <div className="col-span-12 md:col-span-4 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Item Name
                </label>
                <input 
                  type="text"
                  placeholder="E.g. Tomato, Chairs, etc."
                  value={newIngredient.customName}
                  onChange={(e) => setNewIngredient({...newIngredient, customName: e.target.value})}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                />
              </div>

              {/* Step 2: Measurement */}
              <div className="col-span-6 md:col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Quantity</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                />
              </div>
              <div className="col-span-6 md:col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Unit</label>
                <input 
                  type="text"
                  placeholder="kg, gram, piece"
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                />
              </div>

              {/* Step 3: Price */}
              <div className="col-span-12 md:col-span-3 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1">Price (Optional)</label>
                <input 
                  type="number"
                  step="any"
                  placeholder="₹"
                  value={newIngredient.price}
                  onChange={(e) => setNewIngredient({...newIngredient, price: e.target.value})}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                />
              </div>


              {/* Action */}
              <div className="col-span-12 md:col-span-1">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-[32px] flex items-center justify-center bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
      
      {/* Hidden Print Template */}
      <div className="hidden">
        <IngredientPrintTemplate ref={printRef} event={event} ingredients={ingredients} />
      </div>
    </PremiumModal>
  );
};

export default EventMenuIngredientsModal;
