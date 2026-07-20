import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { ShieldCheck, Database, Lock, UserX, FileText, Bell, Share2, Key, Clock } from "lucide-react";

const AdminPrivacyPolicyPage = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = false;
  
  const [policies, setPolicies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/settings/privacy-policy');
      let fetchedPolicies = response.data.data || [];
      if (typeof fetchedPolicies === "string") {
        try { fetchedPolicies = JSON.parse(fetchedPolicies); } catch(e) {}
      }
      setPolicies(Array.isArray(fetchedPolicies) ? fetchedPolicies : []);
    } catch (error) {
      toast.error("Failed to fetch privacy policies");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/settings/privacy-policy', { policies });
      toast.success("Privacy policy updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update privacy policy");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPolicy = () => {
    setPolicies([
      ...policies,
      { icon: "FileText", title: "New Section", description: "Details go here." }
    ]);
  };

  const handleRemovePolicy = (index) => {
    const newPolicies = [...policies];
    newPolicies.splice(index, 1);
    setPolicies(newPolicies);
  };

  const handlePolicyChange = (index, field, value) => {
    const newPolicies = [...policies];
    newPolicies[index][field] = value;
    setPolicies(newPolicies);
  };

  if (isLoading) {
    return <div className="p-6">Loading privacy policy...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 md:p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Privacy Policy</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage the platform's privacy policy</p>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="relative z-10 mt-2 md:mt-0">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm transition-all duration-300 font-semibold px-5">
                  <span className="flex items-center gap-2">
                    <FileText size={16} /> Edit Policy
                  </span>
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button onClick={() => { setIsEditing(false); fetchPolicies(); }} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-50">
                    Discard
                  </Button>
                  <Button onClick={handleSave} isLoading={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 px-6">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 md:p-6">
          
          {!isEditing && (
            <div className="mb-5 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-2.5">
              <Bell className="text-indigo-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[12.5px] text-indigo-900 leading-relaxed font-medium">
                This policy outlines how user data is collected, processed, and protected within the system. It ensures compliance with data privacy standards and provides transparency to our users.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {policies.map((policy, index) => {
              const IconMap = { ShieldCheck, Database, Lock, UserX, FileText, Bell, Share2, Key, Clock };
              const IconComponent = IconMap[policy.icon] || FileText;
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border 
                    ${!isEditing 
                      ? "border-slate-200 bg-white" 
                      : "border-slate-200 bg-slate-50"
                    }
                  `}
                >
                  {!isEditing ? (
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <IconComponent size={18} />
                      </div>
                      <div className="flex-1 mt-0.5">
                        <h3 className="text-[15px] font-semibold text-slate-800 mb-1">{policy.title}</h3>
                        <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">{policy.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">{index + 1}</span>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Edit Section</h4>
                        </div>
                        <button 
                          onClick={() => handleRemovePolicy(index)}
                          className="text-red-500 hover:text-white hover:bg-red-500 px-3 py-1 rounded-lg text-xs font-bold transition-all border border-red-200 hover:border-red-500"
                        >
                          Delete Section
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Icon Identifier</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={policy.icon} 
                              onChange={(e) => handlePolicyChange(index, 'icon', e.target.value)}
                              className="w-full text-sm font-medium text-slate-700 bg-white border-slate-300 rounded-xl p-3 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pl-10"
                              placeholder="e.g. ShieldCheck"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <IconComponent size={16} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-9">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Section Title</label>
                          <input 
                            type="text" 
                            value={policy.title} 
                            onChange={(e) => handlePolicyChange(index, 'title', e.target.value)}
                            className="w-full text-sm font-medium text-slate-700 bg-white border-slate-300 rounded-xl p-3 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            placeholder="Enter the title for this section"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Detailed Description</label>
                        <textarea 
                          value={policy.description} 
                          onChange={(e) => handlePolicyChange(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full text-[13px] text-slate-700 bg-white border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none leading-relaxed resize-none custom-scrollbar"
                          placeholder="Provide the full terms and description..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isEditing && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <Button 
                onClick={handleAddPolicy} 
                variant="outline"
                className="w-full border-dashed flex items-center justify-center gap-2"
              >
                <FileText size={14} /> Add New Section
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPrivacyPolicyPage;
