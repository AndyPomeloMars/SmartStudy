import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { getAIResponse } from '../services/geminiService';
import { ChatMessage, Question, ThemeColor } from '../types';
import { LatexRenderer } from './LatexRenderer';

interface AIChatProps {
  questions: Question[];
  themeColor: ThemeColor;
  initialMessage?: string;
  onClearInitialMessage?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ questions, themeColor, initialMessage, onClearInitialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hello! I am your SmartStudy AI Tutor. I have access to the questions you have uploaded. Ask me to explain a concept, solve a problem, or create a quiz for you!',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      // Include the new user message in context logic if necessary, but here we just pass it as the active prompt
      const responseText = await getAIResponse(history, userMsg.content, questions);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText || "I couldn't generate a response. Please try again.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial message from props (e.g. "Generate Q&A")
  useEffect(() => {
    if (initialMessage && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      handleSendMessage(initialMessage);
      if (onClearInitialMessage) {
        onClearInitialMessage();
      }
    }
  }, [initialMessage]);

  const handleSendClick = () => {
    if (input.trim()) {
      handleSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className={`p-4 bg-${themeColor}-600 text-white flex items-center gap-2`}>
        <Sparkles className="w-5 h-5 text-yellow-300" />
        <h2 className="font-semibold">AI Tutor</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-slate-700' : `bg-${themeColor}-600`
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-200 rounded-tl-none'
              }`}>
                <LatexRenderer>{msg.content}</LatexRenderer>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex max-w-[80%] gap-3">
              <div className={`w-8 h-8 rounded-full bg-${themeColor}-600 flex items-center justify-center`}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 rounded-tl-none flex items-center space-x-2">
                <div className={`w-2 h-2 bg-${themeColor}-400 rounded-full animate-bounce`} />
                <div className={`w-2 h-2 bg-${themeColor}-400 rounded-full animate-bounce delay-75`} />
                <div className={`w-2 h-2 bg-${themeColor}-400 rounded-full animate-bounce delay-150`} />
              </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendClick()}
            placeholder="Ask about your questions or a topic..."
            className={`flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition-all`}
            disabled={isLoading}
          />
          <button
            onClick={handleSendClick}
            disabled={isLoading || !input.trim()}
            className={`p-3 bg-${themeColor}-600 text-white rounded-xl hover:bg-${themeColor}-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};