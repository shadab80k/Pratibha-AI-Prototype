import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Clock, 
  TrendingUp, 
  Users, 
  Heart, 
  Calendar, 
  X, 
  Sparkles
} from 'lucide-react';
import type { Screen } from '../App';
import { jsPDF } from 'jspdf';
import type { Child, HomeVisit, Report } from '../lib/api';

interface ReportsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  childrenList: Child[];
  visitsList: HomeVisit[];
}

const getReportIcon = (type: string) => {
  switch (type) {
    case 'attendance':
      return Users;
    case 'nutrition':
      return Heart;
    case 'development':
      return TrendingUp;
    case 'visits':
      return Calendar;
    case 'impact':
      return Clock;
    default:
      return FileText;
  }
};

const getReportIconColor = (type: string) => {
  switch (type) {
    case 'attendance':
      return 'text-sky-500 bg-sky-50 dark:bg-sky-950/20';
    case 'nutrition':
      return 'text-red-500 bg-red-50 dark:bg-red-950/20';
    case 'development':
      return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
    case 'visits':
      return 'text-pink-500 bg-pink-50 dark:bg-pink-950/20';
    case 'impact':
      return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
    default:
      return 'text-orange-500 bg-orange-50 dark:bg-orange-950/20';
  }
};


export function ReportsScreen({ onBack, onNavigate, childrenList, visitsList }: ReportsScreenProps) {
  const [extraReports, setExtraReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic stats calculated from childrenList
  const {
    presentCount,
    totalCount,
    attendanceRate,
    goodNutritionCount,
    monitoringCount,
    atRiskCount,
    totalObservations,
    completedVisitsCount,
    pendingVisitsCount,
    milestonesCount,
    childrenWithMilestonesCount,
    timeSaved
  } = useMemo(() => {
    const list = childrenList || [];
    const total = list.length;
    const present = list.filter((c) => c.attendance === 'present').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const goodNutrition = list.filter((c) => c.nutritionStatus === 'good').length;
    const monitoring = list.filter((c) => c.nutritionStatus === 'monitoring').length;
    const atRisk = list.filter((c) => c.nutritionStatus === 'at-risk').length;
    const obs = list.reduce((acc, child) => acc + (child.observations?.length || 0), 0);
    const completedVisits = (visitsList || []).filter(v => v.status === 'completed').length;
    const pendingVisits = (visitsList || []).filter(v => v.status === 'pending').length;
    const milestones = list.reduce((acc, c) => acc + (c.milestones?.filter(m => m.completed).length || 0), 0);
    const childrenWithMilestones = list.filter(c => c.milestones?.some(m => m.completed)).length;
    const saved = 30 + (obs * 5) + (completedVisits * 10);
    
    return {
      presentCount: present,
      totalCount: total,
      attendanceRate: rate,
      goodNutritionCount: goodNutrition,
      monitoringCount: monitoring,
      atRiskCount: atRisk,
      totalObservations: obs,
      completedVisitsCount: completedVisits,
      pendingVisitsCount: pendingVisits,
      milestonesCount: milestones,
      childrenWithMilestonesCount: childrenWithMilestones,
      timeSaved: saved
    };
  }, [childrenList, visitsList]);

  // Dynamic reports generator
  const dynamicReports = useMemo(() => {
    return [
      {
        id: 'r1',
        title: 'Daily Attendance Report',
        date: 'Today',
        type: 'attendance',
        summary: `${presentCount} out of ${totalCount} children present (${attendanceRate}%)`,
        data: { present: presentCount, absent: totalCount - presentCount, total: totalCount },
      },
      {
        id: 'r2',
        title: 'Weekly Nutrition Summary',
        date: 'This Week',
        type: 'nutrition',
        summary: `${goodNutritionCount} children in Good status, ${monitoringCount} Monitoring, ${atRiskCount} At-risk`,
        data: { good: goodNutritionCount, monitoring: monitoringCount, atRisk: atRiskCount },
      },
      {
        id: 'r3',
        title: 'Development Milestones',
        date: 'This Month',
        type: 'development',
        summary: `${milestonesCount} milestones completed by ${childrenWithMilestonesCount} children`,
        data: { milestones: milestonesCount, children: childrenWithMilestonesCount },
      },
      {
        id: 'r4',
        title: 'Home Visit Records',
        date: 'This Month',
        type: 'visits',
        summary: `${completedVisitsCount} home visits completed, ${pendingVisitsCount} pending`,
        data: { completed: completedVisitsCount, pending: pendingVisitsCount },
      },
      {
        id: 'r5',
        title: 'Monthly Impact Report',
        date: 'This Month',
        type: 'impact',
        summary: `${timeSaved} minutes of reporting time saved this week`,
        data: { timeSaved: timeSaved, activitiesCompleted: 24, observationsLogged: totalObservations },
      },
    ];
  }, [
    presentCount,
    totalCount,
    attendanceRate,
    goodNutritionCount,
    monitoringCount,
    atRiskCount,
    milestonesCount,
    childrenWithMilestonesCount,
    completedVisitsCount,
    pendingVisitsCount,
    timeSaved,
    totalObservations
  ]);

  const allReports = useMemo(() => {
    return [...extraReports, ...dynamicReports];
  }, [dynamicReports, extraReports]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const id = `r-extra-${Date.now()}`;
      const newReport: Report = {
        id,
        title: `Ad-hoc Observation Report`,
        date: 'Just Now',
        type: 'observation',
        summary: `Detailed summary of ${totalObservations} learning observations recorded for ${totalCount} children`,
        data: { observations: totalObservations, children: totalCount },
      };
      setExtraReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
    }, 1200);
  };

  const handleDownloadPDF = (report: Report) => {
    try {
      const doc = new jsPDF();
      
      // Header Background
      doc.setFillColor(249, 115, 22); // orange-500
      doc.rect(0, 0, 210, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('PRATIBHA AI - ANGANWADI REPORT', 20, 22);
      
      doc.setFontSize(9);
      doc.text('Government of India - Early Childhood Care & Education (ECCE) Portal', 20, 31);
      
      // Body Text
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(15);
      doc.text(report.title, 20, 55);
      
      doc.setFontSize(10);
      doc.text(`Date Generated: ${report.date === 'Today' || report.date === 'Just Now' ? new Date().toLocaleDateString() : report.date}`, 20, 65);
      doc.text(`Report Type: ${report.type.toUpperCase()}`, 20, 71);
      doc.text(`Platform Sync: 100% Secure Offline Sandbox`, 20, 77);
      
      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 83, 190, 83);
      
      // Summary
      doc.setFontSize(12);
      doc.text('Summary Overview:', 20, 93);
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(report.summary, 170);
      doc.text(summaryLines, 20, 101);
      
      // Detailed Table
      let y = 120;
      doc.setDrawColor(200, 200, 200);
      
      if (report.type === 'attendance') {
        doc.setFontSize(12);
        doc.text('Attendance Register Details:', 20, y);
        doc.setFontSize(10);
        y += 8;
        childrenList.forEach((c, i) => {
          const status = c.attendance === 'present' ? 'Present' : c.attendance === 'absent' ? 'Absent' : 'Irregular';
          doc.text(`${i+1}. ${c.name} (Age: ${c.ageDisplay}) - Attendance Status: ${status}`, 20, y);
          y += 7;
        });
      } else if (report.type === 'nutrition') {
        doc.setFontSize(12);
        doc.text('Nutrition Register Health Status:', 20, y);
        doc.setFontSize(10);
        y += 8;
        childrenList.forEach((c, i) => {
          const status = c.nutritionStatus === 'good' ? 'Good health' : c.nutritionStatus === 'at-risk' ? 'At-Risk (Needs Attention)' : 'Monitoring';
          doc.text(`${i+1}. ${c.name} - Status: ${status} (Parent: ${c.parentName})`, 20, y);
          y += 7;
        });
      } else if (report.type === 'development') {
        doc.setFontSize(12);
        doc.text('Development & Learning Progress:', 20, y);
        doc.setFontSize(10);
        y += 8;
        childrenList.forEach((c, i) => {
          const completedCount = c.milestones?.filter(m => m.completed).length || 0;
          doc.text(`${i+1}. ${c.name} - Progress: ${c.developmentProgress}% (${completedCount} Milestones achieved)`, 20, y);
          y += 7;
        });
      } else if (report.type === 'visits') {
        doc.setFontSize(12);
        doc.text('Anganwadi Home Visits Log:', 20, y);
        doc.setFontSize(10);
        y += 8;
        visitsList.forEach((v, i) => {
          const status = v.status === 'completed' ? 'Completed' : 'Pending';
          doc.text(`${i+1}. Child: ${v.childName} (Parent: ${v.parentName}) - Status: ${status}`, 20, y);
          doc.text(`   Concern: ${v.concern || 'Routine checkup'}`, 20, y + 4.5);
          y += 10.5;
        });
      } else {
        doc.setFontSize(12);
        doc.text('Database Core Metrics:', 20, y);
        doc.setFontSize(10);
        y += 8;
        Object.entries(report.data).forEach(([key, val]) => {
          doc.text(`- ${key.toUpperCase()}: ${val}`, 20, y);
          y += 7;
        });
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a verified digital copy compiled from sandbox mock database records.', 20, 285);
      
      doc.save(`${report.title.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF download.');
    }
  };

  const handleCardClick = (report: Report) => {
    setSelectedReport(report);
    setShowPreviewModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Reports</h1>
        </div>
      </header>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* Impact Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-md shadow-emerald-500/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{timeSaved} min</p>
              <p className="text-xs text-emerald-100">reporting time saved this week</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-100">
            <span className="flex items-center gap-1 font-semibold">
              <TrendingUp size={12} />
              +38% from last week
            </span>
            <button
              onClick={() => onNavigate('impact')}
              className="px-3 py-1.5 bg-white/20 rounded-lg font-bold active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-800 text-center">
            <Users size={18} className="text-sky-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-white">{attendanceRate}%</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold">Attendance</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-800 text-center">
            <Heart size={18} className="text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-white">{goodNutritionCount}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold">Good Nutri.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-800 text-center">
            <TrendingUp size={18} className="text-violet-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-white">{milestonesCount}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold">Milestones</p>
          </div>
        </div>

        {/* Reports List */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Generated Reports</h3>
          <div className="space-y-3">
            {allReports.map((report) => {
              const ReportIcon = getReportIcon(report.type);
              const colorClasses = getReportIconColor(report.type);
              return (
                <div
                  key={report.id}
                  onClick={() => handleCardClick(report)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-slate-700 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClasses}`}>
                      <ReportIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate pr-2">{report.title}</h4>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 font-medium">{report.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{report.summary}</p>
                      <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleDownloadPDF(report)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg active:scale-95 transition-all shadow-sm shadow-orange-500/10 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        >
                          <Download size={12} />
                          Export PDF
                        </button>
                        <span className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400 font-bold">
                          Govt. Format
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generate Button Container */}
        <div className="pt-2">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-md shadow-orange-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            {isGenerating ? (
              <>
                <Sparkles size={20} className="animate-spin" />
                Generating Latest Report...
              </>
            ) : (
              <>
                <FileText size={20} />
                Generate New Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreviewModal && selectedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[340px] max-h-[560px] flex flex-col border border-gray-100 dark:border-slate-800 shadow-2xl animate-scaleIn overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <span className="text-[9px] bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Report Preview
                </span>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mt-1 truncate pr-1">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedReport(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide text-xs">
              <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/55 dark:border-slate-800/80 rounded-2xl p-3">
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mb-1">Summary Overview</p>
                <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Data Table Preview */}
              <div>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">Register Preview Details</p>
                
                {selectedReport.type === 'attendance' && (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {childrenList.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                        <span className="font-semibold text-gray-700 dark:text-slate-300">{c.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.attendance === 'present' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : c.attendance === 'absent'
                            ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}>
                          {c.attendance.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedReport.type === 'nutrition' && (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {childrenList.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-slate-300">{c.name}</p>
                          <p className="text-[9px] text-gray-400 dark:text-slate-500">Parent: {c.parentName}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.nutritionStatus === 'good' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : c.nutritionStatus === 'at-risk'
                            ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}>
                          {c.nutritionStatus.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedReport.type === 'development' && (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {childrenList.map((c) => {
                      const completedCount = c.milestones?.filter(m => m.completed).length || 0;
                      return (
                        <div key={c.id} className="p-2 bg-gray-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700 dark:text-slate-300">{c.name}</span>
                            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">{c.developmentProgress}% Progress</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${c.developmentProgress}%` }} />
                          </div>
                          <p className="text-[9px] text-gray-400 dark:text-slate-500">
                            {completedCount} milestones completed
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedReport.type === 'visits' && (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {visitsList.map((v) => (
                      <div key={v.id} className="p-2 bg-gray-50 dark:bg-slate-800/40 rounded-xl space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700 dark:text-slate-300">{v.childName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            v.status === 'completed' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                              : 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400'
                          }`}>
                            {v.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 dark:text-slate-400">Concern: {v.concern || 'Routine'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedReport.type !== 'attendance' && selectedReport.type !== 'nutrition' && selectedReport.type !== 'development' && selectedReport.type !== 'visits' && (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {Object.entries(selectedReport.data).map(([key, val]: any) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                        <span className="font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold text-gray-800 dark:text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex gap-3 shrink-0">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedReport(null);
                }}
                className="flex-1 h-10 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold active:scale-95 transition-all outline-none"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadPDF(selectedReport);
                }}
                className="flex-1 h-10 bg-orange-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Download size={12} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
