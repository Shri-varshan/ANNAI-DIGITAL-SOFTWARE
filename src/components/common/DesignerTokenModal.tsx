import React from 'react';
import { Order } from '../../types';
import { Printer, CheckCircle2, Monitor, ArrowRight, User, Phone, Ruler, Image as ImageIcon, X } from 'lucide-react';

interface DesignerTokenModalProps {
  order: Order;
  onClose: () => void;
  onOpenCashierBilling?: (order: Order) => void;
}

export const DesignerTokenModal: React.FC<DesignerTokenModalProps> = ({
  order,
  onClose,
  onOpenCashierBilling,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const areaSqFt = order.specs.unit === 'ft'
    ? order.specs.width * order.specs.height
    : Number(((order.specs.width * order.specs.height) / 144).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-black text-xl">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Annai Digital Printing
                </span>
                <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Design Approved
                </span>
              </div>
              <h2 className="text-lg font-bold">Designer Job Ticket & Token</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Token Card Body */}
        <div className="p-6 space-y-5">
          {/* Big Token Number & Designer System Banner */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Job Token Number
              </span>
              <div className="text-2xl font-black font-mono text-blue-900 tracking-tight">
                {order.orderNumber}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Originating Terminal
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs">
                <Monitor className="w-4 h-4" />
                <span>{order.designerSystemNo || 'System 01'}</span>
              </div>
            </div>
          </div>

          {/* Customer & Service Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Customer</span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.customerName}</span>
              </div>
              <div className="text-slate-500 font-mono flex items-center gap-1 mt-1 text-[11px]">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.customerPhone}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Service & Size</span>
              <div className="font-bold text-slate-900 truncate mt-0.5" title={order.serviceName}>
                {order.serviceName}
              </div>
              <div className="text-blue-700 font-mono font-semibold flex items-center gap-1 mt-1 text-[11px]">
                <Ruler className="w-3 h-3 text-blue-500" />
                <span>
                  {order.specs.width} × {order.specs.height} {order.specs.unit} ({areaSqFt} sq.ft)
                </span>
              </div>
            </div>
          </div>

          {/* Artwork & Design Attachment */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Artwork File / Reference</span>
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium px-2 py-0.5 rounded">
                {order.specs.artworkChannel || 'WHATSAPP'}
              </span>
            </div>
            <div className="font-mono text-slate-800 text-[11px] truncate bg-white p-2 rounded-lg border border-slate-200">
              {order.specs.artworkFileName || order.specs.shopTemplateCode || 'murugan_banner_10x4.tif'}
            </div>
            {order.specs.customerNotes && (
              <p className="text-[11px] text-slate-600 italic">
                &ldquo;{order.specs.customerNotes}&rdquo;
              </p>
            )}
          </div>

          {/* Instructions Box for Customer */}
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold">
              !
            </div>
            <div>
              <span className="font-bold block text-sm">Next Step: Proceed to Cashier (கல்லா)</span>
              <p className="text-amber-800/90 text-[11px] mt-0.5 leading-relaxed">
                Take this token to the Cashier Counter. The cashier will finalize the <strong>quantity</strong>, <strong>material grade</strong> (Normal vs. Star Flex), <strong>finishing eyelets</strong>, and collect the advance payment to start printing.
              </p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Token Chit</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenCashierBilling && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCashierBilling(order);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <span>Open in Cashier Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
            >
              Done / Next Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
