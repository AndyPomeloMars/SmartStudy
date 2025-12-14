import React from 'react';
import { ViewState, ThemeColor, Language } from '../types';
import { Upload, BookOpen, Printer, Bot, LayoutDashboard, LogOut, Settings as SettingsIcon, PieChart } from 'lucide-react';
import { t } from '../utils/translations';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  questionCount: number;
  onLogout: () => void;
  themeColor: ThemeColor;
  examCount?: number;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  questionCount, 
  onLogout,
  themeColor,
  examCount = 0,
  lang
}) => {
  const NavItem = ({ view, icon: Icon, label, badge }: { view: ViewState; icon: any; label: string; badge?: number }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
          isActive
            ? `bg-slate-900 text-white`
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-900'
          }`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full py-4">
      <div className="flex items-center space-x-2 px-6 mb-8">
        <div className={`w-6 h-6 bg-${themeColor}-600 rounded-md flex items-center justify-center`}>
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">SmartStudy</span>
      </div>

      <div className="px-3 space-y-1">
        <div className="px-3 mb-2">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">General</h3>
        </div>
        <NavItem view={ViewState.DASHBOARD} icon={PieChart} label={t('nav.dashboard', lang)} />
        <NavItem view={ViewState.UPLOAD} icon={Upload} label={t('nav.scan', lang)} />
        <NavItem view={ViewState.BANK} icon={LayoutDashboard} label={t('nav.bank', lang)} badge={questionCount} />
        <NavItem view={ViewState.PRINT} icon={Printer} label={t('nav.exam', lang)} badge={examCount} />
        <NavItem view={ViewState.TUTOR} icon={Bot} label={t('nav.tutor', lang)} />
      </div>

      <div className="mt-auto px-3 space-y-1 pt-4 border-t border-slate-100">
        <NavItem view={ViewState.SETTINGS} icon={SettingsIcon} label={t('nav.settings', lang)} />
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-600" />
          <span>{t('nav.signout', lang)}</span>
        </button>
      </div>

      <div className="px-6 py-4 mt-2">
         <div className="flex items-center gap-3">
            <div className="relative">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="text-xs text-slate-500">
               <p className="font-medium text-slate-900">{t('nav.online', lang)}</p>
               <p>v1.4.0</p>
            </div>
         </div>
      </div>
    </div>
  );
};