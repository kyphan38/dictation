import React from 'react';

interface EmptyStateProps {
  type: 'lessons' | 'decks' | 'trash';
  onAction?: () => void;
}

const config = {
  lessons: {
    icon: '🎧',
    title: 'No lessons yet',
    description: 'Create your first audio lesson to start learning',
    actionText: '+ New Lesson',
    actionClass: 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10',
  },
  decks: {
    icon: '🎴',
    title: 'No flashcard decks',
    description: 'Build a vocabulary deck to practice',
    actionText: '+ New Deck',
    actionClass: 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10',
  },
  trash: {
    title: 'Trash is empty',
    description: 'Deleted items will appear here',
    actionText: null as string | null,
    actionClass: '',
  },
} as const;

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const c = config[type];

  if (type === 'trash') {
    return (
      <div className="empty-state px-3 py-2 text-left">
        <p className="text-[11px] text-gray-500 leading-snug">{c.title}</p>
        <p className="text-[10px] text-gray-600 mt-0.5">{c.description}</p>
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
      <p className="text-xs text-gray-400 mb-4 max-w-[220px] mx-auto">{cl.description}</p>
      {cl.actionText && onAction && (
        <button
          type="button"
          className={`empty-action text-xs px-4 py-2 rounded-lg border border-dashed border-gray-600 bg-transparent text-gray-200 cursor-pointer transition-all hover:border-solid hover:bg-gray-800/50 ${cl.actionClass}`}
          onClick={onAction}
        >
          {cl.actionText}
        </button>
      )}
    </div>
  );
}
