/** Readable query params for the selected lesson/deck; `id` is the source of truth for hydration. */

export function slugifyForUrl(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return s.length > 0 ? s.slice(0, 80) : 'item';
}

export function buildItemSearchString(row: {
  id: string;
  name: string;
  kind: 'audio' | 'flashcard';
}): string {
  const slug = slugifyForUrl(row.name);
  if (row.kind === 'flashcard') {
    return `deck=${encodeURIComponent(slug)}&id=${encodeURIComponent(row.id)}`;
  }
  return `lesson=${encodeURIComponent(slug)}&id=${encodeURIComponent(row.id)}`;
}

export type ParsedUrlSelection =
  | { kind: 'legacy-item'; id: string }
  | { kind: 'lesson'; id: string }
  | { kind: 'deck'; id: string };

export function parseItemFromSearch(search: string): ParsedUrlSelection | null {
  const q = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(q);
  const legacy = params.get('item');
  if (legacy) {
    return { kind: 'legacy-item', id: legacy };
  }
  const id = params.get('id');
  if (id && params.get('lesson')) {
    return { kind: 'lesson', id };
  }
  if (id && params.get('deck')) {
    return { kind: 'deck', id };
  }
  return null;
}
