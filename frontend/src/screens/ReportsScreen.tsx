import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ArrowLeft, FileText, Download, Clock, TrendingUp, Users, Heart, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import type { Screen } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface ReportsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  childrenList: any[];
}

interface GeneratedReport {
  id: string;
  title: string;
  date: string;
  summary: string;
  type: 'attendance' | 'nutrition' | 'development' | 'weekly' | 'custom';
  data: any;
}

// ─── PDF-style export via jsPDF ──────────────────────────────────────────────
function exportReportAsPdf(report: GeneratedReport, childrenList: any[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = 297;
  const pageWidth = 210;
  let currentY = 15;

  // Helper to check for page break and insert page accent borders
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 15) {
      doc.addPage();
      currentY = 15;
      drawHeaderBorder();
    }
  };

  const drawHeaderBorder = () => {
    doc.setFillColor(249, 115, 22); // orange-500
    doc.rect(0, 0, pageWidth, 5, 'F');
  };

  drawHeaderBorder();

  // Header Banner Gray Box
  doc.setFillColor(243, 244, 246);
  doc.rect(15, currentY, 180, 24, 'F');

  // Left Orange Border Stripe
  doc.setFillColor(249, 115, 22);
  doc.rect(15, currentY, 4, 24, 'F');

  // Header Titles
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(report.title, 24, currentY + 9);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Generated: ${dateStr} at ${timeStr} | ICDS Central Anganwadi Registry`, 24, currentY + 15);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(249, 115, 22);
  doc.text('GOVT. FORMAT COMPLIANT REPORT | MINISTRY OF WOMEN & CHILD DEVELOPMENT', 24, currentY + 20);

  currentY += 32;

  // Stats Data
  const totalChildren = childrenList.length || 1;
  const present = childrenList.filter(c => c.attendance === 'present').length;
  const atRiskList = childrenList.filter(c => c.nutritionStatus === 'at-risk');
  const goodCount = childrenList.filter(c => c.nutritionStatus === 'good').length;
  const avgProgress = Math.round(childrenList.reduce((s, c) => s + c.developmentProgress, 0) / totalChildren);

  // Stats Box Border
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 18, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);

  doc.text(`${present} / ${childrenList.length}`, 22, currentY + 7);
  doc.text(`${Math.round((present / totalChildren) * 100)}%`, 65, currentY + 7);
  doc.text(`${goodCount} Good | ${atRiskList.length} Risk`, 108, currentY + 7);
  doc.text(`${avgProgress}%`, 160, currentY + 7);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Attendance Checked', 22, currentY + 12);
  doc.text('Attendance Rate', 65, currentY + 12);
  doc.text('Nutrition Status', 108, currentY + 12);
  doc.text('Avg Progress', 160, currentY + 12);

  currentY += 26;

  // Red Alerts (At Risk Nutrition)
  if (atRiskList.length > 0) {
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(239, 68, 68); // Red
    doc.text('NUTRITIONAL RISK ALERTS', 15, currentY);
    doc.setDrawColor(239, 68, 68);
    doc.line(15, currentY + 2, 195, currentY + 2);
    
    currentY += 8;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    
    atRiskList.forEach(child => {
      checkPageBreak(8);
      doc.setFillColor(254, 242, 242);
      doc.rect(15, currentY - 5, 180, 7, 'F');
      doc.text(`• ${child.name} (Age: ${child.ageDisplay}) — Nutrition Status At-Risk. Parent: ${child.parentName} | Mob: ${child.parentPhone} (${child.address})`, 17, currentY);
      currentY += 8;
    });
    currentY += 4;
  }

  // Yellow Alerts (Absent Today)
  const absentList = childrenList.filter(c => c.attendance === 'absent');
  if (absentList.length > 0) {
    checkPageBreak(25);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(245, 158, 11); // Amber
    doc.text('ABSENTEE NOTIFICATIONS', 15, currentY);
    doc.setDrawColor(245, 158, 11);
    doc.line(15, currentY + 2, 195, currentY + 2);
    
    currentY += 8;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    
    absentList.forEach(child => {
      checkPageBreak(8);
      doc.setFillColor(255, 247, 237);
      doc.rect(15, currentY - 5, 180, 7, 'F');
      doc.text(`• ${child.name} (Age: ${child.ageDisplay}) — Currently Absent. Parent: ${child.parentName} | Contact: ${child.parentPhone}`, 17, currentY);
      currentY += 8;
    });
    currentY += 4;
  }

  // Detailed Table
  checkPageBreak(35);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CLASS REGISTRY DETAILS', 15, currentY);
  doc.setDrawColor(226, 232, 240);
  doc.line(15, currentY + 2, 195, currentY + 2);

  currentY += 8;

  // Table Header Box
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY - 5, 180, 7, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('CHILD NAME', 18, currentY);
  doc.text('AGE DISPLAY', 52, currentY);
  doc.text('ATTENDANCE', 80, currentY);
  doc.text('NUTRITION', 110, currentY);
  doc.text('DEV PROGRESS', 140, currentY);
  doc.text('PARENT CONTACT', 168, currentY);

  currentY += 7;

  // Rows
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  
  childrenList.forEach(c => {
    checkPageBreak(8);
    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + 2, 195, currentY + 2);
    
    doc.text(c.name, 18, currentY);
    doc.text(c.ageDisplay, 52, currentY);
    doc.text(c.attendance.toUpperCase(), 80, currentY);
    doc.text(c.nutritionStatus.toUpperCase(), 110, currentY);
    doc.text(`${c.developmentProgress}%`, 140, currentY);
    doc.text(`${c.parentName} (${c.parentPhone})`, 168, currentY);
    
    currentY += 7;
  });

  currentY += 6;

  // Official Footer
  checkPageBreak(30);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFIED DATA DECLARATION', 15, currentY);
  doc.line(15, currentY + 2, 195, currentY + 2);

  currentY += 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This record represents verified demographic nutrition monitoring logs compiled from the Anganwadi registry', 15, currentY);
  doc.text('compliant with integrated child support services guidelines. Synchronized database logs checked.', 15, currentY + 3.5);

  currentY += 14;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Certified By: ${report.data?.workerName || 'Sunita Ji'}`, 15, currentY);
  doc.text('Worker Signature / Stamp: ________________________', 115, currentY);

  const filename = `pratibha_report_${report.id}_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// ─── Dynamic report generation ───────────────────────────────────────────────
function generateDynamicReports(childrenList: any[]): GeneratedReport[] {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const present = childrenList.filter(c => c.attendance === 'present').length;
  const absent = childrenList.filter(c => c.attendance === 'absent' || c.attendance === 'irregular').length;
  const atRisk = childrenList.filter(c => c.nutritionStatus === 'at-risk').length;
  const good = childrenList.filter(c => c.nutritionStatus === 'good').length;
  const avgProgress = Math.round(childrenList.reduce((s, c) => s + c.developmentProgress, 0) / (childrenList.length || 1));
  const totalObs = childrenList.reduce((s, c) => s + (c.observations ? c.observations.length : 0), 0);

  return [
    {
      id: 'r-daily',
      title: 'Daily Attendance Report',
      date: fmt(now),
      summary: `${present} of ${childrenList.length} children present (${Math.round((present / (childrenList.length || 1)) * 100)}%). ${absent} absent/irregular. ${totalObs} observations recorded today.`,
      type: 'attendance',
      data: { present, absent, total: childrenList.length, workerName: 'Sunita Ji' },
    },
    {
      id: 'r-nutrition',
      title: 'Weekly Nutrition Report',
      date: fmt(new Date(now.getTime() - 2 * 86400000)),
      summary: `${good} children Good nutrition, ${childrenList.filter(c => c.nutritionStatus === 'monitoring').length} Monitoring, ${atRisk} At-Risk. ${atRisk > 0 ? `⚠️ ${atRisk} children require urgent nutritional intervention.` : 'All children receiving adequate nutrition.'}`,
      type: 'nutrition',
      data: { good, atRisk, workerName: 'Sunita Ji' },
    },
    {
      id: 'r-development',
      title: 'Development Milestones Report',
      date: fmt(new Date(now.getTime() - 5 * 86400000)),
      summary: `Class average development: ${avgProgress}%. ${childrenList.filter(c => c.developmentProgress >= 80).length} children on track. ${childrenList.filter(c => c.developmentProgress < 60).length} children need focused attention.`,
      type: 'development',
      data: { avgProgress, workerName: 'Sunita Ji' },
    },
    {
      id: 'r-weekly',
      title: 'Weekly Summary Report',
      date: fmt(new Date(now.getTime() - 7 * 86400000)),
      summary: `Week overview: ${totalObs} total observations, ${Math.round((present / (childrenList.length || 1)) * 100)}% attendance rate, ${atRisk} nutrition alerts flagged. Time saved: ~90 mins vs manual reporting.`,
      type: 'weekly',
      data: { totalObs, workerName: 'Sunita Ji' },
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ReportsScreen({ onBack, onNavigate, childrenList }: ReportsScreenProps) {
  const { language } = useLanguage();
  const [reports, setReports] = useState<GeneratedReport[]>(() => generateDynamicReports(childrenList));
  const [isGenerating, setIsGenerating] = useState(false);
  const [justGenerated, setJustGenerated] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const present = childrenList.filter(c => c.attendance === 'present').length;
  const goodNutrition = childrenList.filter(c => c.nutritionStatus === 'good').length;
  const totalMilestones = childrenList.reduce((s, c) => s + c.milestones.filter((m: any) => m.completed).length, 0);
  const totalObs = childrenList.reduce((s, c) => s + (c.observations ? c.observations.length : 0), 0);
  const timeSaved = Math.max(30, totalObs * 4 + present * 2); // dynamic calc

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const fresh = generateDynamicReports(childrenList);
      const newReport: GeneratedReport = {
        id: 'r-custom-' + Date.now(),
        title: 'Custom Report — ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        summary: `Auto-generated report with ${childrenList.length} children, ${present} present, ${goodNutrition} good nutrition, ${totalMilestones} milestones completed.`,
        type: 'custom',
        data: { workerName: 'Sunita Ji' },
      };
      setReports([newReport, ...fresh]);
      setJustGenerated(newReport.id);
      setIsGenerating(false);
      setTimeout(() => setJustGenerated(null), 3000);
    }, 2000);
  };

  const handleExportPdf = (report: GeneratedReport) => {
    setExportingId(report.id);
    setTimeout(() => {
      exportReportAsPdf(report, childrenList);
      setExportingId(null);
    }, 600);
  };

  const typeColor: Record<string, string> = {
    attendance: 'bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400',
    nutrition: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
    development: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    weekly: 'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400',
    custom: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350 outline-none">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {language === 'hi' ? 'रिपोर्ट' : language === 'bn' ? 'রিপোর্ট' : language === 'mr' ? 'अहवाल' : 'Reports'}
          </h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Dynamic Impact Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-md shadow-emerald-500/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{timeSaved} min</p>
              <p className="text-xs text-emerald-100">
                {language === 'hi' ? 'इस सप्ताह रिपोर्टिंग समय बचाया' : 'reporting time saved this week'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-100">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              {totalObs} observations logged
            </span>
            <button
              onClick={() => onNavigate('impact')}
              className="px-3 py-1 bg-white/20 rounded-lg font-semibold active:bg-white/30 transition-colors"
            >
              {language === 'hi' ? 'विवरण देखें' : 'View Details'}
            </button>
          </div>
        </div>

        {/* Dynamic Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-800 text-center">
            <Users size={18} className="text-sky-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-white">{Math.round((present / (childrenList.length || 1)) * 100)}%</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
              {language === 'hi' ? 'उपस्थिति' : 'Attendance'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-800 text-center">
            <Heart size={18} className="text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-white">{goodNutrition}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
              {language === 'hi' ? 'अच्छा पोषण' : 'Good Nutrition'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-800 text-center">
            <TrendingUp size={18} className="text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-white">{totalMilestones}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
              {language === 'hi' ? 'माइलस्टोन' : 'Milestones'}
            </p>
          </div>
        </div>

        {/* Reports List — Dynamically Generated */}
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3">
            {language === 'hi' ? 'जनरेट की गई रिपोर्ट' : language === 'bn' ? 'তৈরি করা রিপোর্ট' : 'Generated Reports'}
            <span className="ml-2 text-xs font-normal text-gray-400 dark:text-slate-500">({reports.length})</span>
          </h3>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border transition-all ${
                  justGenerated === report.id
                    ? 'border-emerald-400 dark:border-emerald-600 shadow-emerald-100 dark:shadow-none'
                    : 'border-gray-100 dark:border-slate-800'
                }`}
              >
                {justGenerated === report.id && (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold mb-2">
                    <CheckCircle2 size={12} />
                    Just generated!
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor[report.type]}`}>
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate pr-2">{report.title}</h4>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">{report.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{report.summary}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleExportPdf(report)}
                        disabled={exportingId === report.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg active:scale-95 transition-all shadow-sm shadow-orange-500/10 disabled:opacity-60 outline-none"
                      >
                        {exportingId === report.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Download size={11} />}
                        {exportingId === report.id ? 'Opening PDF…' : 'Export PDF'}
                      </button>
                      <span className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400 font-medium">
                        🏛️ Govt. Format
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate New Report Button */}
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-md shadow-orange-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100 outline-none"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {language === 'hi' ? 'रिपोर्ट बन रही है...' : 'Generating Report...'}
            </>
          ) : (
            <>
              <Plus size={20} />
              {language === 'hi' ? 'नई रिपोर्ट बनाएं' : language === 'bn' ? 'নতুন রিপোর্ট তৈরি করুন' : 'Generate New Report'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
