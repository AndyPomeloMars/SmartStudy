import React, { useMemo } from 'react';
import { ViewState, Question, ThemeColor, Language, UploadedFile, QuestionType } from '../types';
import { Download, Calendar, Users, Activity, FileText, Send, MoreHorizontal, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';
import { t } from '../utils/translations';
import { LatexRenderer } from './LatexRenderer';

interface DashboardProps {
  questions: Question[];
  uploads: UploadedFile[];
  examCount: number;
  themeColor: ThemeColor;
  lang: Language;
  onNavigate: (view: ViewState) => void;
  onQuickAsk: (msg: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  questions, 
  uploads, 
  examCount, 
  themeColor, 
  lang,
  onNavigate,
  onQuickAsk
}) => {
  const [askInput, setAskInput] = React.useState('');

  const subjectStats = useMemo(() => {
    const stats: Record<string, number> = {};
    questions.forEach(q => {
      stats[q.subject] = (stats[q.subject] || 0) + 1;
    });
    // Sort by count descending
    return Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [questions]);

  const recentUploads = useMemo(() => {
    return [...uploads].sort((a, b) => (b.file.lastModified || 0) - (a.file.lastModified || 0)).slice(0, 3);
  }, [uploads]);

  const recentQuestions = useMemo(() => {
    // Assuming new questions are appended to the end, reverse to get newest first
    return [...questions].reverse().slice(0, 5);
  }, [questions]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askInput.trim()) {
      onQuickAsk(askInput);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('dashboard.title', lang)}</h2>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-600 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Today, {new Date().toLocaleDateString()}</span>
          </div>
          <button className={`inline-flex items-center gap-2 px-4 py-2 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors`}>
            <Download className="w-4 h-4" />
            {t('dashboard.download', lang)}
          </button>
        </div>
      </div>

      {/* Top Row Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Uploads (Simulating Team Members) */}
        <div className="col-span-1 md:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.recentUploads', lang)}</h3>
                <p className="text-sm text-slate-500">{t('dashboard.invite', lang)}</p>
            </div>
            <div className="space-y-6">
                {recentUploads.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">No recent uploads</div>
                ) : (
                    recentUploads.map((file) => (
                        <div key={file.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                                     {file.previewUrl ? <img src={file.previewUrl} className="w-full h-full object-cover" /> : <FileText className="w-4 h-4 text-slate-500" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{file.file.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {file.status === 'completed' ? 'Processed' : file.status}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onNavigate(ViewState.UPLOAD)}
                                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
                            >
                                {t('dashboard.view', lang)} <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Stats Cards Column */}
        <div className="col-span-1 md:col-span-4 grid gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Total Questions */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500">{t('dashboard.totalQuestions', lang)}</h3>
                    <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{questions.length}</span>
                    <span className="text-xs font-medium text-emerald-600 flex items-center">
                        +12% {t('dashboard.lastMonth', lang)}
                    </span>
                </div>
            </div>

            {/* Exams Created */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500">{t('dashboard.examsCreated', lang)}</h3>
                    <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{examCount}</span>
                    <span className="text-xs font-medium text-emerald-600 flex items-center">
                        +4% {t('dashboard.lastMonth', lang)}
                    </span>
                </div>
            </div>

            {/* AI Quick Chat (Full Width in this sub-grid) */}
            <div className="col-span-1 sm:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('dashboard.quickAsk', lang)}</h3>
                    <p className="text-sm text-slate-500 mb-4">Hi, how can I help you study today?</p>
                </div>
                <form onSubmit={handleAskSubmit} className="flex gap-2">
                     <input 
                        type="text" 
                        value={askInput}
                        onChange={(e) => setAskInput(e.target.value)}
                        placeholder={t('dashboard.askPlaceholder', lang)}
                        className="flex-1 h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                     />
                     <button type="submit" className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-md hover:bg-slate-800">
                        <Send className="w-4 h-4" />
                     </button>
                </form>
            </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid gap-6 md:grid-cols-7">
         {/* Subject Distribution */}
         <div className="col-span-1 md:col-span-7 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.subjectDist', lang)}</h3>
                    <p className="text-sm text-slate-500">{t('dashboard.subjectDesc', lang)}</p>
                 </div>
                 <button onClick={() => onNavigate(ViewState.BANK)} className="p-2 hover:bg-slate-100 rounded-md">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                 </button>
            </div>
            
            {subjectStats.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                    Not enough data to display
                </div>
            ) : (
                <div className="space-y-4">
                    {subjectStats.map(([subject, count]) => {
                        const percentage = Math.round((count / questions.length) * 100);
                        return (
                            <div key={subject} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700">{subject}</span>
                                    <span className="text-slate-500">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-${themeColor}-600 rounded-full`} 
                                        style={{ width: `${percentage}%` }} 
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
         </div>
      </div>

      {/* Bottom Table: Recent Questions */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.recentQuestions', lang)}</h3>
                 <p className="text-sm text-slate-500">Manage recent additions to your bank.</p>
              </div>
              <div className="flex items-center gap-2">
                 <input 
                    type="text" 
                    placeholder="Filter questions..." 
                    className="h-8 w-[150px] lg:w-[250px] rounded-md border border-slate-200 px-3 text-xs outline-none focus:ring-1 focus:ring-slate-300"
                 />
              </div>
          </div>
          <div className="relative w-full overflow-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-3 font-medium">{t('dashboard.col.question', lang)}</th>
                        <th className="px-6 py-3 font-medium">{t('dashboard.col.subject', lang)}</th>
                        <th className="px-6 py-3 font-medium">{t('dashboard.col.difficulty', lang)}</th>
                        <th className="px-6 py-3 font-medium">{t('dashboard.col.type', lang)}</th>
                        <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {recentQuestions.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No questions found</td>
                        </tr>
                    ) : (
                        recentQuestions.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                                    {q.originalText.substring(0, 50)}...
                                </td>
                                <td className="px-6 py-4 text-slate-600">{q.subject}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                        ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' : 
                                          q.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 
                                          'bg-red-50 text-red-700'}`}>
                                        {q.difficulty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{q.type}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-900">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};