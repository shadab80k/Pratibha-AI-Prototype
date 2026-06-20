import { useState } from 'react';
import { ArrowLeft, CloudOff, CheckCircle2, Database, RefreshCw, Wifi } from 'lucide-react';

interface OfflineScreenProps {
  onBack: () => void;
  isOffline: boolean;
  pendingSync: any[];
  onSync: () => void;
}

export function OfflineScreen({ onBack, isOffline, pendingSync, onSync }: OfflineScreenProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSyncClick = () => {
    if (isOffline) {
      alert("Cannot synchronize database while Simulator Offline Mode is enabled! Please open the side panel and turn OFF Offline Sync first.");
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      alert("Your browser is offline! Please check your network/internet connection and try again.");
      return;
    }
    setSyncing(true);
    setTimeout(() => {
      onSync();
      setSyncing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Offline Sync</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-6 py-6 overflow-y-auto scrollbar-hide">
        {/* Offline / Online Status Card */}
        <div className={`w-full max-w-[320px] p-4 rounded-2xl border mb-6 text-center shadow-sm shrink-0 transition-all ${
          isOffline 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' 
            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-1.5">
            {isOffline ? (
              <CloudOff size={20} className="text-red-500" />
            ) : (
              <Wifi size={20} className="text-emerald-500 animate-pulse" />
            )}
            <h3 className={`text-sm font-bold ${isOffline ? 'text-red-800 dark:text-red-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
              {isOffline ? 'Simulator is Offline' : 'Simulator is Online'}
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
            {isOffline 
              ? 'All new records are being written locally to dynamic sandbox storage.' 
              : 'Connection is stable. Press Sync Now to upload local queue changes.'}
          </p>
        </div>

        {/* Sync Queue Title */}
        <div className="w-full max-w-[320px] mb-3 shrink-0 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Local Sync Queue</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
            {pendingSync.length} Pending
          </span>
        </div>

        {/* Pending Sync Items List */}
        <div className="w-full max-w-[320px] space-y-2 mb-6 shrink-0 flex-1 overflow-y-auto scrollbar-hide">
          {pendingSync.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-800 shadow-sm animate-slideDown">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center shrink-0">
                <Database size={14} className="text-orange-500 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate pr-1">{item.childName}</p>
                  <span className="text-[8px] bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                    {item.type}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate mt-0.5">{item.action}</p>
              </div>
            </div>
          ))}

          {pendingSync.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 text-center">
              <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
              <p className="text-xs font-semibold text-gray-800 dark:text-white">Database Synced</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-550 max-w-[200px] mt-1 leading-relaxed">
                All attendance logs, observation cards, and home visits are safely synced to the central Anganwadi server.
              </p>
            </div>
          )}
        </div>

        {/* Storage Info */}
        <div className="w-full max-w-[320px] p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mb-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Database size={18} className="text-gray-500 dark:text-slate-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-350">On-Device Storage</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                {pendingSync.length > 0 ? `${(2.4 + pendingSync.length * 0.1).toFixed(1)} MB` : '2.4 MB'} used of 50 MB
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(5 + pendingSync.length * 2, 100)}%` }}
            />
          </div>
        </div>

        {/* Sync Button */}
        {pendingSync.length > 0 && (
          <button
            onClick={handleSyncClick}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium active:scale-95 transition-transform shrink-0 shadow-md shadow-emerald-500/10 disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Synchronizing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {/* Bottom Status */}
      <div className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-center gap-2 text-center">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isOffline ? 'bg-red-400' : 'bg-emerald-500 animate-pulse'}`} />
          <p className="text-xs text-gray-550 dark:text-slate-400">
            {isOffline 
              ? 'Toggle Offline Sync OFF in sidebar settings to authorize upload.' 
              : 'Safe SSL handshake enabled. Ready to upload local queue.'}
          </p>
        </div>
      </div>
    </div>
  );
}
