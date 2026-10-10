import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ExternalLink, User, RefreshCw } from 'lucide-react';

import { apiUrl } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actions?: Array<{ label: string; actionType: 'inquiry' | 'whatsapp'; payload?: string }>;
}

interface AiSupportChatProps {
  onOpenInquiry: (service?: string, destination?: string) => void;
}

const generateSessionId = () => {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
};

export default function AiSupportChat({ onOpenInquiry }: AiSupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    const existing = localStorage.getItem('ke_chat_session_id');
    if (existing) return existing;
    const fresh = generateSessionId();
    localStorage.setItem('ke_chat_session_id', fresh);
    return fresh;
  });
  const [agentBadge, setAgentBadge] = useState<string>('Kamal AI');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Assalamu Alaikum! 👋 Welcome to **Kamal Express AI Support**. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleNewChat = () => {
    const fresh = generateSessionId();
    setSessionId(fresh);
    localStorage.setItem('ke_chat_session_id', fresh);
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Assalamu Alaikum! 👋 New chat started. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    '🛂 Greece Type 26 Visa Requirements',
    '🕋 Umrah Haram Packages 2026',
    '🎓 Study Visa Guidance',
    '✈️ Cheap Flight Ticket Inquiry',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // Endpoint points to configured AI worker or VPS API endpoint
      const workerUrl = import.meta.env.VITE_AI_WORKER_URL || apiUrl('/chat');
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          messages: messages.concat(userMsg).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      let botReply = '';
      if (response.ok) {
        const data = await response.json();
        botReply = data.reply || data.response || '';
        if (data.session_id && data.session_id !== sessionId) {
          setSessionId(data.session_id);
          localStorage.setItem('ke_chat_session_id', data.session_id);
        }
        if (data.agent) {
          setAgentBadge(data.agent);
        }
      }

      if (!botReply) {
        botReply = 'Thank you for reaching out! For detailed assistance, document verification, or bookings, feel free to submit an official inquiry or chat directly with our team on WhatsApp.';
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Submit Official Inquiry', actionType: 'inquiry', payload: textToSend },
          { label: 'WhatsApp Support', actionType: 'whatsapp' },
        ],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('AI Support error:', error);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'I am currently unable to reach the AI server. Would you like to submit an inquiry or contact our team directly on WhatsApp?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Submit Official Inquiry', actionType: 'inquiry' },
          { label: 'WhatsApp Support', actionType: 'whatsapp' },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionType: 'inquiry' | 'whatsapp', payload?: string) => {
    if (actionType === 'inquiry') {
      onOpenInquiry('AI Support Inquiry', payload || '');
      setIsOpen(false);
    } else if (actionType === 'whatsapp') {
      window.open(
        `https://wa.me/923000590935?text=${encodeURIComponent('Hi Kamal Express, I need assistance regarding: ' + (payload || 'Services'))}`,
        '_blank'
      );
    }
  };

  const renderFormattedText = (text: string) => {
    // Simple markdown formatting for bold, headers, and line breaks
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <div 
          key={idx} 
          className="mb-1 last:mb-0" 
          dangerouslySetInnerHTML={{ __html: formattedLine }} 
        />
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-24 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group relative"
          aria-label="Toggle AI Support Assistant"
        >
          <Bot className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
          <span className="absolute right-full mr-3 bg-slate-900/95 text-white text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md border border-slate-700">
            Ask Kamal AI Assistant ✨
          </span>
        </button>
      </div>

      {/* Chatbot Window Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Window Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between border-b border-emerald-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700/80 border border-emerald-400/30 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                  {agentBadge || 'Kamal AI Support'}
                  <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-mono">LIVE</span>
                </h3>
                <p className="text-xs text-emerald-200/80 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Visa, Umrah & Ticket Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                title="Start New Chat"
                className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-emerald-800/50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-emerald-800/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                    }`}
                  >
                    {renderFormattedText(msg.text)}

                    {/* Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act.actionType, act.payload)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium px-2.5 py-1 rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            {act.actionType === 'inquiry' ? (
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ExternalLink className="w-3 h-3 text-emerald-600" />
                            )}
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          {messages.length < 3 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex overflow-x-auto gap-1.5 no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-200 shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about visas, Umrah, tickets..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all shadow-sm shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
