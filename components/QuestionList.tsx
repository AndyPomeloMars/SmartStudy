import React, { useState, useMemo } from 'react';
import { Question, Difficulty, ThemeColor, QuestionType, Language } from '../types';
import { Trash2, CheckSquare, Square, Tag, Filter, XCircle, Sparkles, Layers, BookOpen, Search, PlusCircle, CheckCircle2, Edit3, MoreHorizontal, Save, X } from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';

interface QuestionListProps {
  questions: Question[];
  toggleSelection: (id: string) => void;
  deleteQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  selectAll: () => void;
  onGenerateQA: (selectedQuestions: Question[]) => void;
  themeColor: ThemeColor;
  addToExam: (question: Question) => void;
  addMultipleToExam: (questions: Question[]) => void;
  removeFromExam: (id: string) => void;
  examQuestions: Question[];
  lang: Language;
}

export const QuestionList: React.FC<QuestionListProps> = ({ 
  questions, 
  toggleSelection, 
  deleteQuestion, 
  onUpdateQuestion, 
  selectAll, 
  onGenerateQA, 
  themeColor,
  addToExam,
  addMultipleToExam,
  removeFromExam,
  examQuestions,
  lang
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Bulk Edit State
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkDifficulty, setBulkDifficulty] = useState<string>('');

  // Single Question Edit State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const subjects = useMemo(() => {
    const s = new Set(questions.map(q => q.subject).filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSubject = filterSubject === 'All' || q.subject === filterSubject;
      const matchType = filterType === 'All' || q.type === filterType;
      const matchDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
      
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        q.originalText.toLowerCase().includes(searchLower) ||
        (q.options && q.options.some(opt => opt.toLowerCase().includes(searchLower))) ||
        (q.answer && q.answer.toLowerCase().includes(searchLower));

      return matchSubject && matchType && matchDifficulty && matchSearch;
    });
  }, [questions, filterSubject, filterType, filterDifficulty, searchQuery]);

  const selectedCount = questions.filter(q => q.selected).length;
  const isFiltered = filterSubject !== 'All' || filterType !== 'All' || filterDifficulty !== 'All' || searchQuery !== '';

  const getDifficultyColor = (diff: Difficulty) => {
    switch(diff) {
      case Difficulty.EASY: return 'border-emerald-500';
      case Difficulty.MEDIUM: return 'border-yellow-500';
      case Difficulty.HARD: return 'border-red-500';
      default: return 'border-slate-300';
    }
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch(diff) {
      case Difficulty.EASY: return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case Difficulty.MEDIUM: return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case Difficulty.HARD: return 'bg-red-50 text-red-700 ring-red-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  const handleBulkEditSubmit = () => {
    const updates: Partial<Question> = {};
    if (bulkSubject) updates.subject = bulkSubject;
    if (bulkDifficulty) updates.difficulty = bulkDifficulty as Difficulty;
    
    questions.filter(q => q.selected).forEach(q => {
      onUpdateQuestion(q.id, updates);
    });
    setIsBulkEditing(false);
    setBulkSubject('');
    setBulkDifficulty('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      onUpdateQuestion(editingQuestion.id, editingQuestion);
      setEditingQuestion(null);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
            <BookOpen className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-xl font-medium text-slate-600">Your bank is empty</p>
        <p className="text-sm text-slate-400 mt-1">Go to "Scan & Upload" to build your database.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className={`w-6 h-6 text-${themeColor}-600`} />
              Question Bank
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Managing <span className="font-semibold text-slate-900">{filteredQuestions.length}</span> questions 
              {selectedCount > 0 && <span className={`ml-2 text-${themeColor}-600 bg-${themeColor}-50 px-2 py-0.5 rounded-md font-medium`}>{selectedCount} Selected</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Batch Actions */}
            {selectedCount > 0 && (
              <>
                 <button 
                  onClick={() => addMultipleToExam(questions.filter(q => q.selected))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm bg-emerald-600 text-white hover:bg-emerald-700`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Add to Exam
                </button>
                <button
                   onClick={() => setIsBulkEditing(!isBulkEditing)}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors"
                >
                   <Edit3 className="w-4 h-4" />
                   Batch Edit
                </button>
                <div className="h-6 w-px bg-slate-300 mx-2 hidden md:block"></div>
              </>
            )}

            <button 
              onClick={() => onGenerateQA(questions.filter(q => q.selected))}
              disabled={selectedCount === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm
                ${selectedCount > 0 
                  ? `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-${themeColor}-200` 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <Sparkles className="w-4 h-4" />
              AI Tutor
            </button>
            <button 
              onClick={selectAll}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-sm transition-colors"
            >
              {selectedCount === questions.length ? 'Deselect' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Bulk Edit Panel */}
        {isBulkEditing && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Set Subject</label>
                         <input 
                           type="text" 
                           value={bulkSubject}
                           onChange={(e) => setBulkSubject(e.target.value)}
                           placeholder="e.g. Calculus"
                           className="px-3 py-2 border border-slate-300 rounded-md text-sm w-40"
                         />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Set Difficulty</label>
                        <select 
                            value={bulkDifficulty}
                            onChange={(e) => setBulkDifficulty(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-md text-sm w-40"
                        >
                            <option value="">No Change</option>
                            {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleBulkEditSubmit}
                        className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-md text-sm font-medium hover:bg-${themeColor}-700`}
                    >
                        Apply to {selectedCount} items
                    </button>
                </div>
            </div>
        )}

        {/* Search & Filters Toolbar */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="relative group">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchQuery ? `text-${themeColor}-500` : 'text-slate-400'}`} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword..."
              className={`w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm md:text-base bg-slate-50 focus:bg-white focus:ring-2 focus:ring-${themeColor}-100 focus:border-${themeColor}-400 outline-none transition-all placeholder:text-slate-400 shadow-sm`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-all"
                aria-label="Clear search"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 text-slate-500 min-w-fit">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
            </div>
            
            <div className="flex flex-wrap gap-3 flex-1">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-slate-50 border-none text-sm font-medium text-slate-700 py-1.5 px-3 rounded-md hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 cursor-pointer transition-colors"
              >
                <option value="All">All Subjects</option>
                {subjects.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 border-none text-sm font-medium text-slate-700 py-1.5 px-3 rounded-md hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 cursor-pointer transition-colors"
              >
                <option value="All">All Types</option>
                {Object.values(QuestionType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-slate-50 border-none text-sm font-medium text-slate-700 py-1.5 px-3 rounded-md hover:bg-slate-100 focus:ring-2 focus:ring-slate-200 cursor-pointer transition-colors"
              >
                <option value="All">All Difficulties</option>
                {Object.values(Difficulty).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              
              {isFiltered && (
                <button
                  onClick={() => {
                    setFilterSubject('All');
                    setFilterType('All');
                    setFilterDifficulty('All');
                    setSearchQuery('');
                  }}
                  className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium py-1.5 px-2"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No questions match your filters.</p>
        </div>
      ) : (
        /* List Layout: Flex column instead of Grid */
        <div className="flex flex-col gap-4 pb-20">
          {filteredQuestions.map((q) => {
            const isInExam = examQuestions.some(eq => eq.id === q.id);
            return (
              <div 
                key={q.id}
                onClick={() => toggleSelection(q.id)}
                className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex
                  ${q.selected ? `ring-2 ring-${themeColor}-500 border-transparent` : 'border-slate-200'}
                `}
              >
                {/* Left Colored Strip */}
                <div className={`w-1.5 rounded-l-xl ${getDifficultyColor(q.difficulty).replace('border', 'bg')}`} />

                <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  
                  {/* Selection Checkbox */}
                  <div 
                    className={`flex-shrink-0 transition-colors duration-200
                        ${q.selected ? `text-${themeColor}-600` : 'text-slate-300 group-hover:text-slate-400'}
                    `}
                  >
                    {q.selected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0 w-full">
                     <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${getDifficultyBadge(q.difficulty)}`}>
                            {q.difficulty}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {q.subject}
                        </span>
                        {q.source && (
                             <span className="text-xs text-slate-400 flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                                {q.source}
                             </span>
                        )}
                     </div>

                     <div className="text-slate-800 text-sm font-serif line-clamp-2 md:line-clamp-1">
                          <LatexRenderer>{q.originalText}</LatexRenderer>
                     </div>
                     
                     {/* Show tiny preview of options if MC */}
                     {q.type === 'Multiple Choice' && q.options && (
                        <div className="flex gap-2 mt-1 text-xs text-slate-400 truncate">
                            {q.options.slice(0,3).map((opt, i) => (
                                <span key={i} className="bg-slate-50 px-1 rounded border border-slate-100">{String.fromCharCode(65+i)}</span>
                            ))}
                            {q.options.length > 3 && <span>...</span>}
                        </div>
                     )}
                  </div>

                  {/* Action Buttons (Right side) */}
                  <div className="flex items-center gap-2 md:ml-auto w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 mt-2 md:mt-0 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          isInExam ? removeFromExam(q.id) : addToExam(q);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap
                          ${isInExam 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : `bg-slate-100 text-slate-500 hover:bg-${themeColor}-50 hover:text-${themeColor}-600`
                          }
                        `}
                      >
                        {isInExam ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        {isInExam ? 'Added' : 'Add'}
                      </button>

                      <button
                         onClick={(e) => {
                             e.stopPropagation();
                             setEditingQuestion(q);
                         }}
                         className="p-1.5 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                         title="Edit Question"
                      >
                         <Edit3 className="w-4 h-4" />
                      </button>

                      <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(q.id);
                          }}
                          className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Question"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSaveEdit} className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Edit Question</h3>
                        <button type="button" onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Question Content (Markdown/LaTeX)</label>
                                <textarea
                                    value={editingQuestion.originalText}
                                    onChange={(e) => setEditingQuestion({...editingQuestion, originalText: e.target.value})}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-serif focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 font-serif">
                                    <p className="text-xs text-slate-400 mb-1 uppercase font-bold">Preview</p>
                                    <LatexRenderer>{editingQuestion.originalText}</LatexRenderer>
                                </div>
                             </div>

                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Answer Key</label>
                                <textarea
                                    value={editingQuestion.answer || ''}
                                    onChange={(e) => setEditingQuestion({...editingQuestion, answer: e.target.value})}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-serif focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Enter the correct answer/explanation here"
                                />
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                                    <input 
                                        type="text"
                                        value={editingQuestion.subject}
                                        onChange={(e) => setEditingQuestion({...editingQuestion, subject: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source / Origin</label>
                                    <input 
                                        type="text"
                                        value={editingQuestion.source || ''}
                                        onChange={(e) => setEditingQuestion({...editingQuestion, source: e.target.value})}
                                        placeholder="e.g. 2023 Final Exam"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Difficulty</label>
                                    <select
                                        value={editingQuestion.difficulty}
                                        onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value as Difficulty})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                     <select
                                        value={editingQuestion.type}
                                        onChange={(e) => setEditingQuestion({...editingQuestion, type: e.target.value as QuestionType})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {Object.values(QuestionType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
                        <button 
                            type="button" 
                            onClick={() => setEditingQuestion(null)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-lg text-sm font-medium hover:bg-${themeColor}-700 flex items-center gap-2`}
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};