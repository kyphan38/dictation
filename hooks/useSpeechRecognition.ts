import { useState, useRef } from 'react';
import { Sentence, SpokenResult } from '@/types';
import { DEFAULT_RECOGNITION_LANG } from '@/constants';
import { compareSentences } from '@/lib/utils';

/** Narrow surface used from the Web Speech API (DOM typings vary by TS version). */
interface WebSpeechResultEvent {
  results: { length: number; [i: number]: { 0: { transcript: string } } };
}

interface WebSpeechErrorEvent {
  error: string;
}

interface WebSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((ev: WebSpeechResultEvent) => void) | null;
  onerror: ((ev: WebSpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type WebSpeechRecognitionCtor = new () => WebSpeechRecognition;

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [recognitionLang, setRecognitionLang] = useState<string>(DEFAULT_RECOGNITION_LANG);
  const [spokenResults, setSpokenResults] = useState<Record<number, SpokenResult>>({});
  const [recognitionErrors, setRecognitionErrors] = useState<Record<number, string>>({});
  
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);

  const toggleRecording = (sentence: Sentence) => {
    if (isRecording === sentence.id) {
      recognitionRef.current?.stop();
      setIsRecording(null);
      return;
    }

    if (isRecording !== null) {
      recognitionRef.current?.stop();
    }

    setRecognitionErrors(prev => {
      const next = { ...prev };
      delete next[sentence.id];
      return next;
    });

    const w = window as Window &
      typeof globalThis & {
        SpeechRecognition?: WebSpeechRecognitionCtor;
        webkitSpeechRecognition?: WebSpeechRecognitionCtor;
      };
    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setRecognitionErrors(prev => ({
        ...prev,
        [sentence.id]:
          'This browser does not support the Web Speech API. Try Chrome or Edge.',
      }));
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = recognitionLang;
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => setIsRecording(sentence.id);
    
    recognition.onresult = (event: WebSpeechResultEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      finalTranscript = transcript.trim();
    };

    recognition.onerror = (event: WebSpeechErrorEvent) => {
      console.error("Speech recognition error", event.error);
      let errMsg = `Recognition error (${event.error}).`;
      if (event.error === 'network') {
        errMsg =
          'Network error: the browser could not reach the speech service. Try opening the app in a new tab or turning off private browsing.';
      } else if (event.error === 'not-allowed') {
        errMsg = 'Permission denied: allow microphone access for this site in your browser settings.';
      }
      setRecognitionErrors(prev => ({ ...prev, [sentence.id]: errMsg }));
      setIsRecording(null);
    };

    recognition.onend = () => {
      if (finalTranscript) {
        const result = compareSentences(sentence.text, finalTranscript);
        setSpokenResults(prev => ({ ...prev, [sentence.id]: result }));
      }
      setIsRecording(null);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition", err);
      setIsRecording(null);
    }
  };

  const handleSimulateSuccess = (sentence: Sentence) => {
    const result = { score: 100, diff: [{word: "Simulated", status: "correct" as const}], text: "Simulated success" };
    setSpokenResults(prev => ({ ...prev, [sentence.id]: result }));
    setRecognitionErrors(prev => { const next = {...prev}; delete next[sentence.id]; return next; });
  };

  return {
    isRecording,
    setIsRecording,
    recognitionLang,
    setRecognitionLang,
    spokenResults,
    setSpokenResults,
    recognitionErrors,
    setRecognitionErrors,
    toggleRecording,
    handleSimulateSuccess,
    recognitionRef
  };
}
