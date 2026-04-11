'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFlashcardEngine } from '@/hooks/useFlashcardEngine';
import { DeckItem } from '@/types';
import { getLesson, saveLesson } from '@/lib/db';

interface FlashcardViewerProps {
  deck: DeckItem;
  onComplete: () => void;
  onDeckUpdated?: () => void;
}

function linesFromLesson(lesson: Awaited<ReturnType<typeof getLesson>>): string[] {
  if (!lesson) return [];
  const fromFlash = lesson.flashcardData?.lines;
  if (fromFlash && fromFlash.length > 0) return [...fromFlash];
  return lesson.transcriptText
    ? lesson.transcriptText.split('\n').map((l) => l.trim()).filter(Boolean)
    : [];
}

export function FlashcardViewer({ deck, onComplete, onDeckUpdated }: FlashcardViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editText, setEditText] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const lesson = await getLesson(deck.id);
      const next = linesFromLesson(lesson);
      setLines(next);
      setEditText(next.join('\n'));
    } catch {
      setLoadError('Could not load deck.');
      setLines([]);
      setEditText('');
    } finally {
      setLoading(false);
    }
  }, [deck.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const engine = useFlashcardEngine(lines, onComplete);

  const handleSaveEdit = async () => {
    const nextLines = editText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    try {
      const lesson = await getLesson(deck.id);
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
      await saveLesson(lesson);
      setLines(nextLines);
      setIsEditing(false);
      onDeckUpdated?.();
    } catch {
      setLoadError('Failed to save deck.');
    }
  };

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
          rows={12}
          aria-label="Deck lines, one card per line"
        />
        <div className="flex gap-2 mt-4">
          <button type="button" className="flashcard-btn-ghost bg-emerald-600/20 border-emerald-500/50 text-emerald-300" onClick={handleSaveEdit}>
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

  const doneMessage = !engine.hasCards && engine.totalCards > 0 ? 'All caught up!' : engine.currentCard;

  return (
    <div className="flashcard-viewer-container">
      <div className="flashcard-header">
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${engine.progress}%` }} />
          </div>
          <span className="progress-text">
            {engine.hasCards
              ? `${engine.progress}% · Card ${engine.currentIndex + 1} / ${engine.totalCards}`
              : `${engine.progress}% · Session complete`}
          </span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            onClick={engine.toggleShuffle}
            className={`flashcard-btn-ghost ${engine.isShuffle ? 'active' : ''}`}
          >
            {engine.isShuffle ? 'Shuffle on' : 'Sequential'}
          </button>
          <button type="button" className="flashcard-btn-ghost" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        </div>
      </div>

      <div className="flashcard-main">
        <h2 className="flashcard-text">{engine.hasCards ? engine.currentCard : doneMessage}</h2>
      </div>

      {engine.hasCards && (
        <div className="flashcard-controls">
          <button
            type="button"
            className={`rate-btn btn-again ${engine.flashedButton === '1' ? 'flash-active' : ''}`}
            onClick={() => engine.handleRating('again')}
          >
            <span className="shortcut-hint">1</span>
            Again
          </button>
          <button
            type="button"
            className={`rate-btn btn-hard ${engine.flashedButton === '2' ? 'flash-active' : ''}`}
            onClick={() => engine.handleRating('hard')}
          >
            <span className="shortcut-hint">2</span>
            Hard
          </button>
          <button
            type="button"
            className={`rate-btn btn-good ${engine.flashedButton === '3' ? 'flash-active' : ''}`}
            onClick={() => engine.handleRating('good')}
          >
            <span className="shortcut-hint">3</span>
            Good
          </button>
          <button
            type="button"
            className={`rate-btn btn-easy ${engine.flashedButton === '4' ? 'flash-active' : ''}`}
            onClick={() => engine.handleRating('easy')}
          >
            <span className="shortcut-hint">4</span>
            Easy
          </button>
          <button
            type="button"
            className={`rate-btn btn-done ${engine.flashedButton === '5' ? 'flash-active' : ''}`}
            onClick={() => engine.handleRating('done')}
          >
            <span className="shortcut-hint">5</span>
            Done
          </button>
        </div>
      )}
    </div>
  );
}
