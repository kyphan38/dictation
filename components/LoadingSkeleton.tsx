import React from 'react';

export function LessonCardSkeleton() {
  return (
    <div className="lesson-card-skeleton rounded-lg border border-gray-800/80 p-3 ml-2 space-y-2">
      <div className="flex justify-between gap-2">
        <div className="skeleton-shimmer h-4 rounded w-2/3" />
        <div className="skeleton-shimmer h-8 w-8 rounded-full shrink-0" />
      </div>
      <div className="skeleton-shimmer h-2 rounded w-full mt-2" />
      <div className="skeleton-shimmer h-3 rounded w-1/2 mt-2" />
    </div>
  );
}

export function DeckCardSkeleton() {
  return (
    <div className="deck-card-skeleton rounded-lg border border-gray-800/80 p-3 mb-2 space-y-2">
      <div className="skeleton-shimmer h-4 rounded w-3/4" />
      <div className="skeleton-shimmer h-3 rounded w-1/3 mt-2" />
    </div>
  );
}

export function TrashCardSkeleton() {
  return (
    <div className="flex items-center gap-2 ml-2 px-2 py-1.5 rounded-lg border border-gray-800/80 mb-1">
      <div className="skeleton-shimmer h-4 w-4 rounded shrink-0" />
      <div className="skeleton-shimmer h-3 flex-1 rounded min-w-0" />
      <div className="skeleton-shimmer h-3 w-8 rounded shrink-0" />
      <div className="skeleton-shimmer h-4 w-4 rounded shrink-0" />
    </div>
  );
}
