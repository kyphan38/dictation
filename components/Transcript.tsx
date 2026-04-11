'use client';

import React from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Sentence, AppMode, SpokenResult, IPAData, DictationInputs, CompletedSentences, RecognitionState } from '@/types';
import { TranscriptSentence } from './TranscriptSentence';

interface TranscriptProps {
  transcript: Sentence[];
  currentTime: number;
  isPlaying: boolean;
  appMode: AppMode;
  hideCaptions?: boolean;
  onToggleHideCaptions?: () => void;
  onResetDictation?: () => void;
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
  onDictationRetry: (sentence: Sentence) => void;
  onToggleRecording: (sentence: Sentence) => void;
  onSkip: (sentence: Sentence) => void;
  onSimulateSuccess: (sentence: Sentence) => void;
}

export function Transcript({
  transcript,
  currentTime,
  isPlaying,
  appMode,
  hideCaptions,
  onToggleHideCaptions,
  onResetDictation,
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
  onDictationRetry,
  onToggleRecording,
  onSkip,
  onSimulateSuccess,
}: TranscriptProps) {
  const toolbarEnd =
    appMode === 'normal' && onToggleHideCaptions ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleHideCaptions();
        }}
        title={hideCaptions ? 'Show transcript (H)' : 'Hide transcript (H)'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
          hideCaptions
            ? 'bg-gray-800/90 border-gray-600 text-amber-300/90 hover:bg-gray-800'
            : 'bg-gray-800/90 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {hideCaptions ? <EyeOff className="w-3.5 h-3.5 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0" />}
        <span className="hidden sm:inline">{hideCaptions ? 'Captions off' : 'Captions'}</span>
      </button>
    ) : appMode === 'dictation' && onResetDictation ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onResetDictation();
        }}
        title="Clear all dictation progress for this lesson"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-900/80 bg-orange-950/40 text-orange-300 hover:bg-orange-950/70 hover:border-orange-800 text-xs font-medium transition-colors active:scale-[0.98]"
      >
        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Reset progress</span>
      </button>
    ) : null;

  return (
    <div className="flex-1 min-h-0 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur shrink-0 flex items-center gap-3 min-h-[3rem]">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider shrink-0">Transcript</h2>
        {toolbarEnd ? <div className="ml-auto shrink-0 flex items-center">{toolbarEnd}</div> : null}
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
              isPlaying={isPlaying}
              appMode={appMode}
              hideCaptions={!!hideCaptions && appMode === 'normal'}
              dictationInput={dictationInputs[sentence.id] || ''}
              isCompleted={!!completedSentences[sentence.id]}
              isRecording={isRecording}
              spokenResult={spokenResults[sentence.id]}
              recognitionError={recognitionErrors[sentence.id]}
              ipaData={ipaData}
              onSentenceClick={onSentenceClick}
              onDictationChange={onDictationChange}
              onDictationKeyDown={onDictationKeyDown}
              onDictationRetry={onDictationRetry}
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
