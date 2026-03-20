import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';

function formatContent(text) {
  return text.split('\n').map((line, i) => {
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 font-semibold">$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em class="text-slate-500">$1</em>');
    if (line.startsWith('✅') || line.startsWith('⚠️') || line.startsWith('📋') || line.startsWith('📱')) {
      return `<div class="my-0.5">${line}</div>`;
    }
    if (/^\d+\./.test(line)) return `<div class="ml-2 my-0.5">${line}</div>`;
    if (line.trim() === '---') return '<hr class="my-2 border-slate-200" />';
    if (line.startsWith('- ')) return `<div class="ml-2 my-0.5">• ${line.slice(2)}</div>`;
    if (line.trim() === '') return '<div class="h-1.5"></div>';
    return `<div class="my-0.5">${line}</div>`;
  }).join('');
}

function ChatMessage({ message, index }) {
  const isBot = message.role === 'assistant';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
        isBot ? 'bg-gradient-to-br from-velora-500 to-teal-500' : 'bg-slate-600'
      }`}>
        {isBot ? <Bot size={13} className="text-white" /> : <User size={13} className="text-white" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
        isBot
          ? 'bg-white border border-slate-200 shadow-sm'
          : 'bg-velora-500 text-white'
      }`}>
        <div
          className={`text-[13px] leading-relaxed ${isBot ? 'text-slate-600' : 'text-white'}`}
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex gap-2.5"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-velora-500 to-teal-500 flex items-center justify-center shrink-0">
        <Bot size={13} className="text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 bg-velora-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPanel({ messages, onSendMessage, isTyping, isDemo, patient }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim() && !isDemo) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-velora-500 to-teal-500 flex items-center justify-center">
          <Bot size={13} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-slate-800">Velora</h3>
          <p className="text-[10px] text-slate-400 leading-none">AI Care Assistant • {patient.name}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] text-slate-400">Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-velora-500 to-teal-500 flex items-center justify-center mb-3"
            >
              <Bot size={28} className="text-white" />
            </motion.div>
            <p className="text-xs font-medium">Ready for {patient.name}'s check-in</p>
            <p className="text-[10px] mt-0.5">Press Play to start the daily interaction</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} index={i} />
          ))}
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="p-2.5 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isDemo ? "Demo in progress..." : `Message ${patient.name.split(' ')[0]}...`}
            disabled={isDemo}
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isDemo}
            className="w-7 h-7 rounded-lg bg-velora-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={12} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
