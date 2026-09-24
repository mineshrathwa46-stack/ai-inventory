import React, { useState } from 'react';
import {
  RefreshCw,
  Send,
  Bot,
  User as UserIcon,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AIInsightItem } from '../types/index.ts';
import { api } from '../api.ts';

interface AIInsightsViewProps {
  insights: AIInsightItem[];
  onRefresh: () => void;
  currencySymbol: string;
  storeName: string;
  onActionClick: (insight: AIInsightItem) => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  insights,
  onRefresh,
  currencySymbol,
  storeName,
  onActionClick
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hello! I am your StockPulse AI Inventory Advisor for ${storeName}. I've synthesized your current 30-day velocity, supplier lead times, and profit margins. How can I assist your purchasing decisions today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSendQuestion = async (qText?: string) => {
    const question = qText || inputQuestion;
    if (!question.trim() || isAsking) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: question, time: timeStr }]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const res = await api.askAI(question);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Encountered a momentary connection delay. Please review your stockout alerts above or ask again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const promptSuggestions = [
    'Which items should I restock right now before the weekend?',
    'How can I free up working capital from dead stock?',
    'What is my most profitable category this month?',
    'Analyze my supplier delivery lead-time risk'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Inventory Insights
            </h1>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
        </div>
      </div>

      {/* 4 Executive Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => {
          const isUrgent = item.type === 'urgent';
          const isOpportunity = item.type === 'opportunity';
          const isOptimization = item.type === 'optimization';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                isUrgent
                  ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                  : isOpportunity
                  ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isUrgent
                        ? 'bg-rose-600 text-white'
                        : isOpportunity
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {item.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    Supporting data
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 mb-1.5">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {item.description}
                </p>

                <div className="mt-3 p-2 rounded-xl bg-white/80 border border-slate-200/80 text-[11px] font-mono text-slate-600">
                  📊 {item.dataEvidence}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Autonomous Suggestion
                </span>
                <button
                  onClick={() => onActionClick(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                    isUrgent
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {item.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Inventory Copilot Q&A Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900">
              Ask StockPulse Copilot (Grounded in Live Store Data)
            </h2>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Natural language retail intelligence
          </span>
        </div>

        {/* Suggested Prompts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
          {promptSuggestions.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs whitespace-pre-line'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isAsking && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Bot className="w-4 h-4 text-indigo-600 animate-bounce" />
              <span>Analyzing historical sales velocity and supplier lead times...</span>
            </div>
          )}
        </div>

        {/* Question Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about your stock, margins, sales velocity, or supplier risks..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendQuestion();
            }}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
          />
          <button
            onClick={() => handleSendQuestion()}
            disabled={isAsking || !inputQuestion.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
