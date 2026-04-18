'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Check, BadgeCheck } from 'lucide-react';
import { useFlashcardEngine } from '@/hooks/useFlashcardEngine';
import type { FlashcardHydrate, FlashcardRating } from '@/hooks/useFlashcardEngine';
import { DeckItem } from '@/types';
import { getLessonFirestore, patchFlashcardRatingFirestore, saveLessonFirestore } from '@/lib/db';
import type { LessonRecord } from '@/lib/db';
import { shuffleFullIndices } from '@/lib/flashcard-shuffle';

interface FlashcardViewerProps {
  deck: DeckItem;
  /** Increment after persisting deck metadata (e.g. completion modal dismissed) to reload hydrate from Firestore. */
  deckHydrateBump?: number;
  onComplete: () => void;
  onPersistError?: (message: string) => void;
}

function linesFromLesson(lesson: Awaited<ReturnType<typeof getLessonFirestore>>): string[] {
  if (!lesson) return [];
  const fromFlash = lesson.flashcardData?.lines;
  if (fromFlash && fromFlash.length > 0) return [...fromFlash];
  return lesson.transcriptText
    ? lesson.transcriptText.split('\n').map((l) => l.trim()).filter(Boolean)
    : [];
}

function normalizeRatings(raw: Record<number, string> | undefined): Record<number, FlashcardRating> {
  const out: Record<number, FlashcardRating> = {};
  if (!raw) return out;
  for (const [k, v] of Object.entries(raw)) {
    const i = Number(k);
    if (!Number.isInteger(i) || typeof v !== 'string') continue;
    let coerced: FlashcardRating | null = null;
    if (v === 'done') coerced = 'done';
    else if (v === 'good' || v === 'easy') coerced = 'good';
    else if (v === 'again' || v === 'hard') coerced = 'again';
    if (coerced) out[i] = coerced;
  }
  return out;
}

function hydrateFromLesson(lesson: LessonRecord | null, lineCount: number): FlashcardHydrate {
  const fd = lesson?.flashcardData;
  const ratings = normalizeRatings(fd?.ratings);
  const raw = fd?.shuffledIndices ?? [];
  const shuffledIndices =
    raw.length === lineCount && lineCount > 0 ? [...raw] : [];
  return {
    ratings,
    isShuffled: !!fd?.isShuffled,
    shuffledIndices,
    completionModalShown: fd?.completionModalShown === true,
  };
}

type FlashcardDeckPlayProps = {
  deckId: string;
  lines: string[];
  hydrate: FlashcardHydrate;
  onComplete: () => void;
  onPersistError?: (message: string) => void;
  onResetDeck: () => void;
  onOpenEdit: () => void;
  onShufflePersisted: () => void;
};

function FlashcardDeckPlay({
  deckId,
  lines,
  hydrate,
  onComplete,
  onPersistError,
  onResetDeck,
  onOpenEdit,
  onShufflePersisted,
}: FlashcardDeckPlayProps) {
  const [clickFlash, setClickFlash] = useState<string | null>(null);

  const onPersistRate = useCallback(
    (lineIndex: number, rating: FlashcardRating) => {
      void (async () => {
        try {
          await patchFlashcardRatingFirestore(deckId, lineIndex, rating);
        } catch (err) {
          console.error('Flashcard persist failed', err);
          onPersistError?.('Could not save progress — try again.');
        }
      })();
    },
    [deckId, onPersistError],
  );

  const engine = useFlashcardEngine(lines, onComplete, { onRate: onPersistRate, hydrate });

  const persistShuffleToggle = useCallback(() => {
    void (async () => {
      try {
        const lesson = await getLessonFirestore(deckId);
        if (!lesson?.flashcardData) return;
        const n = lines.length;
        if (n === 0) return;
        const nextShuffle = !hydrate.isShuffled;
        lesson.flashcardData = {
          ...lesson.flashcardData,
          isShuffled: nextShuffle,
          shuffledIndices: nextShuffle ? shuffleFullIndices(n) : [],
        };
        lesson.updatedAt = Date.now();
        await saveLessonFirestore(lesson);
        onShufflePersisted();
      } catch (err) {
        console.error('Flashcard shuffle persist failed', err);
        onPersistError?.('Could not save shuffle preference — try again.');
      }
    })();
  }, [deckId, lines.length, hydrate.isShuffled, onPersistError, onShufflePersisted]);

  const flashAndRate = (key: string, rating: FlashcardRating) => {
    setClickFlash(key);
    window.setTimeout(() => engine.handleRating(rating), 0);
    window.setTimeout(() => setClickFlash(null), 300);
  };

  const doneMessage = !engine.hasCards && engine.totalCards > 0 ? 'All caught up!' : engine.currentCard;
  const keyFlash = (k: string) => engine.flashedButton === k || clickFlash === k;

  return (
    <div className="flashcard-viewer-container">
      <div className="flashcard-header">
        <div className="header-actions w-full flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-gray-500 tabular-nums shrink-0">{lines.length} cards</span>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => void onResetDeck()}
              title="Reset deck progress"
              className="flashcard-btn-ghost border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Reset deck
            </button>
            <button
              type="button"
              onClick={persistShuffleToggle}
              className={`flashcard-btn-ghost ${engine.isShuffle ? 'active' : ''}`}
            >
              {engine.isShuffle ? 'Shuffle on' : 'Sequential'}
            </button>
            <button type="button" className="flashcard-btn-ghost" onClick={onOpenEdit}>
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="flashcard-main">
        <h2 className="flashcard-text">{engine.hasCards ? engine.currentCard : doneMessage}</h2>
      </div>

      {engine.hasCards && (
        <div className="flashcard-controls">
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className={`rate-btn btn-again ${keyFlash('1') ? 'flash-active' : ''}`}
            onClick={() => flashAndRate('1', 'again')}
          >
            <span className="shortcut-hint">1</span>
            <RotateCcw className="w-4 h-4 shrink-0" strokeWidth={2.25} aria-hidden />
            Again
          </button>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className={`rate-btn btn-good ${keyFlash('2') ? 'flash-active' : ''}`}
            onClick={() => flashAndRate('2', 'good')}
          >
            <span className="shortcut-hint">2</span>
            <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} aria-hidden />
            Good
          </button>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className={`rate-btn btn-done ${keyFlash('3') ? 'flash-active' : ''}`}
            onClick={() => flashAndRate('3', 'done')}
          >
            <span className="shortcut-hint">3</span>
            <BadgeCheck className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export function FlashcardViewer({ deck, deckHydrateBump = 0, onComplete, onPersistError }: FlashcardViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editText, setEditText] = useState('');
  const [hydrateSnapshot, setHydrateSnapshot] = useState<FlashcardHydrate | null>(null);
  const [dataEpoch, setDataEpoch] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const lesson = await getLessonFirestore(deck.id);
      const next = linesFromLesson(lesson);
      setLines(next);
      setEditText(next.join('\n'));
      setHydrateSnapshot(hydrateFromLesson(lesson, next.length));
      setDataEpoch((e) => e + 1);
    } catch {
      setLoadError('Could not load deck.');
      setLines([]);
      setEditText('');
      setHydrateSnapshot({ ratings: {}, isShuffled: false, shuffledIndices: [] });
      setDataEpoch((e) => e + 1);
    } finally {
      setLoading(false);
    }
  }, [deck.id]);

  useEffect(() => {
    reload();
  }, [reload, deckHydrateBump]);

  const handleResetDeck = useCallback(async () => {
    try {
      const lesson = await getLessonFirestore(deck.id);
      if (!lesson) return;
      const baseLines =
        lesson.flashcardData?.lines && lesson.flashcardData.lines.length > 0
          ? lesson.flashcardData.lines
          : lines;
      // Do not spread previous flashcardData — merged fields can include `undefined`,
      // which Firestore rejects on setDoc ("Unsupported field value: undefined").
      lesson.flashcardData = {
        lines: baseLines,
        ratings: {},
        currentIndex: 0,
        isShuffled: false,
        shuffledIndices: [],
        completionModalShown: false,
      };
      lesson.totalSentences = baseLines.length;
      lesson.updatedAt = Date.now();
      await saveLessonFirestore(lesson);
      setLines([...baseLines]);
      setHydrateSnapshot(hydrateFromLesson(lesson, baseLines.length));
      setDataEpoch((e) => e + 1);
    } catch (err) {
      console.error('Failed to reset deck', err);
      setLoadError('Failed to reset deck.');
    }
  }, [deck.id, lines]);

  const bumpHydrateAfterShuffle = useCallback(() => {
    void (async () => {
      try {
        const lesson = await getLessonFirestore(deck.id);
        if (lesson) {
          setHydrateSnapshot(hydrateFromLesson(lesson, lines.length));
        }
        setDataEpoch((e) => e + 1);
      } catch (err) {
        console.error('Flashcard hydrate after shuffle failed', err);
        onPersistError?.('Could not refresh deck — try again.');
      }
    })();
  }, [deck.id, lines.length, onPersistError]);

  const handleSaveEdit = useCallback(async () => {
    const nextLines = editText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    try {
      const lesson = await getLessonFirestore(deck.id);
      if (!lesson) return;
      lesson.flashcardData = {
        ...(lesson.flashcardData ?? {
          ratings: {},
          currentIndex: 0,
          isShuffled: false,
          shuffledIndices: [],
        }),
        lines: nextLines,
      };
      lesson.totalSentences = nextLines.length;
      lesson.updatedAt = Date.now();
      await saveLessonFirestore(lesson);
      setLines(nextLines);
      setHydrateSnapshot(hydrateFromLesson(lesson, nextLines.length));
      setDataEpoch((e) => e + 1);
      setIsEditing(false);
    } catch {
      setLoadError('Failed to save deck.');
    }
  }, [deck.id, editText]);

  if (loading) {
    return (
      <div className="flashcard-viewer-container flex items-center justify-center text-gray-400 text-sm">
        Loading deck…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flashcard-viewer-container flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-400 text-sm">{loadError}</p>
        <button type="button" className="flashcard-btn-ghost" onClick={() => reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flashcard-viewer-container flashcard-editor">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="deck-textarea"
          rows={18}
          aria-label="Deck lines, one card per line"
        />
        <div className="flex gap-2 mt-4">
          <button type="button" className="flashcard-btn-ghost bg-emerald-600/20 border-emerald-500/50 text-emerald-300" onClick={() => void handleSaveEdit()}>
            Save &amp; Resume
          </button>
          <button type="button" className="flashcard-btn-ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flashcard-viewer-container flex flex-col items-center justify-center gap-4 text-center text-gray-400">
        <p className="text-sm">This deck has no cards yet.</p>
        <button type="button" className="flashcard-btn-ghost" onClick={() => setIsEditing(true)}>
          Add lines
        </button>
      </div>
    );
  }

  const hydrate = hydrateSnapshot ?? { ratings: {}, isShuffled: false, shuffledIndices: [] };

  return (
    <FlashcardDeckPlay
      key={dataEpoch}
      deckId={deck.id}
      lines={lines}
      hydrate={hydrate}
      onComplete={onComplete}
      onPersistError={onPersistError}
      onResetDeck={handleResetDeck}
      onOpenEdit={() => setIsEditing(true)}
      onShufflePersisted={bumpHydrateAfterShuffle}
    />
  );
}
