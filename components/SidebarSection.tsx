import React from 'react';
import { Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { LessonSummary } from '@/types';
import { SECTION_LABELS } from '@/constants';
import { LessonCard } from './LessonCard';

interface SidebarSectionProps {
  title: string;
  sections: string[];
  lessons: LessonSummary[];
  currentLessonId: string | null;
  expandedSections: Record<string, boolean>;
  onToggleSection: (section: string, expanded: boolean) => void;
  onLoadLesson: (id: string) => void;
  onTrashLesson: (id: string) => void;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  emptyMessage?: string;
}

export function SidebarSection({
  title,
  sections,
  lessons,
  currentLessonId,
  expandedSections,
  onToggleSection,
  onLoadLesson,
  onTrashLesson,
  activeMenu,
  setActiveMenu,
  emptyMessage
}: SidebarSectionProps) {
  return (
    <div className="space-y-1">
      <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
      
      {sections.map((section) => {
        const type = section.split('-')[0]; // 'audio' or 'flashcard'
        const lang = section.split('-')[1]; // 'en' or 'de'
        
        const sectionLessons = lessons.filter((l) => l.language === lang && !l.isTrashed);
        if (sectionLessons.length === 0 && !emptyMessage) return null;

        const isExpanded = expandedSections[section];
        const toggleSection = () => onToggleSection(section, !isExpanded);

        return (
          <div key={section} className="space-y-1">
            <button
              onClick={toggleSection}
              className="w-full flex items-center justify-between px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Globe size={14} className={lang === 'en' ? 'text-blue-400' : 'text-yellow-400'} />
                {SECTION_LABELS[section]}
              </span>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {isExpanded && sectionLessons.length > 0 ? (
              sectionLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  currentLessonId={currentLessonId}
                  onLoadLesson={onLoadLesson}
                  onTrashLesson={onTrashLesson}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              ))
            ) : isExpanded && emptyMessage ? (
              <div className="px-5 py-2 text-sm text-gray-500 italic">
                {emptyMessage}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
