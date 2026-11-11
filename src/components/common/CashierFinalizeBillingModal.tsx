import React, { useState, useEffect } from 'react';
import { Order, PaymentMethod, Service } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  IndianRupee,
  CheckCircle2,
  Calculator,
  ShieldAlert,
  Percent,
  Layers,
  Printer,
  Smartphone,
  CreditCard,
  Building,
  User,
  Phone,
  Ruler,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface CashierFinalizeBillingModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const CashierFinalizeBillingModal: React.FC<CashierFinalizeBillingModalProps> = ({
  order,
  onClose,
  onSuccess,
}) => {
  const { services, currentUser, finalizeCashierBilling, setReceiptModalOrder } = useApp();

  const currentService: Service =
    services.find((s) => s.id === order.serviceId) || services[0];

  // Cashier Discussion State: Quantity & Materials
  const [quantity, setQuantity] = useState<number>(order.specs.quantity || 1);
  const [material, setMaterial] = useState<string>(
    order.specs.material || currentService.materials[0] || 'Normal Flex 280gsm'
  );
  const [finish, setFinish] = useState<string>(
    order.specs.finish || currentService.finishes[0] || 'Corner Metal Eyelets'
  );
  const [customerNotes, setCustomerNotes] = useState<string>(order.specs.customerNotes || '');

  // Pricing Engine State
  const areaSqFt =
    order.specs.unit === 'ft'
      ? order.specs.width * order.specs.height
      : Number(((order.specs.width * order.specs.height) / 144).toFixed(2));

  // Determine rate based on material selection
  const getBaseRate = (mat: string): number => {
    if (mat.toLowerCase().includes('star')) return 18;
    if (mat.toLowerCase().includes('blackout')) return 22;
    if (mat.toLowerCase().includes('vinyl')) return 28;
    if (mat.toLowerCase().includes('glow')) return 75;
    return currentService.defaultRate || 12;
  };

  const [unitRate, setUnitRate] = useState<number>(() => getBaseRate(material));
  const [finishingCharges, setFinishingCharges] = useState<number>(
    currentService.setupCost || 50
  );
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [includeGst, setIncludeGst] = useState<boolean>(false);

  // When material changes, update default rate
  useEffect(() => {
    setUnitRate(getBaseRate(material));
  }, [material]);

  // Dynamic calculations
  const totalArea = currentService.unitType === 'sqft' ? areaSqFt * quantity : quantity;
  const rawSubtotal = currentService.unitType === 'sqft'
    ? Math.round(totalArea * unitRate)
    : Math.round(quantity * unitRate);
  
  const subtotalWithFinishing = rawSubtotal + finishingCharges;
  const taxableAmount = Math.max(0, subtotalWithFinishing - discountAmount);
  const gstAmount = includeGst ? Math.round(taxableAmount * 0.18) : 0;
  const grandTotal = taxableAmount + gstAmount;

  // Advance Payment State
  const [advancePaid, setAdvancePaid] = useState<number>(() => Math.round(grandTotal * 0.5));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [isCreditAllowed, setIsCreditAllowed] = useState<boolean>(false);
  const [creditReason, setCreditReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Recalculate advance suggestion if grand total changes and not manually touched
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  const setPresetAdvance = (percentage: number) => {
    setIsCreditAllowed(false);
    setAdvancePaid(Math.round((grandTotal * percentage) / 100));
  };

  const setCreditMode = () => {
    setIsCreditAllowed(true);
    setAdvancePaid(0);
    setCreditReason('Regular VIP client / Pay on Delivery authorized');
  };

  // Discount threshold check (max ₹200 or 10% without supervisor)
  const isHighDiscount = discountAmount > 200 || (grandTotal > 0 && discountAmount / (subtotalWithFinishing) > 0.10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (advancePaid < 0 || advancePaid > grandTotal) {
      alert('Advance amount cannot exceed total bill amount');
      return;
    }

    if (!isCreditAllowed && advancePaid === 0 && grandTotal > 0) {
      alert('Please collect an advance payment or select "Credit / Pay on Delivery" with a reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedOrder = await finalizeCashierBilling({
        orderId: order.id,
        quantity,
        material,
        finish,
        customerNotes,
        pricing: {
          unitRate,
          calculatedArea: totalArea,
          subtotal: subtotalWithFinishing,
          finishingCharges,
          discountAmount,
          taxAmount: gstAmount,
          totalAmount: grandTotal,
          advancePaid,
          balanceDue,
        },
        paymentMethod,
        paymentRef,
        creditAuthorized: isCreditAllowed,
        creditReason,
      });

      onSuccess(updatedOrder);
      setReceiptModalOrder(updatedOrder);
      onClose();
    } catch (err) {
      console.error('Failed to finalize billing:', err);
      alert('Error finalizing billing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto no-print-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Cashier Billing Counter
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Pending Billing & Payment
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Finalize Bill:</span>
                <span className="font-mono text-blue-300">{order.orderNumber}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Header from Designer */}
        <div className="bg-blue-50/70 border-b border-blue-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Designer Terminal</span>
              <span className="font-bold text-blue-900 flex items-center gap-1">
                🖥️ {order.designerSystemNo || 'System 01'}
                <span className="text-slate-500 font-normal">({order.designerName || 'Designer'})</span>
              </span>
            </div>
            <div className="h-6 w-px bg-blue-200" />
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold block">Customer</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
              <span className="text-slate-500 font-mono ml-1.5">({order.customerPhone})</span>
            </div>
          </div>
          <div className="bg-white border border-blue-200 px-3 py-1 rounded-lg font-mono font-bold text-blue-800 text-[11px]">
            {order.specs.width} × {order.specs.height} {order.specs.unit} ({areaSqFt} sq.ft)
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Cashier Discussion (Quantity, Material, Finishing) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>1. Quantity & Material Grade (Discussed with Customer)</span>
              </span>
              <span className="text-[11px] text-slate-500">Service: {order.serviceName}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity (Copies / Pieces)
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center py-2 font-mono font-bold text-slate-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Grade
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {currentService.materials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Finishing Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finishing & Fabrication
                </label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {currentService.finishes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing Engine Calculation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Price Calculation & Billing
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">Rate / Sq.Ft (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={unitRate}
                  onChange={(e) => setUnitRate(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-semibold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Finishing / Setup (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={finishingCharges}
                  onChange={(e) => setFinishingCharges(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-semibold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className={`w-full border rounded-lg px-2.5 py-1.5 font-mono font-semibold bg-white ${
                    isHighDiscount ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 py-2">
                  <input
                    type="checkbox"
                    checked={includeGst}
                    onChange={(e) => setIncludeGst(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>18% GST Bill</span>
                </label>
              </div>
            </div>

            {isHighDiscount && (
              <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-100/70 border border-amber-300 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Discount exceeds standard cashier limit (₹200 / 10%). Owner will be notified in the audit log.</span>
              </div>
            )}

            {/* Calculations Summary Bar */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-600">
                <span>Subtotal: ₹{subtotalWithFinishing}</span>
                {discountAmount > 0 && <span className="text-emerald-700 ml-2">-₹{discountAmount} disc</span>}
                {includeGst && <span className="text-slate-500 ml-2">+₹{gstAmount} GST</span>}
              </div>
              <div className="text-sm font-bold text-slate-900">
                Grand Total: <span className="text-blue-700 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Collection & Kallaa Allocation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>3. Payment Collection (Advance / Full)</span>
              </span>
              <span className="text-xs font-bold text-slate-900 font-mono">
                Balance Due: <span className="text-amber-700">₹{balanceDue.toLocaleString('en-IN')}</span>
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPresetAdvance(50)}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  advancePaid === Math.round(grandTotal * 0.5) && !isCreditAllowed
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                50% Advance (₹{Math.round(grandTotal * 0.5)})
              </button>

              <button
                type="button"
                onClick={() => setPresetAdvance(100)}
                className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                  advancePaid === grandTotal && !isCreditAllowed
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Full 100% (₹{grandTotal})
              </button>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={advancePaid}
                  onChange={(e) => {
                    setIsCreditAllowed(false);
                    setAdvancePaid(Number(e.target.value) || 0);
                  }}
                  placeholder="Custom ₹"
                  className="w-full h-full border border-slate-300 rounded-xl px-3 py-1.5 font-mono font-bold text-slate-900 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-400 pointer-events-none">
                  Custom
                </span>
              </div>

              <button
                type="button"
                onClick={setCreditMode}
                className={`py-2 px-3 rounded-xl border font-bold text-[11px] transition-all ${
                  isCreditAllowed
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white border-slate-300 text-amber-800 hover:bg-amber-50'
                }`}
              >
                Pay on Delivery (Credit)
              </button>
            </div>

            {isCreditAllowed && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs space-y-1.5">
                <label className="font-bold text-amber-900 block">
                  Credit Reason (Recorded in Owner Audit Log):
                </label>
                <input
                  type="text"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="e.g. Regular VIP customer, payment on banner pickup"
                  className="w-full border border-amber-300 rounded-lg p-2 text-xs text-slate-900 bg-white"
                />
              </div>
            )}

            {/* Payment Method Selector */}
            {advancePaid > 0 && (
              <div className="space-y-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Payment Mode for Advance Collection:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-bold transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>💵 Cash in Drawer (கல்லா)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-bold transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>UPI / GPay / PhonePe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-bold transition-all ${
                      paymentMethod === 'BANK'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank Transfer / Cheque</span>
                  </button>
                </div>

                {paymentMethod !== 'CASH' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {paymentMethod === 'UPI' ? 'UPI Transaction Ref / UTR No.' : 'Bank Reference / Cheque No.'}
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder={paymentMethod === 'UPI' ? 'e.g. 428901238910 (Google Pay UTR)' : 'e.g. IMPS-9840129'}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 bg-white"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-slate-100 -mx-6 -mb-6 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel / Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : `Confirm ₹${advancePaid} & Send to Production`}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
