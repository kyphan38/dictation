import { useEffect, type MutableRefObject, type RefObject } from 'react';
import type { AppMode } from '@/types';
import type { Sentence } from '@/types';

type ModeChange = (mode: AppMode) => void | Promise<void>;

/**
 * Space / L / R / Ctrl replay-at-sentence-start, and ⌘1–3 mode switching for audio lessons.
 */
export function useGlobalPlaybackShortcuts(
  selectedItemType: 'lesson' | 'deck' | undefined,
  handleModeChange: ModeChange,
  togglePlayPause: () => void,
  toggleLoopMode: () => void,
  loopTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  isLoopDelayingRef: MutableRefObject<boolean>,
  audioRef: RefObject<HTMLAudioElement | null>,
  activeSentenceRef: MutableRefObject<Sentence | null>
) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (selectedItemType === 'lesson' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          void handleModeChange('normal');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          void handleModeChange('dictation');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          void handleModeChange('shadowing');
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'KeyL' || e.code === 'KeyR') {
        e.preventDefault();
        toggleLoopMode();
      } else if (e.key === 'Control') {
        e.preventDefault();
        if (loopTimeoutRef.current) {
          clearTimeout(loopTimeoutRef.current);
          isLoopDelayingRef.current = false;
        }
        if (audioRef.current && activeSentenceRef.current) {
          audioRef.current.currentTime = activeSentenceRef.current.start;
          audioRef.current.play().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    togglePlayPause,
    toggleLoopMode,
    loopTimeoutRef,
    isLoopDelayingRef,
    audioRef,
    selectedItemType,
    handleModeChange,
    activeSentenceRef,
  ]);
}
