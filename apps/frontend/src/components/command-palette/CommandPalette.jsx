import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  ArrowRight,
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  CreditCard,
  FileText
} from 'lucide-react';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState(['dash', 'events', 'create-event']);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Actions data
  const actions = [
    { id: 'dash', title: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation', path: '/dashboard', shortcut: 'd' },
    { id: 'events', title: 'View All Events', icon: Calendar, category: 'Navigation', path: '/events', shortcut: 'e' },
    { id: 'customers', title: 'Customer Directory', icon: Users, category: 'Navigation', path: '/customers', shortcut: 'c' },
    { id: 'create-event', title: 'Create New Event', icon: Plus, category: 'Quick Actions', path: '/events/new', shortcut: 'n' },
    
    // Mock Events
    { id: 'ev-1', title: 'Corporate Gala - TechCorp', icon: Calendar, category: 'Events', path: '/events/1' },
    { id: 'ev-2', title: 'Wedding Reception - Smith & Jones', icon: Calendar, category: 'Events', path: '/events/2' },
    { id: 'ev-3', title: 'Annual Charity Auction', icon: Calendar, category: 'Events', path: '/events/3' },
    
    // Mock Customers
    { id: 'cu-1', title: 'John Doe', icon: Users, category: 'Customers', path: '/customers/1' },
    { id: 'cu-2', title: 'Jane Smith', icon: Users, category: 'Customers', path: '/customers/2' },
    { id: 'cu-3', title: 'Alice Johnson', icon: Users, category: 'Customers', path: '/customers/3' },

    { id: 'inventory', title: 'Manage Inventory', icon: Package, category: 'Management', path: '/inventory', shortcut: 'i' },
    { id: 'billing', title: 'Billing & Invoices', icon: CreditCard, category: 'Management', path: '/billing', shortcut: 'b' },
    { id: 'reports', title: 'System Reports', icon: FileText, category: 'Management', path: '/reports', shortcut: 'r' },
    { id: 'settings', title: 'System Settings', icon: Settings, category: 'Preferences', path: '/settings', shortcut: ',' },
  ];

  // Derive recent actions
  const recentActions = recentIds
    .map(id => actions.find(a => a.id === id))
    .filter(Boolean);

  const filteredActions = query === '' 
    ? [
        ...recentActions.map(a => ({ ...a, category: 'Recent Searches' })),
        ...actions.filter(a => !recentIds.includes(a.id) && ['Navigation', 'Quick Actions'].includes(a.category)).slice(0, 3).map(a => ({ ...a, category: 'Suggestions' }))
      ]
    : actions.filter(action => {
        const searchStr = `${action.title} ${action.category}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
      }).sort((a, b) => {
        // Boost matches in title
        const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return 0;
      });

  const togglePalette = useCallback(() => setIsOpen(prev => !prev), []);

  const handleSelect = useCallback((action) => {
    if (action.path) {
      // Add to recents
      setRecentIds(prev => {
        const filtered = prev.filter(id => id !== action.id);
        return [action.id, ...filtered].slice(0, 5);
      });
      
      navigate(action.path);
      setIsOpen(false);
      setQuery('');
    }
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open/Close
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }

      // Quick shortcuts when palette is open
      if (isOpen && !e.metaKey && !e.ctrlKey && e.key.length === 1 && query === '') {
        const action = actions.find(a => a.shortcut === e.key.toLowerCase());
        if (action) {
          e.preventDefault();
          handleSelect(action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette, isOpen, query, actions, handleSelect]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex]);
      }
    }
  };

  // Group actions by category
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[9998]"
          />

          {/* Command Palette Panel */}
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-2xl mx-4 bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.4)_inset] overflow-hidden pointer-events-auto"
            >
              {/* Top Glow Accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />

              {/* Search Bar */}
              <div className="relative flex items-center px-6 py-6 border-b border-slate-100/40">
                <div className="absolute left-6 text-primary-500/80">
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none pl-9 text-slate-800 text-xl font-medium placeholder:text-slate-400 placeholder:font-normal"
                />
                <div className="flex items-center gap-2">
                  {query && (
                    <button 
                      onClick={() => setQuery('')}
                      className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-400 rotate-45" />
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100/50 rounded-md border border-slate-200/30">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ESC</span>
                  </div>
                </div>
              </div>

              {/* Command List */}
              <div className="max-h-[480px] overflow-y-auto p-3 custom-scrollbar">
                {filteredActions.length === 0 ? (
                  <div className="py-20 px-6 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-semibold text-lg">No results for "{query}"</p>
                    <p className="text-slate-400 mt-2 max-w-xs mx-auto">Try searching for navigation, quick actions or customers.</p>
                  </div>
                ) : (
                  Object.entries(groupedActions).map(([category, items]) => (
                    <div key={category} className="mb-3 last:mb-0">
                      <h3 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
                        <span>{category}</span>
                        {items.length > 0 && <span className="h-[1px] flex-1 ml-4 bg-slate-100/60" />}
                      </h3>
                      <div className="space-y-1">
                        {items.map((item) => {
                          const globalIndex = filteredActions.indexOf(item);
                          const isSelected = globalIndex === selectedIndex;
                          const Icon = item.icon;

                          return (
                            <motion.div
                              key={item.id}
                              layout
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              onClick={() => handleSelect(item)}
                              className={`
                                group relative flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200
                                ${isSelected ? 'bg-primary-500 shadow-[0_12px_24px_-8px_rgba(107,156,242,0.4)]' : 'hover:bg-slate-50/80'}
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`
                                  w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center
                                  ${isSelected ? 'bg-white/20 shadow-inner' : 'bg-slate-100/50 group-hover:bg-white border border-slate-200/20 group-hover:border-slate-200/50'}
                                `}>
                                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500'}`} strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[15px] font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                      {item.title}
                                    </span>
                                    {item.category === 'Events' && !isSelected && (
                                      <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded uppercase">Active</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[11px] font-medium ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                                      {item.category === 'Recent Searches' ? 'Previously visited' : item.category}
                                    </span>
                                    {isSelected && (
                                      <motion.span 
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[11px] text-white/90 font-bold flex items-center gap-1"
                                      >
                                        <div className="w-1 h-1 rounded-full bg-white/50" />
                                        Press Enter to jump
                                      </motion.span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {item.shortcut && !isSelected && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500 shadow-sm">⌘</kbd>
                                    <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase shadow-sm">{item.shortcut}</kbd>
                                  </div>
                                )}
                                
                                {isSelected && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center"
                                  >
                                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                                      <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              {/* Selected Indicator Glow */}
                              {isSelected && (
                                <motion.div 
                                  layoutId="active-pill"
                                  className="absolute inset-0 z-[-1] rounded-xl bg-gradient-to-r from-primary-600/10 to-transparent opacity-50"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100/60 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500 shadow-sm">↑↓</kbd>
                    <span className="text-[11px] text-slate-400">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500 shadow-sm">↵</kbd>
                    <span className="text-[11px] text-slate-400">Select</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  Tip: Press <span className="font-bold">?</span> for help
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
