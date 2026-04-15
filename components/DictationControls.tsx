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

const spaceSlotClass =
  'inline-block min-w-[0.55em] w-[0.55em] max-w-[0.55em] shrink-0 text-center align-baseline';

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

  if (isCompleted) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="font-mono text-lg tracking-wide min-w-0 flex-1 leading-relaxed text-green-400">
            {targetNorm.split('').map((ch, i) => {
              const spaceSlot = ch === ' ' ? spaceSlotClass : 'inline-block whitespace-pre align-baseline';
              return (
                <span key={i} className={spaceSlot}>
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              );
            })}
          </div>
          {onDictationRetry && (
            <button
              type="button"
              title="Practice this sentence again"
              onClick={(e) => {
                e.stopPropagation();
                onDictationRetry(sentence);
              }}
              className="shrink-0 rounded-lg border border-transparent p-1.5 text-emerald-500/90 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="min-w-0 pl-[calc(1rem+1px)] font-mono text-sm leading-relaxed tracking-wide text-gray-500"
        aria-hidden
      >
        {targetNorm.split('').map((ch, i) => (
          <span key={i} className={ch === ' ' ? spaceSlotClass : 'inline-block align-baseline'}>
            {ch === ' ' ? '\u00a0' : '*'}
          </span>
        ))}
      </div>
      {isActive && (
        <input
          type="text"
          autoFocus
          data-dictation-input
          value={dictationInput}
          onChange={(e) => onDictationChange(sentence, e.target.value)}
          onKeyDown={(e) => onDictationKeyDown(e, sentence)}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 font-mono text-lg leading-normal focus:outline-none focus:border-emerald-500 placeholder:text-gray-600"
          placeholder="Type what you hear... (Tab for hint, Ctrl to replay)"
          autoComplete="off"
          spellCheck="false"
        />
      )}
    </div>
  );
}
