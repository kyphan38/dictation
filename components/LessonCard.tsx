import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Wand2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { LessonSummary } from '@/types';

interface LessonCardProps {
  lesson: LessonSummary;
  currentLessonId: string | null;
  onLoadLesson: (id: string) => void;
  onTrashLesson: (id: string) => void;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
}

export function LessonCard({
  lesson,
  currentLessonId,
  onLoadLesson,
  onTrashLesson,
  activeMenu,
  setActiveMenu
}: LessonCardProps) {
  return (
    <div
      onClick={() => onLoadLesson(lesson.id)}
      className={`relative p-3 ml-2 rounded-lg cursor-pointer transition-colors group ${
        currentLessonId === lesson.id
          ? 'bg-gray-800 border border-gray-700'
          : 'hover:bg-gray-800/50 border border-transparent'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4
          className="font-medium text-gray-200 text-sm truncate pr-6"
          title={lesson.name}
        >
          {lesson.name}
          {!lesson.hasAudio && (
            <span title="Audio file missing">
              <AlertTriangle size={12} className="inline ml-1 text-emerald-500" />
            </span>
          )}
        </h4>
        
        {/* More Options Menu */}
        <div className="absolute top-2 right-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === lesson.id ? null : lesson.id);
            }}
            className={`p-1 rounded-md transition-colors ${activeMenu === lesson.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white opacity-0 group-hover:opacity-100'}`}
          >
            <MoreVertical size={14} />
          </button>
          
          {activeMenu === lesson.id && (
            <div className="absolute right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded-lg z-50 py-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Implement rename logic here
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
              >
                <Edit2 size={14} /> Rename
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onTrashLesson(lesson.id);
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2"
              >
                <Trash2 size={14} /> Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <CheckCircle2
            size={12}
            className={lesson.progress === 100 ? 'text-green-400' : ''}
          />
          {lesson.progress}%
        </span>
        {lesson.hasIpa && (
          <span className="flex items-center gap-1 text-purple-400" title="IPA Generated">
            <Wand2 size={12} />
          </span>
        )}
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full ${
            lesson.progress === 100 ? 'bg-green-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${lesson.progress}%` }}
        ></div>
      </div>
    </div>
  );
}
