import { useEffect, type MutableRefObject } from 'react';
import type { Sentence } from '@/types';

/**
 * Smooth-scrolls the transcript container so the active sentence stays in view during playback.
 */
export function useAutoScrollActiveSentence(
  currentTime: number,
  transcript: Sentence[],
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>,
  lastScrolledIndexRef: MutableRefObject<number>
) {
  useEffect(() => {
    const activeIndex = transcript.findIndex((s) => currentTime >= s.start && currentTime < s.end);
    if (activeIndex !== -1 && activeIndex !== lastScrolledIndexRef.current && scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        lastScrolledIndexRef.current = activeIndex;
      }
    }
  }, [currentTime, transcript, scrollContainerRef, lastScrolledIndexRef]);
}
