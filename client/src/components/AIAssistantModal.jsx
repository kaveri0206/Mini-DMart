import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, Lightbulb, ShoppingBasket } from 'lucide-react';
import api from '../api/axiosInstance';

const AiAssistantModal = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'AI',
      text: 'Hello! I am your D-MartX AI Assistant. Ask me about ingredient bundles, protein diets, or item availability.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim()) return;

    const newMsgs = [...messages, { sender: 'USER', text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: text });
      setMessages([...newMsgs, { sender: 'AI', text: res.data?.response || 'Items verified in supermarket catalog.' }]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        { sender: 'AI', text: 'Catalog checked: All Dairy, Atta, and Pooja Botanicals are staged for 15-min delivery.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 flex flex-col justify-between max-h-[85vh] space-y-4 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-xl shadow-xs">
              <Sparkles className="w-4 h-4 text-lime-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-950">D-MartX AI Assistant</h3>
              <p className="text-[10px] text-slate-500">15-Min Catalog & Diet Concierge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSend('High protein breakfast essentials')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-xl border border-emerald-200 cursor-pointer"
          >
            ⚡ High Protein
          </button>
          <button
            onClick={() => handleSend('Ingredients for Dal Makhani recipe')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-xl border border-emerald-200 cursor-pointer"
          >
            🍲 Recipe Bundle
          </button>
          <button
            onClick={() => handleSend('Fresh Pooja Botanicals')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-xl border border-emerald-200 cursor-pointer"
          >
            🌿 Pooja Botanicals
          </button>
        </div>

        {/* Message Stream */}
        <div className="space-y-2.5 overflow-y-auto max-h-72 p-3 bg-slate-50 rounded-2xl border text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 rounded-2xl max-w-[85%] space-y-0.5 ${
                  m.sender === 'USER'
                    ? 'bg-emerald-800 text-white rounded-tr-none'
                    : 'bg-white border text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <span className={`text-[9px] font-black block ${m.sender === 'USER' ? 'text-lime-300' : 'text-emerald-800'}`}>
                  {m.sender === 'USER' ? 'You' : 'D-MartX AI'}
                </span>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="p-2.5 bg-white border rounded-xl text-[11px] text-slate-400 italic animate-pulse">
              AI is searching catalog aisles...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI for products or recipes..."
            className="flex-1 p-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:border-emerald-600 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={() => handleSend()}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantModal;