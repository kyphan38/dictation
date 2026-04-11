import React from 'react';

interface EmptyStateProps {
  type: 'lessons' | 'decks';
}

const config = {
  lessons: {
    icon: '🎧',
    title: 'No audio lessons',
    description: "Click the '+ Audio' button above to add a lesson.",
  },
  decks: {
    icon: '🎴',
    title: 'No flashcard decks',
    description: "Click the '+ Deck' button above to add a deck.",
  },
} as const;

export function EmptyState({ type }: EmptyStateProps) {
  const c = config[type];
  return (
    <div className="empty-state text-center py-8 px-4 opacity-90">
      <div className="text-5xl mb-4 opacity-50" aria-hidden>
        {c.icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{c.title}</h3>
      <p className="text-sm text-gray-400 max-w-[220px] mx-auto">{c.description}</p>
    </div>
  );
}
