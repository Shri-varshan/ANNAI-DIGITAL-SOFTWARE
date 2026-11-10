import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../data/seedData';
import {
  Wallet,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Coins,
  History,
  Info,
} from 'lucide-react';

export const CashShiftsView: React.FC = () => {
  const {
    activeShift,
    shifts,
    transactions,
    currentUser,
    reconcileAndCloseShift,
  } = useApp();

  // Denominations counter state
  const [denom500, setDenom500] = useState<number>(0);
  const [denom200, setDenom200] = useState<number>(0);
  const [denom100, setDenom100] = useState<number>(0);
  const [denom50, setDenom50] = useState<number>(0);
  const [denom20, setDenom20] = useState<number>(0);
  const [denom10, setDenom10] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);

  // Manual cash override input
  const [manualCountedCash, setManualCountedCash] = useState<string>('');
  const [useCalculator, setUseCalculator] = useState<boolean>(true);

  // Handover state
  const [incomingOperatorId, setIncomingOperatorId] = useState<string>(
    INITIAL_USERS.find((u) => u.id !== currentUser.id)?.id || INITIAL_USERS[0].id
  );
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('');
  const [isSuccessModal, setIsSuccessModal] = useState<boolean>(false);

  // Total Counted from denominations
  const countedFromDenom =
    denom500 * 500 +
    denom200 * 200 +
    denom100 * 100 +
    denom50 * 50 +
    denom20 * 20 +
    denom10 * 10 +
    coins;

  const actualCounted = useCalculator
    ? countedFromDenom
    : Number(manualCountedCash) || 0;

  const expectedCash = activeShift.expectedCash;
  const difference = actualCounted - expectedCash;
  const hasDiscrepancy = actualCounted > 0 && difference !== 0;

  // Filter transactions belonging to current active shift
  const shiftCashTxns = transactions.filter(
    (t) => t.paymentMethod === 'CASH' && new Date(t.timestamp) >= new Date(activeShift.openedAt)
  );

  const shiftCashIn = shiftCashTxns
    .filter((t) => t.direction === 'IN')
    .reduce((sum, t) => sum + t.amount, 0);

  const shiftCashOut = shiftCashTxns
    .filter((t) => t.direction === 'OUT')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();

    if (actualCounted <= 0) {
      alert('Please perform physical cash count before completing handover.');
      return;
    }

    if (hasDiscrepancy && !discrepancyReason.trim()) {
      alert('Please record an explanation for the physical cash discrepancy.');
      return;
    }

    reconcileAndCloseShift(
      actualCounted,
      incomingOperatorId,
      handoverNotes,
      discrepancyReason
    );

    // Reset denominations
    setDenom500(0);
    setDenom200(0);
    setDenom100(0);
    setDenom50(0);
    setDenom20(0);
    setDenom10(0);
    setCoins(0);
    setManualCountedCash('');
    setHandoverNotes('');
    setDiscrepancyReason('');

    setIsSuccessModal(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Physical Cash Drawer (கல்லா) & Shift Handover</span>
            <span className="text-xs font-mono font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Active Shift: {activeShift.status}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Reconciles physical counter cash against cash-in and cash-out transactions. UPI & Bank receipts are segregated.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Shift opened: {new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {activeShift.operatorName}
        </div>
      </div>

      {/* Row 1: The Core Reconciliation Equation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>Mathematical Cash Drawer Equation</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Single Shared Drawer across Sector 1, 2, 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          {/* Opening Float */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">
              1. Opening Physical Cash
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 block mt-1">
              ₹{activeShift.openingCash.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Initial morning float
            </span>
          </div>

          {/* Plus Cash Received */}
          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 block">
              + 2. Cash Received In
            </span>
            <span className="text-xl font-bold font-mono text-emerald-900 block mt-1">
              ₹{shiftCashIn.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">
              Customer order cash
            </span>
          </div>

          {/* Minus Cash Paid */}
          <div className="p-3 bg-red-50/70 rounded-lg border border-red-200">
            <span className="text-[11px] font-semibold text-red-800 block">
              - 3. Cash Paid Out
            </span>
            <span className="text-xl font-bold font-mono text-red-900 block mt-1">
              ₹{shiftCashOut.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-red-700 block mt-0.5">
              Petty cash, shop tea, tips
            </span>
          </div>

          {/* Expected Physical Cash */}
          <div className="p-3 bg-slate-900 text-white rounded-lg shadow-xs">
            <span className="text-[11px] font-semibold text-blue-300 block">
              = Expected Physical Cash
            </span>
            <span className="text-2xl font-bold font-mono text-white block mt-1">
              ₹{expectedCash.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
              Formula: Op + In - Out
            </span>
          </div>
        </div>

        {/* Informational banner: UPI & Bank segregation */}
        <div className="flex items-start gap-2 p-3 bg-blue-50/60 rounded-lg border border-blue-200/80 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Auditing Rule:</strong> Customer payments received through GPay/PhonePe UPI or Direct Bank Transfer bypass the physical cash drawer and do not increment Expected Cash. Only physical rupee notes/coins affect this balance.
          </p>
        </div>
      </div>

      {/* Row 2: Counting Assistant & Shift Handover Form */}
      <form onSubmit={handleCloseShift} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Physical Cash Counting Assistant */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Physical Denominations Assistant</span>
            </span>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUseCalculator(!useCalculator)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {useCalculator ? 'Switch to Manual Sum' : 'Switch to Denominations'}
              </button>
            </div>
          </div>

          {useCalculator ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Count notes in the drawer and enter pieces below:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* 500 */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>₹500 Notes</span>
                    <span className="font-mono text-blue-700">₹{denom500 * 500}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={denom500 || ''}
                    onChange={(e) => setDenom500(Math.max(0, Number(e.target.value)))}
                    placeholder="Pieces"
                    className="w-full mt-1 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs"
                  />
                </div>

                {/* 200 */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>₹200 Notes</span>
                    <span className="font-mono text-blue-700">₹{denom200 * 200}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={denom200 || ''}
                    onChange={(e) => setDenom200(Math.max(0, Number(e.target.value)))}
                    placeholder="Pieces"
                    className="w-full mt-1 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs"
                  />
                </div>

                {/* 100 */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>₹100 Notes</span>
                    <span className="font-mono text-blue-700">₹{denom100 * 100}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={denom100 || ''}
                    onChange={(e) => setDenom100(Math.max(0, Number(e.target.value)))}
                    placeholder="Pieces"
                    className="w-full mt-1 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs"
                  />
                </div>

                {/* 50 */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>₹50 Notes</span>
                    <span className="font-mono text-blue-700">₹{denom50 * 50}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={denom50 || ''}
                    onChange={(e) => setDenom50(Math.max(0, Number(e.target.value)))}
                    placeholder="Pieces"
                    className="w-full mt-1 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs"
                  />
                </div>

                {/* 20 */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>₹20 Notes</span>
                    <span className="font-mono text-blue-700">₹{denom20 * 20}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={denom20 || ''}
                    onChange={(e) => setDenom20(Math.max(0, Number(e.target.value)))}
                    placeholder="Pieces"
                    className="w-full mt-1 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs"
                  />
                </div>

                {/* 10 */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>₹10 Notes</span>
                    <span className="font-mono text-blue-700">₹{denom10 * 10}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={denom10 || ''}
                    onChange={(e) => setDenom10(Math.max(0, Number(e.target.value)))}
                    placeholder="Pieces"
                    className="w-full mt-1 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs"
                  />
                </div>

                {/* Coins */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Loose Coins Total (₹)</span>
                    <span className="font-mono text-blue-700">₹{coins}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={coins || ''}
                    onChange={(e) => setCoins(Math.max(0, Number(e.target.value)))}
                    placeholder="Total Rupees in Coins"
                    className="w-full mt-1 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Physically Counted Cash Total (₹)
              </label>
              <input
                type="number"
                min="0"
                value={manualCountedCash}
                onChange={(e) => setManualCountedCash(e.target.value)}
                placeholder="e.g. 3650"
                className="w-full text-lg font-bold font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600"
              />
            </div>
          )}

          {/* Counted Cash Summary Strip */}
          <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Total Counted Cash:</span>
            <span className="text-base font-bold font-mono text-slate-900">
              ₹{actualCounted.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Discrepancy & Shift Handover Signoff */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Shift Reconcile & Handover</span>
            </span>
          </div>

          {/* Difference & Discrepancy Indicator */}
          <div
            className={`p-4 rounded-xl border ${
              difference === 0 && actualCounted > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : difference < 0
                ? 'bg-red-50 border-red-300 text-red-900'
                : difference > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Cash Difference (Δ):</span>
              <span className="font-mono text-base font-bold">
                {difference > 0 ? `+₹${difference}` : difference < 0 ? `-₹${Math.abs(difference)}` : '₹0.00'}
              </span>
            </div>
            <p className="text-[11px] mt-1 leading-snug">
              {difference === 0 && actualCounted > 0
                ? 'Perfect Match! Physical cash exactly equals calculated expected cash.'
                : difference < 0
                ? 'Shortfall: Physically counted cash is LESS than expected drawer balance.'
                : difference > 0
                ? 'Surplus: Physically counted cash exceeds expected drawer balance.'
                : 'Enter physical count to calculate variance.'}
            </p>
          </div>

          {/* If Discrepancy Exists, require explanation */}
          {hasDiscrepancy && (
            <div>
              <label className="block text-xs font-bold text-red-700 mb-1">
                Discrepancy Explanation <span className="text-red-500">* Required</span>
              </label>
              <input
                type="text"
                value={discrepancyReason}
                onChange={(e) => setDiscrepancyReason(e.target.value)}
                placeholder="e.g. Returned ₹50 coin change to customer without slip"
                className="w-full text-xs px-3 py-2 border border-red-300 rounded-lg bg-red-50/30"
                required
              />
            </div>
          )}

          {/* Incoming Operator Signoff */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handover Custody To (Next Operator)
            </label>
            <select
              value={incomingOperatorId}
              onChange={(e) => setIncomingOperatorId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
            >
              {INITIAL_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Handover Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handover Remarks
            </label>
            <input
              type="text"
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="e.g. Star Flex roll 10ft replaced, clean work area"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          {/* Submit Handover Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Complete Handover & Close Shift</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Row 3: Shift History Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Shift Custody & Audit Archive</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {shifts.length} Recorded Shifts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Shift Time</th>
                <th className="py-2.5 px-4 font-semibold">Outgoing Operator</th>
                <th className="py-2.5 px-4 font-semibold">Incoming Handover</th>
                <th className="py-2.5 px-4 font-semibold text-right">Opening Float</th>
                <th className="py-2.5 px-4 font-semibold text-right">Expected Cash</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actual Counted</th>
                <th className="py-2.5 px-4 font-semibold text-right">Difference</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((s, idx) => (
                <tr key={`${s.id}-${s.openedAt || idx}-${s.status}`} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono">
                    {new Date(s.openedAt).toLocaleDateString('en-IN')}{' '}
                    {new Date(s.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{s.operatorName}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {s.handoverToOperatorName || 'Active Shift'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">₹{s.openingCash.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium">₹{s.expectedCash.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {s.actualCountedCash !== undefined ? `₹${s.actualCountedCash.toLocaleString('en-IN')}` : 'In Progress'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {s.discrepancy !== undefined ? (
                      s.discrepancy === 0 ? (
                        <span className="text-emerald-600">₹0</span>
                      ) : (
                        <span className="text-red-600">₹{s.discrepancy}</span>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.status === 'OPEN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Confirmation Toast/Modal */}
      {isSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Shift Closed Successfully!</h3>
            <p className="text-xs text-slate-600">
              Cash custody transferred and new shift opened. Physical float recorded in audit ledger.
            </p>
            <button
              onClick={() => setIsSuccessModal(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
