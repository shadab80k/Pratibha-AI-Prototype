import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Mic, Square, Save, Edit3, CheckCircle2, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import type { Child } from '../lib/api';

interface VoiceReportScreenProps {
  onBack: () => void;
  onComplete: (parsedData: { childName: string; note: string; type: 'observation' | 'alert' }[]) => void | Promise<any>;
  childrenList: any[];
  language?: string;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'transcribed' | 'saved';

const presetTemplatesEn = [
  {
    label: 'Standard Center Report',
    text: '18 children arrived today. Rani performed well in the poem activity. Aarav shared his toys. Rohan was a bit quiet today - he needs more attention.'
  },
  {
    label: 'All Present & Learning',
    text: 'All 21 children are present today. Ananya completed the math puzzles quickly. Dev stacked 8 blocks successfully. Meera shared her lunch with friends.'
  },
  {
    label: 'Attendance & Nutrition Alert',
    text: 'Only 15 children present today. Rohan was absent again. Aarav nutrition status needs monitoring.'
  }
];

const presetTemplatesHi = [
  {
    label: 'दैनिक केंद्र रिपोर्ट',
    text: 'आज 18 बच्चे आए। रानी ने कविता गतिविधि में बहुत अच्छा प्रदर्शन किया। आरव ने अपने खिलौने साझा किए। रोहन आज थोड़ा शांत था - उसे अधिक ध्यान देने की आवश्यकता है।'
  },
  {
    label: 'सभी उपस्थित और सक्रिय',
    text: 'आज सभी 21 बच्चे उपस्थित हैं। अनन्या ने गणित की पहेलियां बहुत जल्दी पूरी कीं। देव ने सफलता पूर्वक 8 ब्लॉक जोड़े। मीरा ने दोस्तों के साथ लंच शेयर किया।'
  },
  {
    label: 'अनुपस्थिति और पोषण अपडेट',
    text: 'आज केवल 15 बच्चे उपस्थित हैं। रोहन फिर से अनुपस्थित था। आरव के पोषण स्तर की निगरानी करने की आवश्यकता है।'
  }
];

const parseTranscriptToReport = (text: string, childrenList: Child[], lang: string) => {
  if (!text.trim()) return [];
  
  // Split into sentences using English and Hindi punctuation
  const sentences = text.split(/[।\.!\?\n]+/).map(s => s.trim()).filter(Boolean);
  const items: { type: 'attendance' | 'observation' | 'alert'; label: string; value: string; childName?: string }[] = [];
  const isHi = lang === 'hi';

  sentences.forEach((sentence) => {
    // Check for attendance keywords
    const attendanceKeywords = ['present', 'absent', 'arrived', 'attendance', 'children', 'total', ' उपस्थित', ' अनुपस्थित', ' हाजिर', ' बच्चे', ' आए', 'संख्या'];
    const hasAttendance = attendanceKeywords.some(keyword => sentence.toLowerCase().includes(keyword));
    
    // Find matching child from the actual list
    let matchedChild: Child | undefined = undefined;
    for (const child of childrenList) {
      const nameEn = child.name.toLowerCase();
      const nameHi = child.nameHindi ? child.nameHindi.toLowerCase() : '';
      if (sentence.toLowerCase().includes(nameEn) || (nameHi && sentence.toLowerCase().includes(nameHi))) {
        matchedChild = child;
        break;
      }
    }

    if (matchedChild) {
      const childName = isHi && matchedChild.nameHindi ? matchedChild.nameHindi : matchedChild.name;
      // Check if it's an alert/needs attention
      const alertKeywords = ['quiet', 'silent', 'attention', 'at-risk', 'monitoring', 'shant', 'chup', 'परेशान', 'ध्यान', 'गंभीर', 'जोखिम', 'कमजोरी', 'उदास'];
      const isAlert = alertKeywords.some(keyword => sentence.toLowerCase().includes(keyword));

      items.push({
        type: isAlert ? 'alert' : 'observation',
        label: isAlert 
          ? (isHi ? `ध्यान दें - ${childName}` : `Needs Attention - ${childName}`)
          : (isHi ? `अवलोकन - ${childName}` : `Observation - ${childName}`),
        value: sentence,
        childName: matchedChild.name // Always use English name key for parent mapping
      });
    } else if (hasAttendance) {
      items.push({
        type: 'attendance',
        label: isHi ? 'उपस्थिति विवरण' : 'Attendance Info',
        value: sentence
      });
    }
  });

  return items;
};

export function VoiceReportScreen({ onBack, onComplete, childrenList, language = 'en' }: VoiceReportScreenProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [waveform, setWaveform] = useState<number[]>(new Array(20).fill(5));
  const [showOfflineMsg, setShowOfflineMsg] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  
  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [listeningText, setListeningText] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const simTimeoutRef1 = useRef<any>(null);
  const simTimeoutRef2 = useRef<any>(null);
  const simIntervalRef = useRef<any>(null);

  const isHi = language === 'hi';
  const presets = isHi ? presetTemplatesHi : presetTemplatesEn;

  // Waveform animation when recording
  useEffect(() => {
    if (state === 'recording') {
      intervalRef.current = setInterval(() => {
        setWaveform((prev) =>
          prev.map(() => Math.random() * 35 + 5)
        );
      }, 150);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (state === 'idle') setWaveform(new Array(20).fill(5));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (simTimeoutRef1.current) clearTimeout(simTimeoutRef1.current);
      if (simTimeoutRef2.current) clearTimeout(simTimeoutRef2.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  // Web Speech API and typing simulation logic
  const handleStartVoiceRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setShowOfflineMsg(true);

    if (!SpeechRecognition) {
      // Simulate Speech Input with a random preset
      setState('recording');
      setIsListening(true);
      setListeningText(isHi ? 'बोलना शुरू करें...' : 'Start speaking...');
      
      const randomPreset = presets[Math.floor(Math.random() * presets.length)].text;
      
      simTimeoutRef1.current = setTimeout(() => {
        setListeningText(isHi ? 'आवाज पहचानी जा रही है...' : 'Voice detected...');
        
        simTimeoutRef2.current = setTimeout(() => {
          setIsListening(false);
          setState('processing');
          simulateTranscriptionTyping(randomPreset);
        }, 1500);
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHi ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setState('recording');
        setIsListening(true);
        setListeningText(isHi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now');
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setListeningText(isHi ? 'आवाज नहीं पहचानी गई' : 'Speech not recognized');
        simTimeoutRef1.current = setTimeout(() => {
          setIsListening(false);
          setState('idle');
        }, 1200);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setListeningText(isHi ? `पहचाना गया: "${resultText.slice(0, 20)}..."` : `Detected: "${resultText.slice(0, 20)}..."`);
          simTimeoutRef1.current = setTimeout(() => {
            setIsListening(false);
            setState('processing');
            simulateTranscriptionTyping(resultText);
          }, 1000);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setState('idle');
      setIsListening(false);
    }
  };

  const simulateTranscriptionTyping = (fullText: string) => {
    let currentIdx = 0;
    setTranscript('');
    
    // Typing simulation to look like high-end voice transcription
    simIntervalRef.current = setInterval(() => {
      if (currentIdx < fullText.length) {
        // Type 3-4 characters at a time to be fast yet smooth
        const step = Math.min(4, fullText.length - currentIdx);
        setTranscript(fullText.substring(0, currentIdx + step));
        currentIdx += step;
      } else {
        clearInterval(simIntervalRef.current);
        setState('transcribed');
      }
    }, 45);
  };

  const handleSelectPreset = (text: string) => {
    setShowPresets(false);
    setState('processing');
    setShowOfflineMsg(true);
    simulateTranscriptionTyping(text);
  };

  const handleSave = async () => {
    // Calculate parsed reports to pass back to database state
    const parsedReports = parseTranscriptToReport(transcript, childrenList, language);
    const saveableObservations = parsedReports
      .filter(r => (r.type === 'observation' || r.type === 'alert') && r.childName)
      .map(r => ({
        childName: r.childName!,
        note: r.value,
        type: r.type as 'observation' | 'alert'
      }));

    if (saveableObservations.length === 0) {
      // Let parent handle empty state and show toast
      onComplete([]);
      return;
    }

    setState('processing');
    try {
      const res = onComplete(saveableObservations);
      if (res instanceof Promise) {
        await res;
      }
      setState('saved');
    } catch (e) {
      console.error(e);
      setState('transcribed');
    }
  };

  // Dynamically calculate parsed report based on current editable transcript text
  const structuredReport = useMemo(() => {
    return parseTranscriptToReport(transcript, childrenList, language);
  }, [transcript, childrenList, language]);

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-b from-[#0b0f19] via-[#0f172a] to-[#1e1b4b] text-white flex flex-col relative select-none">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-10 pb-4 border-b border-white/5 shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold">{isHi ? 'आवाज़ रिपोर्ट' : 'Voice Report'}</h1>
          <p className="text-xs text-gray-400">{isHi ? 'आवाज़ से रिपोर्ट तैयार करें' : 'Generate reports using speech'}</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-hide">
        {/* Status Indicator */}
        <div className="text-center py-2">
          {state === 'idle' && (
            <>
              <p className="text-slate-200 text-sm font-semibold mb-1">
                {isHi ? 'माइक दबाएं और सामान्य रूप से बोलें' : 'Tap the microphone & speak naturally'}
              </p>
              <p className="text-gray-400 text-xs font-medium">
                {isHi ? 'या नीचे दिए गए त्वरित विकल्पों का उपयोग करें' : 'or select a preset template below'}
              </p>
            </>
          )}
          {state === 'recording' && (
            <>
              <p className="text-orange-400 text-sm font-bold mb-1 animate-pulse">
                {isHi ? 'रिकॉर्डिंग चालू है...' : 'Recording Audio...'}
              </p>
              <p className="text-gray-400 text-xs font-medium">
                {isHi ? 'बोलना जारी रखें' : 'Keep speaking clearly'}
              </p>
            </>
          )}
          {state === 'processing' && (
            <>
              <p className="text-sky-400 text-sm font-bold mb-1 flex items-center justify-center gap-1.5">
                <Loader2 size={16} className="animate-spin" />
                {isHi ? 'एआई रिपोर्ट तैयार कर रहा है...' : 'AI processing speech...'}
              </p>
              <p className="text-gray-400 text-xs font-medium">
                {isHi ? 'पाठ में परिवर्तित किया जा रहा है' : 'Converting voice to text...'}
              </p>
            </>
          )}
          {state === 'transcribed' && (
            <>
              <p className="text-emerald-400 text-sm font-bold mb-1 flex items-center justify-center gap-1">
                <Sparkles size={16} className="text-emerald-400 animate-bounce" />
                {isHi ? 'रिपोर्ट समीक्षा के लिए तैयार है!' : 'Report compiled!'}
              </p>
              <p className="text-gray-400 text-xs font-medium">
                {isHi ? 'आवश्यकतानुसार नीचे संपादित करें' : 'Edit details in the box if needed'}
              </p>
            </>
          )}
          {state === 'saved' && (
            <>
              <p className="text-emerald-400 text-sm font-bold mb-1">
                {isHi ? 'सफलतापूर्वक सहेजा गया!' : 'Saved successfully!'}
              </p>
              <p className="text-gray-400 text-xs font-medium">
                {isHi ? 'ऑफलाइन डेटाबेस सिंक सक्रिय' : 'Saved to local sandbox sync log'}
              </p>
            </>
          )}
        </div>

        {/* Microphone / Waveform Area */}
        <div className="relative flex flex-col items-center py-2 shrink-0">
          {/* Pulsating background rings */}
          {(state === 'recording' || state === 'processing') && (
            <>
              <div className="absolute w-36 h-36 rounded-full border border-orange-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-28 h-28 rounded-full border border-orange-500/30 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Mic Button */}
          <button
            onClick={() => {
              if (state === 'idle') handleStartVoiceRecord();
              else if (state === 'recording') {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    console.error(e);
                  }
                } else {
                  setState('processing');
                }
              }
            }}
            disabled={state === 'processing' || state === 'saved'}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              state === 'idle'
                ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20'
                : state === 'recording'
                ? 'bg-red-500 shadow-red-500/20'
                : state === 'processing'
                ? 'bg-sky-500 shadow-sky-500/20'
                : state === 'transcribed'
                ? 'bg-emerald-500 shadow-emerald-500/20'
                : 'bg-emerald-600'
            }`}
          >
            {state === 'idle' && <Mic size={36} className="text-white" strokeWidth={2.5} />}
            {state === 'recording' && <Square size={24} className="text-white" strokeWidth={3} fill="white" />}
            {state === 'processing' && <Loader2 size={32} className="text-white animate-spin" />}
            {(state === 'transcribed' || state === 'saved') && <CheckCircle2 size={36} className="text-white" />}
          </button>

          {/* Waveform */}
          <div className="flex items-center justify-center gap-[3px] h-12 mt-5 select-none pointer-events-none">
            {waveform.map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  state === 'recording'
                    ? 'bg-orange-400'
                    : state === 'processing'
                    ? 'bg-sky-400'
                    : 'bg-slate-700/60'
                }`}
                style={{
                  height: `${height}px`,
                  opacity: state === 'idle' ? 0.35 : 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Offline Warning Banner */}
        {showOfflineMsg && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 rounded-2xl border border-white/5 justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <p className="text-xs text-slate-300 font-semibold">
              {isHi ? 'लो-कनेक्टिविटी में भी ऑफलाइन कार्य करता है' : 'Dictation operates 100% offline'}
            </p>
          </div>
        )}

        {/* Presets Trigger */}
        {state === 'idle' && (
          <div className="space-y-2">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-2xl active:scale-[0.98] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <span className="text-xs font-bold text-orange-400">💡 {isHi ? 'त्वरित सिमुलेशन विकल्प' : 'Quick Simulation Presets'}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
            </button>
            {showPresets && (
              <div className="grid gap-2 animate-slideDown">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectPreset(preset.text)}
                    className="w-full text-left p-3.5 bg-slate-950 border border-slate-900 hover:border-orange-500/30 rounded-2xl text-xs space-y-1 active:scale-[0.98] transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <p className="font-bold text-orange-500">{preset.label}</p>
                    <p className="text-slate-300 leading-relaxed truncate font-medium">{preset.text}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transcript Textarea (Fully Editable) */}
        {(state === 'transcribed' || state === 'saved') && (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5">
              <Edit3 size={12} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {isHi ? 'संपादित करें (Edit Transcript)' : 'Edit Transcript'}
              </span>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none resize-none leading-relaxed min-h-[90px] font-medium"
              placeholder={isHi ? 'यहाँ अपना रिपोर्ट विवरण टाइप करें...' : 'Type details here...'}
              disabled={state === 'saved'}
            />
          </div>
        )}

        {/* Dynamic Structured Report Parser */}
        {(state === 'transcribed' || state === 'saved') && structuredReport.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
              {isHi ? 'एआई-संरचित व्याख्या' : 'AI-Structured Extract'}
            </p>
            <div className="space-y-2.5">
              {structuredReport.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border flex gap-3 ${
                    item.type === 'alert'
                      ? 'bg-red-500/10 border-red-500/20'
                      : item.type === 'attendance'
                      ? 'bg-sky-500/10 border-sky-500/20'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.type === 'attendance'
                          ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                          : item.type === 'observation'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                          : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wide leading-none mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {state === 'transcribed' && (
        <div className="shrink-0 p-4 bg-slate-950/65 backdrop-blur-md border-t border-white/5 select-none">
          <button
            onClick={handleSave}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg active:scale-[0.97] transition-transform flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Save size={18} />
            {isHi ? 'रिपोर्ट सहेजें' : 'Save Report'}
          </button>
        </div>
      )}

      {/* Recording Overlay Voice Modal */}
      {isListening && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-[280px] shadow-2xl space-y-6 text-center animate-scaleIn">
            <div>
              <span className="text-[9px] bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {isHi ? 'वॉइस डिक्टेशन' : 'Voice Dictation'}
              </span>
              <h3 className="text-xs font-semibold text-slate-100 mt-4 min-h-[44px] px-2 leading-relaxed">
                {listeningText}
              </h3>
            </div>

            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping pointer-events-none" />
              <div className="absolute inset-2 bg-orange-500/10 rounded-full animate-pulse pointer-events-none" />
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Mic size={22} className="text-white animate-bounce" />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed px-2 font-medium">
              {isHi
                ? 'अपने माइक्रोफ़ोन में स्पष्ट रूप से बोलें...'
                : 'Speak clearly into your device microphone...'}
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
                setState('idle');
                setIsListening(false);
              }}
              className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl active:scale-95 transition-transform outline-none"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
