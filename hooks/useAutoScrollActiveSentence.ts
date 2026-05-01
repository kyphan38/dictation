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
        const container = scrollContainerRef.current;
        const el = activeElement as HTMLElement;
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetScrollTop =
          container.scrollTop +
          (elRect.top - containerRect.top) -
          (container.clientHeight - el.offsetHeight) / 2;
        container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        lastScrolledIndexRef.current = activeIndex;
      }
    }
  }, [currentTime, transcript, scrollContainerRef, lastScrolledIndexRef]);
}
