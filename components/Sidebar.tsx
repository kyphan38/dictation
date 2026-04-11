'use client';

import React, { useState } from 'react';
import { Plus, LogOut, PanelLeft } from 'lucide-react';
import { LessonSummary, ExpandedSections } from '@/types';
import { SidebarSection } from './SidebarSection';
import { TrashSection } from './TrashSection';

interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  lessons: LessonSummary[];
  currentLessonId: string | null;
  expandedSections: ExpandedSections;
  onLoadLesson: (id: string) => void;
  onNewLesson: () => void;
  onTrashLesson: (id: string) => void;
  onLogout: () => void;
  onToggleSection: (section: string, expanded: boolean) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  lessons,
  currentLessonId,
  expandedSections,
  onLoadLesson,
  onNewLesson,
  onTrashLesson,
  onLogout,
  onToggleSection,
}: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`shrink-0 transition-all duration-300 ease-in-out ${isOpen ? 'w-72' : 'w-0'} relative z-50`}
      >
        <div
          className={`fixed inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Noda.
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
              <button
                onClick={() => onToggle(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Close Sidebar"
              >
                <PanelLeft size={20} />
              </button>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={onNewLesson}
              className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-2 font-medium transition-colors mb-3"
            >
              <Plus size={18} /> New Activity
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-6">
            {/* Audio Lessons Section */}
            <SidebarSection
              title="Audio Lessons"
              sections={['audio-en', 'audio-de']}
              lessons={lessons}
              currentLessonId={currentLessonId}
              expandedSections={expandedSections}
              onToggleSection={onToggleSection}
              onLoadLesson={onLoadLesson}
              onTrashLesson={onTrashLesson}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />

            {/* Flashcards Section */}
            <SidebarSection
              title="Flashcards Deck"
              sections={['flashcard-en', 'flashcard-de']}
              lessons={lessons}
              currentLessonId={currentLessonId}
              expandedSections={expandedSections}
              onToggleSection={onToggleSection}
              onLoadLesson={onLoadLesson}
              onTrashLesson={onTrashLesson}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              emptyMessage="No flashcard decks yet."
            />

            {/* Trash Section */}
            <TrashSection
              lessons={lessons}
              isExpanded={expandedSections['trash']}
              onToggleSection={(expanded) => onToggleSection('trash', expanded)}
              onDeletePermanently={onTrashLesson}
            />
          </div>
        </div>
      </div>
    </>
  );
}
