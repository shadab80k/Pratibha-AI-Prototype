import { ArrowLeft, MapPin, Calendar, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { homeVisits } from '../data/mockData';

interface HomeVisitsScreenProps {
  onBack: () => void;
}

export function HomeVisitsScreen({ onBack }: HomeVisitsScreenProps) {
  const pending = homeVisits.filter((v) => v.status === 'pending');
  const completed = homeVisits.filter((v) => v.status === 'completed');

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Home Visits</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600" />
              <span className="text-xs text-amber-600 font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{pending.length}</p>
            <p className="text-xs text-gray-500">visits to complete</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{completed.length}</p>
            <p className="text-xs text-gray-500">this month</p>
          </div>
        </div>

        {/* Pending Visits */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Pending Visits</h3>
          <div className="space-y-3">
            {pending.map((visit) => (
              <div key={visit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">{visit.childName}&apos;s Home</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Parent: {visit.parentName}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      Last visit: {visit.lastVisit}
                    </p>

                    {/* AI Suggested Topics */}
                    <div className="mt-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle size={12} className="text-violet-500" />
                        <span className="text-[10px] font-medium text-violet-700">AI Suggested Discussion Topics</span>
                      </div>
                      <div className="space-y-1.5">
                        {visit.suggestedTopics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1 shrink-0" />
                            <p className="text-xs text-gray-600 leading-relaxed">{topic}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="mt-3 w-full h-10 bg-amber-500 text-white text-sm font-medium rounded-xl active:scale-95 transition-transform">
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Visits */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Completed</h3>
            <div className="space-y-3">
              {completed.map((visit) => (
                <div key={visit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">{visit.childName}&apos;s Home</h4>
                      <p className="text-xs text-gray-500">Parent: {visit.parentName}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                      Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
