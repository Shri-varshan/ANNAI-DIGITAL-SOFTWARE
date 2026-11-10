import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Service, DesignItem, Customer } from '../../types';
import {
  Printer,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Search,
  UserCheck,
  Shield,
  Layers,
  IndianRupee,
  Smartphone,
  Building2,
  ArrowRight,
  Info,
} from 'lucide-react';

export const NewOrderView: React.FC = () => {
  const {
    services,
    designs,
    customers,
    sectors,
    createOrder,
    setActiveView,
    setReceiptModalOrder,
  } = useApp();

  // Step 1: Customer Info
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

  // Step 2: Service Selection
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0].id);
  const currentService: Service = services.find((s) => s.id === selectedServiceId) || services[0];

  // Step 3: Design Selection
  const [selectedDesignId, setSelectedDesignId] = useState<string | undefined>(undefined);
  const [isCustomArtwork, setIsCustomArtwork] = useState<boolean>(false);

  // Step 4: Specifications
  const [width, setWidth] = useState<number>(10);
  const [height, setHeight] = useState<number>(4);
  const [unit, setUnit] = useState<'ft' | 'in' | 'cm'>('ft');
  const [quantity, setQuantity] = useState<number>(1);
  const [material, setMaterial] = useState<string>(currentService.materials[0]);
  const [finish, setFinish] = useState<string>(currentService.finishes[0]);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  // Step 5: Pricing
  const [unitRate, setUnitRate] = useState<number>(currentService.defaultRate);
  const [finishingCharges, setFinishingCharges] = useState<number>(currentService.setupCost);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);

  // Step 6: Sector Override
  const [isOverride, setIsOverride] = useState<boolean>(false);
  const [overrideSectorId, setOverrideSectorId] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Step 7: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');

  // Update default material & finish when service changes
  useEffect(() => {
    if (currentService) {
      setMaterial(currentService.materials[0]);
      setFinish(currentService.finishes[0]);
      setUnitRate(currentService.defaultRate);
      setFinishingCharges(currentService.setupCost);

      if (currentService.unitType === 'sqft') {
        setWidth(10);
        setHeight(4);
        setUnit('ft');
        setQuantity(1);
      } else if (currentService.category === 'cards') {
        setWidth(3.5);
        setHeight(2);
        setUnit('in');
        setQuantity(1000);
      } else if (currentService.category === 'stickers') {
        setWidth(2.5);
        setHeight(2.5);
        setUnit('in');
        setQuantity(500);
      }
    }
  }, [selectedServiceId]);

  // Phone Lookup
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(val);

    if (val.length >= 4) {
      const match = customers.find((c) => c.phone.includes(val));
      if (match) {
        setCustomerName(match.name);
        setCompanyName(match.companyName || '');
        setSelectedCustomerId(match.id);
        setIsReturningCustomer(true);
        return;
      }
    }
    setIsReturningCustomer(false);
    setSelectedCustomerId(undefined);
  };

  // Preset Dimensions Quick-Click
  const applyPresetDimension = (dimString: string) => {
    // e.g. "10x4 ft"
    const parts = dimString.split(' ');
    if (parts.length >= 2) {
      const [w, h] = parts[0].split('x').map(Number);
      if (!isNaN(w) && !isNaN(h)) {
        setWidth(w);
        setHeight(h);
      }
    }
  };

  // Exact Calculation
  let calculatedArea = 0;
  let subtotal = 0;

  if (currentService.unitType === 'sqft') {
    // Area calculation based on unit
    let areaInSqFt = 0;
    if (unit === 'ft') {
      areaInSqFt = width * height;
    } else if (unit === 'in') {
      areaInSqFt = (width * height) / 144;
    } else if (unit === 'cm') {
      areaInSqFt = (width * height) / 929;
    }
    calculatedArea = Number((areaInSqFt * quantity).toFixed(2));
    subtotal = Math.round(calculatedArea * unitRate);
  } else if (currentService.unitType === 'units') {
    subtotal = Math.round(quantity * unitRate);
  } else {
    subtotal = Math.round(width * height * unitRate);
  }

  const totalAmount = Math.max(0, subtotal + finishingCharges - discountAmount);
  const balanceDue = Math.max(0, totalAmount - advancePaid);

  // Auto-fill advance when clicking "Full Advance"
  const handleFullPayment = () => {
    setAdvancePaid(totalAmount);
  };

  const handleHalfPayment = () => {
    setAdvancePaid(Math.round(totalAmount / 2));
  };

  // Preview automatic sector assignment
  const eligibleSectors = sectors.filter((s) => currentService.eligibleSectorIds.includes(s.id));
  const suggestedSector = [...eligibleSectors].sort((a, b) => a.currentPendingJobs - b.currentPendingJobs)[0] || sectors[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerPhone && !customerName) {
      setCustomerName('Walk-in Customer');
      setCustomerPhone('9884000000');
    }

    try {
      const created = createOrder({
        customerId: selectedCustomerId,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || '9884000000',
        companyName: companyName.trim() || undefined,
        serviceId: currentService.id,
        designId: selectedDesignId,
        specs: {
          width,
          height,
          unit,
          quantity,
          material,
          finish,
          customerNotes,
          artworkSupplied: isCustomArtwork,
        },
        pricing: {
          unitRate,
          calculatedArea: currentService.unitType === 'sqft' ? calculatedArea : undefined,
          subtotal,
          finishingCharges,
          discountAmount,
          taxAmount: 0,
          totalAmount,
          advancePaid,
          balanceDue,
        },
        paymentMethod,
        paymentRef: paymentRef.trim() || undefined,
        overrideSectorId: isOverride ? overrideSectorId : undefined,
        overrideReason: isOverride ? overrideReason : undefined,
        priority,
      });

      // Show receipt modal immediately for rapid POS checkout
      setReceiptModalOrder(created);
    } catch (err) {
      console.error(err);
      alert('Error creating order. Please verify input fields.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Fast POS Billing & Order Entry</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-medium border border-blue-200">
              15–30s Routine Target
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            One shared counter billing desk with automated sector queue balancing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('orders')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel / Back to Orders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Data Entry Workflow */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Customer Identification */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Customer Lookup / Identification</span>
              </span>
              {isReturningCustomer && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Returning Account Customer</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-slate-400 font-normal">(10 Digits)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="98401 00000"
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer / Contact Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Senthil Nathan"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shop / Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Murugan Sweet Stall"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Service Selection */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Select Printing Service</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {services.length} services configured
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.map((svc) => {
                const isSelected = svc.id === selectedServiceId;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`p-3 rounded-lg text-left border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {svc.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      <span>Rate: ₹{svc.defaultRate}/{svc.unitType}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3 & 4: Design & Specifications */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Artwork & Job Specifications</span>
              </span>

              {/* Custom Artwork Toggle */}
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCustomArtwork}
                  onChange={(e) => setIsCustomArtwork(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Customer supplied artwork file (WhatsApp / Pendrive)</span>
              </label>
            </div>

            {/* Popular Dimension Presets */}
            {currentService.popularDimensions && currentService.popularDimensions.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Popular Sizes:</span>
                {currentService.popularDimensions.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPresetDimension(preset)}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors font-mono"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}

            {/* Dimension Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  step="any"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  step="any"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                >
                  <option value="ft">Feet (ft)</option>
                  <option value="in">Inches (in)</option>
                  <option value="cm">Centimeters (cm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                  required
                />
              </div>
            </div>

            {/* Material & Finish */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Grade / Paper Board
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                >
                  {currentService.materials.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finishing & Border Lamination
                </label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
                >
                  {currentService.finishes.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Special Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Printing / Delivery Instructions
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Eyelets every 2 feet, deliver before 6 PM today"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Calculation, Sector Assignment & Payment */}
        <div className="lg:col-span-4 space-y-6">
          {/* STEP 5: Live Price Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Price Breakdown</span>
              </span>
              {currentService.unitType === 'sqft' && (
                <span className="font-mono text-xs font-bold text-blue-700">
                  {calculatedArea} sq.ft
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Unit Rate:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    value={unitRate}
                    onChange={(e) => setUnitRate(Number(e.target.value))}
                    className="w-16 font-mono text-right border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Finishing & Setup:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    value={finishingCharges}
                    onChange={(e) => setFinishingCharges(Number(e.target.value))}
                    className="w-16 font-mono text-right border border-slate-200 rounded px-1 py-0.5"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Special Discount:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">-₹</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-16 font-mono text-right border border-slate-200 rounded px-1 py-0.5 text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-blue-700">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 6: Automatic Sector Routing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Sector Workload Assignment</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOverride(!isOverride)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                {isOverride ? 'Cancel Override' : 'Manual Override'}
              </button>
            </div>

            {!isOverride ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    {suggestedSector.name.split('—')[0]}
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                    Optimal Sector
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {suggestedSector.name.split('—')[1]} · Current queue: {suggestedSector.currentPendingJobs} jobs
                </p>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Machine: {suggestedSector.machinery.split('(')[0]}
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Select Target Sector
                  </label>
                  <select
                    value={overrideSectorId || suggestedSector.id}
                    onChange={(e) => setOverrideSectorId(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-amber-300 rounded-md bg-white font-medium"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.currentPendingJobs} pending)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Override Reason (Audit Logged)
                  </label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Urgent machine maintenance on primary"
                    className="w-full text-xs px-2.5 py-1.5 border border-amber-300 rounded-md bg-white"
                    required={isOverride}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 7: Payment Collection & Instant Bill Submit */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Payment & Settlement</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleHalfPayment}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={handleFullPayment}
                  className="text-[10px] bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded text-blue-800 font-mono font-semibold"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['CASH', 'UPI', 'BANK'] as PaymentMethod[]).map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? method === 'CASH'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {method === 'CASH' ? 'Cash கல்லா' : method === 'UPI' ? 'UPI / GPay' : 'Bank'}
                  </button>
                );
              })}
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Advance Paid Now (₹)
              </label>
              <input
                type="number"
                min="0"
                max={totalAmount}
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                className="w-full text-base font-bold font-mono px-3 py-2 border border-slate-300 rounded-lg text-emerald-800 focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            {/* UPI Reference if applicable */}
            {paymentMethod !== 'CASH' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {paymentMethod === 'UPI' ? 'UPI Reference / UTR Number' : 'NEFT / Cheque Number'}
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. 629381048291"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            )}

            {/* Balance Due Display */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Balance Due on Pickup:</span>
              <span className="font-mono font-bold text-sm text-red-600 tabular-nums">
                ₹{balanceDue.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Submit & Generate Bill Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Complete Order & Print Bill</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
