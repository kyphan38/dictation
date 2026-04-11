import React from 'react';
import { PartyPopper } from 'lucide-react';

interface CleanupModalProps {
  isOpen: boolean;
  onKeep: () => void;
  onRemoveAudio?: () => void | Promise<void>;
  variant?: 'lesson' | 'deck';
}

export function CleanupModal({ isOpen, onKeep, onRemoveAudio, variant = 'lesson' }: CleanupModalProps) {
  if (!isOpen) return null;

  const isDeck = variant === 'deck';

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Congratulations!</h3>
        {isDeck ? (
          <>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              You finished this deck session. Keep studying whenever you like.
            </p>
            <button
              type="button"
              onClick={onKeep}
              className="w-full px-4 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              You completed dictation for this lesson. Remove the audio file from this device to save space? Your transcript and progress stay saved.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void onRemoveAudio?.()}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium transition-colors"
              >
                Remove audio only
              </button>
              <button
                type="button"
                onClick={onKeep}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium transition-colors"
              >
                Keep audio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
