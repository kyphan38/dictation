'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

export interface DeleteLessonModalProps {
  lessonId: string;
  onCancel: () => void;
  onConfirmDelete: (id: string) => void | Promise<void>;
}

export function DeleteLessonModal({ lessonId, onCancel, onConfirmDelete }: DeleteLessonModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Delete item?</h3>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          This removes the lesson or deck and all saved data from this device. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirmDelete(lessonId)}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
