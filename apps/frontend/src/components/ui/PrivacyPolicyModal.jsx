import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { ShieldCheck, Database, Lock, UserX, FileText, Bell, Share2, Key, Clock } from "lucide-react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

const PrivacyPolicyModal = ({ isOpen, onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [policies, setPolicies] = useState([]);
  const { user, updateUser } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      const fetchPolicies = async () => {
        try {
          const response = await api.get('/settings/privacy-policy');
          setPolicies(response.data.data || []);
        } catch (error) {
          console.error("Failed to fetch policies:", error);
          toast.error("Failed to load privacy policies");
        } finally {
          setIsFetching(false);
        }
      };
      fetchPolicies();
    }
  }, [isOpen]);

  const handleAccept = async () => {
    if (!isChecked) return;
    
    setIsLoading(true);
    try {
      await api.post('/auth/accept-privacy-policy');
      
      updateUser({
        ...user,
        privacyPolicyAccepted: true
      });
      
      toast.success("Privacy Policy Accepted");
      if (onAccept) onAccept();
    } catch (error) {
      console.error("Failed to accept privacy policy:", error);
      toast.error("Failed to accept privacy policy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Cannot close manually
      showCloseButton={false}
      maxWidth="max-w-2xl"
      className="p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-100"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-5 py-4 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/30 flex-shrink-0">
            <ShieldCheck size={24} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-0.5">Privacy Policy & Terms</h2>
            <p className="text-primary-100 text-[13px] leading-snug font-medium">
              We value your privacy and security. Please carefully read and accept our updated privacy guidelines.
            </p>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4 md:p-5 max-h-[50vh] overflow-y-auto bg-slate-50/50 custom-scrollbar relative min-h-[200px]">
        {isFetching ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {policies.map((policy, index) => {
              // Dynamically get the Lucide icon from window/imports if possible. 
              // Since we're importing specific icons, we need a small map or fallback.
              // For simplicity, we can map common strings to imported icons.
              const IconMap = { ShieldCheck, Database, Lock, UserX, FileText, Bell, Share2, Key, Clock };
              const Icon = IconMap[policy.icon] || FileText;
              
              return (
                <div key={index} className="flex gap-3.5 group">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-slate-800 mb-0.5 tracking-tight group-hover:text-primary-700 transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-slate-600 text-[12px] leading-relaxed whitespace-pre-line">
                      {policy.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Action Section */}
      <div className="border-t border-slate-200 p-4 md:p-5 bg-white">
        <div className="max-w-2xl mx-auto">
          <label className="flex items-start gap-3 cursor-pointer group bg-slate-50 p-2.5 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all">
            <div className="relative flex items-center pt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <div className="w-4 h-4 border-2 border-slate-300 rounded shadow-sm peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-colors flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors leading-relaxed">
              മുകളിൽ പറഞ്ഞിരിക്കുന്ന കാര്യങ്ങൾ ഞാൻ വായിച്ചു മനസ്സിലാക്കി, ഇതിൽ ഞാൻ പൂർണ്ണമായും സമ്മതിക്കുന്നു.<br/>
              <span className="text-slate-500 font-normal text-[12px] mt-0.5 block">(I have carefully read and fully agree to the Privacy Policy and Terms of Service)</span>
            </span>
          </label>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="primary" 
              onClick={handleAccept}
              isLoading={isLoading}
              disabled={!isChecked}
              className={`w-full sm:w-auto px-5 py-2 text-[13px] rounded-lg shadow-lg transition-all duration-300 ${isChecked ? 'shadow-primary-600/30 hover:shadow-primary-600/50 translate-y-0' : 'opacity-60 cursor-not-allowed'}`}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Modal>
  );
};

export default PrivacyPolicyModal;
