import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Clock, MessageCircle, PlusCircle, X, ChevronDown } from 'lucide-react';

interface HomeVisitsScreenProps {
  onBack: () => void;
  visitsList: any[];
  onCompleteVisit: (visitId: string) => void;
  childrenList: any[];
  onAddVisit: (childName: string, parentName: string, lastVisit: string) => void;
}

export function HomeVisitsScreen({
  onBack,
  visitsList,
  onCompleteVisit,
  childrenList,
  onAddVisit,
}: HomeVisitsScreenProps) {
  const pending = visitsList.filter((v) => v.status === 'pending');
  const completed = visitsList.filter((v) => v.status === 'completed');

  const [showForm, setShowForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [parentName, setParentName] = useState('');
  const [visitDate, setVisitDate] = useState('Tomorrow');

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild.trim()) return;

    // Find parent name from children list if not entered manually
    let targetParent = parentName;
    if (!targetParent) {
      const match = childrenList.find(c => c.name === selectedChild);
      targetParent = match ? match.parentName : 'Parent';
    }

    onAddVisit(selectedChild, targetParent, visitDate);
    
    // Reset form
    setSelectedChild('');
    setParentName('');
    setVisitDate('Tomorrow');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Home Visits</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-md shadow-orange-500/10"
          >
            {showForm ? <X size={14} /> : <PlusCircle size={14} />}
            {showForm ? 'Cancel' : 'Schedule'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* Schedule Form Card */}
        {showForm && (
          <form 
            onSubmit={handleAddVisit}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md border border-orange-100 dark:border-slate-800 space-y-3 animate-slideDown"
          >
            <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Schedule New Visit</h3>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">SELECT CHILD</label>
              <div className="relative">
                <select
                  value={selectedChild}
                  onChange={(e) => {
                    setSelectedChild(e.target.value);
                    const match = childrenList.find(c => c.name === e.target.value);
                    if (match) setParentName(match.parentName);
                  }}
                  className="w-full text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">-- Choose Child --</option>
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">PARENT NAME</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent's Name"
                className="w-full text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">VISIT DATE</label>
              <select
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="Tomorrow">Tomorrow</option>
                <option value="Next Monday">Next Monday</option>
                <option value="Next Friday">Next Friday</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all shadow-md"
            >
              Add to Visits Planner
            </button>
          </form>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600 dark:text-amber-450" />
              <span className="text-xs text-amber-600 dark:text-amber-450 font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{pending.length}</p>
            <p className="text-xs text-gray-550 dark:text-slate-400">visits to complete</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-450" />
              <span className="text-xs text-emerald-600 dark:text-emerald-450 font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{completed.length}</p>
            <p className="text-xs text-gray-555 dark:text-slate-400">this month</p>
          </div>
        </div>

        {/* Pending Visits */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Pending Visits</h3>
          <div className="space-y-3">
            {pending.map((visit) => (
              <div key={visit.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-amber-600 dark:text-amber-405" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate pr-2">{visit.childName}&apos;s Home</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 rounded-full font-medium shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Parent: {visit.parentName}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      Due: {visit.lastVisit}
                    </p>

                    {/* AI Suggested Topics */}
                    <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle size={12} className="text-violet-500 dark:text-violet-400" />
                        <span className="text-[10px] font-medium text-violet-700 dark:text-violet-400">AI Discussion Focus</span>
                      </div>
                      <div className="space-y-1.5">
                        {visit.suggestedTopics.map((topic: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-violet-400 dark:bg-violet-500 rounded-full mt-1 shrink-0" />
                            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{topic}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onCompleteVisit(visit.id)}
                      className="mt-3 w-full h-10 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl active:scale-[0.98] transition-all outline-none shadow-sm shadow-orange-500/10 dark:shadow-none"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pending.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 text-center p-4">
                <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-gray-800 dark:text-white">All Visits Done!</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Excellent! No pending home visits left on your schedule.</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Visits */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Completed Visits</h3>
            <div className="space-y-3">
              {completed.map((visit) => (
                <div key={visit.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-emerald-650 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{visit.childName}&apos;s Home</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Parent: {visit.parentName}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium shrink-0">
                      Completed
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
