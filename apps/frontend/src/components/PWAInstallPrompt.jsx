import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log("PWA component mounted, waiting for beforeinstallprompt event...");
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log("🔥 beforeinstallprompt EVENT FIRED BY BROWSER!");
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // We don't show the prompt yet. We wait for isAuthenticated.
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    // For testing purposes, we show it if authenticated even without deferredPrompt
    // Real PWA requires deferredPrompt, but local dev mode sometimes blocks it
    if (isAuthenticated && !isAppInstalled) {
      // Slight delay to ensure smooth transition after login
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [isAuthenticated]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("ഇതൊരു ടെസ്റ്റ് മോഡ് (Dev) ആയതുകൊണ്ട് ഇൻസ്റ്റാൾ ഡയലോഗ് വരുന്നതല്ല. പ്രൊഡക്ഷനിൽ ഇത് കൃത്യമായി വർക്ക് ചെയ്യും!");
      setShowPrompt(false);
      return;
    }
    
    // Hide the prompt UI
    setShowPrompt(false);
    
    // Show the native browser install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-20 right-4 z-[100] w-[340px]"
        >
          {/* Close Button - Sticking Out */}
          <button 
            onClick={handleDismiss}
            className="absolute -top-2.5 -right-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 rounded-full p-1 shadow-md border border-slate-200 dark:border-slate-700 transition-colors z-20 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={14} strokeWidth={2.5} />
          </button>

          {/* Themed Container */}
          <div className="w-full bg-white dark:bg-slate-900 border border-primary-100 dark:border-primary-900/50 rounded-2xl shadow-xl shadow-primary-500/10 p-4 flex items-center gap-3 relative overflow-hidden">
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* App Icon */}
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex-shrink-0 flex items-center justify-center border border-primary-100 dark:border-primary-800 shadow-sm overflow-hidden z-10">
              <img src="/logo.png" alt="DoCatering" className="w-8 h-8 object-contain drop-shadow-sm" />
            </div>
            
            {/* App Info */}
            <div className="flex-1 min-w-0 pr-4 z-10">
              <h3 className="font-bold text-[14px] text-slate-900 dark:text-white truncate leading-tight">
                DoCatering App
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Fast & secure access
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-2.5 h-2.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Install Button */}
            <div className="flex-shrink-0 z-10">
              <button
                onClick={handleInstallClick}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-[12px] px-4 py-1.5 rounded-full transition-colors shadow-md shadow-primary-500/20 flex items-center gap-1.5"
              >
                <Download size={13} />
                Install
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
