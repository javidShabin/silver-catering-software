import React, { useState, useEffect } from "react";
import { Plus, Package, Edit, Trash2, Sparkles } from "lucide-react";
import { packagesApi } from "../../api/packagesApi";
import { menuApi } from "../../api/menuApi";
import EmptyState from "../../components/ui/EmptyState";
import { toast } from "react-hot-toast";
import PackageFormModal from "./components/PackageFormModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useTranslation } from "react-i18next";

const PackagesPage = () => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pkgsRes, menuRes] = await Promise.all([
        packagesApi.getAll(),
        menuApi.getAll()
      ]);
      if (pkgsRes.status === "success") {
        setPackages(pkgsRes.data);
      }
      if (menuRes.status === "success") {
        setMenuItems(menuRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch packages data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;
    try {
      await packagesApi.delete(packageToDelete.id);
      toast.success("Package deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete package");
    } finally {
      setIsDeleteModalOpen(false);
      setPackageToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex mx-auto md:mx-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1412] border border-orange-500/30 mb-2 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <Sparkles size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{t("packages.packages_and_bundles", "Packages & Bundles")}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("packages.catering_packages", "Catering Packages")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("packages.subtitle", "Manage standard packages and templates for your events")}</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-primary-500/20"
        >
          <Plus size={16} />
          {t("packages.create_package", "Create Package")}
        </button>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t("packages.no_packages_found", "No packages found")}
          description={t("packages.empty_desc", "Create your first catering package template to speed up quotation creation.")}
          actionLabel={t("packages.create_package", "Create Package")}
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const pricePerHead = Number(pkg.pricePerHead) || 0;
            const minGuests = Number(pkg.minGuests) || 0;
            const totalPrice = pricePerHead * minGuests;

            return (
            <div key={pkg.id} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm flex flex-col relative overflow-hidden group hover:border-primary-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{pkg.name}</h3>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(pkg)} className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => handleDeleteClick(pkg)} className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="text-lg font-black text-slate-900 mb-0.5">
                ₹{totalPrice.toLocaleString("en-IN")}
                <span className="text-[10px] font-medium text-slate-500 ml-1">{t("packages.total", "total")}</span>
              </div>

              <div className="text-[10px] font-medium text-slate-500 mb-0.5">
                ₹{pricePerHead.toLocaleString("en-IN")} / {t("packages.pax", "pax")}
              </div>

              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {t("packages.min", "Min.")} {minGuests} {t("packages.pax", "Pax")}
              </div>

              {pkg.description && (
                <p className="text-[11px] text-slate-600 line-clamp-1 mb-2 flex-1">
                  {pkg.description}
                </p>
              )}

              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded">
                  {pkg.menuItems?.length || 0} {t("packages.items", "Items")}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {pkg.isActive ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                </span>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <PackageFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          initialData={selectedPackage}
          menuItems={menuItems}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setPackageToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default PackagesPage;
