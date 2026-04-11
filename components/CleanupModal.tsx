'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PartyPopper } from 'lucide-react';

interface CleanupModalProps {
  isOpen: boolean;
  onKeep: () => void;
  onRemoveAudio?: () => void | Promise<void>;
  onDeleteDeck?: () => void | Promise<void>;
  variant?: 'lesson' | 'deck';
}

export function CleanupModal({
  isOpen,
  onKeep,
  onRemoveAudio,
  onDeleteDeck,
  variant = 'lesson',
}: CleanupModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const isDeck = variant === 'deck';

  const content = (
    <div className="fixed inset-0 bg-black/80 z-[190] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-8 h-8 text-emerald-500" />
        </div>
        {isDeck ? (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Deck complete!</h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              You&apos;ve reviewed all cards in this deck. Delete it from this device to free space?
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void onDeleteDeck?.()}
                className="w-full px-4 py-3 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-medium transition-colors active:scale-[0.98]"
              >
                Delete deck
              </button>
              <button
                type="button"
                onClick={onKeep}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium transition-colors active:scale-[0.98]"
              >
                Keep deck
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Dictation complete!</h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              You&apos;ve mastered all sentences in this lesson. Remove this lesson from this device to free space?
              Transcript and progress will be deleted from this browser.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void onRemoveAudio?.()}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium transition-colors active:scale-[0.98]"
              >
                Remove lesson
              </button>
              <button
                type="button"
                onClick={onKeep}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium transition-colors active:scale-[0.98]"
              >
                Keep files
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
