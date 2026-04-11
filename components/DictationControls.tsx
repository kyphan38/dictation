import React from 'react';
import { Sentence } from '@/types';
import { getLetters } from '@/lib/utils';

interface DictationControlsProps {
  sentence: Sentence;
  isActive: boolean;
  dictationInput: string;
  isCompleted: boolean;
  onDictationChange: (sentence: Sentence, value: string) => void;
  onDictationKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, sentence: Sentence) => void;
}

export function DictationControls({
  sentence,
  isActive,
  dictationInput,
  isCompleted,
  onDictationChange,
  onDictationKeyDown,
}: DictationControlsProps) {
  const targetLetters = getLetters(sentence.text);
  const inputLetters = getLetters(dictationInput);

  return (
    <div className="flex flex-col gap-3">
      <div className="font-mono text-lg tracking-wide flex flex-wrap gap-[1px]">
        {sentence.text.split('').map((char, charIdx) => {
          const isLetter = /[\p{L}\p{N}]/u.test(char);
          if (!isLetter) {
            return (
              <span key={charIdx} className="text-gray-500 whitespace-pre">
                {char}
              </span>
            );
          }

          const letterIdx = targetLetters.findIndex((l) => l.index === charIdx);
          const inputChar = inputLetters[letterIdx]?.char;

          let displayChar = '*';
          let colorClass = 'text-gray-600';

          if (isCompleted) {
            displayChar = char;
            colorClass = 'text-green-400';
          } else if (inputChar !== undefined) {
            if (inputChar.toLowerCase() === char.toLowerCase()) {
              displayChar = char;
              colorClass = 'text-green-400';
            } else {
              displayChar = '*';
              colorClass = 'text-red-400';
            }
          }

          return (
            <span key={charIdx} className={colorClass}>
              {displayChar}
            </span>
          );
        })}
      </div>
      {isActive && !isCompleted && (
        <input
          type="text"
          autoFocus
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
