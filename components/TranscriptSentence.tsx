import React from 'react';
import { Play, CheckCircle2, MicOff, Mic, FastForward, Wand2 } from 'lucide-react';
import { Sentence, AppMode, SpokenResult, IPAData, CompletedSentences, RecognitionState } from '@/types';
import { PRONUNCIATION_SCORE_THRESHOLD } from '@/constants';
import { DictationControls } from './DictationControls';

interface TranscriptSentenceProps {
  sentence: Sentence;
  index: number;
  isActive: boolean;
  isPast: boolean;
  appMode: AppMode;
  dictationInput: string;
  isCompleted: boolean;
  isRecording: number | null;
  spokenResult?: SpokenResult;
  recognitionError?: string;
  ipaData: IPAData;
  onSentenceClick: (sentence: Sentence) => void;
  onDictationChange: (sentence: Sentence, value: string) => void;
  onDictationKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, sentence: Sentence) => void;
  onToggleRecording: (sentence: Sentence) => void;
  onSkip: (sentence: Sentence) => void;
  onSimulateSuccess: (sentence: Sentence) => void;
}

export function TranscriptSentence({
  sentence,
  index,
  isActive,
  isPast,
  appMode,
  dictationInput,
  isCompleted,
  isRecording,
  spokenResult,
  recognitionError,
  ipaData,
  onSentenceClick,
  onDictationChange,
  onDictationKeyDown,
  onToggleRecording,
  onSkip,
  onSimulateSuccess,
}: TranscriptSentenceProps) {
  return (
    <div
      data-index={index}
      onClick={() => onSentenceClick(sentence)}
      className={`
        group flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200
        ${
          isActive
            ? 'bg-emerald-400/10 border border-emerald-400/30'
            : 'hover:bg-gray-800 border border-transparent'
        }
      `}
    >
      <span
        className={`
          font-mono text-sm mt-1 shrink-0 w-6 text-right
          ${
            isActive ? 'text-emerald-400 font-bold' : isPast ? 'text-gray-600' : 'text-gray-500'
          }
        `}
      >
        {index + 1}.
      </span>

      <div className="flex-1 flex flex-col gap-2">
        {appMode === 'dictation' ? (
          <DictationControls
            sentence={sentence}
            isActive={isActive}
            dictationInput={dictationInput}
            isCompleted={isCompleted}
            onDictationChange={onDictationChange}
            onDictationKeyDown={onDictationKeyDown}
          />
        ) : (
          <NormalMode
            sentence={sentence}
            isActive={isActive}
            isPast={isPast}
            appMode={appMode}
            ipaData={ipaData}
            spokenResult={spokenResult}
            recognitionError={recognitionError}
            isCompleted={isCompleted}
            onSkip={onSkip}
            onSimulateSuccess={onSimulateSuccess}
          />
        )}
      </div>

      {/* Status Icon & Mic */}
      <StatusBar
        sentence={sentence}
        isActive={isActive}
        isPast={isPast}
        appMode={appMode}
        isRecording={isRecording}
        spokenResult={spokenResult}
        isCompleted={isCompleted}
        onToggleRecording={onToggleRecording}
        onSkip={onSkip}
      />
    </div>
  );
}

function NormalMode({
  sentence,
  isActive,
  isPast,
  appMode,
  ipaData,
  spokenResult,
  recognitionError,
  isCompleted,
  onSkip,
  onSimulateSuccess,
}: {
  sentence: Sentence;
  isActive: boolean;
  isPast: boolean;
  appMode: AppMode;
  ipaData: IPAData;
  spokenResult?: SpokenResult;
  recognitionError?: string;
  isCompleted: boolean;
  onSkip: (sentence: Sentence) => void;
  onSimulateSuccess: (sentence: Sentence) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className={`
          text-lg leading-relaxed
          ${
            isActive
              ? 'text-emerald-400 font-medium text-xl'
              : isPast
                ? 'text-gray-400'
                : 'text-gray-200'
          }
        `}
      >
        {sentence.text}
      </p>

      {appMode === 'shadowing' && ipaData[sentence.id] && (
        <p className="text-sm font-mono text-purple-400/80 tracking-wide">
          /{ipaData[sentence.id]}/
        </p>
      )}

      {/* Error Message */}
      {recognitionError && (
        <div className="mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30 text-red-400 text-sm flex flex-col gap-3">
          <span>{recognitionError}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSimulateSuccess(sentence);
            }}
            className="self-start px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-xs font-medium text-gray-300 flex items-center gap-2 transition-colors border border-gray-700"
          >
            <Wand2 className="w-3 h-3" /> Bỏ qua lỗi (Mô phỏng đọc đúng 100%)
          </button>
        </div>
      )}

      {/* Pronunciation Assessment Result */}
      {spokenResult && !recognitionError && (
        <div
          className={`mt-2 p-3 rounded-lg border ${
            spokenResult.score >= 80
              ? 'bg-green-900/20 border-green-800/50'
              : 'bg-gray-950 border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Pronunciation Score:</span>
            <span
              className={`text-sm font-bold ${
                spokenResult.score >= 80
                  ? 'text-green-400'
                  : spokenResult.score >= 50
                    ? 'text-emerald-400'
                    : 'text-red-400'
              }`}
            >
              {spokenResult.score}%
            </span>
          </div>
          <div className="flex flex-wrap gap-1 text-base">
            {spokenResult.diff.map((d, i) => (
              <span key={i} className={d.status === 'correct' ? 'text-green-400' : 'text-red-400 font-bold'}>
                {d.word}
              </span>
            ))}
          </div>

          {appMode === 'shadowing' && isActive && !isCompleted && (
            <div className="mt-4 flex justify-end">
              {spokenResult.score >= PRONUNCIATION_SCORE_THRESHOLD ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip(sentence);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  Next <FastForward className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip(sentence);
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-colors border border-gray-700"
                >
                  Skip <FastForward className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBar({
  sentence,
  isActive,
  isPast,
  appMode,
  isRecording,
  spokenResult,
  isCompleted,
  onToggleRecording,
  onSkip,
}: {
  sentence: Sentence;
  isActive: boolean;
  isPast: boolean;
  appMode: AppMode;
  isRecording: number | null;
  spokenResult?: SpokenResult;
  isCompleted: boolean;
  onToggleRecording: (sentence: Sentence) => void;
  onSkip: (sentence: Sentence) => void;
}) {
  return (
    <div className="shrink-0 flex flex-col items-end gap-3 mt-1">
      {isActive && <Play className="w-5 h-5 text-emerald-400 fill-current animate-pulse" />}
      {isPast && !isActive && <CheckCircle2 className="w-5 h-5 text-gray-600" />}

      {appMode === 'shadowing' && isActive && !isCompleted && !spokenResult && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSkip(sentence);
          }}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
          title="Skip this sentence"
        >
          <FastForward className="w-4 h-4" />
        </button>
      )}

      {appMode === 'shadowing' && (
        <div className="flex items-center gap-2">
          {isRecording === sentence.id && (
            <span className="text-xs text-red-400 font-medium animate-pulse">
              Đang thu... (Click để dừng)
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRecording(sentence);
            }}
            className={`p-2 rounded-full transition-colors ${
              isRecording === sentence.id
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
            }`}
            title={isRecording === sentence.id ? 'Dừng thu âm' : 'Bắt đầu thu âm'}
          >
            {isRecording === sentence.id ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
