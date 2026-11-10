import React, { useState } from 'react';
import { Order } from '../../types';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ThermalReceiptProps {
  order: Order;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptProps> = ({ order, onClose }) => {
  const { activeBranch } = useApp();
  const [printMode, setPrintMode] = useState<'thermal' | 'a4'>('thermal');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Receipt / Tax Bill — {order.orderNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Assigned to {order.assignedSectorName.split('—')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setPrintMode('thermal')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  printMode === 'thermal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setPrintMode('a4')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  printMode === 'a4'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Invoice
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {printMode === 'thermal' ? (
            /* 80mm Thermal Receipt Simulation */
            <div className="thermal-receipt bg-white w-[300px] p-4 shadow-sm border border-slate-200 font-mono text-[11px] text-black">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-black pb-2 mb-2">
                <div className="font-bold text-sm tracking-tight">ANNAI DIGITAL PRINTING</div>
                <div className="text-[10px]">Madhavaram Main Branch</div>
                <div className="text-[9px] text-slate-600">{activeBranch.address}</div>
                <div className="text-[9px] font-semibold mt-0.5">Ph: {activeBranch.phone}</div>
                <div className="mt-1 font-bold text-xs bg-black text-white py-0.5 px-2 inline-block">
                  ESTIMATE & RECEIPT
                </div>
              </div>

              {/* Order Meta */}
              <div className="space-y-0.5 mb-2 border-b border-dashed border-black pb-2 text-[10px]">
                <div className="flex justify-between">
                  <span>BILL NO:</span>
                  <span className="font-bold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN')} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="font-semibold truncate max-w-[170px]">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>MOBILE:</span>
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>SECTOR:</span>
                  <span className="font-bold">{order.assignedSectorName.split('—')[0]}</span>
                </div>
              </div>

              {/* Service & Item Details */}
              <div className="mb-2 border-b border-dashed border-black pb-2">
                <div className="font-bold text-xs">{order.serviceName}</div>
                {order.specs?.artworkSource === 'SHOP_TEMPLATE' ? (
                  <div className="text-[10px] text-slate-700">
                    Template: {order.specs.shopTemplateCode || order.designCode || 'FLEX-GRAND-01'}
                    {order.specs.templateModifications ? ` (${order.specs.templateModifications})` : ''}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-700">
                    File: {order.specs?.artworkFileName || (order.specs?.artworkSupplied ? 'Customer File (WhatsApp/USB)' : 'Standard Artwork')}
                  </div>
                )}
                <div className="text-[10px] text-slate-700 mt-0.5">
                  Size: {order.specs.width} × {order.specs.height} {order.specs.unit} ({order.pricing.calculatedArea ? `${order.pricing.calculatedArea} sq.ft` : ''})
                </div>
                <div className="text-[10px] text-slate-700">
                  Qty: {order.specs.quantity} · Mat: {order.specs.material}
                </div>
                <div className="text-[10px] text-slate-700">
                  Finish: {order.specs.finish}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-1 text-right mb-2 border-b border-dashed border-black pb-2 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{order.pricing.subtotal.toFixed(2)}</span>
                </div>
                {order.pricing.finishingCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Finishing/Setup:</span>
                    <span>₹{order.pricing.finishingCharges.toFixed(2)}</span>
                  </div>
                )}
                {order.pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span>-₹{order.pricing.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                  <span>NET TOTAL:</span>
                  <span>₹{order.pricing.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>ADVANCE PAID:</span>
                  <span>₹{order.pricing.advancePaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-700 font-bold text-xs pt-0.5">
                  <span>BALANCE DUE:</span>
                  <span>₹{order.pricing.balanceDue.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="text-center text-[9px] text-slate-600 pt-1">
                <div>Delivery Date: {new Date(order.dueDate).toLocaleDateString('en-IN')}</div>
                <div className="mt-1 font-semibold">Billed by: {order.operatorName}</div>
                <div className="mt-1">Goods once printed will not be taken back.</div>
                <div className="mt-0.5 font-bold tracking-widest text-[8px] uppercase">
                  *** THANK YOU FOR VISITING ***
                </div>
              </div>
            </div>
          ) : (
            /* A4 Tax Invoice Format */
            <div className="bg-white w-full p-8 shadow-sm border border-slate-200 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    ANNAI DIGITAL PRINTING
                  </h2>
                  <p className="text-xs text-slate-600">{activeBranch.address}</p>
                  <p className="text-xs text-slate-600">Phone: {activeBranch.phone} · Madhavaram Hub</p>
                  <p className="text-xs text-blue-700 font-mono mt-1">GSTIN: 33AAAAA0000A1Z5 (Demo Registered)</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-slate-900 block">TAX INVOICE</span>
                  <span className="font-mono text-sm text-blue-600 font-semibold block">{order.orderNumber}</span>
                  <span className="text-xs text-slate-500 block">
                    Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Customer Box */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs">
                <div>
                  <div className="font-semibold text-slate-500 text-[10px] uppercase">Billed To</div>
                  <div className="font-bold text-slate-900 mt-0.5">{order.customerName}</div>
                  {order.companyName && <div className="text-slate-700">{order.companyName}</div>}
                  <div className="text-slate-600">Ph: {order.customerPhone}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500 text-[10px] uppercase">Production Sector</div>
                  <div className="font-bold text-blue-700 mt-0.5">{order.assignedSectorName}</div>
                  <div className="text-slate-600">Due Date: {new Date(order.dueDate).toLocaleDateString('en-IN')}</div>
                  <div className="text-slate-600">Status: {order.status}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse mb-4 text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600">
                    <th className="py-2 font-semibold">Service Description</th>
                    <th className="py-2 font-semibold">Specs & Finish</th>
                    <th className="py-2 text-right font-semibold">Area / Qty</th>
                    <th className="py-2 text-right font-semibold">Rate</th>
                    <th className="py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">
                      {order.serviceName}
                      {order.designCode && <span className="block text-[11px] font-normal text-slate-500">Design Code: {order.designCode}</span>}
                    </td>
                    <td className="py-3 text-slate-600">
                      {order.specs.width}×{order.specs.height} {order.specs.unit} · {order.specs.material} · {order.specs.finish}
                    </td>
                    <td className="py-3 text-right font-mono">
                      {order.pricing.calculatedArea ? `${order.pricing.calculatedArea} sq.ft` : order.specs.quantity}
                    </td>
                    <td className="py-3 text-right font-mono">₹{order.pricing.unitRate}</td>
                    <td className="py-3 text-right font-mono font-medium">₹{order.pricing.subtotal.toFixed(2)}</td>
                  </tr>
                  {order.pricing.finishingCharges > 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-slate-600">Finishing / Setup / Metal Eyelets Charges</td>
                      <td className="py-2 text-right font-mono">₹{order.pricing.finishingCharges.toFixed(2)}</td>
                    </tr>
                  )}
                  {order.pricing.discountAmount > 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-emerald-700">Special Discount Approved</td>
                      <td className="py-2 text-right font-mono text-emerald-700">-₹{order.pricing.discountAmount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="flex justify-end pt-2 border-t border-slate-300">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Bill:</span>
                    <span className="font-mono font-bold text-slate-900">₹{order.pricing.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Advance Received:</span>
                    <span className="font-mono">₹{order.pricing.advancePaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-700 font-bold border-t border-slate-200 pt-1 text-sm">
                    <span>Balance Due:</span>
                    <span className="font-mono">₹{order.pricing.balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="no-print p-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">Ctrl + P</kbd> anytime to print
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            Close & Next Order
          </button>
        </div>
      </div>
    </div>
  );
};
