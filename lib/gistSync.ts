import type { FlashcardData, LessonRecord } from '@/lib/db';
import { getLesson, getLessonsForGistExport, saveLesson } from '@/lib/db';

const GIST_FILENAME = 'noda-data.json';
const LAST_SYNC_KEY = 'noda_last_sync';

export type NodaExportLesson = {
  id: string;
  type?: 'audio' | 'flashcard';
  name: string;
  language: string;
  transcriptText: string;
  completedSentences: Record<number, boolean>;
  totalSentences: number;
  createdAt: number;
  lastAccessed: number;
  /** Required for merge; older files without it treated as 0. */
  updatedAt: number;
  isTrashed?: boolean;
  trashedAt?: number;
  flashcardData?: FlashcardData;
};

function getToken(): string {
  const t = process.env.NEXT_PUBLIC_GIST_TOKEN?.trim();
  if (!t) throw new Error('NEXT_PUBLIC_GIST_TOKEN is not set');
  return t;
}

function getGistId(): string {
  const id = process.env.NEXT_PUBLIC_GIST_ID?.trim();
  if (!id) throw new Error('NEXT_PUBLIC_GIST_ID is not set');
  return id;
}

export function lessonToExportRow(lesson: LessonRecord): NodaExportLesson {
  const { audioFile: _omit, ...rest } = lesson;
  return rest as NodaExportLesson;
}

function parseExportPayload(text: string): NodaExportLesson[] {
  const data = JSON.parse(text) as unknown;
  if (!Array.isArray(data)) throw new Error('Gist JSON must be an array');
  return data as NodaExportLesson[];
}

/** Merge one remote row: blob preservation order; winner by updatedAt. */
export async function mergeRemoteLesson(remote: NodaExportLesson): Promise<void> {
  const existing = await getLesson(remote.id);
  const localBlob = existing?.audioFile;

  const rU = typeof remote.updatedAt === 'number' ? remote.updatedAt : 0;
  const lU = existing && typeof existing.updatedAt === 'number' ? existing.updatedAt : 0;

  let winner: LessonRecord;

  if (!existing) {
    winner = {
      ...remote,
      audioFile: localBlob ?? null,
      updatedAt: typeof remote.updatedAt === 'number' ? remote.updatedAt : Date.now(),
    } as LessonRecord;
  } else if (rU >= lU) {
    winner = {
      ...existing,
      ...remote,
      audioFile: localBlob ?? null,
    } as LessonRecord;
  } else {
    winner = {
      ...existing,
      audioFile: localBlob ?? null,
    };
  }

  winner.audioFile = localBlob ?? null;
  await saveLesson(winner);
}

export async function pushToGist(): Promise<void> {
  const token = getToken();
  const gistId = getGistId();
  const lessons = await getLessonsForGistExport();
  const rows: NodaExportLesson[] = lessons.map(lessonToExportRow);
  const content = JSON.stringify(rows);

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: { content },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gist push failed: ${res.status} ${errText}`);
  }

  if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  }
}

export async function pullFromGist(): Promise<void> {
  const token = getToken();
  const gistId = getGistId();

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gist fetch failed: ${res.status} ${errText}`);
  }

  const body = (await res.json()) as {
    files?: Record<string, { content?: string }>;
  };
  const file = body.files?.[GIST_FILENAME];
  const content = file?.content;
  if (content == null || content === '') {
    throw new Error(`Gist is missing file ${GIST_FILENAME}`);
  }

  const remotes = parseExportPayload(content);
  for (const row of remotes) {
    if (!row?.id) continue;
    await mergeRemoteLesson(row);
  }
}

export function getLastSyncTime(): Date | null {
  if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
    return null;
  }
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return new Date(n);
}
