import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Square, Save, Edit3, CheckCircle2, Loader2 } from 'lucide-react';

interface VoiceReportScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'transcribed' | 'saved';

const mockTranscript =
  '18 children arrived today. Rani performed well in the poem activity. Aarav shared his toys. Rohan was a bit quiet today - he needs more attention.';

const structuredReport = [
  { type: 'attendance', label: 'Attendance', value: '18 children present out of 21' },
  { type: 'observation', label: 'Observation - Rani', value: 'Excellent participation in poem activity. Shows confidence in group settings.' },
  { type: 'observation', label: 'Observation - Aarav', value: 'Demonstrated sharing behavior with peers without prompting. Social skills improving.' },
  { type: 'alert', label: 'Attention Needed - Rohan', value: 'Quiet today, did not participate actively. Monitor emotional well-being.' },
];

export function VoiceReportScreen({ onBack, onComplete }: VoiceReportScreenProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [waveform, setWaveform] = useState<number[]>(new Array(20).fill(5));
  const [showOfflineMsg, setShowOfflineMsg] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const startRecording = () => {
    setState('recording');
    setShowOfflineMsg(true);
  };

  const stopRecording = () => {
    setState('processing');
    setWaveform(new Array(20).fill(5));
    // Simulate AI processing
    setTimeout(() => {
      setTranscript(mockTranscript);
      setState('transcribed');
    }, 2500);
  };

  const handleSave = () => {
    setState('saved');
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Voice Report</h1>
          <p className="text-xs text-gray-400">Generate report using voice</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Status Indicator */}
        <div className="mb-8 text-center">
          {state === 'idle' && (
            <>
              <p className="text-gray-300 text-sm mb-1">Tap the microphone and speak naturally</p>
              <p className="text-gray-500 text-xs">Press microphone and speak</p>
            </>
          )}
          {state === 'recording' && (
            <>
              <p className="text-orange-400 text-sm font-medium mb-1 animate-pulse">Recording...</p>
              <p className="text-gray-500 text-xs">Speak naturally</p>
            </>
          )}
          {state === 'processing' && (
            <>
              <p className="text-sky-400 text-sm font-medium mb-1">AI is processing...</p>
              <p className="text-gray-500 text-xs">Preparing report...</p>
            </>
          )}
          {state === 'transcribed' && (
            <>
              <p className="text-emerald-400 text-sm font-medium mb-1">Report ready!</p>
              <p className="text-gray-500 text-xs">Edit below if needed</p>
            </>
          )}
          {state === 'saved' && (
            <>
              <p className="text-emerald-400 text-sm font-medium mb-1">Saved successfully!</p>
              <p className="text-gray-500 text-xs">Saved offline - Syncs when online</p>
            </>
          )}
        </div>

        {/* Microphone / Waveform Area */}
        <div className="relative flex flex-col items-center mb-8">
          {/* Outer rings animation */}
          {(state === 'recording' || state === 'processing') && (
            <>
              <div className="absolute w-48 h-48 rounded-full border border-orange-500/20 animate-ping" />
              <div className="absolute w-40 h-40 rounded-full border border-orange-500/30 animate-pulse" />
            </>
          )}

          {/* Mic Button */}
          <button
            onClick={() => {
              if (state === 'idle') startRecording();
              else if (state === 'recording') stopRecording();
            }}
            disabled={state === 'processing' || state === 'saved'}
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
              state === 'idle'
                ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/40'
                : state === 'recording'
                ? 'bg-red-500 shadow-red-500/40'
                : state === 'processing'
                ? 'bg-sky-500 shadow-sky-500/40'
                : state === 'transcribed'
                ? 'bg-emerald-500 shadow-emerald-500/40'
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
                    ? 'bg-orange-400'
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
              Works even in low connectivity
            </p>
          </div>
        )}

        {/* Transcript Card */}
        {(state === 'transcribed' || state === 'saved') && (
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Edit3 size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400">Transcript</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed italic">&ldquo;{transcript}&rdquo;</p>
          </div>
        )}

        {/* Structured Report */}
        {state === 'transcribed' && (
          <div className="w-full space-y-3 mb-6">
            <p className="text-xs text-gray-400 text-center mb-2">AI-Generated Report</p>
            {structuredReport.map((item, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border ${
                  item.type === 'alert'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.type === 'attendance'
                        ? 'bg-sky-400'
                        : item.type === 'observation'
                        ? 'bg-emerald-400'
                        : 'bg-red-400'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-gray-300">{item.label}</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {state === 'transcribed' && (
        <div className="shrink-0 p-4 bg-gray-900/50 backdrop-blur-md border-t border-white/10">
          <button
            onClick={handleSave}
            className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Report
          </button>
        </div>
      )}
    </div>
  );
}
