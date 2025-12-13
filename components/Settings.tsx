import React from 'react';
import { ThemeColor } from '../types';
import { Palette, Shield, Info, Database } from 'lucide-react';

interface SettingsProps {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

export const Settings: React.FC<SettingsProps> = ({ themeColor, setThemeColor }) => {
  const colors: { id: ThemeColor; label: string; hex: string }[] = [
    { id: 'indigo', label: 'Indigo', hex: '#4f46e5' },
    { id: 'rose', label: 'Rose', hex: '#e11d48' },
    { id: 'blue', label: 'Blue', hex: '#2563eb' },
    { id: 'emerald', label: 'Emerald', hex: '#059669' },
    { id: 'violet', label: 'Violet', hex: '#7c3aed' },
  ];

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-2">Manage your preferences and system configuration.</p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className={`p-2 bg-${themeColor}-100 rounded-lg text-${themeColor}-600`}>
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Appearance</h3>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-4">Accent Color</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setThemeColor(color.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    themeColor === color.id
                      ? `border-${color.id}-500 bg-${color.id}-50 ring-1 ring-${color.id}-500`
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={`font-medium ${themeColor === color.id ? `text-${color.id}-700` : 'text-slate-600'}`}>
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              This color will be used for buttons, links, and active states throughout the application.
            </p>
          </div>
        </section>

        {/* System Info Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">System Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between py-2 border-b border-slate-50">
               <span className="text-slate-600">Version</span>
               <span className="font-mono text-slate-900">1.2.0-beta</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
               <span className="text-slate-600">OCR Engine</span>
               <span className="font-mono text-slate-900">Gemini 2.5 Flash</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
               <span className="text-slate-600">Backend</span>
               <span className="font-mono text-slate-900">Python + SQLite</span>
            </div>
          </div>
        </section>

        {/* Data Management Section Placeholder */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-75">
           <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Data Management</h3>
          </div>
          <div className="p-6">
             <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-4">
                These settings are managed by the server administrator.
             </div>
             <button disabled className="text-slate-400 font-medium cursor-not-allowed">
                Clear Cache & Temporary Files
             </button>
          </div>
        </section>
      </div>
    </div>
  );
};