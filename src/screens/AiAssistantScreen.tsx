import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Bot, User, Wifi, CloudOff, Copy, Check, Trash2 } from 'lucide-react';
import { children as defaultChildren, homeVisits as defaultHomeVisits, activities } from '../data/mockData';
import { chatApi } from '../lib/api';

interface Child {
  id: string;
  name: string;
  nameHindi: string;
  age: number;
  ageDisplay: string;
  gender: 'boy' | 'girl';
  avatar: string;
  attendance: 'present' | 'absent' | 'irregular';
  nutritionStatus: 'good' | 'at-risk' | 'monitoring';
  developmentProgress: number;
  lastVisit: string;
  parentName: string;
  parentPhone: string;
  address: string;
  observations: { id: string; date: string; note: string; category: string; type: string }[];
  milestones: { id: string; title: string; date: string; category: string; completed: boolean }[];
  aiInsights: string[];
  needsAttention: boolean;
  attendanceHistory: boolean[];
}

interface HomeVisit {
  id: string;
  childName: string;
  parentName: string;
  concern: string;
  lastVisit: string;
  suggestedTopics: string[];
  status: 'pending' | 'completed';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

interface AiAssistantScreenProps {
  onBack: () => void;
  isOffline?: boolean;
  language?: string;
  onAddObservation?: (childId: string, note: string, category: string) => void;
  childrenList?: Child[];
  visitsList?: HomeVisit[];
}

const getSuggestedPrompts = (lang: string) => {
  if (lang === 'hi') {
    return [
      'इस सप्ताह किस बच्चे की उपस्थिति कम रही?',
      'शर्मीले बच्चों के लिए गतिविधि बताएं',
      'किसे गृह दौरे की आवश्यकता है?',
      'पोषण स्तर का सारांश दिखाएं',
      'किन बच्चों को अतिरिक्त सहायता चाहिए?'
    ];
  }
  return [
    'Which children missed attendance this week?',
    'Suggest activity for shy children',
    'Who needs home visit?',
    'Generate nutrition summary',
    'Show children needing extra support',
  ];
};

// Generate dynamic AI responses based on actual mock database state
const generateAiResponse = (
  query: string,
  lang: string,
  childrenList: Child[] = [],
  visitsList: HomeVisit[] = []
): string => {
  const text = query.toLowerCase().trim();
  const isHi = lang === 'hi';

  // 1. Individual Child Profile Lookup
  const matchedChild = childrenList.find(c => {
    const nameEn = c.name.toLowerCase();
    const nameHi = c.nameHindi ? c.nameHindi.toLowerCase() : '';
    return text.includes(nameEn) || (nameHi && text.includes(nameHi));
  });

  if (matchedChild) {
    const name = isHi ? matchedChild.nameHindi : matchedChild.name;
    const parent = matchedChild.parentName;
    const age = matchedChild.ageDisplay;
    const nutrition = matchedChild.nutritionStatus;
    const attendance = matchedChild.attendance;
    const progress = matchedChild.developmentProgress;
    const lastVisit = matchedChild.lastVisit;

    const nutritionText = nutrition === 'good' 
      ? (isHi ? 'अच्छी (Good)' : 'Good') 
      : nutrition === 'at-risk' 
      ? (isHi ? 'जोखिम में (At-Risk)' : 'At-Risk') 
      : (isHi ? 'निगरानी में (Monitoring)' : 'Monitoring');

    const attendanceText = attendance === 'present' 
      ? (isHi ? 'उपस्थित (Present)' : 'Present') 
      : attendance === 'irregular' 
      ? (isHi ? 'अनियमित (Irregular)' : 'Irregular') 
      : (isHi ? 'अनुपस्थित (Absent)' : 'Absent');

    const insights = matchedChild.aiInsights.map((ins: string) => `- ${ins}`).join('\n');

    if (isHi) {
      return `यहाँ **${name}** का प्रोफ़ाइल विवरण है:\n\n` +
             `- **उम्र**: ${age}\n` +
             `- **अभिभावक**: ${parent} (फ़ोन: ${matchedChild.parentPhone})\n` +
             `- **उपस्थिति**: ${attendanceText}\n` +
             `- **पोषण स्तर**: ${nutritionText}\n` +
             `- **विकास प्रगति**: ${progress}%\n` +
             `- **अंतिम गृह दौरा**: ${lastVisit}\n\n` +
             `**एआई अंतर्दृष्टि (Insights):**\n${insights}\n\n` +
             `क्या आप ${name} के लिए गृह दौरा निर्धारित करना चाहते हैं या कोई टिप्पणी जोड़ना चाहते हैं?`;
    } else {
      return `Here is the profile summary for **${name}**:\n\n` +
             `- **Age**: ${age}\n` +
             `- **Parent**: ${parent} (Phone: ${matchedChild.parentPhone})\n` +
             `- **Attendance**: ${attendanceText}\n` +
             `- **Nutrition**: ${nutritionText}\n` +
             `- **Development Progress**: ${progress}%\n` +
             `- **Last Home Visit**: ${lastVisit}\n\n` +
             `**AI Insights:**\n${insights}\n\n` +
             `Would you like to schedule a home visit or log a new observation for ${name}?`;
    }
  }

  // 2. Attendance / Absentees Query
  if (text.includes('attendance') || text.includes('absent') || text.includes('irregular') || text.includes('missed') || text.includes('gairhazir') || text.includes('anupasthit') || text.includes('upasthiti') || text.includes('कम उपस्थिति')) {
    const irregular = childrenList.filter(c => c.attendance === 'irregular' || c.attendance === 'absent');
    if (irregular.length === 0) {
      return isHi 
        ? 'सभी बच्चे आज उपस्थित हैं! हाल ही में कोई अनुपस्थिति दर्ज नहीं की गई है।' 
        : 'All children are present today! No recent absences recorded.';
    }

    const list = irregular.map((c, idx) => {
      const name = isHi ? c.nameHindi : c.name;
      const status = c.attendance === 'irregular' 
        ? (isHi ? 'अनियमित' : 'Irregular') 
        : (isHi ? 'अनुपस्थित' : 'Absent');
      return `${idx + 1}. **${name}** (${status} - अभिभावक: ${c.parentName})`;
    }).join('\n');

    if (isHi) {
      return `इस सप्ताह निम्नलिखित बच्चों की उपस्थिति अनियमित या कम रही है:\n\n${list}\n\nक्या आप इनमें से किसी बच्चे के लिए गृह दौरा (Home Visit) की योजना बनाना चाहेंगे?`;
    } else {
      return `Here are the children with irregular or missed attendance this week:\n\n${list}\n\nWould you like me to help you schedule home visits for them?`;
    }
  }

  // 3. Activities / Shy Children Query
  if (text.includes('activity') || text.includes('activities') || text.includes('shy') || text.includes('sharmile') || text.includes('sharmila') || text.includes('gatividhi') || text.includes('khel') || text.includes('गतिविधि')) {
    const recommended = activities.filter(a => a.aiRecommended);
    const list = recommended.map((a, idx) => {
      const title = isHi ? a.titleHindi : a.title;
      return `${idx + 1}. **${title}** (${a.duration} &middot; ${a.category} &middot; ${a.ageGroup})\n   - *${isHi ? 'सीखने का परिणाम' : 'Outcome'}:* ${a.learningOutcome}`;
    }).join('\n');

    if (isHi) {
      return `शर्मीले या संकोची बच्चों के लिए, मैं इन गतिविधियों की सलाह देती हूँ:\n\n${list}\n\nइन छोटी समूह गतिविधियों से बच्चों में आत्मविश्वास बढ़ेगा। क्या आप इनमें से कोई गतिविधि शुरू करना चाहते हैं?`;
    } else {
      return `For shy or quiet children, I highly recommend starting with these activities:\n\n${list}\n\nThese low-pressure and creative play activities help build peer confidence. Would you like to start one?`;
    }
  }

  // 4. Home Visits Query
  if (text.includes('home visit') || text.includes('visit') || text.includes('ghar') || text.includes('daura') || text.includes('milne') || text.includes('ghar par') || text.includes('दौरा')) {
    const pendingVisits = visitsList.filter(v => v.status === 'pending');
    if (pendingVisits.length === 0) {
      return isHi 
        ? 'आपके पास कोई लंबित गृह दौरा नहीं है! सभी दौरे पूरे हो चुके हैं।' 
        : 'You have no pending home visits! All visits are completed.';
    }

    const list = pendingVisits.map((v, idx) => {
      const childName = v.childName;
      const match = childrenList.find(c => c.name === childName);
      const displayName = isHi && match ? match.nameHindi : childName;
      return `${idx + 1}. **${displayName}**\n   - *अभिभावक (Parent):* ${v.parentName}\n   - *कारण (Concern):* ${v.concern}\n   - *अंतिम दौरा (Last visit):* ${v.lastVisit}`;
    }).join('\n');

    if (isHi) {
      return `यहाँ आपके लंबित गृह दौरों की सूची है:\n\n${list}\n\nगृह दौरे पर जाने से पहले आप मुझसे चर्चा के विषय (Discussion Points) पूछ सकते हैं।`;
    } else {
      return `Here are your pending home visits:\n\n${list}\n\nWould you like guidance on what topics to discuss during these visits?`;
    }
  }

  // 5. Nutrition / At-Risk Query
  if (text.includes('nutrition') || text.includes('poshan') || text.includes('at-risk') || text.includes('risk') || text.includes('health') || text.includes('malnourished') || text.includes('weight') || text.includes('पोषण') || text.includes('स्वास्थ्य')) {
    const good = childrenList.filter(c => c.nutritionStatus === 'good').length;
    const monitoring = childrenList.filter(c => c.nutritionStatus === 'monitoring');
    const atRisk = childrenList.filter(c => c.nutritionStatus === 'at-risk');

    const atRiskList = atRisk.map(c => isHi ? c.nameHindi : c.name).join(', ') || (isHi ? 'कोई नहीं' : 'None');
    const monitoringList = monitoring.map(c => isHi ? c.nameHindi : c.name).join(', ') || (isHi ? 'कोई नहीं' : 'None');

    if (isHi) {
      return `साप्ताहिक पोषण सारांश:\n\n` +
             `- **अच्छी स्थिति (Good)**: ${good} बच्चे\n` +
             `- **निगरानी स्तर (Monitoring)**: ${monitoring.length} (${monitoringList})\n` +
             `- **जोखिम में (At Risk)**: ${atRisk.length} (${atRiskList})\n\n` +
             `*अनुशंसा:* जोखिम वाले बच्चों के परिवारों के साथ पूरक आहार और स्थानीय पोषण सामग्री पर चर्चा के लिए गृह दौरा करें।`;
    } else {
      return `Weekly Nutrition Summary:\n\n` +
             `- **Good Status**: ${good} children\n` +
             `- **Monitoring Status**: ${monitoring.length} (${monitoringList})\n` +
             `- **At-Risk Status**: ${atRisk.length} (${atRiskList})\n\n` +
             `*Recommendation:* Schedule home visits with the families of at-risk children to discuss micro-nutrients and local high-protein diets.`;
    }
  }

  // 6. Extra Support / Attention Query
  if (text.includes('support') || text.includes('extra') || text.includes('attention') || text.includes('help') || text.includes('madad') || text.includes('kamzor') || text.includes('sahyog') || text.includes('अतिरिक्त सहायता')) {
    const attention = childrenList.filter(c => c.needsAttention);
    const list = attention.map((c, idx) => {
      const name = isHi ? c.nameHindi : c.name;
      return `${idx + 1}. **${name}** (उम्र: ${c.ageDisplay})\n   - *स्थिति:* ${c.attendance === 'irregular' ? (isHi ? 'अनियमित उपस्थिति' : 'Irregular Attendance') : ''}${c.nutritionStatus === 'at-risk' ? (isHi ? ' + पोषण जोखिम' : ' + Nutrition At-Risk') : ''}`;
    }).join('\n');

    if (isHi) {
      return `इन बच्चों को अतिरिक्त सहायता और ध्यान की आवश्यकता है:\n\n${list}\n\nइन बच्चों के सीखने के स्तर और स्वास्थ्य पर विशेष ध्यान दें। क्या आप इनमें से किसी के लिए रिपोर्ट देखना चाहते हैं?`;
    } else {
      return `The following children need extra attention or support:\n\n${list}\n\nI recommend prioritizing home visits and custom learning plans for them. How else can I help?`;
    }
  }

  // 7. General Fallback Response
  if (isHi) {
    return `नमस्ते! मैं आपका एआई मेंटर (AI Mentor) हूँ। मैं आपकी निम्नलिखित जानकारी में मदद कर सकती हूँ:\n\n` +
           `- **उपस्थिति** (जैसे: 'कौन अनुपस्थित है?')\n` +
           `- **गतिविधियाँ** (जैसे: 'शर्मीले बच्चों के लिए खेल')\n` +
           `- **गृह दौरा** (जैसे: 'किसे गृह दौरे की आवश्यकता है?')\n` +
           `- **पोषण स्तर** (जैसे: 'पोषण रिपोर्ट सारांश')\n` +
           `- **बच्चे की जानकारी** (जैसे: 'रानी की प्रोफाइल' या 'रोहन के बारे में बताएं')\n\n` +
           `कृपया इनमें से कोई भी प्रश्न पूछें!`;
  } else {
    return `Hello! I am your AI Mentor. I can dynamically assist you with details from your Anganwadi center:\n\n` +
           `- **Attendance Reports** (e.g., 'Who missed attendance this week?')\n` +
           `- **Activity Recommendations** (e.g., 'Suggest activity for shy children')\n` +
           `- **Home Visit Schedules** (e.g., 'Who needs a home visit?')\n` +
           `- **Nutrition Summaries** (e.g., 'Generate nutrition summary')\n` +
           `- **Individual Child Profiles** (e.g., 'Tell me about Rani' or 'Profile of Rohan')\n\n` +
           `How can I assist you today?`;
  }
};

const getFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const generateMessageId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export function AiAssistantScreen({
  onBack,
  isOffline = false,
  language = 'en',
  onAddObservation,
  childrenList = defaultChildren,
  visitsList = defaultHomeVisits
}: AiAssistantScreenProps) {
  // Load chat messages from localStorage or initialize with welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('pratibha_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading chat history", e);
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'ai',
        message: language === 'hi' 
          ? 'नमस्ते सुनीता जी! मैं प्रतिभा, आपकी एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?'
          : 'Namaste Sunita Ji! I am Pratibha, your AI assistant. How can I help you today?',
        timestamp: getFormattedTime(),
      },
    ];
  });

  // Load chat messages from API on mount
  useEffect(() => {
    if (isOffline) return;
    chatApi.getHistory()
      .then((history) => {
        if (history && history.length > 0) {
          // Format backend ISO timestamps to local time format if needed
          const formattedHistory = history.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.includes('T')
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : msg.timestamp
          }));
          setMessages(formattedHistory);
        }
      })
      .catch((err) => console.error("Error loading chat history from server:", err));
  }, [isOffline]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [listeningText, setListeningText] = useState('Listening...');

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiTimeoutRef = useRef<any>(null);
  const speechSimTimeout1Ref = useRef<any>(null);
  const speechSimTimeout2Ref = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  // Persist messages to localStorage for offline fallback
  useEffect(() => {
    localStorage.setItem('pratibha_ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [input]);

  // Component Unmount Cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      if (speechSimTimeout1Ref.current) clearTimeout(speechSimTimeout1Ref.current);
      if (speechSimTimeout2Ref.current) clearTimeout(speechSimTimeout2Ref.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const sendMessage = async (text: string) => {
    const cleaned = text.trim();
    // Safety check to prevent sending empty messages
    if (!cleaned || cleaned.replace(/\s/g, '').length === 0 || isTyping) return;

    const tempUserMsgId = generateMessageId();
    const userMsg: ChatMessage = {
      id: tempUserMsgId,
      sender: 'user',
      message: cleaned,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulated local response generation logic (used for offline or fallback)
    const runOfflineSimulation = () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = setTimeout(() => {
        let response = '';
        const lowerText = cleaned.toLowerCase();
        let observationLogged = false;
        let loggedMessage = '';

        // Check if user is requesting to log an observation note
        const isLogQuery = 
          lowerText.includes('log') || 
          lowerText.includes('record') || 
          lowerText.includes('add') || 
          lowerText.includes('observation') || 
          lowerText.includes('tippani') || 
          lowerText.includes('टिप्पणी') || 
          lowerText.includes('लिखो') || 
          lowerText.includes('जोड़ें') ||
          lowerText.includes('दर्ज');

        if (isLogQuery && onAddObservation && childrenList) {
          const matched = childrenList.find(c => {
            const nameEn = c.name.toLowerCase();
            const nameHi = c.nameHindi ? c.nameHindi.toLowerCase() : '';
            return lowerText.includes(nameEn) || (nameHi && lowerText.includes(nameHi));
          });

          if (matched) {
            let note = '';
            if (cleaned.includes(':')) {
              note = cleaned.split(':').slice(1).join(':').trim();
            } else {
              const nameIndexEn = lowerText.indexOf(matched.name.toLowerCase());
              const nameIndexHi = matched.nameHindi ? lowerText.indexOf(matched.nameHindi.toLowerCase()) : -1;
              let index = -1;
              let len = 0;
              if (nameIndexEn !== -1) {
                index = nameIndexEn;
                len = matched.name.length;
              } else if (nameIndexHi !== -1) {
                index = nameIndexHi;
                len = matched.nameHindi.length;
              }
              if (index !== -1) {
                note = cleaned.substring(index + len)
                  .replace(/^(for|of|ki|ki\stippani|ki\sobservation|के\sलिए|की\sटिप्पणी|के\sबारे\sमें|:|\s)+/gi, '')
                  .trim();
              }
            }

            if (note.length < 3) {
              note = language === 'hi' 
                ? `दैनिक गतिविधि में अच्छा प्रदर्शन` 
                : `Good performance in daily activities.`;
            }

            let category = 'social';
            if (lowerText.includes('read') || lowerText.includes('math') || lowerText.includes('count') || lowerText.includes('learn') || lowerText.includes('padhne') || lowerText.includes('painting') || lowerText.includes('drawing')) {
              category = 'learning';
            } else if (lowerText.includes('health') || lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('nutrition') || lowerText.includes('sehat') || lowerText.includes('khana')) {
              category = 'health';
            }

            onAddObservation(matched.id, note, category);
            observationLogged = true;
            
            const childName = language === 'hi' && matched.nameHindi ? matched.nameHindi : matched.name;
            loggedMessage = language === 'hi'
              ? `मैंने **${childName}** के लिए टिप्पणी दर्ज कर ली है:\n\n*"${note}"*\n\nयह टिप्पणी उनके प्रोफ़ाइल में सहेज ली गई है और डैशबोर्ड पर सिंक हो गई है।`
              : `I have successfully logged the observation for **${childName}**:\n\n*"${note}"*\n\nThis note has been added to their profile and synced with the dashboard.`;
          }
        }

        if (observationLogged) {
          response = loggedMessage;
        } else {
          response = generateAiResponse(cleaned, language, childrenList, visitsList);
        }

        const aiMsg: ChatMessage = {
          id: generateMessageId(),
          sender: 'ai',
          message: response,
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
    };

    if (isOffline) {
      runOfflineSimulation();
    } else {
      try {
        const res = await chatApi.sendMessage(cleaned);

        // Run local observation parsing for immediate child list UI updates
        const lowerText = cleaned.toLowerCase();
        const isLogQuery = 
          lowerText.includes('log') || 
          lowerText.includes('record') || 
          lowerText.includes('add') || 
          lowerText.includes('observation') || 
          lowerText.includes('tippani') || 
          lowerText.includes('टिप्पणी') || 
          lowerText.includes('लिखो') || 
          lowerText.includes('जोड़ें') ||
          lowerText.includes('दर्ज');

        if (isLogQuery && onAddObservation && childrenList) {
          const matched = childrenList.find(c => {
            const nameEn = c.name.toLowerCase();
            const nameHi = c.nameHindi ? c.nameHindi.toLowerCase() : '';
            return lowerText.includes(nameEn) || (nameHi && lowerText.includes(nameHi));
          });

          if (matched) {
            let note = '';
            if (cleaned.includes(':')) {
              note = cleaned.split(':').slice(1).join(':').trim();
            } else {
              const nameIndexEn = lowerText.indexOf(matched.name.toLowerCase());
              const nameIndexHi = matched.nameHindi ? lowerText.indexOf(matched.nameHindi.toLowerCase()) : -1;
              let index = -1;
              let len = 0;
              if (nameIndexEn !== -1) {
                index = nameIndexEn;
                len = matched.name.length;
              } else if (nameIndexHi !== -1) {
                index = nameIndexHi;
                len = matched.nameHindi.length;
              }
              if (index !== -1) {
                note = cleaned.substring(index + len)
                  .replace(/^(for|of|ki|ki\stippani|ki\sobservation|के\sलिए|की\sटिप्पणी|के\sबारे\sमें|:|\s)+/gi, '')
                  .trim();
              }
            }

            if (note.length < 3) {
              note = language === 'hi' 
                ? `दैनिक गतिविधि में अच्छा प्रदर्शन` 
                : `Good performance in daily activities.`;
            }

            let category = 'social';
            if (lowerText.includes('read') || lowerText.includes('math') || lowerText.includes('count') || lowerText.includes('learn') || lowerText.includes('padhne') || lowerText.includes('painting') || lowerText.includes('drawing')) {
              category = 'learning';
            } else if (lowerText.includes('health') || lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('nutrition') || lowerText.includes('sehat') || lowerText.includes('khana')) {
              category = 'health';
            }

            onAddObservation(matched.id, note, category);
          }
        }

        // Sync messages from backend
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsgId);
          const userMsgFromBackend: ChatMessage = {
            id: res.userMessage.id,
            sender: 'user',
            message: res.userMessage.message,
            timestamp: new Date(res.userMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          const aiMsgFromBackend: ChatMessage = {
            id: res.aiMessage.id,
            sender: 'ai',
            message: res.aiMessage.message,
            timestamp: new Date(res.aiMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return [...filtered, userMsgFromBackend, aiMsgFromBackend];
        });
        setIsTyping(false);
      } catch (err) {
        console.error('Failed to send message online, falling back to local simulation:', err);
        runOfflineSimulation();
      }
    }
  };

  // Web Speech API / Voice Input Simulation
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Simulate Voice Input if SpeechRecognition is not supported by the browser (randomizing the prompt)
      setIsListening(true);
      setListeningText(language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...');
      
      const voiceQueries = language === 'hi'
        ? [
            'किसे गृह दौरे की आवश्यकता है?',
            'रानी की प्रोफाइल दिखाएं',
            'शर्मीले बच्चों के लिए गतिविधि बताएं',
            'साप्ताहिक पोषण सारांश बताओ'
          ]
        : [
            'Who needs a home visit?',
            'Show Rani\'s profile summary',
            'Suggest activity for shy children',
            'Generate nutrition summary'
          ];
      const simQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];

      speechSimTimeout1Ref.current = setTimeout(() => {
        setListeningText(`${language === 'hi' ? 'पहचाना गया' : 'Detected'}: "${simQuery}"`);
        
        speechSimTimeout2Ref.current = setTimeout(() => {
          setIsListening(false);
          sendMessage(simQuery);
        }, 1500);
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setListeningText(language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now');
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setListeningText(language === 'hi' ? 'आवाज़ नहीं पहचानी गई' : 'Speech not recognized');
        speechSimTimeout1Ref.current = setTimeout(() => setIsListening(false), 1200);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setListeningText(`${language === 'hi' ? 'पहचाना गया' : 'Detected'}: "${transcript}"`);
          speechSimTimeout1Ref.current = setTimeout(() => {
            setIsListening(false);
            sendMessage(transcript);
          }, 1000);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const clearChatHistory = async () => {
    const confirmMessage = language === 'hi' 
      ? "क्या आप पूरी बातचीत मिटाना चाहते हैं?"
      : "Are you sure you want to clear all chat messages?";
      
    if (window.confirm(confirmMessage)) {
      if (!isOffline) {
        try {
          await chatApi.clearHistory();
        } catch (err) {
          console.error('Failed to clear chat history on server:', err);
        }
      }
      const defaultWelcome: ChatMessage[] = [
        {
          id: 'welcome',
          sender: 'ai',
          message: language === 'hi' 
            ? 'नमस्ते सुनीता जी! मैं प्रतिभा, आपकी एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?'
            : 'Namaste Sunita Ji! I am Pratibha, your AI assistant. How can I help you today?',
          timestamp: getFormattedTime(),
        },
      ];
      setMessages(defaultWelcome);
      localStorage.setItem('pratibha_ai_chat_history', JSON.stringify(defaultWelcome));
    }
  };

  const currentSuggestedPrompts = getSuggestedPrompts(language);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-600 dark:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative shrink-0">
            <img
              src="./ai-avatar.jpg"
              alt="AI Mentor"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
              isOffline ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-800 dark:text-white truncate">AI Mentor</h1>
            <div className="flex items-center gap-1">
              {isOffline ? (
                <>
                  <CloudOff size={10} className="text-amber-500" />
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi size={10} className="text-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online (Offline Ready)</span>
                </>
              )}
            </div>
          </div>
          {/* Clear history button */}
          <button
            onClick={clearChatHistory}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title={language === 'hi' ? 'बातचीत साफ़ करें' : 'Clear Chat'}
          >
            <Trash2 size={18} />
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
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.message}</p>
              
              <div className="flex items-center justify-between gap-4 mt-1 border-t border-black/5 dark:border-white/5 pt-1">
                <span className={`text-[9px] ${msg.sender === 'user' ? 'text-violet-200' : 'text-gray-400 dark:text-slate-500'}`}>
                  {msg.timestamp}
                </span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => copyToClipboard(msg.message, msg.id)}
                    className="p-1 -mr-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-violet-500"
                    title="Copy response"
                  >
                    {copiedMessageId === msg.id ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                )}
              </div>
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
              <div className="flex items-center gap-1.5 py-1">
                <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Button Toggle */}
      {messages.length > 2 && (
        <div className="shrink-0 px-4 pb-1 flex justify-end">
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-semibold bg-violet-50 dark:bg-violet-950/20 px-2.5 py-1 rounded-lg border border-violet-100 dark:border-slate-800 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span>💡 {showSuggestions ? (language === 'hi' ? 'विकल्प छुपाएं' : 'Hide Suggestions') : (language === 'hi' ? 'त्वरित प्रश्न' : 'Quick Questions')}</span>
          </button>
        </div>
      )}

      {/* Suggested Prompts List */}
      {(messages.length <= 2 || showSuggestions) && (
        <div className="shrink-0 px-4 pb-2 select-none">
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-1.5">
            {language === 'hi' ? 'त्वरित प्रश्न:' : 'Quick Questions:'}
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {currentSuggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  sendMessage(prompt);
                  setShowSuggestions(false);
                }}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 rounded-xl text-xs text-gray-700 dark:text-slate-300 whitespace-nowrap active:scale-95 transition-transform select-none hover:bg-orange-50 dark:hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                {prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-end gap-2">
          {/* Voice Input Button */}
          <button 
            onClick={startSpeechRecognition}
            disabled={isTyping}
            className="w-10 h-10 bg-orange-100 dark:bg-orange-950/40 rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            title="Voice input"
          >
            <Mic size={18} className="text-orange-600 dark:text-orange-400" />
          </button>

          {/* Text Area */}
          <div className="flex-1 flex items-end bg-gray-100 dark:bg-slate-950 rounded-2xl px-3.5 py-1.5 border border-transparent focus-within:border-violet-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all focus-within:ring-2 focus-within:ring-violet-500/25">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={language === 'hi' ? 'कुछ भी पूछें...' : 'Ask anything...'}
              rows={1}
              disabled={isTyping}
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none resize-none py-1 scrollbar-hide max-h-20"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            title="Send message"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Voice Dictation Overlay Modal */}
      {isListening && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-[280px] border border-gray-100 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-scaleIn">
            <div>
              <span className="text-[10px] bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {language === 'hi' ? 'वॉइस डिक्टेशन' : 'Voice Dictation'}
              </span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white mt-4 min-h-[40px] px-2 leading-relaxed">
                {listeningText}
              </h3>
            </div>

            {/* Pulsating Mic Icon and Wave Rings */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
              <div className="absolute inset-3 bg-orange-500/10 rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Mic size={26} className="text-white" />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-relaxed px-2">
              {language === 'hi'
                ? 'अपने माइक में स्पष्ट बोलें या वॉइस सिम्युलेटर की प्रतीक्षा करें...'
                : 'Speak clearly into your microphone or wait for voice simulation...'}
            </p>

            <button
              onClick={() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.abort();
                  } catch (e) {
                    console.error(e);
                  }
                }
                setIsListening(false);
              }}
              className="w-full h-10 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-xl active:scale-95 transition-transform"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
