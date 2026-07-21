import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Plus, 
  Search,
  Phone,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { agenciesApi } from "../../api/agenciesApi";
import AgencyFormModal from "./components/AgencyFormModal";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useTranslation } from "react-i18next";

const AgenciesPage = () => {
  const { t } = useTranslation();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState(null);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const res = await agenciesApi.getAll();
      if (res.status === "success") {
        setAgencies(res.data);
      }
    } catch (error) {
      toast.error("Failed to load agencies");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleDeleteClick = (id, assignmentsCount) => {
    if (assignmentsCount > 0) {
      toast.error("Cannot delete agency with existing assignments. Please deactivate it instead.");
      return;
    }
    setAgencyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agencyToDelete) return;
    try {
      await agenciesApi.delete(agencyToDelete);
      toast.success("Agency deleted successfully");
      fetchAgencies();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete agency");
    } finally {
      setIsDeleteModalOpen(false);
      setAgencyToDelete(null);
    }
  };

  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agency.serviceType && agency.serviceType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">

          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            {t("agencies.manpower_agencies", "Manpower Agencies")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("agencies.subtitle", "Manage sub-contractors, serving boys, and other agencies.")}
          </p>
        </div>
        <button
          onClick={() => { setSelectedAgency(null); setIsModalOpen(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-orange-600/20"
        >
          <Plus size={16} />
          {t("agencies.add_agency", "Add Agency")}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("agencies.search_placeholder", "Search by name or service type...")}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
      ) : filteredAgencies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{t("agencies.no_agencies_found", "No agencies found")}</h3>
          <p className="text-slate-500 mb-6">{t("agencies.empty_desc", "You haven't added any manpower agencies yet.")}</p>
          <button
            onClick={() => { setSelectedAgency(null); setIsModalOpen(true); }}
            className="text-orange-600 font-semibold hover:underline"
          >
            {t("agencies.add_first_agency", "Add your first agency")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgencies.map((agency) => (
            <div key={agency.id} className="group bg-white rounded-2xl border border-slate-200 flex flex-col hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-[15px] truncate">{agency.name}</h3>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${agency.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {agency.isActive ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                      </span>
                    </div>
                    {agency.serviceType && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-xs font-medium border border-slate-100 max-w-full">
                        <Briefcase size={12} className="text-primary/70 shrink-0" />
                        <span className="truncate">{agency.serviceType}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center shrink-0">
                    <button 
                      onClick={() => { setSelectedAgency(agency); setIsModalOpen(true); }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      title="Edit Details"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(agency.id, agency._count?.assignments)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Agency"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-[13px] text-slate-600">
                  {agency.phone && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Phone size={12} className="text-slate-400" />
                      </div>
                      <span className="font-medium truncate">{agency.phone}</span>
                    </div>
                  )}
                  {agency.address && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <MapPin size={12} className="text-slate-400" />
                      </div>
                      <span className="truncate">{agency.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                <span className="text-xs font-semibold text-slate-500">{t("agencies.total_assignments", "Total Assignments")}</span>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
                  <span className="text-xs font-bold text-slate-700">
                    {agency._count?.assignments || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AgencyFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          agency={selectedAgency}
          onSuccess={fetchAgencies}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setAgencyToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Agency"
        message="Are you sure you want to delete this agency? This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default AgenciesPage;
