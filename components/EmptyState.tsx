import React from 'react';
import { Trash2 } from 'lucide-react';

interface EmptyStateProps {
  type: 'lessons' | 'decks' | 'trash';
}

const config = {
  lessons: {
    icon: '🎧',
    title: 'No audio lessons',
    description: "Click the '+ Audio' button above to start learning.",
  },
  decks: {
    icon: '🎴',
    title: 'No flashcard decks',
    description: "Click the '+ Deck' button above to build your vocabulary.",
  },
  trash: {
    title: 'Trash is empty',
    description: 'Deleted items will appear here',
  },
} as const;

export function EmptyState({ type }: EmptyStateProps) {
  const c = config[type];

  if (type === 'trash') {
    return (
      <div className="empty-state px-3 py-2 text-left flex items-start gap-2">
        <Trash2 size={12} className="text-gray-600 shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-[11px] text-gray-500 leading-snug">{c.title}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">{c.description}</p>
        </div>
      </div>
    );
  }

  const cl = c as typeof config.lessons;

  return (
    <div className="empty-state text-center py-8 px-4 opacity-90">
      <div className="text-5xl mb-4 opacity-50" aria-hidden>
        {cl.icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{cl.title}</h3>
      <p className="text-xs text-gray-400 max-w-[220px] mx-auto">{cl.description}</p>
    </div>
  );
}
