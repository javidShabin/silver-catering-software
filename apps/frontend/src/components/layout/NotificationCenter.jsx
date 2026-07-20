import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Trash2, 
  Calendar, 
  Package, 
  CreditCard, 
  ChefHat 
} from "lucide-react";
import { notificationApi } from "../../api/notificationApi";
import { io } from "socket.io-client";
import { useAuthStore } from "../../store/authStore";
import { toast as hotToast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const icons = {
    inventory: Package,
    billing: CreditCard,
    event: Calendar,
    kitchen: ChefHat,
    system: Info,
    staff: CheckCircle2
  };

  const colors = {
    info: "text-blue-500 bg-blue-50",
    success: "text-emerald-500 bg-emerald-50",
    warning: "text-amber-500 bg-amber-50",
    error: "text-rose-500 bg-rose-50"
  };

  const Icon = icons[notification.category] || Info;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 border-b border-slate-50 transition-colors hover:bg-slate-50/50 group flex gap-3 items-start ${!notification.isRead ? 'bg-primary-50/30' : ''}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colors[notification.type]}`}>
        <Icon size={16} />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className={`text-xs font-bold leading-tight truncate ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
          {notification.title}
        </h4>
        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
              className="p-1 text-primary-600 bg-primary-100/50 hover:bg-primary-100 rounded-md transition-all"
              title="Mark as read"
            >
              <CheckCircle2 size={13} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            className="p-1 text-slate-400 bg-slate-100/50 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
            title="Delete"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

let globalAudioCtx = null;
const getAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      globalAudioCtx = new AudioContext();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

if (typeof window !== 'undefined') {
  const initAudio = () => {
    getAudioContext();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
    document.removeEventListener('touchstart', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);
  document.addEventListener('touchstart', initAudio);
}

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    let debounceTimer = null;
    const pendingInvalidations = new Set();

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const socketUrl = apiUrl.replace("/api/v1", "");
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket.io: Connected to live notification channel", socket.id);
      // Room joining is now handled automatically by the backend via JWT
    });

    socket.on("notification", (newNotification) => {
      console.log("Socket.io: Received live notification", newNotification);
      
      setNotifications((prev) => {
        if (prev.some((item) => item.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);

      // Play audio notification ping using unlocked Web Audio API
      try {
        const ctx = getAudioContext();
        if (ctx) {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime); 
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
          
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch (err) {
        console.warn("Audio play prevented:", err);
      }

      // Display premium live hotToast
      hotToast.custom((t) => (
        <div
          className={`flex items-start gap-4 p-4 w-[420px] bg-slate-800 rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.5)] border border-slate-700 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            t.visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-8"
          }`}
        >
          {/* Indicator Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-gradient-to-b from-orange-400 to-primary-500 rounded-r-full"></div>
          
          <div className="relative shrink-0 ml-2">
            <div className="w-10 h-10 rounded-full bg-slate-700/50 text-orange-400 border border-slate-600 flex items-center justify-center">
              <Bell size={18} className="animate-swing origin-top" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 py-0.5">
            <p className="text-[14px] font-extrabold text-white truncate tracking-tight">{newNotification.title}</p>
            <p className="text-[12px] font-medium text-slate-300 leading-relaxed line-clamp-2 mt-1">{newNotification.message}</p>
          </div>
          
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="p-1.5 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ), { duration: 5000, position: 'top-center' });

      // Cache Invalidation Logic
      if (newNotification.category) {
        if (newNotification.category === "inventory") {
          pendingInvalidations.add("inventory");
          pendingInvalidations.add("inventory-items");
          pendingInvalidations.add("dashboardData");
        } else if (newNotification.category === "event") {
          pendingInvalidations.add("events");
          pendingInvalidations.add("dashboardData");
        } else if (newNotification.category === "billing") {
          pendingInvalidations.add("invoices");
          pendingInvalidations.add("expenses");
          pendingInvalidations.add("dashboardData");
          pendingInvalidations.add("billingStats");
        } else if (newNotification.category === "staff") {
          pendingInvalidations.add("staff");
          pendingInvalidations.add("roles");
        } else if (newNotification.category === "purchases") {
          pendingInvalidations.add("purchases");
          pendingInvalidations.add("billingStats");
        } else if (newNotification.category === "menu") {
          pendingInvalidations.add("menu");
          pendingInvalidations.add("menuCategories");
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          pendingInvalidations.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
          pendingInvalidations.clear();
        }, 500);
      }
    });


    socket.on("connect_error", (err) => {
      console.warn("Socket.io connection warning:", err.message);
    });

    return () => {
      clearTimeout(debounceTimer);
      pendingInvalidations.clear();
      socket.disconnect();
      console.log("Socket.io: Disconnected live notification channel");
    };
  }, [user?.id, queryClient]);

  const handleRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all group"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-swing origin-top' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed sm:absolute top-16 sm:top-auto right-4 left-4 sm:right-0 sm:left-auto mt-2 w-auto sm:w-80 bg-slate-50/95 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.3)] z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded text-[9px] font-black uppercase">New</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleReadAll}
                    className="text-[9px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-tighter"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center grayscale opacity-30 gap-2">
                    <Bell size={32} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">All caught up</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <NotificationItem 
                      key={n.id} 
                      notification={n} 
                      onRead={handleRead}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                  View Activity Timeline
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
