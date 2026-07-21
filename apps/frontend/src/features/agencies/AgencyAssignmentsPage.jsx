import React, { useState, useEffect } from "react";
import { 
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Briefcase,
  IndianRupee,
  MapPin,
  Box
} from "lucide-react";
import { agenciesApi } from "../../api/agenciesApi";
import toast from "react-hot-toast";
import AssignmentFormModal from "./components/AssignmentFormModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useTranslation } from "react-i18next";

const AgencyAssignmentsPage = () => {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await agenciesApi.getAllAssignments();
      if (res.status === "success") {
        setAssignments(res.data);
      }
    } catch (error) {
      toast.error("Failed to load assignments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDeleteClick = (id) => {
    setAssignmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;
    try {
      await agenciesApi.deleteAssignment(assignmentToDelete);
      toast.success("Assignment deleted successfully");
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete assignment");
    } finally {
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const q = searchQuery.toLowerCase();
    return (
      assignment.agency?.name?.toLowerCase().includes(q) ||
      assignment.event?.title?.toLowerCase().includes(q) ||
      assignment.agency?.serviceType?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200"; // pending
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            {t("agency_assignments.title", "Agency Assignments")}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-md mx-auto lg:mx-0">
            {t("agency_assignments.subtitle", "Manage manpower assignments across all your events.")}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          <button
            onClick={() => { setSelectedAssignment(null); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md sm:shadow-lg shadow-primary-500/25 active:scale-95 shrink-0 max-md:fixed max-md:bottom-20 max-md:right-4 max-md:w-14 max-md:h-14 max-md:rounded-full max-md:p-0 max-md:justify-center max-md:z-50"
          >
            <Plus className="w-4 h-4 max-md:w-6 max-md:h-6" /> <span className="max-md:hidden">{t("agency_assignments.new_assignment", "New Assignment")}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder={t("agency_assignments.search_placeholder", "Search by agency, event, or service...")}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{t("agency_assignments.no_assignments_found", "No assignments found")}</h3>
          <p className="text-slate-500 mb-6">{t("agency_assignments.empty_desc", "You haven't made any manpower assignments yet.")}</p>
          <button
            onClick={() => { setSelectedAssignment(null); setIsModalOpen(true); }}
            className="text-orange-600 font-semibold hover:underline"
          >
            {t("agency_assignments.create_first_assignment", "Create your first assignment")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="group bg-white rounded-2xl border border-slate-200 flex flex-col hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-[15px] truncate mb-1">
                      {assignment.agency?.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center shrink-0">
                    <button 
                      onClick={() => { setSelectedAssignment(assignment); setIsModalOpen(true); }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      title="Edit Assignment"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(assignment.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete Assignment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-[13px] text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <Calendar size={12} className="text-slate-400" />
                    </div>
                    <span className="truncate">{assignment.event?.title}</span>
                  </div>
                  {assignment.numberOfStaff > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Users size={12} className="text-slate-400" />
                      </div>
                      <span>{assignment.numberOfStaff} {t("agency_assignments.workers", "Workers")} &times; {assignment.numberOfDays} {t("agency_assignments.days", "Days")}</span>
                    </div>
                  )}
                  {Array.isArray(assignment.rentalItems) && assignment.rentalItems.length > 0 && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Box size={12} className="text-slate-400" />
                      </div>
                      <span className="truncate">
                        {assignment.rentalItems.map(i => `${i.quantity} ${i.name}`).join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <Briefcase size={12} className="text-slate-400" />
                    </div>
                    <span className="truncate">{assignment.agency?.serviceType || t("agency_assignments.general_staff", "General Staff")}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                <span className="text-xs font-semibold text-slate-500">{t("common.total_amount", "Total Amount")}</span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm text-primary">
                  <IndianRupee size={12} />
                  <span className="text-sm font-bold">
                    {assignment.totalAmount?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AssignmentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assignment={selectedAssignment}
          onSuccess={fetchAssignments}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setAssignmentToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default AgencyAssignmentsPage;
