import React, { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Phone, 
  Mail, 
  IndianRupee, 
  LayoutGrid, 
  List,
  Edit2,
  Trash2,
  Sparkles
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierApi } from "../../api/supplierApi";
import { toast } from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import PremiumModal from "../../components/ui/PremiumModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import { GridSkeleton } from "../../components/ui/Skeleton";
import CreateVendorForm from "./components/CreateVendorForm";
import VendorCard from "./components/VendorCard";

const VendorsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const categories = ["All", "Wholesaler", "Manufacturer", "Distributor", "Retailer"];

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => supplierApi.getAll(),
    onError: () => toast.error("Failed to fetch vendors")
  });

  const vendors = vendorsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => supplierApi.create(data),
    onSuccess: () => {
      toast.success("Vendor added successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => toast.error("Failed to add vendor")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => supplierApi.update(selectedVendor.id, data),
    onSuccess: () => {
      toast.success("Vendor updated successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => toast.error("Failed to update vendor")
  });

  const deleteMutation = useMutation({
    mutationFn: () => supplierApi.delete(selectedVendor.id),
    onSuccess: () => {
      toast.success("Vendor deleted successfully");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to delete vendor")
  });

  const handleCreate = (data) => createMutation.mutate(data);
  const handleUpdate = (data) => updateMutation.mutate(data);
  const handleDelete = () => deleteMutation.mutate();

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-1">
          <div className="inline-flex mx-auto lg:mx-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1412] border border-orange-500/30 mb-2 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <Sparkles size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>Supplier Network</span>
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{t("vendors.vendor_management", "Vendor Management")}</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-md mx-auto lg:mx-0">{t("vendors.vendor_subtitle", "Track your suppliers, monitor balances, and review performance ratings.")}</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <div className="hidden sm:flex bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
          </div>
          <div className="w-full flex justify-center sm:w-auto">
            <button 
              onClick={() => { setSelectedVendor(null); setIsModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50 max-md:bg-primary-600 max-md:hover:bg-primary-500 max-md:shadow-primary-500/25"
            >
              <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("vendors.add_vendor", "Add Vendor")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t("vendors.search_vendors", "Search vendors or contact persons...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full lg:w-auto scrollbar-none flex-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                categoryFilter === cat 
                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20' 
                : 'bg-white text-slate-500 border-slate-200/60 hover:border-primary-200 hover:bg-primary-50/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <GridSkeleton items={8} />
        ) : filteredVendors.length === 0 ? (
          <EmptyState 
            icon={Building2} 
            title="No Vendors Found" 
            description="Start building your supplier network to track purchases."
            actionLabel="Add Vendor"
            onAction={() => { setSelectedVendor(null); setIsModalOpen(true); }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVendors.map(vendor => (
              <VendorCard 
                key={vendor.id} 
                vendor={vendor} 
                onEdit={() => { setSelectedVendor(vendor); setIsModalOpen(true); }}
                onDelete={() => { setSelectedVendor(vendor); setIsDeleteModalOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto w-full max-md:hidden">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                            {vendor.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">{vendor.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg">{vendor.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-700">{vendor.contactPerson}</span>
                          <span className="text-[10px] text-slate-400">{vendor.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee size={12} className={vendor.balanceDue > 0 ? "text-rose-500" : "text-slate-400"} />
                          <span className={`text-sm font-bold ${vendor.balanceDue > 0 ? "text-rose-600" : "text-slate-600"}`}>
                            {Number(vendor.balanceDue || 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedVendor(vendor); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => { setSelectedVendor(vendor); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hidden max-md:grid grid-cols-1 gap-4">
              {filteredVendors.map(vendor => (
                <VendorCard 
                  key={vendor.id} 
                  vendor={vendor} 
                  onEdit={() => { setSelectedVendor(vendor); setIsModalOpen(true); }}
                  onDelete={() => { setSelectedVendor(vendor); setIsDeleteModalOpen(true); }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVendor ? "Edit Vendor" : "Add New Vendor"}
        description={selectedVendor ? "Update supplier details and contact info." : "Register a new supplier to your network."}
        maxWidth="max-w-2xl"
      >
        <CreateVendorForm 
          onSubmit={selectedVendor ? handleUpdate : handleCreate}
          onCancel={() => setIsModalOpen(false)}
          initialData={selectedVendor}
        />
      </PremiumModal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Vendor"
        message={`Are you sure you want to delete ${selectedVendor?.name}? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

export default VendorsPage;
