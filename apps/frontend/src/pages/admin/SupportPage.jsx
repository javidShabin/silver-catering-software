import React, { useEffect, useState, useRef } from "react";
import { useTicketStore } from "../../store/useTicketStore";
import { useShallow } from "zustand/react/shallow";
import {
  LifeBuoy, Plus, Send, Lock, MessageSquare, Loader2,
  AlertCircle, CheckCircle2, ChevronRight, Clock, ShieldAlert, X
} from "lucide-react";
import toast from "react-hot-toast";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low Priority", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { value: "medium", label: "Medium Priority", color: "bg-amber-50 text-amber-700 border-amber-100" },
  { value: "high", label: "High Priority", color: "bg-red-50 text-red-700 border-red-100" }
];

// ─── Raise Ticket Modal ─────────────────────────────────────────────────────────
const RaiseTicketModal = ({ onClose, onSave }) => {
  const { createTicket, isLoading } = useTicketStore(
    useShallow((state) => ({
      createTicket: state.createTicket,
      isLoading: state.isLoading
    }))
  );

  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const result = await createTicket(form);
    if (result.success) {
      toast.success("Support ticket raised successfully");
      onSave();
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in scale-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-150 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <LifeBuoy size={18} className="text-indigo-600 animate-[spin_4s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Raise Support Ticket</h2>
              <p className="text-[11px] text-slate-500 font-medium">Submit a request to platform administrators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-750 mb-1.5">
                Ticket Subject <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="e.g., Invoice generation failing, Printer scaling issue"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 hover:bg-slate-100/50 focus:bg-white font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Describe the Issue <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Provide detailed steps or context about the issue you are facing..."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 hover:bg-slate-100/50 focus:bg-white font-medium text-slate-700 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority Level</label>
              <div className="grid grid-cols-3 gap-3">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = form.priority === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, priority: opt.value }))}
                      className={`py-2.5 px-3 border text-xs font-bold rounded-xl transition-all ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm shadow-indigo-100/50"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {opt.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 shadow-md shadow-indigo-100/50 cursor-pointer"
            >
              {isLoading ? (
                <><Loader2 size={13} className="animate-spin" /> Submitting...</>
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Support Page ──────────────────────────────────────────────────────────
const SupportPage = () => {
  const {
    tickets,
    selectedTicket,
    messages,
    isLoading,
    fetchMyTickets,
    fetchTicketDetails,
    sendReply,
    closeTicket
  } = useTicketStore(
    useShallow((state) => ({
      tickets: state.tickets,
      selectedTicket: state.selectedTicket,
      messages: state.messages,
      isLoading: state.isLoading,
      fetchMyTickets: state.fetchMyTickets,
      fetchTicketDetails: state.fetchTicketDetails,
      sendReply: state.sendReply,
      closeTicket: state.closeTicket
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mobileViewThread, setMobileViewThread] = useState(false);
  const threadEndRef = useRef(null);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSelectTicket = (id) => {
    fetchTicketDetails(id);
    setMobileViewThread(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsSending(true);
    const result = await sendReply(selectedTicket.id, replyText.trim());
    setIsSending(false);
    if (result.success) {
      setReplyText("");
    } else {
      toast.error(result.message);
    }
  };

  const handleCloseTicket = async () => {
    // Admin can no longer close tickets manually, Super Admin does this.
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: "bg-emerald-50 border-emerald-200 text-emerald-700",
      in_progress: "bg-blue-50 border-blue-200 text-blue-700",
      closed: "bg-slate-100 border-slate-200 text-slate-600"
    };
    const labels = {
      open: "Open",
      in_progress: "In Progress",
      closed: "Resolved"
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-extrabold rounded-md uppercase tracking-wider ${badges[status] || badges.open}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityText = (prio) => {
    const items = {
      low: { label: "Low", color: "text-blue-600" },
      medium: { label: "Medium", color: "text-amber-600" },
      high: { label: "High", color: "text-red-600" }
    };
    return items[prio] || items.medium;
  };

  return (
    <div className="space-y-4 md:space-y-6 h-[calc(100vh-12rem)] md:h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm shadow-indigo-500/20 shrink-0">
            <LifeBuoy size={20} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Help & Support</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-md:hidden">
              Submit support tickets and track resolution progress natively
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} /> Raise Support Ticket
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-0 relative">
        
        {/* Left Side: Tickets List */}
        <div className={`w-full md:w-1/3 border-r border-slate-100 flex flex-col min-h-0 shrink-0 ${mobileViewThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-5 py-4 border-b border-slate-50 shrink-0 bg-slate-50/20 text-left">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">My Tickets</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
            {isLoading && tickets.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2.5 px-6">
                <LifeBuoy size={36} strokeWidth={1.5} className="text-slate-300" />
                <p className="text-xs font-bold">No support tickets found</p>
                <p className="text-[11px] text-slate-500 text-center">If you face any issues or bugs, click "Raise Support Ticket" to contact us.</p>
              </div>
            ) : (
              tickets.map((tkt) => {
                const isSelected = selectedTicket?.id === tkt.id;
                const prio = getPriorityText(tkt.priority);
                
                return (
                  <button
                    key={tkt.id}
                    onClick={() => handleSelectTicket(tkt.id)}
                    className={`w-full p-4 text-left transition-all hover:bg-slate-50/60 flex items-start justify-between gap-3 ${
                      isSelected ? "bg-indigo-50/30 border-l-[3px] border-indigo-600 pl-3" : "border-l-[3px] border-transparent"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-600">{tkt.ticketNumber}</span>
                        {getStatusBadge(tkt.status)}
                      </div>
                      <span className="block text-xs font-extrabold text-slate-800 truncate leading-snug">{tkt.subject}</span>
                      <span className="block text-[10px] text-slate-400">
                        Raised on {new Date(tkt.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} by {tkt.createdBy?.name || "User"}
                      </span>
                    </div>
                    <div className="shrink-0 text-right mt-0.5">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide ${prio.color}`}>{prio.label}</span>
                      <ChevronRight size={14} className="text-slate-400 ml-auto mt-2 block" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Thread */}
        <div className={`flex-1 flex flex-col min-h-0 bg-slate-50/20 ${!mobileViewThread ? 'hidden md:flex' : 'flex'}`}>
          {selectedTicket ? (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Header Panel - Ticket UI */}
              <div className="p-3 bg-slate-50/20 border-b border-slate-100 shrink-0">
                <div className="relative bg-[#f9f8ff] flex shadow-sm border border-indigo-100/50 rounded-xl overflow-hidden h-[72px]">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-r border-indigo-100/50"></div>
                  
                  <div className="px-4 py-2 flex flex-col justify-center border-r-2 border-dashed border-indigo-100 min-w-[110px] shrink-0 text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Ticket ID</span>
                    <span className="text-[14px] font-black text-indigo-600 leading-none">{selectedTicket.ticketNumber}</span>
                  </div>
                  
                  <div className="px-4 py-2 flex-1 flex flex-col justify-center border-r-2 border-dashed border-indigo-100 min-w-0 text-left">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <button onClick={() => setMobileViewThread(false)} className="md:hidden p-1 -ml-1 text-slate-400 hover:bg-indigo-100 rounded-lg">
                        <ChevronRight size={16} className="rotate-180" />
                      </button>
                      <h2 className="text-[14px] font-extrabold text-slate-900 truncate leading-none">{selectedTicket.subject}</h2>
                      <div className="scale-90 origin-left">{getStatusBadge(selectedTicket.status)}</div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={11}/> Opened on {new Date(selectedTicket.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="text-slate-300 hidden sm:block">•</span>
                      <span>Priority: <span className={getPriorityText(selectedTicket.priority).color}>{getPriorityText(selectedTicket.priority).label}</span></span>
                    </div>
                  </div>

                  <div className="px-4 py-2 flex flex-col justify-center items-center w-[140px] shrink-0 gap-2 hidden sm:flex">
                    <div className="w-full h-5 opacity-60" style={{ background: "repeating-linear-gradient(to right, #1e293b 0, #1e293b 1.5px, transparent 1.5px, transparent 3px, #1e293b 3px, #1e293b 4px, transparent 4px, transparent 6px)" }}></div>
                    <button 
                      disabled
                      className="w-full py-1.5 bg-indigo-50/50 border border-indigo-100 text-indigo-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-not-allowed"
                    >
                      <CheckCircle2 size={12} /> Mark Resolved
                    </button>
                  </div>

                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-l border-indigo-100/50"></div>
                </div>
              </div>

              {/* Message Thread Box */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                {/* Initial Description Block */}
                <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-left">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 font-bold text-sm">
                    {selectedTicket.createdBy?.name?.slice(0, 2).toUpperCase() || "US"}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">{selectedTicket.createdBy?.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Creator</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-200 my-4" />

                {/* Conversation replies */}
                {messages.length === 0 ? (
                  <p className="text-center text-[11px] text-slate-400 italic py-4">No replies yet. A platform administrator will review and respond to your request shortly.</p>
                ) : (
                  messages.map((msg) => {
                    const isSenderAdmin = msg.isAdmin;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-4 p-4.5 rounded-2xl border transition-all text-left max-w-2xl shadow-sm ${
                          isSenderAdmin
                            ? "bg-indigo-50/45 border-indigo-200/60 mr-auto"
                            : "bg-white border-slate-100 ml-auto"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold text-sm ${
                          isSenderAdmin 
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                            : "bg-slate-500 text-white border-slate-600 shadow-sm"
                        }`}>
                          {isSenderAdmin ? "AD" : (msg.sender?.name?.slice(0, 2).toUpperCase() || "US")}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-10">
                            <span className="text-xs font-extrabold text-slate-800">
                              {isSenderAdmin ? "Platform Support (Admin)" : msg.sender?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Reply Box Footer */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                {selectedTicket.status === "closed" ? (
                  <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-500 shrink-0">
                    <Lock size={14} />
                    <span className="text-xs font-bold">This discussion thread has been locked as resolved</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="flex gap-3">
                    <textarea
                      rows={1}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="flex-1 px-3.5 py-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 hover:bg-slate-100/50 focus:bg-white font-medium text-slate-700 resize-none min-h-[46px] max-h-[46px] leading-relaxed custom-scrollbar"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSending || !replyText.trim()}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-indigo-100/50 cursor-pointer shrink-0 w-12 h-[46px]"
                    >
                      {isSending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/30 animate-pulse">
                <LifeBuoy size={28} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 mt-2">Select a Support Ticket</h3>
              <p className="text-xs text-slate-500 max-w-sm text-center font-medium leading-relaxed">
                Choose a ticket from the left sidebar to view the discussion thread and converse with platform administrators.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Raise Ticket Modal */}
      {showModal && (
        <RaiseTicketModal
          onClose={() => setShowModal(false)}
          onSave={fetchMyTickets}
        />
      )}
    </div>
  );
};

export default SupportPage;
