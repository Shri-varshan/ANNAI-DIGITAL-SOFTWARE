import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Service, DesignItem } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  UserCheck,
  Monitor,
  Layers,
  ArrowRight,
  Info,
  Phone,
  User,
  Building,
  Ruler,
  FileCheck,
  UploadCloud,
  FileText,
  Clock,
  Printer,
} from 'lucide-react';

export const NewOrderView: React.FC = () => {
  const {
    services,
    designs,
    customers,
    currentUser,
    createDesignerJobTicket,
    setActiveView,
    setCashierBillingOrder,
  } = useApp();

  // Terminal & Designer Info
  const [designerSystemNo, setDesignerSystemNo] = useState<string>(
    currentUser.systemNo || 'System 01'
  );
  const [customSystemNo, setCustomSystemNo] = useState<string>('');
  const [isCustomSystem, setIsCustomSystem] = useState<boolean>(false);

  // Step 1: Customer Info
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

  // Step 2: Service Selection
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0].id);
  const currentService: Service =
    services.find((s) => s.id === selectedServiceId) || services[0];

  // Step 3: Dimensions (Width & Height)
  const [width, setWidth] = useState<number>(10);
  const [height, setHeight] = useState<number>(4);
  const [unit, setUnit] = useState<'ft' | 'in' | 'cm'>('ft');

  // Step 4: Design & Artwork Selection
  const [artworkSource, setArtworkSource] = useState<'CUSTOMER_FILE' | 'SHOP_TEMPLATE'>(
    'CUSTOMER_FILE'
  );
  const [artworkChannel, setArtworkChannel] = useState<'WHATSAPP' | 'PENDRIVE' | 'UPLOAD'>(
    'WHATSAPP'
  );
  const [artworkFileName, setArtworkFileName] = useState<string>('murugan_banner_10x4.tif');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [templateModifications, setTemplateModifications] = useState<string>('');
  const [selectedDesignId, setSelectedDesignId] = useState<string | undefined>(undefined);
  const [designApproved, setDesignApproved] = useState<boolean>(true);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill customer if returning phone number matches
  useEffect(() => {
    const trimmed = customerPhone.trim();
    if (trimmed.length >= 5) {
      const found = customers.find((c) => c.phone.includes(trimmed));
      if (found) {
        setCustomerName(found.name);
        setCompanyName(found.companyName || '');
        setIsReturningCustomer(true);
      } else {
        setIsReturningCustomer(false);
      }
    } else {
      setIsReturningCustomer(false);
    }
  }, [customerPhone, customers]);

  // Adjust default dimensions when service changes
  useEffect(() => {
    if (currentService.unitType === 'sqft') {
      setWidth(10);
      setHeight(4);
      setUnit('ft');
    } else if (currentService.category === 'cards') {
      setWidth(3.5);
      setHeight(2);
      setUnit('in');
    } else if (currentService.category === 'stickers') {
      setWidth(3);
      setHeight(3);
      setUnit('in');
    }
  }, [selectedServiceId, currentService]);

  const calculatedArea =
    unit === 'ft'
      ? width * height
      : Number(((width * height) / 144).toFixed(2));

  const effectiveSystemNo = isCustomSystem ? customSystemNo : designerSystemNo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      alert('Please enter customer mobile number');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (width <= 0 || height <= 0) {
      alert('Please enter valid dimensions');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDesignerJobTicket({
        customerName,
        customerPhone,
        companyName: companyName || undefined,
        serviceId: selectedServiceId,
        designId: selectedDesignId,
        designerSystemNo: effectiveSystemNo || 'System 01',
        priority,
        specs: {
          width,
          height,
          unit,
          quantity: 1, // Finalized with Cashier
          material: currentService.materials[0] || 'Standard',
          finish: currentService.finishes[0] || 'Standard',
          artworkSupplied: artworkSource === 'CUSTOMER_FILE',
          artworkSource,
          artworkChannel,
          artworkFileName,
          shopTemplateCode:
            artworkSource === 'SHOP_TEMPLATE'
              ? designs.find((d) => d.id === selectedDesignId)?.code
              : undefined,
          templateModifications:
            artworkSource === 'SHOP_TEMPLATE' ? templateModifications : undefined,
          customerNotes,
          designApproved,
        },
      });

      // Reset form for next customer
      setCustomerPhone('');
      setCustomerName('');
      setCompanyName('');
      setCustomerNotes('');
      setTemplateModifications('');
    } catch (err) {
      console.error('Error creating job ticket:', err);
      alert('Failed to create ticket. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Stage 1: Designer Desk
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-mono">Fast 20-Second Intake</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Customer Intake & Design Ticket</span>
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Create the digital job ticket, attach customer artwork or select a template, and issue a token slip.
              <strong> Quantity, material finishes, and billing are finalized at the Cashier counter (கல்லா).</strong>
            </p>
          </div>

          {/* Designer System Terminal Switcher */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col gap-1.5 self-start lg:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-300" />
              <span>Designer Terminal Number</span>
            </span>
            <div className="flex items-center gap-1.5">
              {['System 01', 'System 02', 'System 03', 'System 04'].map((sys) => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => {
                    setDesignerSystemNo(sys);
                    setIsCustomSystem(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    designerSystemNo === sys && !isCustomSystem
                      ? 'bg-blue-500 text-white shadow-xs'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {sys}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomSystem(true)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  isCustomSystem
                    ? 'bg-blue-500 text-white shadow-xs'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Custom
              </button>
            </div>
            {isCustomSystem && (
              <input
                type="text"
                placeholder="e.g. DTP-Desk-B"
                value={customSystemNo}
                onChange={(e) => setCustomSystemNo(e.target.value)}
                className="mt-1 px-2.5 py-1 text-xs bg-slate-900/80 border border-white/30 rounded-lg text-white font-mono focus:outline-hidden"
              />
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Service (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>1. Customer Details (Auto-Search)</span>
              </h2>
              {isReturningCustomer && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Existing Customer Found</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="98401 23456"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Senthil Nathan"
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Stall Name (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Murugan Sweet Stall"
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Service Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>2. Service Category</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Active Machine Capability
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.map((service) => {
                const isSelected = service.id === selectedServiceId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          {service.category}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <span className="font-bold text-slate-900 text-xs block leading-tight">
                        {service.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono">
                      Pricing: By {service.unitType.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Dimensions & Visual Aspect Ratio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-600" />
                <span>3. Dimensions & Aspect Ratio</span>
              </h2>
              <div className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                Total Area: {calculatedArea} {unit === 'ft' ? 'Sq.Ft.' : 'Sq.In.'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Width ({unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height ({unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Measurement Unit
                </label>
                <div className="flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 p-0.5">
                  {(['ft', 'in'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`flex-1 py-1.5 text-xs font-bold transition-all rounded-lg ${
                        unit === u ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {u === 'ft' ? 'Feet (ft)' : 'Inches (in)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Size Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] text-slate-500 font-semibold">Standard Banner Sizes:</span>
              {[
                { w: 6, h: 3, label: '6 × 3 ft' },
                { w: 8, h: 4, label: '8 × 4 ft' },
                { w: 10, h: 4, label: '10 × 4 ft' },
                { w: 12, h: 5, label: '12 × 5 ft' },
                { w: 20, h: 10, label: '20 × 10 ft' },
              ].map((sz) => (
                <button
                  key={sz.label}
                  type="button"
                  onClick={() => {
                    setWidth(sz.w);
                    setHeight(sz.h);
                    setUnit('ft');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                    width === sz.w && height === sz.h && unit === 'ft'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Artwork Handoff & Submit Ticket (1 col) */}
        <div className="space-y-6">
          {/* Card 4: Artwork & Design Handoff */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span>4. Artwork File</span>
              </h2>
            </div>

            {/* Source Tab */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setArtworkSource('CUSTOMER_FILE')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  artworkSource === 'CUSTOMER_FILE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Customer File
              </button>
              <button
                type="button"
                onClick={() => setArtworkSource('SHOP_TEMPLATE')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  artworkSource === 'SHOP_TEMPLATE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Shop PC Template
              </button>
            </div>

            {artworkSource === 'CUSTOMER_FILE' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Received Through
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'WHATSAPP', label: 'WhatsApp' },
                      { id: 'PENDRIVE', label: 'Pen Drive' },
                      { id: 'UPLOAD', label: 'Local PC' },
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setArtworkChannel(ch.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                          artworkChannel === ch.id
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Design File Name / Reference
                  </label>
                  <input
                    type="text"
                    value={artworkFileName}
                    onChange={(e) => setArtworkFileName(e.target.value)}
                    placeholder="e.g. murugan_sweets_10x4.tif"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Operator RIP software will fetch this file directly.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Shop Design
                  </label>
                  <select
                    value={selectedDesignId}
                    onChange={(e) => setSelectedDesignId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium bg-white"
                  >
                    <option value="">-- Choose Template --</option>
                    {designs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Text / Content Modifications
                  </label>
                  <textarea
                    rows={2}
                    value={templateModifications}
                    onChange={(e) => setTemplateModifications(e.target.value)}
                    placeholder="e.g. Change title to 'Murugan Stores', add phone 98401 23456"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Design Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Design Remarks / Special Instructions
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Red background, Tamil font, photo on left side"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Priority Selector */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-700">Priority:</span>
              <div className="flex gap-1.5">
                {(['NORMAL', 'HIGH', 'URGENT'] as const).map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setPriority(pr)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      priority === pr
                        ? pr === 'URGENT'
                          ? 'bg-red-600 text-white border-red-600'
                          : pr === 'HIGH'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-700 text-white border-slate-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Design Signoff */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="designApprovalCheck"
                checked={designApproved}
                onChange={(e) => setDesignApproved(e.target.checked)}
                className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="designApprovalCheck" className="text-xs text-emerald-950 font-medium cursor-pointer leading-tight">
                <strong>Customer verified & approved artwork.</strong> Spelling, contact numbers, and dimensions are signed off.
              </label>
            </div>
          </div>

          {/* Submit Action Box */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Terminal:</span>
              <span className="font-mono font-bold text-blue-300">{effectiveSystemNo}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Area:</span>
              <span className="font-mono font-bold text-white">
                {calculatedArea} {unit === 'ft' ? 'sq.ft' : 'sq.in'}
              </span>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="text-[11px] text-blue-200/90 leading-relaxed bg-blue-900/40 p-3 rounded-xl border border-blue-800/60">
              👉 Submitting will create the Job Ticket and issue a <strong>Job Token Slip</strong> for the customer to take to the Cashier.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Generating Ticket...' : 'Create Job Ticket & Send to Cashier'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
