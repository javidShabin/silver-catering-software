import React, { useState, useEffect, useRef } from "react";
import { Search, User, Check, ChevronDown, Loader2 } from "lucide-react";
import { customerApi } from "../../api/customerApi";

const CustomerSelector = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch customers on search or open
  useEffect(() => {
    if (!isOpen) return;

    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const res = await customerApi.getAll({ search, limit: 5 });
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  // Set initial name if value exists
  useEffect(() => {
    if (value && !selectedName) {
      const fetchInitial = async () => {
        try {
          const res = await customerApi.getOne(value);
          setSelectedName(res.data.name);
        } catch (err) {
          console.error("Failed to fetch selected customer", err);
        }
      };
      fetchInitial();
    }
  }, [value]);

  const handleSelect = (customer) => {
    setSelectedName(customer.name);
    onChange(customer.id);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full pl-12 pr-4 py-3 bg-slate-50 border transition-all duration-300 rounded-xl text-sm cursor-pointer ${
          isOpen ? 'border-primary-500 ring-4 ring-primary-500/5 bg-white' : 'border-slate-100 hover:border-slate-200'
        } ${error ? 'border-rose-500 ring-4 ring-rose-500/5' : ''}`}
      >
        <div className="flex items-center gap-3">
          <User size={18} className={`absolute left-4 transition-colors ${isOpen ? 'text-primary-500' : 'text-slate-400'}`} />
          <span className={selectedName ? 'text-slate-900 font-medium' : 'text-slate-400'}>
            {selectedName || "Select a client..."}
          </span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                autoFocus
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs focus:ring-0 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Searching...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No clients found.
              </div>
            ) : (
              customers.map((customer) => (
                <div 
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{customer.name}</span>
                    <span className="text-[10px] text-slate-400">{customer.email}</span>
                  </div>
                  {value === (customer.id) && <Check size={16} className="text-primary-500" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
