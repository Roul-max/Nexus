'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";
import { useAuth } from '@/lib/firebase/auth-context';

export default function AIPage() {
  const { currentOrg, user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: "Hello! I'm your Nexus AI Assistant. I can help you analyze CRM data, summarize project progress, or draft emails. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user || !currentOrg) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-organization-id': currentOrg.id,
        },
        body: JSON.stringify({ prompt: userMessage.content })
      });

      const data = await res.json();
      
      if (data.text) {
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: data.text }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Nexus AI</h1>
            <p className="text-xs text-zinc-500 font-medium">Powered by Gemini</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={cn(
                "flex gap-4 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === 'user' ? "bg-zinc-900 text-white" : "bg-indigo-100 text-indigo-700 border border-indigo-200"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-zinc-900 text-white rounded-tr-none" 
                  : "bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 max-w-[80%]"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 rounded-tl-none flex items-center gap-1.5">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-200 bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['Summarize my open tasks', 'Draft a follow-up email', 'Analyze Q3 revenue'].map(suggestion => (
              <button 
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-medium hover:bg-zinc-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
