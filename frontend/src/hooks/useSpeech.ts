import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { SpeechRecognitionInstance } from '../types';

interface UseSpeechOptions {
  continuous?: boolean;
  interimResults?: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function useSpeech(options: UseSpeechOptions) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Keep options in a ref to avoid restart cycles on callback dependencies changes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const startListening = useCallback(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert('Voice input is not supported on this browser. Please try Chrome.');
      return;
    }

    if (isListening) return;

    try {
      const recognition = new Recognition();
      recognition.continuous = optionsRef.current.continuous ?? false;
      recognition.interimResults = optionsRef.current.interimResults ?? true;
      
      if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (language === 'bn') {
        recognition.lang = 'bn-IN';
      } else if (language === 'mr') {
        recognition.lang = 'mr-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      let accumulated = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let hasFinal = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i][0]) {
            const transcriptSegment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulated += transcriptSegment + ' ';
              hasFinal = true;
            } else {
              interim += transcriptSegment;
            }
          }
        }
        const fullTranscript = (accumulated + interim).trim();
        optionsRef.current.onResult(fullTranscript, hasFinal);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (optionsRef.current.onEnd) optionsRef.current.onEnd();
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (optionsRef.current.onError) optionsRef.current.onError(event);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to start SpeechRecognition', e);
    }
  }, [isListening, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
  };
}
