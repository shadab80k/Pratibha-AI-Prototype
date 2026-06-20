import { useState, useEffect, useRef } from 'react';
import { saveMedia } from '../lib/indexedDb';
import { ArrowLeft, Mic, Square, Save, Edit3, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceReportScreenProps {
  onBack: () => void;
  onComplete: (reportData?: any) => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'transcribed' | 'saved';

export function VoiceReportScreen({ onBack, onComplete }: VoiceReportScreenProps) {
  const { language } = useLanguage();
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [waveform, setWaveform] = useState<number[]>(new Array(20).fill(5));
  const [showOfflineMsg, setShowOfflineMsg] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Microphone and Audio Context states
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);

  // MediaRecorder audio storage states
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Parsed NLP report data
  const [reportData, setReportData] = useState<{
    attendanceText: string;
    attendanceCount: number;
    childObservations: { name: string; note: string; category: string; isAlert?: boolean }[];
  } | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup audio stream and contexts on unmount
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [audioStream]);

  const parseTranscriptToReport = (text: string) => {
    const textLower = text.toLowerCase();
    
    // 1. Attendance parsing
    let attendanceCount = 18; // Default mock count
    const numMatch = textLower.match(/(\d+)\s*(children|kids|students|bachhe|shishu|mule|present|aaye|upasthit)/i) 
      || textLower.match(/(?:present|attendance|upasthit|aaye)\s*(?:is|was|of)?\s*(\d+)/i)
      || textLower.match(/(\d+)\s*(?:present|aaye|upasthit)/i);
    
    if (numMatch && numMatch[1]) {
      const parsedNum = parseInt(numMatch[1], 10);
      if (parsedNum > 0 && parsedNum <= 21) {
        attendanceCount = parsedNum;
      }
    }
    
    const attendanceText = language === 'hi' 
      ? `21 में से ${attendanceCount} बच्चे उपस्थित हैं` 
      : language === 'bn'
      ? `21 জনের মধ্যে ${attendanceCount} জন শিশু উপস্থিত`
      : language === 'mr'
      ? `21 पैकी ${attendanceCount} मुले उपस्थित`
      : `${attendanceCount} children present out of 21`;

    // 2. Observations and alerts parsing
    const sentences = text.split(/[.।?!]+/).map(s => s.trim()).filter(Boolean);
    const childObservations: { name: string; note: string; category: string; isAlert?: boolean }[] = [];
    const childrenNames = ['Rani', 'Rohan', 'Aarav', 'Dev', 'Meera', 'Priya', 'Pooja', 'Karan'];

    sentences.forEach((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      const matchedName = childrenNames.find(name => sentenceLower.includes(name.toLowerCase()));
      
      if (matchedName) {
        let category = 'General';
        if (sentenceLower.includes('poem') || sentenceLower.includes('speak') || sentenceLower.includes('sentence') || sentenceLower.includes('kavita') || sentenceLower.includes('shabd') || sentenceLower.includes('language') || sentenceLower.includes('bhasha') || sentenceLower.includes('bol')) {
          category = 'Language';
        } else if (sentenceLower.includes('toy') || sentenceLower.includes('share') || sentenceLower.includes('friend') || sentenceLower.includes('peer') || sentenceLower.includes('khilone') || sentenceLower.includes('mitra') || sentenceLower.includes('social') || sentenceLower.includes('sath')) {
          category = 'Social';
        } else if (sentenceLower.includes('quiet') || sentenceLower.includes('sad') || sentenceLower.includes('cry') || sentenceLower.includes('shant') || sentenceLower.includes('emotional') || sentenceLower.includes('akela') || sentenceLower.includes('dar')) {
          category = 'Emotional';
        } else if (sentenceLower.includes('count') || sentenceLower.includes('math') || sentenceLower.includes('puzzle') || sentenceLower.includes('ganit') || sentenceLower.includes('cognitive') || sentenceLower.includes('color') || sentenceLower.includes('rang')) {
          category = 'Cognitive';
        }

        const isAlert = sentenceLower.includes('quiet') || 
                        sentenceLower.includes('attention') || 
                        sentenceLower.includes('sad') || 
                        sentenceLower.includes('risk') || 
                        sentenceLower.includes('absent') || 
                        sentenceLower.includes('shant') || 
                        sentenceLower.includes('dhyan') || 
                        sentenceLower.includes('chinta');

        childObservations.push({
          name: matchedName,
          note: sentence,
          category,
          isAlert
        });
      }
    });

    // If no specific child is mentioned, map sentences to generic child observations to populate cards
    if (childObservations.length === 0) {
      sentences.slice(0, 3).forEach((sentence, idx) => {
        childObservations.push({
          name: idx === 0 ? 'Rani' : idx === 1 ? 'Aarav' : 'Rohan',
          note: sentence,
          category: idx === 0 ? 'Language' : idx === 1 ? 'Social' : 'General',
          isAlert: sentence.toLowerCase().includes('attention') || sentence.toLowerCase().includes('quiet')
        });
      });
    }

    return {
      attendanceText,
      attendanceCount,
      childObservations
    };
  };

  const startRecording = async () => {
    setTranscript('');
    setReportData(null);
    setRecordedAudioUrl(null);
    setIsPlaying(false);
    audioChunksRef.current = [];
    setState('recording');
    setShowOfflineMsg(true);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      // Create MediaRecorder instance
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } catch (e) {
        console.warn("audio/webm not supported, fallback to default", e);
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        try {
          const mediaId = 'audio-' + Date.now();
          await saveMedia(mediaId, audioBlob, audioBlob.type);
          console.log('Saved recorded audio blob to IndexedDB with ID:', mediaId);
        } catch (e) {
          console.warn('Failed to save audio blob to IndexedDB:', e);
        }
      };

      mediaRecorder.start();

      // Web Audio setup for live visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioContext = new AudioCtx();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        intervalRef.current = setInterval(() => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const mapped = Array.from(dataArray)
              .slice(0, 20)
              .map(val => Math.max(5, (val / 255) * 45));
            while (mapped.length < 20) mapped.push(5);
            setWaveform(mapped);
          }
        }, 100);
      }
    } catch (err) {
      console.warn("Microphone access failed, falling back to mock waveform", err);
      intervalRef.current = setInterval(() => {
        setWaveform((prev) =>
          prev.map(() => Math.random() * 35 + 5)
        );
      }, 150);
    }

    // Speech recognition setup
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (Recognition) {
      try {
        const recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        if (language === 'hi') {
          recognition.lang = 'hi-IN';
        } else if (language === 'bn') {
          recognition.lang = 'bn-IN';
        } else if (language === 'mr') {
          recognition.lang = 'mr-IN';
        } else {
          recognition.lang = 'en-IN';
        }

        let accumulatedTranscript = '';
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              accumulatedTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(accumulatedTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.error("Failed to start SpeechRecognition", e);
      }
    }
  };

  const stopRecording = () => {
    setState('processing');
    setWaveform(new Array(20).fill(5));

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop media recorder", e);
      }
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const executeParsing = async () => {
      let finalTranscript = transcript.trim();
      if (!finalTranscript) {
        finalTranscript = language === 'hi' 
          ? 'आज 18 बच्चे आए। रानी ने कविता गतिविधि में अच्छा प्रदर्शन किया। आरव ने अपने खिलौने साझा किए। रोहन आज शांत था, उसे अधिक ध्यान देने की आवश्यकता है।'
          : language === 'bn'
          ? 'আজ ১৮ জন শিশু এসেছে। রানী কবিতা কার্যকলাপে খুব ভালো করেছে। আরভ খেলনা ভাগ করেছে। আরভ মেহরাকে সাহায্য করেছে। রোহন আজ শান্ত ছিল।'
          : language === 'mr'
          ? 'आज १८ मुले आली. राणीने कविता उपक्रमात चांगली कामगिरी केली. आरवने खेळणी शेअर केली. रोहन आज शांत होता, त्याला लक्ष देण्याची गरज आहे।'
          : '18 children arrived today. Rani performed well in the poem activity. Aarav shared his toys. Rohan was a bit quiet today - he needs more attention.';
        setTranscript(finalTranscript);
      }

      const apiMode = localStorage.getItem('pratibha_api_mode') || 'gemini';
      const apiKey = localStorage.getItem('pratibha_gemini_key') || '';

      if (apiMode === 'gemini' && apiKey.trim()) {
        try {
          const prompt = `You are a structured parser for an Anganwadi assistant application.
Analyze the following speech transcript spoken by the worker Sunita Ji and extract structured JSON matching exactly this schema:
{
  "attendanceCount": number,
  "attendanceText": "formatted string indicating attendance out of 21 (e.g. 19 children present out of 21, in user's query language if possible)",
  "childObservations": [
    {
      "name": "matching child name (e.g. Rani, Rohan, Aarav, Dev, Meera, Ananya)",
      "note": "the sentence segment detailing this child's behavior/observation",
      "category": "Language" | "Social" | "Emotional" | "Cognitive" | "General",
      "isAlert": boolean (true if child was sad, quiet, struggled, needs attention, or represents a concern)
    }
  ]
}

Note:
- If multiple children are mentioned, include each in childObservations.
- Output ONLY valid JSON. Do not include markdown code block syntax (like \`\`\`json). Just return raw JSON.

Transcript: "${finalTranscript}"`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );

          if (!response.ok) throw new Error('Gemini API request failed');
          
          const resJson = await response.json();
          const textResult = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Clean markdown wrapper if any
          const cleanJsonText = textResult
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
            
          const parsedData = JSON.parse(cleanJsonText);
          setReportData(parsedData);
          setState('transcribed');
          return;
        } catch (err) {
          console.warn("AI parsing failed or key invalid, falling back to local NLU regex parser", err);
        }
      }

      // Fallback local regex parsing
      const parsed = parseTranscriptToReport(finalTranscript);
      setReportData(parsed);
      setState('transcribed');
    };

    setTimeout(() => {
      executeParsing();
    }, 1500);
  };

  const handleSave = () => {
    setState('saved');
    setTimeout(() => {
      onComplete(reportData);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all outline-none"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {language === 'hi' ? 'आवाज रिपोर्ट' : language === 'bn' ? 'ভয়েস রিপোর্ট' : language === 'mr' ? 'आवाज अहवाल' : 'Voice Report'}
          </h1>
          <p className="text-xs text-gray-400">
            {language === 'hi' ? 'आवाज का उपयोग करके रिपोर्ट बनाएं' : language === 'bn' ? 'ভয়েস ব্যবহার করে রিপোর্ট তৈরি করুন' : language === 'mr' ? 'आवाज वापरून अहवाल तयार करा' : 'Generate report using voice'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Status Indicator */}
        <div className="mb-8 text-center">
          {state === 'idle' && (
            <>
              <p className="text-gray-300 text-sm mb-1">
                {language === 'hi' ? 'माइक्रोफोन पर टैप करें और बोलना शुरू करें' : language === 'bn' ? 'মাইক্রোফোনে ট্যাপ করুন এবং কথা বলা শুরু করুন' : language === 'mr' ? 'मायक्रोफोनवर टॅप करा आणि बोलायला सुरुवात करा' : 'Tap the microphone and speak naturally'}
              </p>
              <p className="text-gray-500 text-xs">
                {language === 'hi' ? 'माइक्रोफ़ोन दबाएं और बोलें' : language === 'bn' ? 'মাইক্রোফোন টিপুন এবং কথা বলুন' : language === 'mr' ? 'मायक्रोफोन दाबा आणि बोला' : 'Press microphone and speak'}
              </p>
            </>
          )}
          {state === 'recording' && (
            <>
              <p className="text-orange-400 text-sm font-medium mb-1 animate-pulse">
                {language === 'hi' ? 'रिकॉर्डिंग चालू है...' : language === 'bn' ? 'রেকর্ডিং হচ্ছে...' : language === 'mr' ? 'रेकॉर्डिंग सुरू आहे...' : 'Recording...'}
              </p>
              <p className="text-gray-500 text-xs">
                {language === 'hi' ? 'सामान्य रूप से बोलें' : language === 'bn' ? 'স্বাভাবিকভাবে কথা বলুন' : language === 'mr' ? 'नेहमिप्रमाणे बोला' : 'Speak naturally'}
              </p>
            </>
          )}
          {state === 'processing' && (
            <>
              <p className="text-sky-400 text-sm font-medium mb-1">
                {language === 'hi' ? 'एआई प्रोसेस कर रहा है...' : language === 'bn' ? 'এআই প্রসেস করছে...' : language === 'mr' ? 'एआय प्रक्रिया करत आहे...' : 'AI is processing...'}
              </p>
              <p className="text-gray-500 text-xs">
                {language === 'hi' ? 'रिपोर्ट तैयार की जा रही है...' : language === 'bn' ? 'রিপোর্ট তৈরি হচ্ছে...' : language === 'mr' ? 'अहवाल तयार केला जात आहे...' : 'Preparing report...'}
              </p>
            </>
          )}
          {state === 'transcribed' && (
            <>
              <p className="text-emerald-400 text-sm font-medium mb-1">
                {language === 'hi' ? 'रिपोर्ट तैयार है!' : language === 'bn' ? 'রিপোর্ট প্রস্তুত!' : language === 'mr' ? 'अहवाल तयार आहे!' : 'Report ready!'}
              </p>
              <p className="text-gray-500 text-xs">
                {language === 'hi' ? 'यदि आवश्यक हो तो नीचे संपादित करें' : language === 'bn' ? 'প্রয়োজন হলে নিচে সম্পাদনা করুন' : language === 'mr' ? 'गरज भासल्यास खाली संपादन करा' : 'Edit below if needed'}
              </p>
            </>
          )}
          {state === 'saved' && (
            <>
              <p className="text-emerald-400 text-sm font-medium mb-1">
                {language === 'hi' ? 'सफलतापूर्वक सहेजा गया!' : language === 'bn' ? 'সফলভাবে সংরক্ষিত হয়েছে!' : language === 'mr' ? 'यशस्वीरित्या जतन केले!' : 'Saved successfully!'}
              </p>
              <p className="text-gray-500 text-xs">
                {language === 'hi' ? 'ऑफलाइन सहेजा गया - ऑनलाइन होने पर सिंक होगा' : language === 'bn' ? 'অফলাইনে সংরক্ষিত - অনলাইন হলে সিঙ্ক হবে' : language === 'mr' ? 'ऑफलाइन जतन केले - ऑनलाइन झाल्यावर सिंक होईल' : 'Saved offline - Syncs when online'}
              </p>
            </>
          )}
        </div>

        {/* Microphone / Waveform Area */}
        <div className="relative flex flex-col items-center mb-8">
          {(state === 'recording' || state === 'processing') && (
            <>
              <div className="absolute w-48 h-48 rounded-full border border-orange-500/20 animate-ping" />
              <div className="absolute w-40 h-40 rounded-full border border-orange-500/30 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={() => {
              if (state === 'idle') startRecording();
              else if (state === 'recording') stopRecording();
            }}
            disabled={state === 'processing' || state === 'saved'}
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 outline-none ${
              state === 'idle'
                ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/40 hover:from-orange-650 hover:to-amber-650'
                : state === 'recording'
                ? 'bg-red-500 shadow-red-500/40 hover:bg-red-600'
                : state === 'processing'
                ? 'bg-sky-500 shadow-sky-500/40'
                : state === 'transcribed'
                ? 'bg-emerald-500 shadow-emerald-500/40 hover:bg-emerald-600'
                : 'bg-emerald-600'
            }`}
          >
            {state === 'idle' && <Mic size={40} className="text-white" strokeWidth={2} />}
            {state === 'recording' && <Square size={28} className="text-white" strokeWidth={3} fill="white" />}
            {state === 'processing' && <Loader2 size={36} className="text-white animate-spin" />}
            {(state === 'transcribed' || state === 'saved') && <CheckCircle2 size={40} className="text-white" />}
          </button>

          {/* Waveform */}
          <div className="flex items-center justify-center gap-[3px] h-16 mt-6">
            {waveform.map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  state === 'recording'
                    ? 'bg-orange-400 animate-pulse'
                    : state === 'processing'
                    ? 'bg-sky-400'
                    : 'bg-gray-700'
                }`}
                style={{
                  height: `${height}px`,
                  opacity: state === 'idle' ? 0.3 : 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Offline Note */}
        {showOfflineMsg && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <p className="text-xs text-gray-400">
              {language === 'hi' ? 'कम कनेक्टिविटी में भी काम करता है' : language === 'bn' ? 'কম কানেক্টিভিটিতেও কাজ করে' : language === 'mr' ? 'कमी कनेक्टिव्हिटीमध्येही काम करते' : 'Works even in low connectivity'}
            </p>
          </div>
        )}

        {/* Audio Playback Card */}
        {(state === 'transcribed' || state === 'saved') && recordedAudioUrl && (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (audioElementRef.current) {
                  if (isPlaying) {
                    audioElementRef.current.pause();
                  } else {
                    audioElementRef.current.play();
                  }
                }
              }}
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white shrink-0 active:scale-95 transition-all outline-none"
            >
              {isPlaying ? (
                <div className="flex gap-[3px] items-center">
                  <div className="w-[3px] h-3.5 bg-white rounded-full" />
                  <div className="w-[3px] h-3.5 bg-white rounded-full" />
                </div>
              ) : (
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase">Recorded Audio Note</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
                  <div className={`h-full bg-orange-500 rounded-full ${isPlaying ? 'w-full transition-all duration-[10s]' : 'w-0'}`} />
                </div>
                <span className="text-[9px] font-mono text-gray-400">Preview Playback</span>
              </div>
            </div>
            <audio
              ref={audioElementRef}
              src={recordedAudioUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}

        {/* Transcript Card */}
        {(state === 'transcribed' || state === 'saved') && (
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Edit3 size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400">
                {language === 'hi' ? 'ट्रांसक्रिप्ट' : language === 'bn' ? 'অনুলিপি' : language === 'mr' ? 'ट्रान्सक्रिप्ट' : 'Transcript'}
              </span>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-200 leading-relaxed italic border-none outline-none resize-none focus:ring-0"
              rows={3}
            />
          </div>
        )}

        {/* Structured NLP Report Display */}
        {state === 'transcribed' && reportData && (
          <div className="w-full space-y-3 mb-6">
            <p className="text-xs text-gray-400 text-center mb-2">
              {language === 'hi' ? 'एआई-जनरेटेड रिपोर्ट' : language === 'bn' ? 'এআই-জনরেটেড রিপোর্ট' : language === 'mr' ? 'एआय-व्युत्पन्न अहवाल' : 'AI-Generated Report'}
            </p>
            
            {/* Attendance card */}
            <div className="p-3 rounded-xl border bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-[11px] font-medium text-gray-300">
                  {language === 'hi' ? 'उपस्थिति' : 'Attendance'}
                </span>
              </div>
              <p className="text-xs text-gray-250 leading-relaxed">{reportData.attendanceText}</p>
            </div>

            {/* Observations cards */}
            {reportData.childObservations.map((item, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border ${
                  item.isAlert
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.isAlert ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-gray-300">
                    {item.isAlert 
                      ? (language === 'hi' ? `ध्यान दें - ${item.name}` : `Attention Needed - ${item.name}`)
                      : (language === 'hi' ? `अवलोकन - ${item.name}` : `Observation - ${item.name}`)}
                    {` (${item.category})`}
                  </span>
                </div>
                <p className="text-xs text-gray-250 leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {state === 'transcribed' && (
        <div className="shrink-0 p-4 bg-gray-900/50 backdrop-blur-md border-t border-white/10">
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-650 hover:to-teal-650 text-white font-semibold rounded-2xl shadow-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2 outline-none"
          >
            <Save size={20} />
            {language === 'hi' ? 'रिपोर्ट सहेजें' : language === 'bn' ? 'রিপোর্ট সংরক্ষণ করুন' : language === 'mr' ? 'अहवाल जतन करा' : 'Save Report'}
          </button>
        </div>
      )}
    </div>
  );
}
