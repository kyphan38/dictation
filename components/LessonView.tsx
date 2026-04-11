import React from 'react';
import { Player } from './Player';
import { Transcript } from './Transcript';

const MemoPlayer = React.memo(Player);
const MemoTranscript = React.memo(Transcript);
import {
  LessonItem,
  AppMode,
  LoopMode,
  Sentence,
  SpokenResult,
  DictationInputs,
  CompletedSentences,
  IPAData,
} from '@/types';

interface LessonViewProps {
  lesson: LessonItem;
  mode: AppMode;
  // Player props
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  playbackRate: number;
  loopMode: LoopMode;
  isGeneratingIPA: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: () => void;
  onLoopModeChange: () => void;
  onResetDictation?: () => void;
  hideCaptions?: boolean;
  onToggleHideCaptions?: () => void;
  // Transcript props
  transcript: Sentence[];
  dictationInputs: DictationInputs;
  completedSentences: CompletedSentences;
  isRecording: number | null;
  spokenResults: Record<number, SpokenResult>;
  recognitionErrors: Record<number, string>;
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

export function LessonView({
  lesson,
  mode,
  isPlaying,
  duration,
  currentTime,
  playbackRate,
  loopMode,
  isGeneratingIPA,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onLoopModeChange,
  transcript,
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
  onResetDictation,
  hideCaptions,
  onToggleHideCaptions,
}: LessonViewProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      <MemoPlayer
        isPlaying={isPlaying}
        duration={duration}
        currentTime={currentTime}
        playbackRate={playbackRate}
        loopMode={loopMode}
        isGeneratingIPA={isGeneratingIPA}
        onPlayPause={onPlayPause}
        onSeek={onSeek}
        onSpeedChange={onSpeedChange}
        onLoopModeChange={onLoopModeChange}
      />

      <MemoTranscript
        transcript={transcript}
        currentTime={currentTime}
        isPlaying={isPlaying}
        appMode={mode}
        hideCaptions={hideCaptions}
        onToggleHideCaptions={onToggleHideCaptions}
        onResetDictation={onResetDictation}
        dictationInputs={dictationInputs}
        completedSentences={completedSentences}
        isRecording={isRecording}
        spokenResults={spokenResults}
        recognitionErrors={recognitionErrors}
        ipaData={ipaData}
        scrollContainerRef={scrollContainerRef}
        onSentenceClick={onSentenceClick}
        onDictationChange={onDictationChange}
        onDictationKeyDown={onDictationKeyDown}
        onDictationRetry={onDictationRetry}
        onToggleRecording={onToggleRecording}
        onSkip={onSkip}
        onSimulateSuccess={onSimulateSuccess}
      />
    </div>
  );
}
