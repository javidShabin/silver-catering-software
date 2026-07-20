import { useState } from "react";
import SettingsModule, { ModuleRow } from "../../components/ui/SettingsModule";
import Switch from "../../components/ui/Switch";
import FloatingSaveBar from "../../components/ui/FloatingSaveBar";
import { Monitor, Sun, Moon, Sparkles, Type, Eye, Palette, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAppearanceStore } from "../../store/useAppearanceStore";
import { useShallow } from "zustand/react/shallow";

const AppearanceSettings = () => {
  const { theme, setTheme, primaryColor, setPrimaryColor, animations, setAnimations, highContrast, setHighContrast } = useAppearanceStore(
    useShallow((state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
      primaryColor: state.primaryColor,
      setPrimaryColor: state.setPrimaryColor,
      animations: state.animations,
      setAnimations: state.setAnimations,
      highContrast: state.highContrast,
      setHighContrast: state.setHighContrast,
    }))
  );
  
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDirty(false);
    }, 1500);
  };

  const handleReset = () => setIsDirty(false);
  const handleChange = () => setIsDirty(true);

  const themeOptions = [
    { id: "system", name: "System", icon: Monitor, color: "bg-slate-100", text: "text-slate-500" },
    { id: "light", name: "Light", icon: Sun, color: "bg-white", text: "text-amber-500" },
    { id: "dark", name: "Dark", icon: Moon, color: "bg-slate-950", text: "text-blue-400" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="h-full">
        
        {/* Theme Selection Module */}
        <SettingsModule 
          span="md:col-span-6" 
          title="Interface Theme" 
          description="Customize the visual atmosphere of your workspace."
          icon={Palette}
          className="h-full"
          action={
            <div className="flex flex-col items-end gap-1.5 mt-1 sm:mt-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Color</span>
              <div className="flex items-center gap-2">
              {[
                { id: "orange", color: "bg-orange-500" },
                { id: "blue", color: "bg-blue-500" },
                { id: "purple", color: "bg-purple-500" },
                { id: "green", color: "bg-green-500" },
                { id: "red", color: "bg-red-500" },
              ].map((pc) => (
                <button
                  key={pc.id}
                  onClick={() => { setPrimaryColor(pc.id); handleChange(); }}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${pc.color} flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm ${primaryColor === pc.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 ring-offset-white dark:ring-offset-slate-900 scale-110' : ''}`}
                  title={pc.id}
                >
                  {primaryColor === pc.id && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              ))}
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 items-center">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.id;
              return (
                <button 
                  key={opt.id}
                  onClick={() => { setTheme(opt.id); handleChange(); }}
                  className={`
                    relative group flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-300
                    ${isActive 
                      ? "border-primary-500 bg-white shadow-lg shadow-primary-500/10" 
                      : "border-transparent bg-white/40 hover:bg-white/60 hover:border-slate-200"
                    }
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl ${opt.color} ${opt.text} flex items-center justify-center shadow-inner border border-white/20 group-hover:scale-105 transition-transform`}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[12px] font-bold tracking-tight ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                    {opt.name}
                  </span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="active-theme"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-500"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </SettingsModule>

      </div>

      <FloatingSaveBar 
        show={isDirty} 
        onSave={handleSave} 
        onReset={handleReset}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AppearanceSettings;
