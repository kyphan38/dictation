import { useState, useRef } from 'react';
import { Sentence, SpokenResult } from '@/types';
import { DEFAULT_RECOGNITION_LANG } from '@/constants';
import { compareSentences } from '@/lib/utils';

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [recognitionLang, setRecognitionLang] = useState<string>(DEFAULT_RECOGNITION_LANG);
  const [spokenResults, setSpokenResults] = useState<Record<number, SpokenResult>>({});
  const [recognitionErrors, setRecognitionErrors] = useState<Record<number, string>>({});
  
  const recognitionRef = useRef<any>(null);

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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionErrors(prev => ({ ...prev, [sentence.id]: "Trình duyệt của bạn không hỗ trợ Web Speech API. Vui lòng sử dụng Chrome hoặc Edge." }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLang;
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => setIsRecording(sentence.id);
    
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      finalTranscript = transcript.trim();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      let errMsg = `Lỗi nhận diện (${event.error}).`;
      if (event.error === 'network') {
        errMsg = "Lỗi mạng (Network Error): Trình duyệt không thể kết nối đến dịch vụ nhận diện của Google. Hãy thử mở app ở Tab mới (Open in new tab) hoặc tắt chế độ ẩn danh.";
      } else if (event.error === 'not-allowed') {
        errMsg = "Lỗi quyền: Vui lòng cho phép sử dụng Microphone trên trình duyệt.";
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
