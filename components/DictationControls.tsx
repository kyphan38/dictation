import React, { useEffect, useRef } from 'react';
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
  'inline-block min-w-[0.63em] w-[0.63em] max-w-[0.63em] shrink-0 text-center align-baseline';

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

  const mainInputRef = useRef<HTMLInputElement>(null);
  const srOnlyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isActive) return;
    if (isCompleted) {
      srOnlyRef.current?.focus({ preventScroll: true });
    } else {
      mainInputRef.current?.focus({ preventScroll: true });
    }
  }, [isCompleted, isActive, sentence.id]);

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
        {isActive && (
          <input
            ref={srOnlyRef}
            type="text"
            readOnly
            aria-label="Press Enter to continue"
            value={dictationInput}
            onKeyDown={(e) => onDictationKeyDown(e, sentence)}
            onClick={(e) => e.stopPropagation()}
            className="fixed top-0 left-0 w-px h-px opacity-0 overflow-hidden pointer-events-none border-0"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="min-w-0 pl-4 font-mono text-lg leading-normal tracking-wide"
        aria-hidden
      >
        {targetNorm.split('').map((ch, i) => {
          const typed = i < inputNorm.length ? inputNorm[i] : undefined;
          const slotClass = ch === ' ' ? spaceSlotClass : 'inline-block align-baseline';

          if (ch === ' ') {
            return (
              <span key={i} className={`${slotClass} text-gray-500`}>
                {'\u00a0'}
              </span>
            );
          }

          if (typed === undefined) {
            return (
              <span key={i} className={`${slotClass} text-gray-500`}>
                {'*'}
              </span>
            );
          }

          if (typed === ch) {
            return (
              <span key={i} className={`${slotClass} whitespace-pre text-emerald-500`}>
                {'*'}
              </span>
            );
          }

          return (
            <span key={i} className={`${slotClass} text-red-500`}>
              {'*'}
            </span>
          );
        })}
      </div>
      {isActive && (
        <input
          ref={mainInputRef}
          type="text"
          data-dictation-input
          value={dictationInput}
          onChange={(e) => onDictationChange(sentence, e.target.value)}
          onKeyDown={(e) => onDictationKeyDown(e, sentence)}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 font-mono text-lg leading-normal tracking-wide text-gray-200 placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none"
          placeholder="Type what you hear... (Tab for hint, Ctrl to replay)"
          autoComplete="off"
          spellCheck="false"
        />
      )}
    </div>
  );
}
