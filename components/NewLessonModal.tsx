import React, { useState, useCallback, useEffect } from 'react';
import { Music2, FileText } from 'lucide-react';
import { isLessonNameTaken } from '@/lib/utils';

interface LessonData {
  name: string;
  language: 'en' | 'de';
  audioFile: File;
  transcriptFile: File | null;
}

interface NewLessonModalProps {
  onClose: () => void;
  onSubmit: (data: LessonData) => void;
  getTakenAudioLessonNames: () => string[];
}

function isAudioFile(file: File) {
  return file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name);
}

function isSrtFile(file: File) {
  return file.name.toLowerCase().endsWith('.srt') || file.type === 'application/x-subrip' || file.type === 'text/plain';
}

export function NewLessonModal({
  onClose,
  onSubmit,
  getTakenAudioLessonNames,
}: NewLessonModalProps) {
  const [lessonName, setLessonName] = useState('');
  const [language, setLanguage] = useState<'en' | 'de'>('de');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [audioDrag, setAudioDrag] = useState(false);
  const [transcriptDrag, setTranscriptDrag] = useState(false);
  const [audioNameConflict, setAudioNameConflict] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const applyAudioFile = useCallback(
    (file: File) => {
      if (!isAudioFile(file)) return;
      const stem = file.name.replace(/\.[^/.]+$/, '');
      const taken = getTakenAudioLessonNames();
      if (isLessonNameTaken(stem, taken)) {
        setAudioNameConflict(
          `A lesson named "${stem}" already exists. Use another file or rename the lesson after choosing a file with a different name.`
        );
        return;
      }
      setAudioNameConflict(null);
      setAudioFile(file);
      setLessonName(stem);
    },
    [getTakenAudioLessonNames]
  );

  const applyTranscriptFile = useCallback((file: File) => {
    if (!isSrtFile(file)) return;
    setTranscriptFile(file);
  }, []);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyAudioFile(file);
    e.target.value = '';
  };

  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyTranscriptFile(file);
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyAudioFile(file);
  };

  const handleTranscriptDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTranscriptDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyTranscriptFile(file);
  };

  const handleSubmit = () => {
    if (audioFile && lessonName) {
      onSubmit({
        name: lessonName,
        language,
        audioFile,
        transcriptFile,
      });
    }
  };

  return (
    <div className="app-modal-backdrop fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="app-modal-panel relative bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700/80">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">🎧 Create New Audio Lesson</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lesson Name</label>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Lesson name (e.g., German A1 Basics)"
              value={lessonName}
              onChange={(e) => {
                setLessonName(e.target.value);
                setAudioNameConflict(null);
              }}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'de')}
            >
              <option value="de">de</option>
              <option value="en">en</option>
            </select>
          </div>

          <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-2xl p-6">
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setAudioDrag(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setAudioDrag(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={handleAudioDrop}
              className={`text-center pb-6 border-b border-gray-700 mb-4 relative rounded-xl transition-colors ${audioDrag ? 'bg-emerald-500/10 border border-dashed border-emerald-500/50' : ''}`}
            >
              <div className="flex justify-center mb-3 text-emerald-500">
                <Music2 size={40} />
              </div>
              <p className="text-lg font-medium text-white mb-1">Upload Audio File</p>
              <p className="text-sm text-gray-400 mb-4">MP3, WAV, M4A - click or drop here</p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {audioNameConflict && (
                <p className="text-sm text-amber-400 relative z-10 px-2 mb-2" role="alert">
                  {audioNameConflict}
                </p>
              )}
              {audioFile && !audioNameConflict && (
                <p className="text-emerald-500 font-medium relative z-10 pointer-events-none">✓ {audioFile.name}</p>
              )}
            </div>

            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setTranscriptDrag(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setTranscriptDrag(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={handleTranscriptDrop}
              className={`flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg relative transition-colors ${transcriptDrag ? 'ring-1 ring-emerald-500/50 bg-emerald-500/5' : ''}`}
            >
              <FileText size={20} className="text-gray-400 shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-300">+ Add transcript (.srt) - optional</p>
                <p className="text-xs text-gray-500 mt-0.5">Drop file here or click</p>
                {transcriptFile && <p className="text-xs text-emerald-500 mt-1">✓ {transcriptFile.name}</p>}
              </div>
              <input
                type="file"
                accept=".srt"
                onChange={handleTranscriptUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="button"
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              audioFile && lessonName
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!audioFile || !lessonName}
            onClick={handleSubmit}
          >
            Create Lesson
          </button>
        </div>
      </div>
    </div>
  );
}
