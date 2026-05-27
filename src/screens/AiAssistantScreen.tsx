import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Bot, User, WifiOff } from 'lucide-react';
import { aiResponses } from '../data/mockData';
import type { ChatMessage } from '../data/mockData';

interface AiAssistantScreenProps {
  onBack: () => void;
}

const suggestedPrompts = [
  'Which children missed attendance this week?',
  'Suggest activity for shy children',
  'Who needs home visit?',
  'Generate nutrition summary',
  'Show children needing extra support',
];

export function AiAssistantScreen({ onBack }: AiAssistantScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      message: 'Namaste Sunita Ji! I am Pratibha, your AI assistant. How can I help you today?',
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: text,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = aiResponses[text] || aiResponses['default'];
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: response,
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350">
            <ArrowLeft size={20} />
          </button>
          <div className="relative shrink-0">
            <img
              src="/ai-avatar.jpg"
              alt="AI Mentor"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-800 dark:text-white">AI Mentor</h1>
            <div className="flex items-center gap-1">
              <WifiOff size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Offline Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className="shrink-0 self-end">
              {msg.sender === 'ai' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
                  <User size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-violet-500 dark:bg-violet-600 text-white rounded-br-md shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-200 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.message}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-violet-200' : 'text-gray-400 dark:text-slate-500'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-300 dark:bg-slate-650 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 dark:bg-slate-650 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-gray-300 dark:bg-slate-650 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="shrink-0 px-4 pb-2">
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-2">Quick Questions:</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 rounded-xl text-xs text-gray-700 dark:text-slate-350 whitespace-nowrap active:scale-95 transition-transform select-none hover:bg-orange-50 dark:hover:bg-slate-800"
              >
                {prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-orange-100 dark:bg-orange-950/40 rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0">
            <Mic size={18} className="text-orange-650 dark:text-orange-400" />
          </button>
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-slate-950 rounded-full px-4 h-10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none"
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0 disabled:opacity-50"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
