import { ArrowLeft, User, Shield, Volume2, Database, RotateCcw, Save } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  workerName: string;
  setWorkerName: (name: string) => void;
  workerId: string;
  setWorkerId: (id: string) => void;
  anganwadiBlock: string;
  setAnganwadiBlock: (block: string) => void;
  onResetData: () => void;
}

export function SettingsScreen({
  onBack,
  workerName,
  setWorkerName,
  workerId,
  setWorkerId,
  anganwadiBlock,
  setAnganwadiBlock,
  onResetData,
}: SettingsScreenProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-hide">
        {/* Profile Card Edit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            <User size={16} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Edit Profile Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Worker Name</label>
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Worker Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Worker ID</label>
              <input
                type="text"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Worker ID"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">Anganwadi Center Block</label>
              <input
                type="text"
                value={anganwadiBlock}
                onChange={(e) => setAnganwadiBlock(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Anganwadi Center / Block"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            <Volume2 size={16} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">App Preferences</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase">Voice Guidance Speed</label>
              <div className="grid grid-cols-3 gap-2">
                {['Slow', 'Normal', 'Fast'].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    className={`h-8 rounded-xl text-xs font-semibold select-none active:scale-95 transition-all ${
                      speed === 'Normal'
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/10'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-650 dark:text-slate-350 border border-transparent dark:border-slate-850'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-slate-650 dark:text-slate-300">Sound Success Alerts</span>
              <button
                type="button"
                className="w-9 h-[22px] rounded-full bg-orange-500 relative outline-none shrink-0"
              >
                <div className="w-[18px] h-[18px] rounded-full bg-white shadow-sm absolute top-[2px] right-[2px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Database Control */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
            <Database size={16} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Simulator Database</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={onResetData}
              type="button"
              className="w-full flex items-center justify-center gap-2 h-10 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all"
            >
              <RotateCcw size={14} />
              Reset All Mock Data
            </button>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center leading-relaxed">
              Clears dynamic edits, attendance toggles, visit completions, and sync queues, restoring all simulator values to defaults.
            </p>
          </div>
        </div>

        {/* Security / System Version */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-orange-500" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">System Security</h3>
          </div>
          <p className="text-xs text-gray-550 dark:text-slate-400 leading-relaxed">
            All observation notes and child records are locally encrypted on-device. When syncing is triggered online, data transfers securely over SSL.
          </p>
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={onBack}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 dark:shadow-none"
        >
          <Save size={16} />
          Save Preferences
        </button>
      </div>
    </div>
  );
}
