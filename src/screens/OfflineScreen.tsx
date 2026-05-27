import { ArrowLeft, CloudOff, CheckCircle2, Database, RefreshCw } from 'lucide-react';

interface OfflineScreenProps {
  onBack: () => void;
}

export function OfflineScreen({ onBack }: OfflineScreenProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Offline Mode</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Offline Icon */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <CloudOff size={48} className="text-gray-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">No Internet Connection</h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          You are offline
        </p>
        <p className="text-xs text-gray-400 text-center max-w-[280px] mb-8">
          Don&apos;t worry! Pratibha AI works completely offline. All your data is saved locally and will sync automatically when internet becomes available.
        </p>

        {/* Features List */}
        <div className="w-full max-w-[320px] space-y-3 mb-8">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Record attendance</p>
              <p className="text-[10px] text-gray-400">All entries saved locally</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">Voice reports</p>
              <p className="text-[10px] text-gray-400">Record and transcribe offline</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">View all child profiles</p>
              <p className="text-[10px] text-gray-400">Data available offline</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">AI Assistant</p>
              <p className="text-[10px] text-gray-400">Works with on-device AI</p>
            </div>
          </div>
        </div>

        {/* Storage Info */}
        <div className="w-full max-w-[320px] p-4 bg-white rounded-2xl border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Database size={18} className="text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Local Storage</p>
              <p className="text-[10px] text-gray-400">2.4 MB used of 50 MB</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="w-[5%] h-full bg-emerald-500 rounded-full" />
          </div>
        </div>

        {/* Sync Button */}
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium active:scale-95 transition-transform">
          <RefreshCw size={18} />
          Sync Now
        </button>
      </div>

      {/* Bottom Status */}
      <div className="shrink-0 p-4 bg-white border-t border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-xs text-gray-500">All information will sync automatically when online</p>
        </div>
      </div>
    </div>
  );
}
