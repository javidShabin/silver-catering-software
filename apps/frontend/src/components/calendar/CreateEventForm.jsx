import { CURRENCY } from "../../config/currency";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  Users, 
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Type,
  User,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react';
import CustomerSelector from './CustomerSelector';
import { customerApi } from '../../api/customerApi';
import DatePicker from '../ui/DatePicker';

const CreateEventForm = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: '12:00',
    location: '',
    type: 'catering',
    guestCount: 1,
    customer: '',
    durationInDays: 1,
    eventFee: '',
    advanceAmount: ''
  });

  // Client Selection / Registration States
  const [clientMode, setClientMode] = useState('existing'); // 'existing' | 'new'
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [activeField, setActiveField] = useState(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientError, setClientError] = useState(null);

  // Validations per step
  const isStep1Valid = formData.title.trim().length >= 3;
  const isStep2Valid = clientMode === 'existing' 
    ? formData.customer !== '' 
    : (newClient.name.trim().length >= 2 && newClient.phone.trim().length >= 7);
  const isStep3Valid = formData.date !== '' && 
                       formData.time !== '' && 
                       formData.location.trim().length >= 3 &&
                       formData.date >= new Date().toISOString().split('T')[0];

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid) setCurrentStep(2);
    else if (currentStep === 2 && isStep2Valid) setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!isStep3Valid) return;

    setIsCreatingClient(true);
    setClientError(null);

    try {
      let finalCustomerId = formData.customer;

      // If user opted to create a brand new client right inline
      if (clientMode === 'new') {
        const response = await customerApi.create({
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          address: newClient.address || 'Address not specified'
        });
        
        // Handle possible nested data structure safely
        const createdCustomer = response.data || response;
        finalCustomerId = createdCustomer?.id || createdCustomer?.id;
        
        if (!finalCustomerId) {
          throw new Error("Failed to retrieve ID for new client.");
        }
      }

      const submissionData = {
        ...formData,
        customer: finalCustomerId,
        guestCount: Number(formData.guestCount),
        date: new Date(`${formData.date}T${formData.time}:00Z`).toISOString(),
        durationInDays: Number(formData.durationInDays || 1),
        description: formData.description?.trim() || undefined,
        eventFee: formData.eventFee !== '' ? Number(formData.eventFee) : undefined,
        advanceAmount: formData.advanceAmount !== '' ? Number(formData.advanceAmount) : undefined
      };
      
      onSubmit(submissionData);
    } catch (err) {
      console.error("Event creation wizard error:", err);
      setClientError(err.response?.data?.message || err.message || "Failed to create client or schedule event.");
    } finally {
      setIsCreatingClient(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full bg-white border border-slate-300 transition-all duration-300 rounded-lg px-3 py-1.5 text-[13px] text-slate-800 placeholder:text-slate-400
    ${activeField === fieldName 
      ? 'border-orange-500 focus:outline-none' 
      : 'hover:border-slate-400'}
    ${isLoading || isCreatingClient ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  const labelClasses = "text-[11px] font-semibold text-slate-600 ml-0.5 block mb-1";

  return (
    <div className="max-w-md mx-auto flex flex-col justify-between">
      {/* Firebase Style Stepper progress indicator */}
      <div className="flex items-center justify-between mb-8 relative px-4 select-none">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }} 
        />
        
        {[1, 2, 3].map((step) => {
          const isCompleted = currentStep > step;
          const isActive = currentStep === step;
          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                ${isCompleted 
                  ? 'bg-orange-600 text-white' 
                  : isActive 
                    ? 'bg-white border-2 border-orange-500 text-orange-600 ring-4 ring-orange-500/10' 
                    : 'bg-white border-2 border-slate-200 text-slate-450'}
              `}>
                {isCompleted ? <Check size={11} strokeWidth={3} /> : step}
              </div>
              <span className={`text-[8px] font-bold mt-2 uppercase tracking-wider ${isActive ? 'text-slate-800' : 'text-slate-450'}`}>
                {step === 1 ? 'Essentials' : step === 2 ? 'Client' : 'Logistics'}
              </span>
            </div>
          );
        })}
      </div>

      {clientError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2 animate-in fade-in duration-250">
          <AlertCircle size={14} className="shrink-0" />
          <span>{clientError}</span>
        </div>
      )}

      {/* Steps Transition Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* STEP 1: ESSENTIAL DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Event Title</label>
                <div className="relative">
                  <Type size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'title' ? 'text-orange-500' : 'text-slate-400'}`} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Corporate Summer Gala"
                    className={`${inputClasses('title')} pl-8`}
                    onFocus={() => setActiveField('title')}
                    onBlur={() => setActiveField(null)}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Event Type</label>
                <div className="flex p-0.5 bg-slate-100 rounded-lg gap-0.5 border border-slate-200/30">
                  {['catering', 'delivery', 'meeting'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`
                        flex-1 py-1.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider transition-all duration-200
                        ${formData.type === type 
                          ? 'bg-white text-orange-650 shadow-sm border border-slate-200/20' 
                          : 'text-slate-400 hover:text-slate-600'}
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClasses}>Event Fee (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{CURRENCY}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      className={`${inputClasses('eventFee')} pl-8`}
                      onFocus={() => setActiveField('eventFee')}
                      onBlur={() => setActiveField(null)}
                      value={formData.eventFee}
                      onChange={e => setFormData({ ...formData, eventFee: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Advance Payment (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{CURRENCY}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1000"
                      className={`${inputClasses('advanceAmount')} pl-8`}
                      onFocus={() => setActiveField('advanceAmount')}
                      onBlur={() => setActiveField(null)}
                      value={formData.advanceAmount}
                      onChange={e => setFormData({ ...formData, advanceAmount: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Special Notes / Description (Optional)</label>
                <textarea
                  placeholder="e.g. Menu preferences, special setup requirements..."
                  className={`${inputClasses('description')} h-20 resize-none pt-2`}
                  onFocus={() => setActiveField('description')}
                  onBlur={() => setActiveField(null)}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* STEP 2: CLIENT & GUEST DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Guest Count</label>
                <div className="relative">
                  <Users size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'guestCount' ? 'text-orange-500' : 'text-slate-400'}`} />
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    className={`${inputClasses('guestCount')} pl-8`}
                    onFocus={() => setActiveField('guestCount')}
                    onBlur={() => setActiveField(null)}
                    value={formData.guestCount}
                    onChange={e => setFormData({ ...formData, guestCount: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelClasses}>Client Assignment</label>
                </div>

                {/* Segemented client creation controller */}
                <div className="flex p-0.5 bg-slate-100 rounded-xl gap-0.5 border border-slate-200/30 mb-3">
                  <button
                    type="button"
                    onClick={() => setClientMode('existing')}
                    className={`
                      flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all
                      ${clientMode === 'existing' 
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20' 
                        : 'text-slate-400 hover:text-slate-655'}
                    `}
                  >
                    Select Existing Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode('new')}
                    className={`
                      flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all
                      ${clientMode === 'new' 
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20' 
                        : 'text-slate-400 hover:text-slate-655'}
                    `}
                  >
                    Register New Client
                  </button>
                </div>

                {clientMode === 'existing' ? (
                  <div className="animate-in fade-in duration-200">
                    <CustomerSelector 
                      value={formData.customer}
                      onChange={(val) => setFormData({ ...formData, customer: val })}
                      disabled={isLoading}
                    />
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-1.5 duration-200">
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className={labelClasses}>Full Name</label>
                        <div className="relative">
                          <User size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'cli_name' ? 'text-orange-500' : 'text-slate-400'}`} />
                          <input
                            type="text"
                            placeholder="John Doe"
                            className={`${inputClasses('cli_name')} pl-8.5`}
                            onFocus={() => setActiveField('cli_name')}
                            onBlur={() => setActiveField(null)}
                            value={newClient.name}
                            onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClasses}>Email (Optional)</label>
                          <div className="relative">
                            <Mail size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'cli_email' ? 'text-orange-500' : 'text-slate-400'}`} />
                            <input
                              type="email"
                              placeholder="john@example.com"
                              className={`${inputClasses('cli_email')} pl-8.5`}
                              onFocus={() => setActiveField('cli_email')}
                              onBlur={() => setActiveField(null)}
                              value={newClient.email}
                              onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClasses}>Phone</label>
                          <div className="relative">
                            <Phone size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'cli_phone' ? 'text-orange-500' : 'text-slate-400'}`} />
                            <input
                              type="tel"
                              placeholder="+91 98765 43210"
                              className={`${inputClasses('cli_phone')} pl-8.5`}
                              onFocus={() => setActiveField('cli_phone')}
                              onBlur={() => setActiveField(null)}
                              value={newClient.phone}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setNewClient({ ...newClient, phone: val });
                              }}
                              minLength={10}
                              maxLength={10}
                              pattern="[0-9]{10}"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={labelClasses}>Address (Optional)</label>
                        <input
                          type="text"
                          placeholder="Delivery/Billing address..."
                          className={inputClasses('cli_address')}
                          value={newClient.address}
                          onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE, VENUE & REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <DatePicker
                    label="Date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                    inputClassName={`${inputClasses('date')} pl-8 pr-1`}
                    onFocus={() => setActiveField('date')}
                    onBlur={() => setActiveField(null)}
                    leftIcon={CalendarIcon}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Time</label>
                  <div className="relative">
                    <Clock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'time' ? 'text-orange-500' : 'text-slate-400'}`} />
                    <input
                      type="time"
                      className={`${inputClasses('time')} pl-8 pr-1`}
                      onFocus={() => setActiveField('time')}
                      onBlur={() => setActiveField(null)}
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Duration (Days)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1 justify-between h-[38px] w-full">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, durationInDays: Math.max(1, (formData.durationInDays || 1) - 1) })}
                      disabled={(formData.durationInDays || 1) <= 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-800">{formData.durationInDays || 1}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, durationInDays: (formData.durationInDays || 1) + 1 })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 transition-colors text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Venue / Location</label>
                <div className="relative">
                  <MapPin size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'location' ? 'text-orange-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="e.g. Grand Ballroom, Plaza Hotel"
                    className={`${inputClasses('location')} pl-8`}
                    onFocus={() => setActiveField('location')}
                    onBlur={() => setActiveField(null)}
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Verify Review Section (Highly premium Firebase style summary) */}
              <div className="bg-orange-50/40 border border-orange-100/50 rounded-2xl p-4 mt-2 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold uppercase tracking-wider text-[8px] mb-1">
                  <Info size={12} className="text-orange-500" />
                  <span>Verify Event Details</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-slate-600">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Event</span>
                    <span className="font-semibold text-slate-800">{formData.title || 'Unnamed Event'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Catering Mode</span>
                    <span className="font-semibold text-slate-800 capitalize">{formData.type}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Client Profile</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {clientMode === 'existing' 
                        ? 'Linked Active Account' 
                        : `${newClient.name} (New Registration)`
                      }
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Scale</span>
                    <span className="font-semibold text-slate-800">{formData.guestCount} guests</span>
                  </div>
                  {formData.eventFee && (
                    <div className="space-y-0.5 animate-in fade-in">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Event Fee</span>
                      <span className="font-semibold text-slate-800">{CURRENCY}{formData.eventFee}</span>
                    </div>
                  )}
                  {formData.advanceAmount && (
                    <div className="space-y-0.5 animate-in fade-in">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Advance Paid</span>
                      <span className="font-semibold text-slate-800">{CURRENCY}{formData.advanceAmount}</span>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-slate-100 pt-2 grid grid-cols-2 gap-x-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Schedule</span>
                      <span className="font-semibold text-slate-800">
                        {formData.date} at {formData.time}
                        {formData.durationInDays > 1 ? ` (${formData.durationInDays} Days)` : ""}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Venue Location</span>
                      <span className="font-semibold text-slate-800 truncate block">{formData.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-50">
        <button
          type="button"
          onClick={currentStep === 1 ? onCancel : handleBack}
          className="px-5 py-2 rounded-lg text-[13px] font-bold text-slate-500 hover:text-slate-655 hover:bg-slate-50 transition-colors"
          disabled={isLoading || isCreatingClient}
        >
          {currentStep === 1 ? 'Discard' : 'Back'}
        </button>

        {currentStep < 3 ? (
            <button
            type="button"
            onClick={handleNext}
            disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
            className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-[13px] shadow-sm hover:shadow-md hover:shadow-orange-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue</span>
            <ChevronRight size={14} />
          </button>
        ) : (
            <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={!isStep3Valid || isLoading || isCreatingClient}
            className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-[13px] shadow-sm hover:shadow-md hover:shadow-orange-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isCreatingClient ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <span>Confirm & Schedule</span>
                <Check size={14} strokeWidth={2.5} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateEventForm;
