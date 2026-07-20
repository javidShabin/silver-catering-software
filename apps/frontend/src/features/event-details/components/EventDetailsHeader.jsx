import React, { useState } from "react";
import { ArrowLeft, CreditCard, Edit, Share2, Loader2, Check } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import { useAuthStore } from "../../../store/authStore";
import axiosInstance from "../../../utils/axios.js";
import toast from "react-hot-toast";

const EventDetailsHeader = ({ event, navigate, openEditModal }) => {
  const user = useAuthStore((state) => state.user);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasFeedbackFeature = true;

  const handleShareFeedback = async () => {
    try {
      setIsGeneratingLink(true);
      const response = await axiosInstance.get(`/feedback/admin/link/${event.id}`);
      if (response.data.success && response.data.url) {
        await navigator.clipboard.writeText(response.data.url);
        setCopied(true);
        toast.success("Feedback link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      console.error("Error generating feedback link:", error);
      toast.error(error.response?.data?.message || "Failed to generate feedback link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors py-1.5 self-start"
          >
            <ArrowLeft size={15} />
            <span>Back to Events</span>
          </button>
          
          <div className="sm:hidden">
            <Badge status={event.status} />
          </div>
        </div>
        
        {/* Desktop actions */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={() => navigate(`/billing?search=${encodeURIComponent(event.title)}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/25 active:scale-95 shrink-0"
          >
            <CreditCard size={13} />
            <span>View Billing</span>
          </button>
          {hasFeedbackFeature && (
            <button
              onClick={handleShareFeedback}
              disabled={isGeneratingLink}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 disabled:opacity-70"
            >
              {isGeneratingLink ? <Loader2 size={13} className="animate-spin" /> : copied ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
              <span>{copied ? "Copied Link!" : "Share Feedback"}</span>
            </button>
          )}
          <button
            onClick={openEditModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Edit size={13} />
            <span>Edit Details</span>
          </button>
          <div className="shrink-0">
            <Badge status={event.status} />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="sm:hidden fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex items-center justify-around gap-2"
           style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}>
        <button
          onClick={() => navigate(`/billing?search=${encodeURIComponent(event.title)}`)}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 flex-1 py-1"
        >
          <CreditCard size={18} />
          <span className="text-[10px] font-bold">Billing</span>
        </button>
        {hasFeedbackFeature && (
          <button
            onClick={handleShareFeedback}
            disabled={isGeneratingLink}
            className="flex flex-col items-center gap-1 text-indigo-600 hover:text-indigo-800 flex-1 py-1 disabled:opacity-50"
          >
            {isGeneratingLink ? <Loader2 size={18} className="animate-spin" /> : copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
            <span className="text-[10px] font-bold">{copied ? "Copied!" : "Feedback"}</span>
          </button>
        )}
        <button
          onClick={openEditModal}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 flex-1 py-1"
        >
          <Edit size={18} />
          <span className="text-[10px] font-bold">Edit</span>
        </button>
      </div>
    </>
  );
};

export default React.memo(EventDetailsHeader);
