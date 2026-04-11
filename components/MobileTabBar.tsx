'use client';

import React from 'react';
import type { AppTab } from '@/types';

export interface MobileTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex items-center justify-around p-2 z-40 pb-safe">
      <button
        type="button"
        onClick={() => onTabChange('Lessons')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
          activeTab === 'Lessons' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <span className="text-xl">🎧</span>
        <span className="text-[10px] font-medium">Lessons</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('Flashcards')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
          activeTab === 'Flashcards' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <span className="text-xl">🎴</span>
        <span className="text-[10px] font-medium">Flashcards</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('Stats')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
          activeTab === 'Stats' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <span className="text-xl">📊</span>
        <span className="text-[10px] font-medium">Stats</span>
      </button>
    </div>
  );
}
