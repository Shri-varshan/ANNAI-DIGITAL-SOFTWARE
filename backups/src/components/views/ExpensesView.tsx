import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, TransactionCategory } from '../../types';
import {
  Receipt,
  PlusCircle,
  Wallet,
  AlertCircle,
  Building2,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { transactions, sectors, recordExpense, activeShift } = useApp();

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('PETTY_CASH');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [sectorId, setSectorId] = useState<string>('sec-1');
  const [notes, setNotes] = useState<string>('');
  const [externalRef, setExternalRef] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const expenseTxns = transactions.filter((t) => t.direction === 'OUT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    recordExpense({
      amount: numAmount,
      category,
      paymentMethod,
      sectorId: sectorId || undefined,
      notes: notes.trim() || undefined,
      externalRef: externalRef.trim() || undefined,
    });

    setAmount('');
    setNotes('');
    setExternalRef('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const totalExpenses = expenseTxns.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Shop Expenses & Raw Material Outflows</span>
            <span className="text-xs font-mono font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded">
              Total Spent: ₹{totalExpenses.toLocaleString('en-IN')}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Record raw media purchases, machine maintenance, shop refreshments, and petty cash.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-600" />
              <span>Record New Outflow</span>
            </span>
            {paymentMethod === 'CASH' && (
              <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono font-bold">
                Impacts Cash கல்லா
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 450"
                className="w-full text-base font-bold font-mono px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="PETTY_CASH">Petty Cash / Shop Refreshments / Snacks</option>
                <option value="MATERIAL_PURCHASE">Raw Material (Flex Rolls, Vinyl, Paper Board)</option>
                <option value="SUPPLIER_PAYMENT">Printing Ink / Solvent / Solvent Heads</option>
                <option value="SHOP_EXPENSE">Electricity, Rent, Internet & Courier</option>
                <option value="REFUND">Customer Refund / Settlement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method / Source Account
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CASH', 'UPI', 'BANK'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                      paymentMethod === m
                        ? m === 'CASH'
                          ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-600'
                          : 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m === 'CASH' ? 'Cash கல்லா' : m === 'UPI' ? 'UPI / QR' : 'Bank'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sector Attribution
              </label>
              <select
                value={sectorId}
                onChange={(e) => setSectorId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Shared Shop Counter</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bill / Supplier Invoice Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="e.g. INV-8921 / UTR"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Remarks
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Courier charges for flex roll delivery from Parrys"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Post Expense Transaction
            </button>
          </form>

          {showSuccessToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Expense recorded in audit ledger!</span>
            </div>
          )}
        </div>

        {/* Expense History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Recorded Expenditures</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {expenseTxns.length} Vouchers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Channel</th>
                    <th className="py-2.5 px-4 font-semibold">Notes & Ref</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseTxns.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {t.category.replace(/_/g, ' ')}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {t.sectorName ? t.sectorName.split('—')[0] : 'Shared Shop'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800">
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                        {t.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                        ₹{t.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
