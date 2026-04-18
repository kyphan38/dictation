'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { shuffleFullIndices } from '@/lib/flashcard-shuffle';

export type FlashcardRating = 'again' | 'good' | 'done';

/** Snapshot from Firestore used to rebuild queue (excludes `done` indices). */
export type FlashcardHydrate = {
  ratings: Record<number, FlashcardRating>;
  isShuffled: boolean;
  shuffledIndices: number[];
  /** When true, do not open the post-completion modal (user chose Keep last time). Cleared on deck reset. */
  completionModalShown?: boolean;
};

function isPermutationOfIndices(saved: number[], n: number): boolean {
  if (saved.length !== n) return false;
  const seen = new Set<number>();
  for (const x of saved) {
    if (!Number.isInteger(x) || x < 0 || x >= n || seen.has(x)) return false;
    seen.add(x);
  }
  return seen.size === n;
}

function buildInitialOrder(
  n: number,
  shuffleMode: boolean,
  hydrate: FlashcardHydrate | null,
): number[] {
  if (n === 0) return [];
  const ratings = hydrate?.ratings ?? {};
  const active = Array.from({ length: n }, (_, i) => i).filter((i) => ratings[i] !== 'done');
  if (active.length === 0) return [];

  if (!shuffleMode) {
    return active;
  }

  const saved = hydrate?.shuffledIndices ?? [];
  if (isPermutationOfIndices(saved, n)) {
    const filtered = saved.filter((i) => ratings[i] !== 'done');
    if (filtered.length === active.length) return filtered;
  }

  const shuffled = shuffleFullIndices(active.length);
  return shuffled.map((j) => active[j]!);
}

function isTypingInField(): boolean {
  const ae = document.activeElement;
  if (!ae) return false;
  if (ae instanceof HTMLInputElement || ae instanceof HTMLTextAreaElement || ae instanceof HTMLSelectElement) {
    return true;
  }
  if (ae instanceof HTMLElement && ae.isContentEditable) return true;
  return false;
}

export function useFlashcardEngine(
  initialLines: string[],
  onComplete: () => void,
  options?: {
    onRate?: (lineIndex: number, rating: FlashcardRating) => void;
    /** When set, queue excludes indices with `ratings[i] === 'done'` and may restore shuffle order from `shuffledIndices`. */
    hydrate?: FlashcardHydrate | null;
  },
) {
  const [lines, setLines] = useState<string[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [isShuffle, setIsShuffle] = useState(() => options?.hydrate?.isShuffled ?? false);
  const [flashedButton, setFlashedButton] = useState<string | null>(null);

  const orderRef = useRef<number[]>([]);
  const linesRef = useRef<string[]>([]);
  const onCompleteRef = useRef(onComplete);
  const onRateRef = useRef(options?.onRate);
  const hydrateRef = useRef(options?.hydrate ?? null);
  const completeFiredRef = useRef(false);
  /** Tracks last queue length so we only fire onComplete on transition from >0 cards to 0 (not on mount at 100%). */
  const prevOrderLenRef = useRef<number | null>(null);

  onCompleteRef.current = onComplete;
  onRateRef.current = options?.onRate;
  hydrateRef.current = options?.hydrate ?? null;

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useEffect(() => {
    completeFiredRef.current = false;
    prevOrderLenRef.current = null;
    const cleaned = initialLines.map((l) => l.trim()).filter((l) => l.length > 0);
    setLines(cleaned);
    const n = cleaned.length;
    const ord = buildInitialOrder(n, isShuffle, hydrateRef.current);
    setOrder(ord);
  }, [initialLines, isShuffle, options?.hydrate]);

  const originalTotal = lines.length;
  const cardsRemaining = order.length;
  const progress =
    originalTotal === 0 ? 0 : Math.round(((originalTotal - cardsRemaining) / originalTotal) * 100);
  const currentIndex = originalTotal - cardsRemaining;
  const currentCard = order.length > 0 ? lines[order[0]] ?? '' : '';
  const currentLineOneBased = order.length > 0 ? order[0] + 1 : 0;

  const handleRating = useCallback((rating: FlashcardRating) => {
    setOrder((prev) => {
      if (prev.length === 0) return prev;
      const idx = prev[0];
      onRateRef.current?.(idx, rating);
      const rest = prev.slice(1);

      if (rating === 'done') {
        return rest;
      }
      if (rating === 'good') {
        return [...rest, idx];
      }
      if (rating === 'again') {
        if (rest.length === 0) return [idx];
        return [rest[0]!, idx, ...rest.slice(1)];
      }
      return rest;
    });
  }, []);

  useEffect(() => {
    if (originalTotal === 0) return;
    const prev = prevOrderLenRef.current;
    const curr = order.length;
    if (prev === null) {
      prevOrderLenRef.current = curr;
      return;
    }
    if (prev > 0 && curr === 0 && !completeFiredRef.current) {
      if (hydrateRef.current?.completionModalShown) {
        prevOrderLenRef.current = curr;
        return;
      }
      completeFiredRef.current = true;
      onCompleteRef.current();
    }
    prevOrderLenRef.current = curr;
  }, [order.length, originalTotal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingInField()) return;
      const el = e.target as HTMLElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable) {
        return;
      }
      const keyMap: Record<string, FlashcardRating> = {
        '1': 'again',
        '2': 'good',
        '3': 'done',
      };
      const rating = keyMap[e.key];
      if (!rating) return;
      if (orderRef.current.length === 0) return;
      e.preventDefault();
      setFlashedButton(e.key);
      window.setTimeout(() => {
        handleRating(rating);
      }, 0);
      window.setTimeout(() => setFlashedButton(null), 300);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRating]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((s) => !s);
  }, []);

  const jumpToLineOneBased = useCallback((oneBased: number) => {
    const lineIndex = oneBased - 1;
    setOrder((prev) => {
      const L = linesRef.current.length;
      if (lineIndex < 0 || lineIndex >= L) return prev;
      const pos = prev.indexOf(lineIndex);
      if (pos === -1) return prev;
      return [...prev.slice(pos), ...prev.slice(0, pos)];
    });
  }, []);

  return {
    currentCard,
    progress,
    currentIndex,
    totalCards: originalTotal,
    queueLength: order.length,
    currentLineOneBased,
    isShuffle,
    toggleShuffle,
    handleRating,
    flashedButton,
    hasCards: order.length > 0,
    jumpToLineOneBased,
  };
}
