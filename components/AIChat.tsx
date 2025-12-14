import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Globe, Database, Paperclip, X, Plus, MessageSquare } from 'lucide-react';
import { ChatSession, ChatMessage, Question, ThemeColor, Language } from '../types';
import { LatexRenderer } from './LatexRenderer';

interface AIChatProps {
  questions: Question[];
  themeColor: ThemeColor;
  lang: Language;
  // New props for lifted state
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSwitchSession: (id: string) => void;
  onCreateSession: () => void;
  onSendMessage: (text: string, attachment?: string, useWeb?: boolean, useKb?: boolean) => void;
  isGenerating: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ 
    questions, 
    themeColor, 
    lang,
    sessions,
    activeSessionId,
    onSwitchSession,
    onCreateSession,
    onSendMessage,
    isGenerating
}) => {
  const [input, setInput] = useState('');
  
  // Feature Toggles
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  
  // Attachment State
  const [attachment, setAttachment] = useState<{file: File, preview: string, base64: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeSessionId, isGenerating]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
            const result = ev.target.result as string;
            setAttachment({
                file,
                preview: result,
                base64: result.split(',')[1]
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendClick = () => {
    if ((!input.trim() && !attachment) || isGenerating) return;
    onSendMessage(input, attachment?.base64, useWebSearch, useKnowledgeBase);
    setInput('');
    setAttachment(null);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Sidebar - Session List */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200">
           <button 
             onClick={() => onCreateSession()}
             className={`w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm`}
           >
              <Plus className="w-4 h-4" />
              New Chat
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                    No conversations yet.
                </div>
            )}
            {sessions.map(session => (
                <button
                    key={session.id}
                    onClick={() => onSwitchSession(session.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-start gap-3 transition-colors
                        ${activeSessionId === session.id 
                            ? 'bg-white shadow-sm ring-1 ring-slate-200' 
                            : 'hover:bg-slate-200/50 text-slate-600'
                        }
                    `}
                >
                    <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${activeSessionId === session.id ? `text-${themeColor}-600` : 'text-slate-400'}`} />
                    <div className="min-w-0">
                        <div className={`font-medium truncate ${activeSessionId === session.id ? 'text-slate-900' : 'text-slate-700'}`}>
                            {session.title || 'New Chat'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(session.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className={`h-14 px-4 bg-white border-b border-slate-100 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 text-${themeColor}-600`} />
                <h2 className="font-semibold text-slate-900">AI Tutor</h2>
            </div>
            <div className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                Gemini 2.5 Flash
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Bot className="w-12 h-12 mb-3 text-slate-300" />
                    <p>Start a new conversation...</p>
                </div>
            ) : (
                messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                                msg.role === 'user' ? 'bg-slate-800' : `bg-${themeColor}-600`
                            }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.attachment && (
                                    <div className="mb-1">
                                        <img 
                                            src={`data:image/png;base64,${msg.attachment}`} 
                                            alt="Attachment" 
                                            className="max-w-[200px] rounded-lg border border-slate-200 shadow-sm"
                                        />
                                    </div>
                                )}
                                
                                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-slate-800 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                                }`}>
                                    {msg.content ? <LatexRenderer>{msg.content}</LatexRenderer> : null}
                                    
                                    {/* Streaming / Loading Indicator if content is empty */}
                                    {isGenerating && msg.role === 'model' && msg.content === '' && (
                                        <div className="flex items-center space-x-2 h-6 px-1">
                                            <div className={`w-1.5 h-1.5 bg-${themeColor}-400 rounded-full animate-bounce`} />
                                            <div className={`w-1.5 h-1.5 bg-${themeColor}-400 rounded-full animate-bounce delay-75`} />
                                            <div className={`w-1.5 h-1.5 bg-${themeColor}-400 rounded-full animate-bounce delay-150`} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-300 transition-all overflow-hidden">
                
                {/* Image Preview inside input area */}
                {attachment && (
                    <div className="px-4 pt-4 pb-0">
                        <div className="relative inline-block">
                            <img src={attachment.preview} alt="Preview" className="h-16 w-auto rounded-lg border border-slate-200" />
                            <button 
                                onClick={() => setAttachment(null)}
                                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendClick();
                            }
                        }}
                        placeholder={activeSessionId ? "Ask a question..." : "Select or create a chat to start..."}
                        disabled={!activeSessionId || isGenerating}
                        className="w-full px-4 py-3 max-h-32 resize-none focus:outline-none text-slate-700 placeholder:text-slate-400"
                        rows={1}
                        style={{ minHeight: '3rem' }}
                    />
                    
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-2 pb-2 bg-white">
                        <div className="flex items-center gap-1">
                            
                            {/* File Upload */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!activeSessionId}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium
                                    ${attachment 
                                        ? `bg-${themeColor}-50 text-${themeColor}-600` 
                                        : 'text-slate-500 hover:bg-slate-100 disabled:opacity-50'
                                    }
                                `}
                                title="Attach Image"
                            >
                                <Paperclip className="w-4 h-4" />
                                <span className="hidden sm:inline">Attach</span>
                            </button>

                            <div className="w-px h-4 bg-slate-200 mx-1"></div>

                            {/* Web Search Toggle */}
                            <button 
                                onClick={() => setUseWebSearch(!useWebSearch)}
                                disabled={!activeSessionId}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium
                                    ${useWebSearch 
                                        ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' 
                                        : 'text-slate-500 hover:bg-slate-100 disabled:opacity-50'
                                    }
                                `}
                                title="Enable Google Search"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="hidden sm:inline">Web Search</span>
                            </button>

                            {/* Knowledge Base Toggle */}
                            <button 
                                onClick={() => setUseKnowledgeBase(!useKnowledgeBase)}
                                disabled={!activeSessionId}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium
                                    ${useKnowledgeBase 
                                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' 
                                        : 'text-slate-400 hover:bg-slate-100 disabled:opacity-50'
                                    }
                                `}
                                title="Search within Uploaded Questions"
                            >
                                <Database className="w-4 h-4" />
                                <span className="hidden sm:inline">Bank ({questions.length})</span>
                            </button>
                        </div>

                        <button
                            onClick={handleSendClick}
                            disabled={!activeSessionId || isGenerating || (!input.trim() && !attachment)}
                            className={`p-2 rounded-lg transition-colors
                                ${(!input.trim() && !attachment) || isGenerating || !activeSessionId
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-md`
                                }
                            `}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400">
                    AI can make mistakes. {useWebSearch && <span className="text-blue-500 ml-1">Web Search Active.</span>}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};