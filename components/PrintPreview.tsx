import React, { useState } from 'react';
import { Question, ThemeColor, Language } from '../types';
import { Printer, BookOpen, ArrowUp, ArrowDown, X, GripVertical, FileText, Save } from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';

interface PrintPreviewProps {
  questions: Question[];
  themeColor: ThemeColor;
  onReorder: (questions: Question[]) => void;
  onRemove: (id: string) => void;
  lang: Language;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ questions, themeColor, onReorder, onRemove, lang }) => {
  const [examTitle, setExamTitle] = useState(() => {
    const saved = localStorage.getItem('savedExam');
    try {
      return saved ? JSON.parse(saved).title : 'Assessment Worksheet';
    } catch (e) {
      return 'Assessment Worksheet';
    }
  });
  
  // Reorder logic
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) return;
    
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    onReorder(newQuestions);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const data = {
      title: examTitle,
      questions: questions
    };
    try {
      localStorage.setItem('savedExam', JSON.stringify(data));
      // In a real app we might use a toast, here we use a simple alert for feedback
      alert('Exam configuration saved successfully!');
    } catch (e) {
      console.error('Failed to save exam', e);
      alert('Failed to save exam.');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <FileText className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-xl font-medium text-slate-600">Exam Composer is Empty</p>
        <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">
          Go to the Question Bank and click "Add to Exam" on questions you want to include here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
      
      {/* Sidebar Controls (Non-Printable) */}
      <div className="lg:w-80 flex flex-col gap-6 print:hidden overflow-y-auto pr-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Exam Composer
          </h2>
          <p className="text-sm text-slate-500 mt-1">Arrange {questions.length} questions.</p>
        </div>

        <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paper Title</label>
             <input 
               type="text" 
               value={examTitle}
               onChange={(e) => setExamTitle(e.target.value)}
               className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
             />
           </div>
           
           <div className="grid gap-3">
             <button
               onClick={handlePrint}
               className={`w-full bg-${themeColor}-600 text-white px-4 py-3 rounded-lg hover:bg-${themeColor}-700 font-medium flex items-center justify-center gap-2 shadow-sm`}
             >
               <Printer className="w-4 h-4" />
               Download PDF / Print
             </button>

             <button
               onClick={handleSave}
               className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-50 font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
             >
               <Save className="w-4 h-4" />
               Save Progress
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-slate-100 pt-4">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Structure</label>
           <div className="space-y-2">
             {questions.map((q, i) => (
               <div key={q.id} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 group hover:border-slate-300">
                 <div className="text-slate-400 cursor-move"><GripVertical className="w-4 h-4" /></div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      <span className="text-slate-400 mr-1">{i + 1}.</span> 
                      {q.originalText}
                    </p>
                 </div>
                 <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveQuestion(i, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveQuestion(i, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ArrowDown className="w-3 h-3" /></button>
                    <button onClick={() => onRemove(q.id)} className="p-1 hover:bg-red-50 rounded text-red-500"><X className="w-3 h-3" /></button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* The Printable Paper Area */}
      <div className="flex-1 bg-slate-100 overflow-y-auto rounded-xl p-8 print:bg-white print:p-0 print:overflow-visible">
        <div className="bg-white shadow-lg p-16 min-h-[1123px] w-full max-w-[794px] mx-auto print:shadow-none print:w-full print:max-w-none print:mx-0 print:h-auto print:min-h-0">
          
          {/* Worksheet Header */}
          <div className="flex justify-between items-end border-b-2 border-slate-800 pb-6 mb-12">
              <div className="flex items-center gap-3">
                  <div className={`p-2 bg-slate-900 rounded-lg print:hidden`}>
                      <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                      <h1 className="text-3xl font-serif font-bold text-slate-900 leading-none">SmartStudy</h1>
                      <p className="text-slate-500 font-serif italic text-sm mt-1">{examTitle}</p>
                  </div>
              </div>
              
              <div className="text-right font-serif text-sm flex gap-8">
                  <div className="space-y-4">
                      <div className="w-48 border-b border-slate-300 text-left pl-1 pb-1 text-slate-400">Name</div>
                      <div className="w-48 border-b border-slate-300 text-left pl-1 pb-1 text-slate-400">Date</div>
                  </div>
                  <div className="space-y-4">
                       <div className="w-32 border-b border-slate-300 text-left pl-1 pb-1 text-slate-400 flex justify-between">
                          <span>Score</span>
                          <span className="text-slate-900 font-bold">/ {questions.length}</span>
                       </div>
                  </div>
              </div>
          </div>

          <div className="space-y-12">
            {questions.map((q, index) => (
              <div key={q.id} className="break-inside-avoid relative pl-10">
                {/* Distinct Question Number */}
                <div className="absolute left-0 top-0 font-serif font-bold text-lg text-slate-900 w-8 h-8 flex items-center justify-center">
                   {index + 1}.
                </div>
                
                <div className="pt-0.5">
                    <div className="text-lg text-slate-900 font-serif leading-relaxed mb-5">
                      <LatexRenderer>{q.originalText}</LatexRenderer>
                    </div>

                    {q.type === 'Multiple Choice' && q.options && (
                      <div className="grid grid-cols-1 gap-y-3 pl-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-baseline gap-3 font-serif text-base text-slate-800">
                            <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-slate-500">
                               {String.fromCharCode(65 + i)}
                            </div>
                            <div className="pt-0.5"><LatexRenderer>{opt}</LatexRenderer></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'Short Answer' && (
                      <div className="mt-8 space-y-8 w-full">
                           <div className="border-b border-slate-200 w-full h-px"></div>
                           <div className="border-b border-slate-200 w-full h-px"></div>
                      </div>
                    )}

                     {q.type === 'Fill in the Blank' && (
                       <div className="inline-block border-b border-slate-400 w-40 mx-2 align-bottom"></div>
                     )}
                  </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-sans print:text-slate-300 print:mt-auto print:absolute print:bottom-8 print:w-[calc(100%-4rem)]">
              <span>Generated by SmartStudy AI</span>
              <span>Page 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};