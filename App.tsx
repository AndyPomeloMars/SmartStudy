import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { UploadZone } from './components/UploadZone';
import { QuestionList } from './components/QuestionList';
import { PrintPreview } from './components/PrintPreview';
import { AIChat } from './components/AIChat';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { ViewState, Question, ThemeColor, UploadedFile, Language, ChatSession, ChatMessage } from './types';
import { extractQuestionsFromImage, getAIResponse, getAIResponseStream } from './services/geminiService';
import { Bell, Search, Sun, PanelLeft } from 'lucide-react';
import { t } from './utils/translations';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignupView, setIsSignupView] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Initialize exam questions from local storage if available
  const [examQuestions, setExamQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('savedExam');
    try {
      return saved ? JSON.parse(saved).questions || [] : [];
    } catch (e) {
      return [];
    }
  });
  
  // Chat State (Lifted)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Background Upload/Scanning State
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  
  // Theme & Language State
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('themeColor') as ThemeColor) || 'neutral';
  });
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // --- Background Processing Logic ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const processQueue = async () => {
      const isProcessing = uploads.some(f => f.status === 'processing');
      if (isProcessing) return;

      const nextFile = uploads.find(f => f.status === 'queued');
      if (!nextFile) return;

      setUploads(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: 'processing' } : f));

      try {
        const base64 = await fileToBase64(nextFile.file);
        const apiBase64 = base64.split(',')[1];
        const newQuestions = await extractQuestionsFromImage(apiBase64);
        
        setQuestions(prev => [...prev, ...newQuestions]);
        setUploads(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: 'completed' } : f));
      } catch (err) {
        console.error("Scan failed for file", nextFile.id, err);
        setUploads(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: 'error', error: 'Failed to extract' } : f));
      }
    };

    processQueue();
  }, [uploads]);

  // --- Upload Handlers ---
  const handleUploadFiles = (newFiles: File[]) => {
    const newUploads = newFiles.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'pending' as const
    }));
    setUploads(prev => [...prev, ...newUploads]);
  };

  const handleQueueFile = (id: string) => {
    setUploads(prev => prev.map(f => f.id === id ? { ...f, status: 'queued' } : f));
  };

  const handleQueueAll = () => {
    setUploads(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'queued' } : f));
  };

  const handleRemoveFile = (id: string) => {
    setUploads(prev => prev.filter(f => f.id !== id));
  };

  const handleManualQuestionsAdded = (newQuestions: Question[]) => {
      setQuestions(prev => [...prev, ...newQuestions]);
  };

  // --- Normal App Logic ---
  const toggleSelection = (id: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, selected: !q.selected } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setExamQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    setExamQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const selectAll = () => {
    const allSelected = questions.every(q => q.selected);
    setQuestions(prev => prev.map(q => ({ ...q, selected: !allSelected })));
  };

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

  // --- Chat Logic ---

  const createChatSession = (initialMsg?: string | object) => {
      // Robust check: if called via event handler, initialMsg is an object.
      const titleText = (typeof initialMsg === 'string' && initialMsg) ? initialMsg : undefined;

      const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: titleText ? (titleText.slice(0, 30) + '...') : 'New Chat',
          messages: [{
              id: 'welcome',
              role: 'model',
              content: 'Hello! I am your SmartStudy AI Tutor. How can I help you today?',
              timestamp: Date.now()
          }],
          updatedAt: Date.now()
      };
      setChatSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      return newSession.id;
  };

  const handleChatSwitch = (sessionId: string) => {
      setActiveSessionId(sessionId);
  };

  const handleSendChatMessage = async (text: string, attachment?: string, useWeb: boolean = false, useKb: boolean = true, explicitSessionId?: string) => {
      
      let targetSessionId = explicitSessionId || activeSessionId;

      if (!targetSessionId) {
          targetSessionId = createChatSession(text);
      }
      
      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: text,
          timestamp: Date.now(),
          attachment
      };

      // Retrieve history BEFORE we add the user message to state, so we can pass clean history to the API.
      // NOTE: We assume 'chatSessions' isn't yet updated with 'userMsg'.
      const currentSession = chatSessions.find(s => s.id === targetSessionId);
      const history = currentSession ? currentSession.messages.map(m => ({ 
          role: m.role, 
          content: m.content, 
          attachment: m.attachment
      })) : [];

      // Create placeholder for AI response
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsgPlaceholder: ChatMessage = {
          id: aiMsgId,
          role: 'model',
          content: '',
          timestamp: Date.now()
      };

      // Optimistic Update: Add User Message + Empty Model Message
      setChatSessions(prev => prev.map(s => {
          if (s.id === targetSessionId) {
              return {
                  ...s,
                  messages: [...s.messages, userMsg, aiMsgPlaceholder],
                  updatedAt: Date.now(),
                  title: s.messages.length <= 1 ? (text.slice(0, 30)) : s.title
              };
          }
          return s;
      }));

      setIsGenerating(true);

      try {
          const stream = getAIResponseStream(
              history, 
              userMsg.content, 
              questions, 
              {
                  useWebSearch: useWeb,
                  useKnowledgeBase: useKb,
                  attachment: userMsg.attachment
              }
          );

          let fullText = "";

          for await (const chunk of stream) {
              fullText += chunk;
              
              setChatSessions(prev => prev.map(s => {
                  if (s.id === targetSessionId) {
                      return {
                          ...s,
                          messages: s.messages.map(m => 
                              m.id === aiMsgId ? { ...m, content: fullText } : m
                          )
                      };
                  }
                  return s;
              }));
          }

      } catch (err) {
          console.error("Chat Error", err);
          setChatSessions(prev => prev.map(s => {
              if (s.id === targetSessionId) {
                  return {
                      ...s,
                      messages: s.messages.map(m => 
                          m.id === aiMsgId ? { ...m, content: "I couldn't generate a response. Please try again." } : m
                      )
                  };
              }
              return s;
          }));
      } finally {
          setIsGenerating(false);
      }
  };

  const handleGenerateQA = (selectedQuestions: Question[]) => {
    const prompt = `Please generate a detailed Q&A study guide for the following ${selectedQuestions.length} questions. For each question, provide the correct answer and a step-by-step explanation.\n\n` + 
      selectedQuestions.map((q, i) => `Q${i+1}: ${q.originalText}${q.options ? `\nOptions: ${q.options.join(', ')}` : ''}`).join('\n\n');
    
    // Create new session explicitly to avoid race condition with state update
    const sessionId = createChatSession("Study Guide Generation");
    handleSendChatMessage(prompt, undefined, false, true, sessionId); 
    setCurrentView(ViewState.TUTOR);
  };

  const handleQuickAsk = (msg: string) => {
      const sessionId = createChatSession(msg);
      handleSendChatMessage(msg, undefined, false, true, sessionId);
      setCurrentView(ViewState.TUTOR);
  };

  // --- Render ---

  if (!isAuthenticated) {
    if (isSignupView) {
      return <Signup onSignup={() => setIsAuthenticated(true)} onSwitchToLogin={() => setIsSignupView(false)} themeColor={themeColor} />;
    }
    return <Login onLogin={() => setIsAuthenticated(true)} onSwitchToSignup={() => setIsSignupView(true)} themeColor={themeColor} />;
  }

  const activeScanningCount = uploads.filter(f => f.status === 'processing' || f.status === 'queued').length;

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return (
          <Dashboard
             questions={questions}
             uploads={uploads}
             examCount={examQuestions.length}
             themeColor={themeColor}
             lang={language}
             onNavigate={setCurrentView}
             onQuickAsk={handleQuickAsk}
          />
        );
      case ViewState.UPLOAD:
        return (
          <UploadZone 
            uploads={uploads}
            onUploadFiles={handleUploadFiles}
            onQueueFile={handleQueueFile}
            onQueueAll={handleQueueAll}
            onRemoveFile={handleRemoveFile}
            onManualQuestionsAdded={handleManualQuestionsAdded}
            themeColor={themeColor}
            lang={language}
          />
        );
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
            lang={language}
          />
        );
      case ViewState.PRINT:
        return (
          <PrintPreview 
            questions={examQuestions} 
            themeColor={themeColor} 
            onReorder={reorderExamQuestions}
            onRemove={removeFromExam}
            lang={language}
          />
        );
      case ViewState.TUTOR:
        return (
          <AIChat 
            questions={questions} 
            themeColor={themeColor} 
            lang={language}
            sessions={chatSessions}
            activeSessionId={activeSessionId}
            onSwitchSession={handleChatSwitch}
            onCreateSession={createChatSession}
            onSendMessage={handleSendChatMessage}
            isGenerating={isGenerating}
          />
        );
      case ViewState.SETTINGS:
        return <Settings themeColor={themeColor} setThemeColor={setThemeColor} language={language} setLanguage={setLanguage} />;
      default:
        return null;
    }
  };

  // Helper for Breadcrumbs
  const getBreadcrumb = () => {
    switch(currentView) {
      case ViewState.DASHBOARD: return t('nav.dashboard', language);
      case ViewState.UPLOAD: return t('nav.scan', language);
      case ViewState.BANK: return t('nav.bank', language);
      case ViewState.PRINT: return t('nav.exam', language);
      case ViewState.TUTOR: return t('nav.tutor', language);
      case ViewState.SETTINGS: return t('nav.settings', language);
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-50 border-r border-slate-200 bg-white">
        <Sidebar 
          currentView={currentView} 
          setView={setCurrentView} 
          questionCount={questions.length}
          onLogout={() => setIsAuthenticated(false)}
          themeColor={themeColor}
          examCount={examQuestions.length}
          lang={language}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen">
        {/* Top Header (Shadcn style) */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm print:hidden">
          <div className="flex h-14 items-center gap-4 px-6">
            <button className="md:hidden p-2 -ml-2 text-slate-500">
               <PanelLeft className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
               <span className="text-slate-900">SmartStudy</span>
               <span className="mx-2">/</span>
               <span>{getBreadcrumb()}</span>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
               <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="search" 
                    placeholder="Search..." 
                    className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
               </div>
               <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
                  <Bell className="w-4 h-4" />
               </button>
               <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                  JD
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0 print:overflow-visible">
          {activeScanningCount > 0 && currentView !== ViewState.UPLOAD && (
             <div className={`fixed bottom-4 left-72 z-40 bg-${themeColor}-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2`}>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning {activeScanningCount} item(s)...
             </div>
          )}
          
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;