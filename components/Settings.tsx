import React, { useState } from 'react';
import { ThemeColor, Language } from '../types';
import { Palette, Shield, Info, Database, User, Globe, Save } from 'lucide-react';
import { t } from '../utils/translations';

interface SettingsProps {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Settings: React.FC<SettingsProps> = ({ themeColor, setThemeColor, language, setLanguage }) => {
  const [userName, setUserName] = useState('Demo User');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [userBio, setUserBio] = useState('Student');

  const colors: { id: ThemeColor; label: string; hex: string; bg: string }[] = [
    { id: 'neutral', label: 'Neutral', hex: '#262626', bg: 'bg-neutral-600' },
    { id: 'indigo', label: 'Indigo', hex: '#4f46e5', bg: 'bg-indigo-600' },
    { id: 'rose', label: 'Rose', hex: '#e11d48', bg: 'bg-rose-600' },
    { id: 'blue', label: 'Blue', hex: '#2563eb', bg: 'bg-blue-600' },
    { id: 'emerald', label: 'Emerald', hex: '#059669', bg: 'bg-emerald-600' },
    { id: 'violet', label: 'Violet', hex: '#7c3aed', bg: 'bg-violet-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('settings.title', language)}</h2>
        <p className="text-slate-500">{t('settings.subtitle', language)}</p>
      </div>

      <div className="grid gap-6">
        {/* User Profile Section */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 p-6 border-b border-slate-100">
            <div className={`p-2 bg-${themeColor}-100 rounded-lg text-${themeColor}-600`}>
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">{t('settings.profile', language)}</h3>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-bold border-2 border-white shadow-sm">
                   {userName.charAt(0)}
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                    <input 
                      type="text" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
                    <input 
                      type="text" 
                      value={userBio}
                      onChange={(e) => setUserBio(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                    <input 
                      type="email" 
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
                    />
                </div>

                <div className="pt-2 flex justify-end">
                   <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 h-9 px-4 py-2`}>
                     <Save className="mr-2 h-4 w-4" />
                     {t('settings.save', language)}
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-4 p-6 border-b border-slate-100">
            <div className={`p-2 bg-${themeColor}-100 rounded-lg text-${themeColor}-600`}>
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">{t('settings.appearance', language)}</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">{t('settings.theme', language)}</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setThemeColor(color.id)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${
                      themeColor === color.id
                        ? `border-${color.id}-600 bg-${color.id}-50`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div 
                      className={`w-6 h-6 rounded-full shadow-sm ${color.id === 'neutral' ? 'bg-neutral-600' : `bg-${color.id}-600`}`}
                    />
                    <span className={`text-xs font-medium ${themeColor === color.id ? `text-${color.id}-700` : 'text-slate-600'}`}>
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <label className="text-sm font-medium leading-none flex items-center gap-2">
                 <Globe className="w-4 h-4 text-slate-400" />
                 {t('settings.language', language)}
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="flex h-9 w-full md:w-64 items-center justify-between rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="en">English (US)</option>
                <option value="zh">Chinese (Simplified) / 简体中文</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};