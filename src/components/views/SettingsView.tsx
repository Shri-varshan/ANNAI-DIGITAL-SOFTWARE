import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    branches,
    sectors,
    updateSectorSettings,
    resetToDemoData,
    activeBranch,
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSectorChange = (id: string, field: string, value: any) => {
    updateSectorSettings(id, { [field]: value });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      branches,
      sectors,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annai_settings_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all operational data back to standard Chennai demo state? This will restore initial orders and shifts.')) {
      resetToDemoData();
      alert('Workspace reset to Chennai demo dataset!');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <span>Business Settings & Machinery Configuration</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure operating sectors, machine models, multi-branch readiness, and demo state.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Updated!</span>
          </div>
        )}
      </div>

      {/* Section 1: Multi-Branch Readiness */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Branch Architecture (Madhavaram Active Hub)</span>
          </span>
          <span className="text-xs font-mono text-slate-500">Chennai Region</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-xl border text-xs space-y-1.5 transition-colors ${
                b.isActive
                  ? 'border-blue-500 bg-blue-50/40'
                  : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{b.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    b.isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {b.isActive ? 'Active Shop' : 'Planned Branch'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">{b.address}</p>
              <div className="text-[10px] text-slate-400 font-mono">Code: {b.code} · Ph: {b.phone}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Sector Names & Machinery Configuration */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Sector Names & Machinery Parameters</span>
          </span>
          <span className="text-xs text-slate-500">
            Configurable by Authorized Admin
          </span>
        </div>

        <div className="space-y-4">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  {sector.code}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Current Queue: {sector.currentPendingJobs} jobs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Sector Display Name
                  </label>
                  <input
                    type="text"
                    value={sector.name}
                    onChange={(e) => handleSectorChange(sector.id, 'name', e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Primary Machinery Spec
                  </label>
                  <input
                    type="text"
                    value={sector.machinery}
                    onChange={(e) => handleSectorChange(sector.id, 'machinery', e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Max Daily Capacity (Units/Sq.ft)
                  </label>
                  <input
                    type="number"
                    value={sector.maxDailyCapacity}
                    onChange={(e) => handleSectorChange(sector.id, 'maxDailyCapacity', Number(e.target.value))}
                    className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Operating Capabilities & Instructions
                </label>
                <input
                  type="text"
                  value={sector.description}
                  onChange={(e) => handleSectorChange(sector.id, 'description', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Reset & Data Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Workspace Data Controls</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="font-bold text-slate-900">Reload Chennai Demo Dataset</div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Restores initial realistic sample orders, transactions, active shift with ₹3,000 float, and customer records.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportBackup}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup State</span>
            </button>

            <button
              onClick={handleResetData}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
