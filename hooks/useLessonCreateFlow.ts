import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { parseTranscript, uniquifyName } from '@/lib/utils';
import { saveLesson } from '@/lib/db';
import type { AppMode, DeckItem, LessonItem, Sentence } from '@/types';

type SetToast = (t: { message: string; type: 'success' | 'error' | 'info' } | null) => void;

type Selected = {
  id: string;
  type: 'lesson' | 'deck';
  data: LessonItem | DeckItem;
};

type FetchIPA = (sentencesToUse?: Sentence[], langOverride?: string) => boolean | Promise<boolean>;

export function useLessonCreateFlow(
  setSelectedItem: Dispatch<SetStateAction<Selected | null>>,
  handleLoadLesson: (id: string) => Promise<void>,
  handleModeChange: (mode: AppMode) => void | Promise<void>,
  setUploadMode: (m: 'idle' | 'lesson' | 'deck') => void,
  setToast: SetToast,
  fetchIPA: FetchIPA,
  getTakenAudioLessonNames: () => string[],
  getTakenFlashcardDeckNames: () => string[],
  expandSidebarForItem: (kind: 'audio' | 'flashcard', language: string) => void
) {
  const handleLessonCreated = useCallback(
    async (data: {
      name: string;
      language: 'en' | 'de';
      audioFile: File;
      transcriptFile: File | null;
      generateIpa: boolean;
    }) => {
      try {
        let text = '';
        if (data.transcriptFile) {
          text = await data.transcriptFile.text();
        }

        const sentences = parseTranscript(text);
        const lessonId = Date.now().toString();
        const baseName = data.name.trim() || 'Untitled lesson';
        const uniqueName = uniquifyName(baseName, getTakenAudioLessonNames());

        const newLesson = {
          id: lessonId,
          type: 'audio' as const,
          name: uniqueName,
          language: data.language,
          audioFile: data.audioFile,
          transcriptText: text,
          ipaData: {},
          completedSentences: {},
          totalSentences: sentences.length,
          createdAt: Date.now(),
          lastAccessed: Date.now(),
        };

        await saveLesson(newLesson);

        const lessonItem: LessonItem = {
          id: lessonId,
          name: uniqueName,
          language: data.language,
          progress: 0,
          hasAudio: true,
          hasIpa: false,
          type: 'lesson',
        };

        setSelectedItem({
          id: lessonId,
          type: 'lesson',
          data: lessonItem,
        });
        expandSidebarForItem('audio', data.language);

        await handleLoadLesson(lessonId);
        await handleModeChange('normal');
        let ipaOk = true;
        if (data.generateIpa && sentences.length > 0) {
          ipaOk = await fetchIPA(sentences, data.language);
        }
        if (!ipaOk) {
          setToast({
            message:
              'Lesson saved. IPA generation failed — set NEXT_PUBLIC_GEMINI_API_KEY, restart the dev server, and check the console.',
            type: 'error',
          });
        } else {
          setToast({ message: 'Lesson created.', type: 'success' });
        }
      } catch {
        setToast({ message: 'Could not create lesson.', type: 'error' });
      } finally {
        setUploadMode('idle');
      }
    },
    [
      setSelectedItem,
      handleLoadLesson,
      handleModeChange,
      setUploadMode,
      setToast,
      fetchIPA,
      getTakenAudioLessonNames,
      expandSidebarForItem,
    ]
  );

  const handleDeckCreated = useCallback(
    async (deckData: { name: string; language: 'en' | 'de'; content: string }) => {
      try {
        const lines = deckData.content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        const lessonId = Date.now().toString();
        const baseName = deckData.name.trim() || 'Untitled deck';
        const uniqueName = uniquifyName(baseName, getTakenFlashcardDeckNames());

        const newLesson = {
          id: lessonId,
          type: 'flashcard' as const,
          name: uniqueName,
          language: deckData.language,
          transcriptText: '',
          ipaData: {},
          completedSentences: {},
          totalSentences: lines.length,
          createdAt: Date.now(),
          lastAccessed: Date.now(),
          flashcardData: {
            lines,
            ratings: {},
            currentIndex: 0,
            isShuffled: false,
            shuffledIndices: [],
          },
        };

        await saveLesson(newLesson);

        const deckItem: DeckItem = {
          id: lessonId,
          name: uniqueName,
          language: deckData.language,
          cardCount: lines.length,
          progress: 0,
          type: 'deck',
        };

        setSelectedItem({
          id: lessonId,
          type: 'deck',
          data: deckItem,
        });
        expandSidebarForItem('flashcard', deckData.language);

        await handleLoadLesson(lessonId);
        setToast({ message: 'Deck created.', type: 'success' });
      } catch {
        setToast({ message: 'Could not create deck.', type: 'error' });
      } finally {
        setUploadMode('idle');
      }
    },
    [setSelectedItem, handleLoadLesson, setUploadMode, setToast, getTakenFlashcardDeckNames, expandSidebarForItem]
  );

  return { handleLessonCreated, handleDeckCreated };
}
