import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../data/seedData';
import { Plus, Printer, Shield, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    activeBranch,
    setActiveView,
    activeShift,
    setReceiptModalOrder,
    lastCreatedOrder,
    isBackendConnected,
    refreshBackendData,
  } = useApp();

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 z-30 sticky top-0">
      {/* Zone 1: Single Brand Lockup with Branch tag */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          A
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Annai Digital Printing
            </span>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
              {activeBranch.name.split(' ')[0]} Main
            </span>
            <button
              onClick={() => refreshBackendData()}
              title="Click to sync with backend REST API"
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
                isBackendConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isBackendConnected ? 'API Live' : 'Syncing'}</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Madhavaram, Chennai · Shift: ₹{activeShift.expectedCash.toLocaleString('en-IN')} Cash
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Quick Stats / Live Shift Watcher */}
      <nav className="hidden lg:flex items-center gap-6 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Drawer (கல்லா):</span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            ₹{activeShift.expectedCash.toLocaleString('en-IN')}
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Active Shift:</span>
          <span className="text-emerald-700 font-medium whitespace-nowrap">
            {activeShift.operatorName.split(' ')[0]} ({activeShift.status})
          </span>
        </div>
        {lastCreatedOrder && (
          <>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setReceiptModalOrder(lastCreatedOrder)}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Last Bill: {lastCreatedOrder.orderNumber}</span>
            </button>
          </>
        )}
      </nav>

      {/* Zone 3: Primary Action & Operator Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveView('new-order')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Order</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-blue-500/50 rounded font-mono">
            F2
          </kbd>
        </button>

        {/* Operator Profile Selector */}
        <div className="relative group">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight whitespace-nowrap">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-none whitespace-nowrap">
                {currentUser.role === 'BILLING_OPERATOR'
                  ? 'Operator'
                  : currentUser.role === 'OWNER'
                  ? 'Owner'
                  : currentUser.role === 'PRODUCTION_STAFF'
                  ? 'Production'
                  : 'Accounts'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Role Switching Dropdown */}
          <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
            <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Switch Active Operator / Role
            </div>
            {INITIAL_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  user.id === currentUser.id ? 'bg-blue-50/70 text-blue-900 font-semibold' : 'text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-[10px] text-slate-500">{user.role.replace('_', ' ')}</div>
                </div>
                {user.id === currentUser.id && (
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
