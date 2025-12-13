import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { UploadZone } from './components/UploadZone';
import { QuestionList } from './components/QuestionList';
import { PrintPreview } from './components/PrintPreview';
import { AIChat } from './components/AIChat';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Settings } from './components/Settings';
import { ViewState, Question, ThemeColor } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignupView, setIsSignupView] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.UPLOAD);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>(undefined);
  
  // Initialize theme from local storage or default to indigo
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('themeColor') as ThemeColor) || 'indigo';
  });

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  const handleQuestionsAdded = (newQuestions: Question[]) => {
    setQuestions(prev => [...prev, ...newQuestions]);
    // Optional: Switch to bank view automatically? Let's keep user in upload zone to see progress.
    // setCurrentView(ViewState.BANK); 
  };

  const toggleSelection = (id: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, selected: !q.selected } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    // Also remove from exam if present
    setExamQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
    setExamQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const selectAll = () => {
    const allSelected = questions.every(q => q.selected);
    setQuestions(prev => prev.map(q => ({ ...q, selected: !allSelected })));
  };

  // Exam Management
  const addToExam = (question: Question) => {
    if (!examQuestions.some(q => q.id === question.id)) {
      setExamQuestions(prev => [...prev, question]);
    }
  };

  const addMultipleToExam = (selectedQuestions: Question[]) => {
    setExamQuestions(prev => {
      const existingIds = new Set(prev.map(q => q.id));
      const newQuestions = selectedQuestions.filter(q => !existingIds.has(q.id));
      return [...prev, ...newQuestions];
    });
  };

  const removeFromExam = (id: string) => {
    setExamQuestions(prev => prev.filter(q => q.id !== id));
  };

  const reorderExamQuestions = (newOrder: Question[]) => {
    setExamQuestions(newOrder);
  };

  const handleGenerateQA = (selectedQuestions: Question[]) => {
    const prompt = `Please generate a detailed Q&A study guide for the following ${selectedQuestions.length} questions. For each question, provide the correct answer and a step-by-step explanation.\n\n` + 
      selectedQuestions.map((q, i) => `Q${i+1}: ${q.originalText}${q.options ? `\nOptions: ${q.options.join(', ')}` : ''}`).join('\n\n');
    
    setInitialChatMessage(prompt);
    setCurrentView(ViewState.TUTOR);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.UPLOAD:
        return <UploadZone onQuestionsAdded={handleQuestionsAdded} themeColor={themeColor} />;
      case ViewState.BANK:
        return (
          <QuestionList 
            questions={questions} 
            toggleSelection={toggleSelection}
            deleteQuestion={deleteQuestion}
            onUpdateQuestion={updateQuestion}
            selectAll={selectAll}
            onGenerateQA={handleGenerateQA}
            themeColor={themeColor}
            addToExam={addToExam}
            addMultipleToExam={addMultipleToExam}
            removeFromExam={removeFromExam}
            examQuestions={examQuestions}
          />
        );
      case ViewState.PRINT:
        return (
          <PrintPreview 
            questions={examQuestions} 
            themeColor={themeColor} 
            onReorder={reorderExamQuestions}
            onRemove={removeFromExam}
          />
        );
      case ViewState.TUTOR:
        return (
          <AIChat 
            questions={questions} 
            themeColor={themeColor} 
            initialMessage={initialChatMessage}
            onClearInitialMessage={() => setInitialChatMessage(undefined)}
          />
        );
      case ViewState.SETTINGS:
        return <Settings themeColor={themeColor} setThemeColor={setThemeColor} />;
      default:
        return <UploadZone onQuestionsAdded={handleQuestionsAdded} themeColor={themeColor} />;
    }
  };

  if (!isAuthenticated) {
    if (isSignupView) {
      return (
        <Signup 
          onSignup={() => setIsAuthenticated(true)} 
          onSwitchToLogin={() => setIsSignupView(false)} 
          themeColor={themeColor}
        />
      );
    }
    return (
      <Login 
        onLogin={() => setIsAuthenticated(true)} 
        onSwitchToSignup={() => setIsSignupView(true)} 
        themeColor={themeColor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        questionCount={questions.length} // Bank Total
        onLogout={() => setIsAuthenticated(false)}
        themeColor={themeColor}
        examCount={examQuestions.length} // Exam Cart Count
      />
      
      <main className="flex-1 md:ml-72 p-8 h-screen overflow-y-auto print:ml-0 print:p-0">
        <div className="max-w-7xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Menu Button - simplified for brevity */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <button 
          onClick={() => setCurrentView(ViewState.UPLOAD)}
          className={`bg-${themeColor}-600 text-white p-4 rounded-full shadow-lg`}
        >
          Menu
        </button>
      </div>
    </div>
  );
}

export default App;