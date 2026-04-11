'use client';

import React from 'react';
import { Sentence, AppMode, SpokenResult, IPAData, DictationInputs, CompletedSentences, RecognitionState } from '@/types';
import { TranscriptSentence } from './TranscriptSentence';

interface TranscriptProps {
  transcript: Sentence[];
  currentTime: number;
  appMode: AppMode;
  dictationInputs: DictationInputs;
  completedSentences: CompletedSentences;
  isRecording: number | null;
  spokenResults: Record<number, SpokenResult>;
  recognitionErrors: RecognitionState;
  ipaData: IPAData;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onSentenceClick: (sentence: Sentence) => void;
  onDictationChange: (sentence: Sentence, value: string) => void;
  onDictationKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, sentence: Sentence) => void;
  onToggleRecording: (sentence: Sentence) => void;
  onSkip: (sentence: Sentence) => void;
  onSimulateSuccess: (sentence: Sentence) => void;
}

export function Transcript({
  transcript,
  currentTime,
  appMode,
  dictationInputs,
  completedSentences,
  isRecording,
  spokenResults,
  recognitionErrors,
  ipaData,
  scrollContainerRef,
  onSentenceClick,
  onDictationChange,
  onDictationKeyDown,
  onToggleRecording,
  onSkip,
  onSimulateSuccess,
}: TranscriptProps) {
  return (
    <div className="flex-1 min-h-0 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur shrink-0">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Transcript</h2>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth">
        {transcript.map((sentence, index) => {
          const isActive = currentTime >= sentence.start && currentTime < sentence.end;
          const isPast = currentTime >= sentence.end;

          return (
            <TranscriptSentence
              key={sentence.id}
              sentence={sentence}
              index={index}
              isActive={isActive}
              isPast={isPast}
              appMode={appMode}
              dictationInput={dictationInputs[sentence.id] || ''}
              isCompleted={!!completedSentences[sentence.id]}
              isRecording={isRecording}
              spokenResult={spokenResults[sentence.id]}
              recognitionError={recognitionErrors[sentence.id]}
              ipaData={ipaData}
              onSentenceClick={onSentenceClick}
              onDictationChange={onDictationChange}
              onDictationKeyDown={onDictationKeyDown}
              onToggleRecording={onToggleRecording}
              onSkip={onSkip}
              onSimulateSuccess={onSimulateSuccess}
            />
          );
        })}
      </div>
    </div>
  );
}
