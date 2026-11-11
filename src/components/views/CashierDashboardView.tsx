import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, PaymentMethod } from '../../types';
import {
  Wallet,
  Smartphone,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  Calculator,
  AlertTriangle,
  ArrowRight,
  User,
  Phone,
  Ruler,
  Layers,
  Search,
  IndianRupee,
  FileText,
} from 'lucide-react';

export const CashierDashboardView: React.FC = () => {
  const {
    activeShift,
    orders,
    transactions,
    currentUser,
    setCashierBillingOrder,
    setReceiptModalOrder,
    recordOrderPayment,
    setActiveView,
  } = useApp();

  const [collectModalOrder, setCollectModalOrder] = useState<Order | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>('CASH');
  const [collectRef, setCollectRef] = useState<string>('');

  // 1. Designer Intake Queue (Awaiting Cashier Billing)
  const pendingDesignerJobs = orders.filter((o) => o.status === 'Awaiting Billing');

  // 2. Pickups with Balance Due
  const balancePickupJobs = orders.filter(
    (o) => o.status === 'Ready for Collection' && o.pricing.balanceDue > 0
  );

  // 3. Shift Financials
  const todayTransactions = transactions.filter((t) => t.direction === 'IN');
  const cashCollected = todayTransactions
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + t.amount, 0);

  const upiCollected = todayTransactions
    .filter((t) => t.paymentMethod === 'UPI')
    .reduce((sum, t) => sum + t.amount, 0);

  const bankCollected = todayTransactions
    .filter((t) => t.paymentMethod === 'BANK')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCollected = cashCollected + upiCollected + bankCollected;

  const handleOpenSettle = (order: Order) => {
    setCollectModalOrder(order);
    setCollectAmount(order.pricing.balanceDue);
    setCollectMethod('CASH');
    setCollectRef('');
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalOrder || collectAmount <= 0) return;
    recordOrderPayment(collectModalOrder.id, collectAmount, collectMethod, collectRef);
    setCollectModalOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Billing & Kallaa Desk
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-mono">
                Cashier: {currentUser.name}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span>Cashier Counter Command Center</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
              Verify incoming designer tickets, discuss customer quantities, finalize material grades, collect payments, and protect the physical cash drawer (கல்லா).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveView('cash-shifts')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>Shift Reconciliation (கல்லா)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kallaa Shift Financials Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Physical Cash in Drawer */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 border-2 border-emerald-300 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Physical Drawer (கல்லா)</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono">
            ₹{activeShift.expectedCash.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Opening Float + Cash Collections
          </div>
        </div>

        {/* UPI Collections */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">UPI / GPay Today</span>
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono">
            ₹{upiCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-blue-600/80 mt-1">
            Direct Bank Credit (Non-Cash)
          </div>
        </div>

        {/* Cash Collected Today */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Cash Sales Today</span>
            <IndianRupee className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{cashCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Received across counter
          </div>
        </div>

        {/* Total Shift Collections */}
        <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Collections</span>
            <Calculator className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-1">
            {todayTransactions.length} payment entries
          </div>
        </div>
      </div>

      {/* Main Cashier Workspace: Pending Designer Queue + Pickup Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Live Intake Queue from Designers (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span>1. Live Designer Intake Queue</span>
                  <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {pendingDesignerJobs.length} Waiting
                  </span>
                </h2>
              </div>
              <span className="text-xs text-slate-500">Discuss quantity & bill to authorize printing</span>
            </div>

            {pendingDesignerJobs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-bold text-slate-700">All designer tickets billed!</div>
                <div>Waiting for designer workstations (System 01, 02) to submit new job slips.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDesignerJobs.map((order) => {
                  const area =
                    order.specs.unit === 'ft'
                      ? order.specs.width * order.specs.height
                      : Number(((order.specs.width * order.specs.height) / 144).toFixed(1));

                  return (
                    <div
                      key={order.id}
                      className="bg-amber-50/40 rounded-xl p-4 border border-amber-300 hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-900 text-sm">
                            {order.orderNumber}
                          </span>
                          <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            🖥️ {order.designerSystemNo || 'System 01'} ({order.designerName || 'Designer'})
                          </span>
                          <span className="text-slate-400 text-xs font-mono">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{order.customerName}</span>
                          <span className="text-slate-500 font-mono font-normal text-xs">
                            ({order.customerPhone})
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 font-medium">
                          Service: <span className="font-bold">{order.serviceName}</span>
                        </div>

                        <div className="text-blue-800 font-mono font-bold text-xs">
                          Dimensions: {order.specs.width} × {order.specs.height} {order.specs.unit} ({area} sq.ft)
                        </div>
                      </div>

                      <button
                        onClick={() => setCashierBillingOrder(order)}
                        className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Bill & Collect Advance</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Recent Payments Processed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Today's Counter Transaction Receipts
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {todayTransactions.length} Payments
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {todayTransactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>₹{txn.amount.toLocaleString('en-IN')}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          txn.paymentMethod === 'CASH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {txn.paymentMethod}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] truncate max-w-sm">
                      {txn.notes || `Order ${txn.orderNumber}`}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-400">
                    {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Customer Balance Pickups (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready for Pickup (Balances Due)</span>
              </h3>
              <span className="text-xs font-bold font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">
                {balancePickupJobs.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Banners ready from shop floor. Verify remaining balance payment before handing over goods:
            </p>

            {balancePickupJobs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No orders waiting for balance collection.
              </div>
            ) : (
              <div className="space-y-3">
                {balancePickupJobs.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-xl border border-red-200 bg-red-50/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {order.orderNumber}
                      </span>
                      <span className="font-mono font-black text-red-600 text-sm">
                        ₹{order.pricing.balanceDue.toLocaleString('en-IN')} Due
                      </span>
                    </div>

                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{order.customerPhone}</div>
                      <div className="text-slate-600 text-[11px] truncate mt-0.5">{order.serviceName}</div>
                    </div>

                    <button
                      onClick={() => handleOpenSettle(order)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      Collect ₹{order.pricing.balanceDue} & Release Print
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settle Balance Modal */}
      {collectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Collect Final Balance — {collectModalOrder.orderNumber}
              </h3>
              <button
                onClick={() => setCollectModalOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{collectModalOrder.customerName}</div>
              <div className="text-slate-500">{collectModalOrder.serviceName}</div>
              <div className="font-mono font-bold text-red-600 text-sm pt-1">
                Outstanding Balance: ₹{collectModalOrder.pricing.balanceDue}
              </div>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={collectModalOrder.pricing.balanceDue}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['CASH', 'UPI', 'BANK'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCollectMethod(m)}
                      className={`py-2 px-2 rounded-lg font-bold border transition-all ${
                        collectMethod === m
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {m === 'CASH' ? '💵 Cash' : m === 'UPI' ? '📱 UPI' : '🏦 Bank'}
                    </button>
                  ))}
                </div>
              </div>

              {collectMethod !== 'CASH' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Ref / UTR No.
                  </label>
                  <input
                    type="text"
                    required
                    value={collectRef}
                    onChange={(e) => setCollectRef(e.target.value)}
                    placeholder="e.g. 428901238910"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectModalOrder(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Settle ₹{collectAmount} & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
