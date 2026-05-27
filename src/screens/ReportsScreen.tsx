import { ArrowLeft, FileText, Download, Clock, TrendingUp, Users, Heart } from 'lucide-react';
import { reports } from '../data/mockData';
import type { Screen } from '../App';

interface ReportsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export function ReportsScreen({ onBack, onNavigate }: ReportsScreenProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Reports</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Impact Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">90 min</p>
              <p className="text-xs text-emerald-100">reporting time saved this week</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-emerald-100">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              +38% from last week
            </span>
            <button
              onClick={() => onNavigate('impact')}
              className="px-3 py-1 bg-white/20 rounded-lg font-medium active:bg-white/30 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <Users size={18} className="text-sky-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">85%</p>
            <p className="text-[10px] text-gray-400">Attendance</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <Heart size={18} className="text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">16</p>
            <p className="text-[10px] text-gray-400">Good Nutrition</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <TrendingUp size={18} className="text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">12</p>
            <p className="text-[10px] text-gray-400">Milestones</p>
          </div>
        </div>

        {/* Reports List */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Generated Reports</h3>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">{report.title}</h4>
                      <span className="text-[10px] text-gray-400">{report.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{report.summary}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-[11px] font-medium rounded-lg active:bg-orange-600 transition-colors">
                        <Download size={12} />
                        Export PDF
                      </button>
                      <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-lg text-gray-500">
                        Govt. Format
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Generate Button */}
        <button className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.97] transition-transform flex items-center justify-center gap-2">
          <FileText size={20} />
          Generate New Report
        </button>
      </div>
    </div>
  );
}
