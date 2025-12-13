import React from 'react';
import { ViewState, ThemeColor } from '../types';
import { Upload, BookOpen, Printer, Bot, LayoutDashboard, LogOut, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  questionCount: number;
  onLogout: () => void;
  themeColor: ThemeColor;
  examCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  questionCount, 
  onLogout,
  themeColor,
  examCount = 0
}) => {
  const NavItem = ({ view, icon: Icon, label, badge }: { view: ViewState; icon: any; label: string; badge?: number }) => (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        currentView === view
          ? `bg-${themeColor}-600 text-white shadow-md`
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-white' : `text-slate-500 group-hover:text-${themeColor}-600`}`} />
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
          currentView === view ? `bg-${themeColor}-500 text-white` : 'bg-slate-200 text-slate-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-72 bg-white h-screen border-r border-slate-200 flex flex-col p-4 fixed left-0 top-0 hidden md:flex">
      <div className="flex items-center space-x-2 px-2 mb-8">
        <div className={`w-8 h-8 bg-${themeColor}-600 rounded-lg flex items-center justify-center`}>
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-800">SmartStudy</span>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem view={ViewState.UPLOAD} icon={Upload} label="Scan & Upload" />
        <NavItem view={ViewState.BANK} icon={LayoutDashboard} label="Question Bank" badge={questionCount} />
        <NavItem view={ViewState.PRINT} icon={Printer} label="Exam Composer" badge={examCount} />
        <NavItem view={ViewState.TUTOR} icon={Bot} label="AI Tutor" />
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
        
        <NavItem view={ViewState.SETTINGS} icon={SettingsIcon} label="Settings" />

        <div className="px-4 py-3 bg-slate-50 rounded-lg mb-2 mt-2">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-700">System Online</span>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-600" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};