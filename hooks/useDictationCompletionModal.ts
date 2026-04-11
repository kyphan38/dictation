import { useEffect, useRef, useState } from 'react';
import type { AppMode } from '@/types';

type Selected = { id: string; type: 'lesson' | 'deck' } | null;

/**
 * Opens the post-dictation cleanup modal when all sentences are completed in dictation mode.
 */
export function useDictationCompletionModal(
  selectedItem: Selected,
  isStarted: boolean,
  transcriptLength: number,
  appMode: AppMode,
  completedSentences: Record<number, boolean>
) {
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupModalVariant, setCleanupModalVariant] = useState<'lesson' | 'deck'>('lesson');
  const prevLessonIdForCompletionRef = useRef<string | null>(null);
  const prevCompletedCountRef = useRef<number>(-1);

  useEffect(() => {
    const id = selectedItem?.id ?? null;
    if (id !== prevLessonIdForCompletionRef.current) {
      prevLessonIdForCompletionRef.current = id;
      if (id && selectedItem?.type === 'lesson' && isStarted && transcriptLength > 0) {
        prevCompletedCountRef.current = Object.keys(completedSentences).length;
      } else {
        prevCompletedCountRef.current = -1;
      }
      return;
    }

    if (!id || selectedItem?.type !== 'lesson' || !isStarted || transcriptLength === 0) {
      return;
    }

    const currentCount = Object.keys(completedSentences).length;
    const total = transcriptLength;

    if (
      appMode === 'dictation' &&
      prevCompletedCountRef.current !== -1 &&
      prevCompletedCountRef.current < total &&
      currentCount === total
    ) {
      setCleanupModalVariant('lesson');
      setShowCleanupModal(true);
    }

    prevCompletedCountRef.current = currentCount;
  }, [selectedItem?.id, selectedItem?.type, appMode, completedSentences, transcriptLength, isStarted]);

  return {
    showCleanupModal,
    setShowCleanupModal,
    cleanupModalVariant,
    setCleanupModalVariant,
  };
}
