import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Sentence } from '@/types';
import { normalizeDictationTarget } from '@/lib/utils';

interface DictationControlsProps {
  sentence: Sentence;
  isActive: boolean;
  dictationInput: string;
  isCompleted: boolean;
  onDictationChange: (sentence: Sentence, value: string) => void;
  onDictationKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, sentence: Sentence) => void;
  onDictationRetry?: (sentence: Sentence) => void;
}

export function DictationControls({
  sentence,
  isActive,
  dictationInput,
  isCompleted,
  onDictationChange,
  onDictationKeyDown,
  onDictationRetry,
}: DictationControlsProps) {
  const targetNorm = normalizeDictationTarget(sentence.text);
  const inputNorm = normalizeDictationTarget(dictationInput, { preserveTrailingSpace: true });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="font-mono text-lg tracking-wide min-w-0 flex-1 leading-relaxed">
          {targetNorm.split('').map((ch, i) => {
            const spaceSlot =
              ch === ' '
                ? 'inline-block min-w-[0.55em] w-[0.55em] max-w-[0.55em] text-center align-baseline shrink-0'
                : 'inline-block align-baseline';
            if (isCompleted) {
              return (
                <span key={i} className={`${spaceSlot} text-green-400 whitespace-pre`}>
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              );
            }
            const inp = i < inputNorm.length ? inputNorm[i] : undefined;
            if (inp === undefined) {
              return (
                <span key={i} className={`${spaceSlot} text-gray-600`}>
                  {ch === ' ' ? '\u00a0' : '*'}
                </span>
              );
            }
            if (inp === ch) {
              return (
                <span key={i} className={`${spaceSlot} text-green-400 whitespace-pre`}>
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              );
            }
            return (
              <span key={i} className={`${spaceSlot} text-red-400`}>
                {ch === ' ' ? '\u00a0' : '*'}
              </span>
            );
          })}
        </div>
        {isCompleted && onDictationRetry && (
          <button
            type="button"
            title="Practice this sentence again"
            onClick={(e) => {
              e.stopPropagation();
              onDictationRetry(sentence);
            }}
            className="shrink-0 p-1.5 rounded-lg text-emerald-500/90 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
      {isActive && !isCompleted && (
        <input
          type="text"
          autoFocus
          data-dictation-input
          value={dictationInput}
          onChange={(e) => onDictationChange(sentence, e.target.value)}
          onKeyDown={(e) => onDictationKeyDown(e, sentence)}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 font-mono text-lg focus:outline-none focus:border-emerald-500"
          placeholder="Type what you hear... (Tab for hint, Ctrl to replay)"
          autoComplete="off"
          spellCheck="false"
        />
      )}
    </div>
  );
}
