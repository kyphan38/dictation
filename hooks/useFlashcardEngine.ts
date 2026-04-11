'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy' | 'done';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useFlashcardEngine(initialLines: string[], onComplete: () => void) {
  const [cards, setCards] = useState<string[]>([]);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [flashedButton, setFlashedButton] = useState<string | null>(null);

  const cardsRef = useRef<string[]>([]);
  const onCompleteRef = useRef(onComplete);
  const completeFiredRef = useRef(false);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    completeFiredRef.current = false;
    const lines = initialLines.map((l) => l.trim()).filter((l) => l.length > 0);
    const ordered = isShuffle ? shuffleArray(lines) : [...lines];
    setCards(ordered);
    setOriginalTotal(ordered.length);
  }, [initialLines, isShuffle]);

  const progress =
    originalTotal === 0 ? 0 : Math.round(((originalTotal - cards.length) / originalTotal) * 100);

  const currentIndex = originalTotal - cards.length;

  const handleRating = useCallback((rating: FlashcardRating) => {
    setCards((prev) => {
      if (prev.length === 0) return prev;
      const newArray = [...prev];
      const currentCard = newArray.shift();
      if (!currentCard) return prev;

      if (rating === 'again' || rating === 'hard') {
        newArray.push(currentCard);
      } else if (rating === 'good' || rating === 'easy') {
        const insertIndex = Math.min(3, newArray.length);
        newArray.splice(insertIndex, 0, currentCard);
      }
      return newArray;
    });
  }, []);

  useEffect(() => {
    if (originalTotal > 0 && cards.length === 0 && !completeFiredRef.current) {
      completeFiredRef.current = true;
      onCompleteRef.current();
    }
  }, [cards.length, originalTotal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable) {
        return;
      }
      const keyMap: Record<string, FlashcardRating> = {
        '1': 'again',
        '2': 'hard',
        '3': 'good',
        '4': 'easy',
        '5': 'done',
      };
      const rating = keyMap[e.key];
      if (!rating) return;
      if (cardsRef.current.length === 0) return;
      e.preventDefault();
      setFlashedButton(e.key);
      handleRating(rating);
      window.setTimeout(() => setFlashedButton(null), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRating]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((s) => !s);
  }, []);

  return {
    currentCard: cards[0] ?? '',
    progress,
    currentIndex,
    totalCards: originalTotal,
    isShuffle,
    toggleShuffle,
    handleRating,
    flashedButton,
    hasCards: cards.length > 0,
  };
}
