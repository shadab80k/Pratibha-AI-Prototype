import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Mic, Bot, User, Wifi, Square } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { ChatMessage } from '../data/mockData';

interface AiAssistantScreenProps {
  onBack: () => void;
  childrenList?: any[];
}

// ─── Extended NLU Knowledge Base ────────────────────────────────────────────
const knowledgeBase: { patterns: RegExp[]; handler: (ctx: any) => string }[] = [
  {
    patterns: [/miss|absent|attendance|didn.t come|nahi aaya|gaayab/i],
    handler: (ctx) => {
      const absent = ctx.children.filter((c: any) => c.attendance === 'absent' || c.attendance === 'irregular');
      if (absent.length === 0) return '✅ Great news! All children have good attendance this week.';
      const list = absent.map((c: any, i: number) => `${i + 1}. **${c.name}** — ${c.attendance} (${c.ageDisplay})`).join('\n');
      return `📋 **${absent.length} children need attendance attention:**\n\n${list}\n\nWould you like me to schedule home visits for them?`;
    },
  },
  {
    patterns: [/shy|quiet|introvert|hesitant|shant|chup|dar/i],
    handler: () =>
      `🎭 **Activities for shy children:**\n\n1. **Puppet Show** — Children express through puppets, reducing direct social pressure\n2. **Art Corner** — Individual creativity builds self-confidence\n3. **Paired Story Reading** — 1-on-1 with a trusted peer, then gradually group\n4. **Role Play Games** — Safe environment to practice social interactions\n\n💡 *Tip: Pair shy children with a confident, kind peer for 15 mins/day.*`,
  },
  {
    patterns: [/home visit|ghar jana|visit kab|ghar milna/i],
    handler: (ctx) => {
      const needVisit = ctx.children.filter((c: any) => c.attendance === 'irregular' || c.attendance === 'absent' || c.needsAttention);
      if (needVisit.length === 0) return '🏠 No urgent home visits needed at this time. All children are doing well!';
      const list = needVisit.map((c: any, i: number) => `${i + 1}. **${c.name}** — ${c.parentName} (${c.address})`).join('\n');
      return `🏠 **${needVisit.length} children need home visits:**\n\n${list}\n\nGo to the **Home Visits** tab to log or schedule visits.`;
    },
  },
  {
    patterns: [/nutrition|malnourish|poshan|khaana|food|weight|risk/i],
    handler: (ctx) => {
      const atRisk = ctx.children.filter((c: any) => c.nutritionStatus === 'at-risk');
      const monitoring = ctx.children.filter((c: any) => c.nutritionStatus === 'monitoring');
      const good = ctx.children.filter((c: any) => c.nutritionStatus === 'good');
      return `🥗 **Nutrition Summary:**\n\n✅ Good: ${good.length} children\n⚠️ Monitoring: ${monitoring.length} children\n🔴 At Risk: ${atRisk.length} children${atRisk.length > 0 ? '\n\n**At-risk: ' + atRisk.map((c: any) => c.name).join(', ') + '**\nPlease escalate to health worker immediately.' : ''}\n\n💊 Tip: Conduct weekly weight checks & ensure supplementary nutrition is distributed.`;
    },
  },
  {
    patterns: [/extra support|help|needs attention|problem|struggle|dhyan|madad/i],
    handler: (ctx) => {
      const attention = ctx.children.filter((c: any) => c.needsAttention || c.developmentProgress < 60);
      if (attention.length === 0) return '🌟 All children are progressing well! Keep up the great work.';
      const list = attention.map((c: any, i: number) => `${i + 1}. **${c.name}** — Progress: ${c.developmentProgress}%`).join('\n');
      return `⚠️ **${attention.length} children need extra support:**\n\n${list}\n\n📌 Consider:\n• Individual attention during activities\n• Notify parents for home practice\n• Request ASHA worker support if needed`;
    },
  },
  {
    patterns: [/milestone|development|progress|vikash|badh|grow/i],
    handler: (ctx) => {
      const sorted = [...ctx.children].sort((a: any, b: any) => a.developmentProgress - b.developmentProgress);
      const low = sorted.slice(0, 3);
      const list = low.map((c: any, i: number) => `${i + 1}. ${c.name} — ${c.developmentProgress}%`).join('\n');
      return `📈 **Development Progress Overview:**\n\nClass Average: ${Math.round(ctx.children.reduce((s: number, c: any) => s + c.developmentProgress, 0) / ctx.children.length)}%\n\n**Children needing milestone support:**\n${list}\n\n💡 Focus on language & motor activities for lowest-progress children.`;
    },
  },
  {
    patterns: [/report|summary|aaj ka|today|daily|din/i],
    handler: (ctx) => {
      const present = ctx.children.filter((c: any) => c.attendance === 'present').length;
      const total = ctx.children.length;
      const atRisk = ctx.children.filter((c: any) => c.nutritionStatus === 'at-risk').length;
      const obs = ctx.children.reduce((sum: number, c: any) => sum + (c.observations ? c.observations.length : 0), 0);
      return `📊 **Today's Daily Summary:**\n\n👥 Attendance: ${present}/${total} children\n🥗 Nutrition At-Risk: ${atRisk}\n📝 Total Observations: ${obs}\n\n🕐 Generated at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n\nGo to **Reports** tab to export this as a PDF.`;
    },
  },
  {
    patterns: [/activity|suggest|recommend|kya karein|khelna|kya sikhayen/i],
    handler: (ctx) => {
      const languageLag = ctx.children.find((c: any) => c.developmentProgress < 70 && c.name === 'Rani');
      const cogLag = ctx.children.find((c: any) => c.developmentProgress < 75 && c.name === 'Aarav');
      let recs = `🎯 **AI Activity Recommendations for Today:**\n\n`;
      if (languageLag) recs += `• **Rhyme Time** — For ${languageLag.name}'s language development\n`;
      if (cogLag) recs += `• **Color Sorting Game** — For ${cogLag.name}'s cognitive skills\n`;
      recs += `• **Story Circle** — Great for group listening and expression\n• **Finger Painting** — Boosts fine motor & creativity\n\nGo to the **Activities** tab to schedule these.`;
      return recs;
    },
  },
  {
    patterns: [/how many|kitne|total|count|sankhya/i],
    handler: (ctx) => {
      const present = ctx.children.filter((c: any) => c.attendance === 'present').length;
      return `📊 **Quick Count:**\n\n• Total Enrolled: ${ctx.children.length}\n• Present Today: ${present}\n• Absent/Irregular: ${ctx.children.length - present}\n\nAttendance Rate: **${Math.round((present / ctx.children.length) * 100)}%**`;
    },
  },
  {
    patterns: [/namaste|hello|hi |hii|namaskar|hey|good morning|good evening/i],
    handler: () =>
      `🙏 Namaste! I'm Pratibha, your AI assistant.\n\nI can help you with:\n• 📋 Attendance & home visits\n• 🥗 Nutrition monitoring\n• 📈 Development progress\n• 🎯 Activity suggestions\n• 📊 Daily summaries & reports\n\nWhat would you like to know?`,
  },
  {
    patterns: [/thank|shukriya|dhanyawad|thanks/i],
    handler: () => `🙏 You're welcome, Sunita Ji! You're doing wonderful work for these children. Anything else I can help with?`,
  },
];

const DEFAULT_RESPONSE = (q: string) =>
  `🤔 I understand you're asking about **"${q}"**.\n\nI can help you with:\n• Attendance & home visits\n• Nutrition status\n• Activity recommendations\n• Development milestones\n• Daily summaries\n\nTry asking: *"Who needs home visit?"* or *"Suggest activity for today"*`;

// ─── NLU Engine ──────────────────────────────────────────────────────────────
function processQuery(text: string, children: any[]): string {
  const ctx = { children };
  for (const entry of knowledgeBase) {
    if (entry.patterns.some((p) => p.test(text))) {
      return entry.handler(ctx);
    }
  }
  return DEFAULT_RESPONSE(text);
}

// ─── RAG Context Compiler ───────────────────────────────────────────────────
function getRagContext(children: any[]): string {
  const list = children.map(c => {
    const lastObs = c.observations && c.observations.length > 0 
      ? c.observations.map((o: any) => `[Category: ${o.category}]: ${o.note}`).join('; ')
      : 'No observations logged yet';
    return `- Name: ${c.name} (${c.gender === 'girl' ? 'Girl' : 'Boy'}, Age: ${c.ageDisplay}), Attendance Status: ${c.attendance}, Nutrition Status: ${c.nutritionStatus}, Development Progress: ${c.developmentProgress}%, Recent Logs: ${lastObs}`;
  }).join('\n');
  return `Anganwadi Center Children Registry Context:\n${list}`;
}

// ─── Local Storage History ────────────────────────────────────────────────────
const HISTORY_KEY = 'pratibha_chat_history';

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw).slice(-30); // keep last 30 msgs
  } catch {}
  return [];
}

function saveHistory(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-30)));
  } catch {}
}

// Helper to render markdown bold tags as strong React elements
function renderFormattedMessage(text: string, isUser: boolean) {
  if (!text) return null;
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className={isUser ? "font-bold text-white" : "font-bold text-gray-950 dark:text-white"}>
          {part}
        </strong>
      );
    }
    return part;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AiAssistantScreen({ onBack, childrenList = [] }: AiAssistantScreenProps) {
  const { language } = useLanguage();

  const welcomeMsg: ChatMessage = {
    id: 'welcome',
    sender: 'ai',
    message: language === 'hi'
      ? '🙏 नमस्ते सुनीता जी! मैं प्रतिभा हूँ, आपकी एआई सहायक। आज मैं आपकी कैसे मदद कर सकती हूँ?'
      : language === 'bn'
      ? '🙏 নমস্কার সুনিতা জি! আমি প্রতিভা, আপনার এআই সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?'
      : language === 'mr'
      ? '🙏 नमस्कार सुनिता जी! मी प्रतिभा आहे, तुमची एआय सहाय्यक. आज मी तुम्हाला कशी मदत करू शकते?'
      : '🙏 Namaste Sunita Ji! I am Pratibha, your AI assistant. How can I help you today?',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = loadHistory();
    return history.length > 0 ? history : [welcomeMsg];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedPrompts = language === 'hi' ? [
    'इस हफ्ते किसने अनुपस्थिति ली?',
    'शर्मीले बच्चों के लिए गतिविधि सुझाएं',
    'किसे घर भेंट की जरूरत है?',
    'पोषण सारांश बनाएं',
    'आज का सारांश दिखाएं',
  ] : language === 'bn' ? [
    'এই সপ্তাহে কে অনুপস্থিত ছিল?',
    'লাজুক শিশুদের জন্য কার্যক্রম পরামর্শ',
    'কার গৃহ পরিদর্শন দরকার?',
    'পুষ্টি সারসংক্ষেপ তৈরি করুন',
    'আজকের সারসংক্ষেপ দেখান',
  ] : [
    'Which children missed attendance this week?',
    'Suggest activity for shy children',
    'Who needs home visit?',
    'Generate nutrition summary',
    'Show today\'s daily summary',
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: text,
      timestamp: now,
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      saveHistory(updated);
      return updated;
    });
    setInput('');
    setIsTyping(true);

    const apiMode = localStorage.getItem('pratibha_api_mode') || 'gemini';
    const apiKey = localStorage.getItem('pratibha_gemini_key') || '';

    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholderMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      message: '',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    if (apiMode === 'gemini' && apiKey.trim()) {
      // 1. Real Streaming Gemini API call using RAG context
      try {
        setMessages((prev) => [...prev, aiPlaceholderMsg]);
        
        const ragContext = getRagContext(childrenList);
        const systemInstruction = `You are Pratibha, a supportive, respectful AI mentor/assistant for an Anganwadi early education worker in India named Sunita Ji.
Here is the current real-time database snapshot of children in the Anganwadi center (RAG context):
${ragContext}

Answer the user's questions accurately based on this database context.
Format your responses using clean Markdown bullets and bold text. Keep replies concise and easy to read.

CRITICAL LANGUAGE RULE:
1. You MUST respond in the EXACT same language and script/dialect that the user queried in:
   - If the user query is in English (e.g., "Which children missed attendance?"), reply ONLY in English. Do not write Hindi.
   - If the user query is in Hindi using Devanagari script (e.g., "कौन अनुपस्थित है?"), reply ONLY in Hindi (Devanagari script).
   - If the user query is in Hinglish using Latin script (e.g., "kaun absent hai?"), reply ONLY in Hinglish using Latin script.
   - If the user query is in Bengali, reply ONLY in Bengali.
   - If the user query is in Marathi, reply ONLY in Marathi.
2. NEVER mix languages (e.g., do not reply in Hindi to an English question, and do not use Devanagari Hindi inside an English reply).
3. Do not wrap your response in outer quote characters.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: systemInstruction + "\n\nUser Question: " + text }] }
              ]
            })
          }
        );

        if (!response.ok) throw new Error('API connection failure');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        setIsTyping(false);

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            
            // Extract text matching "text" field in chunks
            const matches = chunk.match(/"text"\s*:\s*"([^"]+)"/g);
            if (matches) {
              matches.forEach(m => {
                const startIndex = m.indexOf('"') + 8;
                const txt = m.slice(startIndex, -1);
                const cleanText = txt
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\t/g, '\t')
                  .replace(/\\\\/g, '\\');

                accumulatedText += cleanText;
                setMessages((prev) => 
                  prev.map(msg => 
                    msg.id === aiMsgId ? { ...msg, message: accumulatedText } : msg
                  )
                );
              });
            }
          }
          setMessages((prev) => {
            saveHistory(prev);
            return prev;
          });
        }
      } catch (err) {
        console.error("Gemini stream error", err);
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, message: "⚠️ Gemini API Error. Please verify your internet connection or check your Developer API Key in settings." } 
              : msg
          )
        );
        setIsTyping(false);
      }
    } else {
      // 2. Typewriter Streaming NLU Simulator fallback (offline mode)
      const responseText = processQuery(text, childrenList);
      
      // Delay NLU start slightly to simulate processing
      const delay = 450 + Math.random() * 450;
      setTimeout(() => {
        setMessages((prev) => [...prev, aiPlaceholderMsg]);
        setIsTyping(false);

        let currentIdx = 0;
        const words = responseText.split(' ');
        const interval = setInterval(() => {
          if (currentIdx >= words.length) {
            clearInterval(interval);
            setMessages((prev) => {
              saveHistory(prev);
              return prev;
            });
            return;
          }
          const currentText = words.slice(0, currentIdx + 1).join(' ');
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, message: currentText } : msg
            )
          );
          currentIdx++;
        }, 55); // Streams 55ms per word
      }, delay);
    }
  }, [childrenList]);

  // Mic voice input using SpeechRecognition
  const toggleMic = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      alert('Voice input is not supported on this browser. Please try Chrome.');
      return;
    }

    if (isMicActive) {
      recognitionRef.current?.stop();
      setIsMicActive(false);
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

    recognition.onstart = () => setIsMicActive(true);

    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
      }
      if (finalText.trim()) {
        setInput(finalText.trim());
      }
    };

    recognition.onend = () => {
      setIsMicActive(false);
    };

    recognition.onerror = () => {
      setIsMicActive(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setMessages([welcomeMsg]);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350 outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-800 dark:text-white">
              {language === 'hi' ? 'एआई मेंटर' : language === 'bn' ? 'এআই মেন্টর' : language === 'mr' ? 'एआय मेंटर' : 'AI Mentor'}
            </h1>
            <div className="flex items-center gap-1">
              <Wifi size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {language === 'hi' ? 'ऑफलाइन रेडी' : 'Offline Ready'}
              </span>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="text-[10px] text-gray-400 dark:text-slate-500 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Clear
          </button>
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
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {renderFormattedMessage(msg.message, msg.sender === 'user')}
              </p>
              <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-violet-200' : 'text-gray-400 dark:text-slate-500'}`}>
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
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts — shown when < 3 messages */}
      {messages.length <= 2 && (
        <div className="shrink-0 px-4 pb-2">
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-2 font-medium">
            {language === 'hi' ? 'त्वरित प्रश्न:' : language === 'bn' ? 'দ্রুত প্রশ্ন:' : 'Quick Questions:'}
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 rounded-xl text-xs text-gray-700 dark:text-slate-350 whitespace-nowrap active:scale-95 transition-transform select-none hover:bg-orange-50 dark:hover:bg-slate-800 outline-none"
              >
                {prompt.length > 28 ? prompt.slice(0, 28) + '…' : prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* Mic button — real voice input */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0 outline-none ${
              isMicActive
                ? 'bg-red-500 shadow-md shadow-red-500/30 animate-pulse'
                : 'bg-orange-100 dark:bg-orange-950/40 hover:bg-orange-200'
            }`}
          >
            {isMicActive
              ? <Square size={14} className="text-white" fill="white" />
              : <Mic size={18} className="text-orange-600 dark:text-orange-400" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 flex items-center bg-gray-100 dark:bg-slate-950 rounded-full px-4 h-10 border border-transparent focus-within:border-violet-400 dark:focus-within:border-violet-600 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder={isMicActive
                ? (language === 'hi' ? 'सुन रहे हैं...' : 'Listening...')
                : (language === 'hi' ? 'कुछ भी पूछें...' : language === 'bn' ? 'যেকোনো কিছু জিজ্ঞেস করুন...' : 'Ask anything...')}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-10 h-10 bg-violet-500 hover:bg-violet-600 rounded-full flex items-center justify-center active:scale-95 transition-all shrink-0 disabled:opacity-40 disabled:active:scale-100 shadow-sm shadow-violet-500/20 outline-none"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
